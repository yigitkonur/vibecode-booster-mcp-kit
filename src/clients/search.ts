/**
 * Web Search Client
 * Generic interface for web search via Google (Serper implementation)
 */

import { parseEnv } from '../config/index.js';

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
  position: number;
}

export interface KeywordSearchResult {
  keyword: string;
  results: SearchResult[];
  totalResults: number;
  related: string[];
}

export interface MultipleSearchResponse {
  searches: KeywordSearchResult[];
  totalKeywords: number;
  executionTime: number;
}

export interface RedditSearchResult {
  title: string;
  url: string;
  snippet: string;
  date?: string;
}

export class SearchClient {
  private apiKey: string;
  private baseURL = 'https://google.serper.dev';

  constructor(apiKey?: string) {
    const env = parseEnv();
    this.apiKey = apiKey || env.SEARCH_API_KEY || '';

    if (!this.apiKey) {
      throw new Error('SERPER_API_KEY is required for search functionality');
    }
  }

  /**
   * Search multiple keywords in parallel
   */
  async searchMultiple(keywords: string[]): Promise<MultipleSearchResponse> {
    const startTime = Date.now();

    try {
      const searchQueries = keywords.map(keyword => ({ q: keyword }));

      const response = await fetch(`${this.baseURL}/search`, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchQueries),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Search API error: ${response.status} ${errorText}`);
      }

      const data = await response.json() as Record<string, unknown>;
      const responses = Array.isArray(data) ? data : [data];

      const searches: KeywordSearchResult[] = responses.map((resp: Record<string, unknown>, index: number) => {
        const organic = (resp.organic || []) as Array<Record<string, unknown>>;
        const results: SearchResult[] = organic.map((item: Record<string, unknown>, idx: number) => ({
          title: (item.title as string) || 'No title',
          link: (item.link as string) || '#',
          snippet: (item.snippet as string) || '',
          date: item.date as string | undefined,
          position: (item.position as number) || idx + 1,
        }));

        const searchInfo = resp.searchInformation as Record<string, unknown> | undefined;
        const totalResults = searchInfo?.totalResults
          ? parseInt(String(searchInfo.totalResults).replace(/,/g, ''), 10)
          : results.length;

        const relatedSearches = (resp.relatedSearches || []) as Array<Record<string, unknown>>;
        const related = relatedSearches.map((r: Record<string, unknown>) => (r.query as string) || '');

        return { keyword: keywords[index] || '', results, totalResults, related };
      });

      return { searches, totalKeywords: keywords.length, executionTime: Date.now() - startTime };
    } catch (error) {
      throw new Error(`Failed to search: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Search Reddit via Google (adds site:reddit.com automatically)
   */
  async searchReddit(query: string, dateAfter?: string): Promise<RedditSearchResult[]> {
    let q = /site:\s*reddit\.com/i.test(query) ? query : `${query} site:reddit.com`;

    if (dateAfter) {
      q += ` after:${dateAfter}`;
    }

    const res = await fetch(`${this.baseURL}/search`, {
      method: 'POST',
      headers: { 'X-API-KEY': this.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q, num: 10 }),
    });

    if (!res.ok) throw new Error(`Search error: ${res.status}`);

    const data = await res.json() as { organic?: Array<{ title: string; link: string; snippet: string; date?: string }> };
    return (data.organic || []).map((r) => ({
      title: r.title.replace(/ : r\/\w+$/, '').replace(/ - Reddit$/, ''),
      url: r.link,
      snippet: r.snippet,
      date: r.date,
    }));
  }

  /**
   * Search Reddit with multiple queries in parallel
   */
  async searchRedditMultiple(queries: string[], dateAfter?: string): Promise<Map<string, RedditSearchResult[]>> {
    const results = await Promise.all(
      queries.map(q => this.searchReddit(q, dateAfter).catch(() => []))
    );
    return new Map(queries.map((q, i) => [q, results[i]]));
  }
}
