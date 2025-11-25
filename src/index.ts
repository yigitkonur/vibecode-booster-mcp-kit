#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { searchReddit } from './tools/search-reddit.js';
import { getRedditPosts } from './tools/get-reddit-post.js';

const { SERPER_API_KEY, REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET } = process.env;

if (!SERPER_API_KEY || !REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) {
  console.error('Missing env: SERPER_API_KEY, REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET');
  process.exit(1);
}

const TOOLS = [
  {
    name: 'search_reddit',
    description: `Search Reddit via Google (10 results/query). MUST call get_reddit_post after. Supports: intitle:, "exact", OR, -exclude. Auto-adds site:reddit.com.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        queries: { type: 'array', items: { type: 'string' }, description: 'Distinct queries (max 10). Maximize count for multiple perspectives. eg: ["best IDE 2025", "best AI features on IDEs", "best IDE for Python", "top alternatives to vscode", "top alternatives to intitle:cursor -windsurf", "intitle:comparison of top IDEs","new IDEs like intitle:zed"]' },
        date_after: { type: 'string', description: 'Filter results after date (YYYY-MM-DD). Optional.' },
      },
      required: ['queries'],
    },
  },
  {
    name: 'get_reddit_post',
    description: `Fetch full Reddit posts + threaded comments (sorted by most upvoted to least). MUST call search_reddit first. Returns: title, author, subreddit, score, body, nested replies with [OP] tags. You can post up to 5 links. Set max_comments more than 100 if you have very limited candidate URLs or want comprehensive analysis. For best results, use 200-500 for detailed analysis or 1000 for comprehensive coverage.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        urls: { type: 'array', items: { type: 'string' }, description: 'Reddit URLs (max 5). Pick most relevant from search results.' },
        max_comments: { type: 'number', description: 'Comments per post. 100=quick, 200-500=detailed, 1000=comprehensive. Default: 100', default: 100 },
      },
      required: ['urls'],
    },
  },
];

const server = new Server(
  { name: 'reddit-mcp', version: '2.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'search_reddit') {
      const { queries, date_after } = args as { queries: string[]; date_after?: string };
      if (!Array.isArray(queries) || queries.length === 0) {
        return { content: [{ type: 'text', text: 'Error: queries must be a non-empty array of strings' }], isError: true };
      }
      const result = await searchReddit(queries, SERPER_API_KEY!, date_after);
      return { content: [{ type: 'text', text: result }] };
    }

    if (name === 'get_reddit_post') {
      const { urls, max_comments = 100 } = args as { urls: string[]; max_comments?: number };
      if (!Array.isArray(urls) || urls.length === 0) {
        return { content: [{ type: 'text', text: 'Error: urls must be a non-empty array of Reddit post URLs' }], isError: true };
      }
      const result = await getRedditPosts(urls, REDDIT_CLIENT_ID!, REDDIT_CLIENT_SECRET!, max_comments);
      return { content: [{ type: 'text', text: result }] };
    }

    return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { content: [{ type: 'text', text: `Error: ${msg}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
server.connect(transport);
console.error('Reddit Research MCP Server v2.0.0 started');
