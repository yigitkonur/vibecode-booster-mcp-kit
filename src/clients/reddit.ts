/**
 * Reddit OAuth API Client
 * Fetches posts and comments sorted by score (most upvoted first)
 * Supports batching and smart comment allocation
 */

import { REDDIT } from '../config/index.js';

export interface Post {
  title: string;
  author: string;
  subreddit: string;
  body: string;
  score: number;
  commentCount: number;
  url: string;
}

export interface Comment {
  author: string;
  body: string;
  score: number;
  depth: number;
  isOP: boolean;
}

export interface PostResult {
  post: Post;
  comments: Comment[];
  allocatedComments: number;
  actualComments: number;
}

export interface BatchPostResult {
  results: Map<string, PostResult | Error>;
  batchesProcessed: number;
  totalPosts: number;
  rateLimitHits: number;
  commentAllocation: CommentAllocation;
}

export interface CommentAllocation {
  totalBudget: number;
  perPostBase: number;
  perPostCapped: number;
  redistributed: boolean;
}

/**
 * Calculate comment allocation based on post count
 */
export function calculateCommentAllocation(postCount: number): CommentAllocation {
  const totalBudget = REDDIT.MAX_COMMENT_BUDGET;
  const perPostBase = Math.floor(totalBudget / postCount);
  const perPostCapped = Math.min(perPostBase, REDDIT.MAX_COMMENTS_PER_POST);

  return { totalBudget, perPostBase, perPostCapped, redistributed: false };
}

export class RedditClient {
  private token: string | null = null;
  private tokenExpiry = 0;

  constructor(private clientId: string, private clientSecret: string) {}

  private async auth(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiry - 60000) return this.token;

    const res = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'reddit-mcp/2.0',
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) throw new Error(`Reddit auth failed: ${res.status}`);
    const data = await res.json();
    this.token = data.access_token;
    this.tokenExpiry = Date.now() + data.expires_in * 1000;
    return this.token!;
  }

  private parseUrl(url: string): { sub: string; id: string } | null {
    const m = url.match(/reddit\.com\/r\/([^\/]+)\/comments\/([a-z0-9]+)/i);
    return m ? { sub: m[1], id: m[2] } : null;
  }

  /**
   * Fetch a Reddit post with comments
   */
  async getPost(url: string, maxComments = 100): Promise<PostResult> {
    const parsed = this.parseUrl(url);
    if (!parsed) throw new Error(`Invalid Reddit URL: ${url}`);

    const token = await this.auth();
    const limit = Math.min(maxComments, 500);

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < REDDIT.RETRY_COUNT; attempt++) {
      try {
        const res = await fetch(
          `https://oauth.reddit.com/r/${parsed.sub}/comments/${parsed.id}?sort=top&limit=${limit}&depth=10&raw_json=1`,
          { headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'reddit-mcp/2.0' } }
        );

        if (res.status === 429) {
          const delay = REDDIT.RETRY_DELAYS[attempt] || 32000;
          console.error(`[Reddit] Rate limited (429). Retry ${attempt + 1}/${REDDIT.RETRY_COUNT} after ${delay}ms`);
          await this.delay(delay);
          continue;
        }

        if (!res.ok) throw new Error(`Reddit API error: ${res.status}`);
        const [postListing, commentListing] = await res.json();

        const p = postListing?.data?.children?.[0]?.data;
        if (!p) throw new Error(`Post not found: ${url}`);

        const post: Post = {
          title: p.title,
          author: p.author,
          subreddit: p.subreddit,
          body: p.selftext || (p.is_self ? '' : `[Link: ${p.url}]`),
          score: p.score,
          commentCount: p.num_comments,
          url: `https://reddit.com${p.permalink}`,
        };

        const comments: Comment[] = [];
        const extract = (children: any[], depth = 0) => {
          const sorted = [...children].sort((a, b) => (b.data?.score || 0) - (a.data?.score || 0));
          for (const c of sorted) {
            if (comments.length >= maxComments) return;
            if (c.kind !== 't1' || !c.data?.author || c.data.author === '[deleted]') continue;
            comments.push({
              author: c.data.author,
              body: c.data.body || '',
              score: c.data.score,
              depth,
              isOP: c.data.author === p.author,
            });
            if (c.data.replies?.data?.children && comments.length < maxComments) {
              extract(c.data.replies.data.children, depth + 1);
            }
          }
        };
        if (commentListing?.data?.children) extract(commentListing.data.children);

        return { post, comments, allocatedComments: maxComments, actualComments: post.commentCount };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < REDDIT.RETRY_COUNT - 1 && !lastError.message.includes('API error')) {
          const delay = REDDIT.RETRY_DELAYS[attempt] || 32000;
          console.error(`[Reddit] Error, retry ${attempt + 1}/${REDDIT.RETRY_COUNT} after ${delay}ms: ${lastError.message}`);
          await this.delay(delay);
        }
      }
    }

    throw lastError || new Error('Reddit rate limited. Retry in 1-2 minutes.');
  }

  /**
   * Fetch multiple posts in parallel
   */
  async getPosts(urls: string[], maxComments = 100): Promise<Map<string, PostResult | Error>> {
    if (urls.length <= REDDIT.BATCH_SIZE) {
      const results = await Promise.all(
        urls.map(u => this.getPost(u, maxComments).catch(e => e as Error))
      );
      return new Map(urls.map((u, i) => [u, results[i]]));
    }

    const result = await this.batchGetPosts(urls, maxComments);
    return result.results;
  }

  /**
   * Batch fetch posts with concurrent limit
   */
  async batchGetPosts(
    urls: string[],
    maxCommentsOverride?: number,
    fetchComments = true,
    onBatchComplete?: (batchNum: number, totalBatches: number, processed: number) => void
  ): Promise<BatchPostResult> {
    const totalBatches = Math.ceil(urls.length / REDDIT.BATCH_SIZE);
    const allResults = new Map<string, PostResult | Error>();
    let rateLimitHits = 0;

    const allocation = calculateCommentAllocation(urls.length);
    const commentsPerPost = fetchComments ? (maxCommentsOverride || allocation.perPostCapped) : 0;

    console.error(`[Reddit] Starting batch: ${urls.length} posts in ${totalBatches} batch(es), ${commentsPerPost} comments/post`);

    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
      const startIdx = batchNum * REDDIT.BATCH_SIZE;
      const endIdx = Math.min(startIdx + REDDIT.BATCH_SIZE, urls.length);
      const batchUrls = urls.slice(startIdx, endIdx);

      console.error(`[Reddit] Processing batch ${batchNum + 1}/${totalBatches} (${batchUrls.length} posts)`);

      const batchResults = await Promise.allSettled(
        batchUrls.map(url => this.getPost(url, commentsPerPost))
      );

      for (let i = 0; i < batchResults.length; i++) {
        const result = batchResults[i];
        const url = batchUrls[i] || '';

        if (result.status === 'fulfilled') {
          allResults.set(url, result.value);
        } else {
          const errorMsg = result.reason instanceof Error ? result.reason.message : String(result.reason);
          if (errorMsg.includes('rate limited') || errorMsg.includes('429')) {
            rateLimitHits++;
          }
          allResults.set(url, result.reason instanceof Error ? result.reason : new Error(errorMsg));
        }
      }

      onBatchComplete?.(batchNum + 1, totalBatches, allResults.size);
      console.error(`[Reddit] Completed batch ${batchNum + 1}/${totalBatches} (${allResults.size}/${urls.length} total)`);

      if (batchNum < totalBatches - 1) {
        await this.delay(500);
      }
    }

    return { results: allResults, batchesProcessed: totalBatches, totalPosts: urls.length, rateLimitHits, commentAllocation: allocation };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
