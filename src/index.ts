#!/usr/bin/env node

/**
 * Research Powerpack MCP Server
 * Implements robust error handling - server NEVER crashes on tool failures
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode as McpErrorCode } from '@modelcontextprotocol/sdk/types.js';

import { TOOLS } from './tools/definitions.js';
import { handleSearchReddit, handleGetRedditPosts } from './tools/reddit.js';
import { handleDeepResearch } from './tools/research.js';
import { handleScrapeLinks } from './tools/scrape.js';
import { handleWebSearch } from './tools/search.js';
import { deepResearchParamsSchema } from './schemas/deep-research.js';
import { scrapeLinksParamsSchema } from './schemas/scrape-links.js';
import { webSearchParamsSchema } from './schemas/web-search.js';
import { classifyError, createToolErrorFromStructured } from './utils/errors.js';
import { parseEnv, SERVER, getCapabilities, getMissingEnvMessage } from './config/index.js';

// ============================================================================
// Capability Detection (no ENV required - tools fail gracefully when called)
// ============================================================================

const env = parseEnv();
const capabilities = getCapabilities();

// Log available capabilities for debugging
const enabledTools: string[] = [];
const disabledTools: string[] = [];

if (capabilities.search) {
  enabledTools.push('web_search', 'search_reddit');
} else {
  disabledTools.push('web_search', 'search_reddit');
}
if (capabilities.reddit) {
  enabledTools.push('get_reddit_post');
} else {
  disabledTools.push('get_reddit_post');
}
if (capabilities.scraping) {
  enabledTools.push('scrape_links');
} else {
  disabledTools.push('scrape_links');
}
if (capabilities.deepResearch) {
  enabledTools.push('deep_research');
} else {
  disabledTools.push('deep_research');
}

if (enabledTools.length > 0) {
  console.error(`✅ Enabled tools: ${enabledTools.join(', ')}`);
}
if (disabledTools.length > 0) {
  console.error(`⚠️ Disabled tools (missing ENV): ${disabledTools.join(', ')}`);
}
if (capabilities.scraping && !capabilities.llmExtraction) {
  console.error(`ℹ️ scrape_links: AI extraction (use_llm) disabled - set OPENROUTER_API_KEY to enable`);
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
    // ========== SEARCH_REDDIT ==========
    if (name === 'search_reddit') {
      // Check capability
      if (!capabilities.search) {
        return { content: [{ type: 'text', text: getMissingEnvMessage('search') }], isError: true };
      }
      const { queries, date_after } = args as { queries: string[]; date_after?: string };
      if (!Array.isArray(queries) || queries.length === 0) {
        return { content: [{ type: 'text', text: 'Error: queries must be a non-empty array of strings' }], isError: true };
      }
      const result = await handleSearchReddit(queries, env.SEARCH_API_KEY!, date_after);
      return { content: [{ type: 'text', text: result }] };
    }

    // ========== GET_REDDIT_POST ==========
    if (name === 'get_reddit_post') {
      // Check capability
      if (!capabilities.reddit) {
        return { content: [{ type: 'text', text: getMissingEnvMessage('reddit') }], isError: true };
      }
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

    // ========== DEEP_RESEARCH ==========
    if (name === 'deep_research') {
      // Check capability
      if (!capabilities.deepResearch) {
        return { content: [{ type: 'text', text: getMissingEnvMessage('deepResearch') }], isError: true };
      }
      const validatedParams = deepResearchParamsSchema.parse(args);
      const { content, structuredContent } = await handleDeepResearch(validatedParams);
      if (structuredContent && typeof structuredContent === 'object' && 'error' in structuredContent && structuredContent.error) {
        return { content: [{ type: 'text', text: content }], isError: true };
      }
      return { content: [{ type: 'text', text: content }] };
    }

    // ========== SCRAPE_LINKS ==========
    if (name === 'scrape_links') {
      // Check capability
      if (!capabilities.scraping) {
        return { content: [{ type: 'text', text: getMissingEnvMessage('scraping') }], isError: true };
      }
      const validatedParams = scrapeLinksParamsSchema.parse(args);
      
      // Warn if use_llm requested but LLM not available
      if (validatedParams.use_llm && !capabilities.llmExtraction) {
        console.error('[scrape_links] use_llm requested but OPENROUTER_API_KEY not set - proceeding without AI extraction');
        validatedParams.use_llm = false;
      }
      
      const { content, structuredContent } = await handleScrapeLinks(validatedParams);
      if (structuredContent.metadata.failed === structuredContent.metadata.total_urls) {
        return { content: [{ type: 'text', text: content }], isError: true };
      }
      return { content: [{ type: 'text', text: content }] };
    }

    // ========== WEB_SEARCH ==========
    if (name === 'web_search') {
      // Check capability
      if (!capabilities.search) {
        return { content: [{ type: 'text', text: getMissingEnvMessage('search') }], isError: true };
      }
      const validatedParams = webSearchParamsSchema.parse(args);
      const { content, structuredContent } = await handleWebSearch(validatedParams);
      if (structuredContent.metadata.total_results === 0) {
        return { content: [{ type: 'text', text: content }], isError: true };
      }
      return { content: [{ type: 'text', text: content }] };
    }

    /**
     * Protocol Error: Unknown tool requested
     * Per MCP spec, use McpError for protocol-level errors (tool not found, invalid params)
     * vs isError:true for tool execution failures (network, API, timeout)
     */
    throw new McpError(
      McpErrorCode.MethodNotFound,
      `Method not found: ${name}. Available tools: search_reddit, get_reddit_post, deep_research, scrape_links, web_search`
    );
  } catch (error) {
    // McpError should propagate to client as protocol error
    if (error instanceof McpError) {
      throw error;
    }
    
    // Classify the error for helpful messaging
    const structuredError = classifyError(error);

    // Log for debugging
    console.error(`[MCP Server] Tool "${name}" error:`, {
      code: structuredError.code,
      message: structuredError.message,
      retryable: structuredError.retryable,
    });

    // Create standardized error response with errorCode for client programmatic handling
    // This response includes: content (markdown), isError: true, errorCode, and retryAfter (for rate limits)
    return createToolErrorFromStructured(structuredError);
  }
});

// ============================================================================
// Global Error Handlers - MUST EXIT on fatal errors per Node.js best practices
// See: https://nodejs.org/api/process.html#warning-using-uncaughtexception-correctly
// ============================================================================

// Track shutdown state to prevent double shutdown
let isShuttingDown = false;

/**
 * Graceful shutdown handler - closes server and exits
 * @param exitCode - Exit code (0 for clean shutdown, 1 for error)
 */
async function gracefulShutdown(exitCode: number): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  try {
    await server.close();
    console.error(`[MCP Server] Server closed at ${new Date().toISOString()}`);
  } catch (closeError) {
    console.error('[MCP Server] Error closing server:', closeError);
  } finally {
    process.exit(exitCode);
  }
}

// Handle uncaught exceptions - MUST EXIT per Node.js docs
// The VM is in an unstable state after uncaught exception
process.on('uncaughtException', (error: Error) => {
  console.error(`[MCP Server] FATAL uncaughtException at ${new Date().toISOString()}:`);
  console.error(`  Message: ${error.message}`);
  console.error(`  Stack: ${error.stack}`);
  gracefulShutdown(1);
});

// Handle unhandled promise rejections - MUST EXIT (Node v15+ behavior)
// Suppressing this risks memory leaks and corrupted state
process.on('unhandledRejection', (reason: unknown) => {
  const error = classifyError(reason);
  console.error(`[MCP Server] FATAL unhandledRejection at ${new Date().toISOString()}:`);
  console.error(`  Message: ${error.message}`);
  console.error(`  Code: ${error.code}`);
  gracefulShutdown(1);
});

// Handle SIGTERM gracefully (Docker/Kubernetes stop signal)
process.on('SIGTERM', () => {
  console.error(`[MCP Server] Received SIGTERM at ${new Date().toISOString()}, shutting down gracefully`);
  gracefulShutdown(0);
});

// Handle SIGINT gracefully (Ctrl+C) - use once() to prevent double-fire
process.once('SIGINT', () => {
  console.error(`[MCP Server] Received SIGINT at ${new Date().toISOString()}, shutting down gracefully`);
  gracefulShutdown(0);
});

// ============================================================================
// Start Server
// ============================================================================

const transport = new StdioServerTransport();

// Connect with error handling
try {
  server.connect(transport);
  console.error(`🚀 ${SERVER.NAME} v${SERVER.VERSION} ready`);
} catch (error) {
  const err = classifyError(error);
  console.error(`[MCP Server] Failed to start: ${err.message}`);
  process.exit(1);
}
