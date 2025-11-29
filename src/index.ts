#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { TOOLS } from './tools/definitions.js';
import { handleSearchReddit, handleGetRedditPosts } from './tools/reddit.js';
import { handleDeepResearch } from './tools/research.js';
import { handleScrapeLinks } from './tools/scrape.js';
import { handleWebSearch } from './tools/search.js';
import { deepResearchParamsSchema } from './schemas/deep-research.js';
import { scrapeLinksParamsSchema } from './schemas/scrape-links.js';
import { webSearchParamsSchema } from './schemas/web-search.js';
import { createSimpleError } from './utils/errors.js';
import { parseEnv, RESEARCH, SERVER } from './config/index.js';

// ============================================================================
// Environment Validation
// ============================================================================

const env = parseEnv();
const missingVars: string[] = [];
if (!env.SEARCH_API_KEY) missingVars.push('SERPER_API_KEY');
if (!env.REDDIT_CLIENT_ID) missingVars.push('REDDIT_CLIENT_ID');
if (!env.REDDIT_CLIENT_SECRET) missingVars.push('REDDIT_CLIENT_SECRET');

if (!RESEARCH.API_KEY) {
  console.error('Warning: OPENROUTER_API_KEY not set - deep_research tool will not work');
}
if (!env.SCRAPER_API_KEY) {
  console.error('Warning: SCRAPEDO_API_KEY not set - scrape_links tool will not work');
}

if (missingVars.length > 0) {
  console.error(`Missing required env vars: ${missingVars.join(', ')}`);
  process.exit(1);
}

// ============================================================================
// Server Setup
// ============================================================================

const server = new Server(
  { name: SERVER.NAME, version: SERVER.VERSION },
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
      const result = await handleSearchReddit(queries, env.SEARCH_API_KEY!, date_after);
      return { content: [{ type: 'text', text: result }] };
    }

    if (name === 'get_reddit_post') {
      const { urls, max_comments = 100, fetch_comments = true } = args as { urls: string[]; max_comments?: number; fetch_comments?: boolean };
      if (!Array.isArray(urls) || urls.length === 0) {
        return { content: [{ type: 'text', text: 'Error: urls must be a non-empty array of Reddit post URLs' }], isError: true };
      }
      const result = await handleGetRedditPosts(urls, env.REDDIT_CLIENT_ID!, env.REDDIT_CLIENT_SECRET!, max_comments, {
        fetchComments: fetch_comments,
        maxCommentsOverride: max_comments !== 100 ? max_comments : undefined,
      });
      return { content: [{ type: 'text', text: result }] };
    }

    if (name === 'deep_research') {
      const validatedParams = deepResearchParamsSchema.parse(args);
      const { content, structuredContent } = await handleDeepResearch(validatedParams);
      if (structuredContent && typeof structuredContent === 'object' && 'error' in structuredContent && structuredContent.error) {
        return { content: [{ type: 'text', text: content }], isError: true };
      }
      return { content: [{ type: 'text', text: content }] };
    }

    if (name === 'scrape_links') {
      const validatedParams = scrapeLinksParamsSchema.parse(args);
      const { content, structuredContent } = await handleScrapeLinks(validatedParams);
      if (structuredContent.metadata.failed === structuredContent.metadata.total_urls) {
        return { content: [{ type: 'text', text: content }], isError: true };
      }
      return { content: [{ type: 'text', text: content }] };
    }

    if (name === 'web_search') {
      const validatedParams = webSearchParamsSchema.parse(args);
      const { content, structuredContent } = await handleWebSearch(validatedParams);
      if (structuredContent.metadata.total_results === 0) {
        return { content: [{ type: 'text', text: content }], isError: true };
      }
      return { content: [{ type: 'text', text: content }] };
    }

    return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
  } catch (error) {
    const simpleError = createSimpleError(error);
    return { content: [{ type: 'text', text: `Error: ${simpleError.message}` }], isError: true };
  }
});

// ============================================================================
// Start Server
// ============================================================================

const transport = new StdioServerTransport();
server.connect(transport);
console.error(`${SERVER.NAME} v${SERVER.VERSION} started (5 tools: search_reddit, get_reddit_post, deep_research, scrape_links, web_search)`);
