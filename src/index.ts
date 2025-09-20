#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as dotenv from 'dotenv';
import {
  deepSearchOutputSchema,
  deepSearchOutputShape,
  deepSearchParamsSchema,
  deepSearchParamsShape,
} from './schemas/deepsearch';
import { performResearch } from './tools/research-tool';
import { MCP_CONFIG } from './utils/constants';
import { createSimpleError } from './utils/errors';

dotenv.config();

const mcpServer = new McpServer(
  {
    name: MCP_CONFIG.SERVER_NAME,
    version: MCP_CONFIG.SERVER_VERSION,
    description: MCP_CONFIG.DESCRIPTION,
    icons: [{ src: MCP_CONFIG.ICONS.FAVICON, sizes: '32x32', mimeType: 'image/x-icon' }],
    license: MCP_CONFIG.LICENSE,
    author: `${MCP_CONFIG.AUTHOR.name} <${MCP_CONFIG.AUTHOR.email}>`,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register research tool
mcpServer.registerTool(
  'deep_research',
  {
    title: 'deep_research',
    description:
      "This is an unlimited joker you can use whenever you encounter any bug or when you need extra thinking, especially when gathering information from the internet. Don't hesitate to use this abundantly — it's particularly useful during planning.\n\nWhen you face a bug and your internal analysis doesn't lead to a 100% certain solution, that's when you should definitely use this tool. Describe your problem in as much detail as possible within the specified template, including all relevant links. However, if there's an issue, simply providing the file name won't be enough — you must include the related code snippet and conduct very detailed research.\n\nI guarantee you'll be 99% satisfied with this product, so USE IT ABUNDANTLY!",
    inputSchema: deepSearchParamsShape,
    outputSchema: deepSearchOutputShape,
  },
  async (args, extra) => {
    try {
      const validatedParams = deepSearchParamsSchema.parse(args);

      // Simple logger function
      const logger = async (
        level: 'info' | 'error' | 'debug',
        message: string,
        sessionId: string
      ) => {
        await mcpServer.server.sendLoggingMessage({ level, data: message }, sessionId);
      };

      const sessionId = extra?.sessionId || 'default';
      const { content, structuredContent } = await performResearch(validatedParams, {
        sessionId,
        logger,
      });

      // Handle error responses
      if (
        structuredContent &&
        typeof structuredContent === 'object' &&
        'error' in structuredContent &&
        structuredContent.error
      ) {
        // Extract only schema-compliant fields for error responses
        const errorResponse = structuredContent as unknown as {
          content: string;
          metadata: { id: string; model: string; created: number };
        };
        return {
          content: [{ type: 'text' as const, text: content }],
          structuredContent: {
            content: errorResponse.content,
            metadata: errorResponse.metadata,
          },
          isError: true,
        };
      }

      // Transform response to output schema
      const jinaResponse = structuredContent as {
        id?: string;
        model?: string;
        created?: number;
        choices?: Array<{ finish_reason?: string }>;
        usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
        visitedURLs?: string[];
        readURLs?: string[];
      };
      const transformedOutput = {
        content,
        metadata: {
          id: jinaResponse.id || 'unknown',
          model: jinaResponse.model || 'jina-deepsearch-v1',
          created: jinaResponse.created || Date.now(),
          finish_reason: jinaResponse.choices?.[0]?.finish_reason || 'unknown',
        },
        usage: jinaResponse.usage
          ? {
              prompt_tokens: jinaResponse.usage.prompt_tokens || 0,
              completion_tokens: jinaResponse.usage.completion_tokens || 0,
              total_tokens: jinaResponse.usage.total_tokens || 0,
            }
          : undefined,
        sources:
          jinaResponse.visitedURLs || jinaResponse.readURLs
            ? {
                visited_urls: jinaResponse.visitedURLs || [],
                read_urls: jinaResponse.readURLs || [],
                total_sources:
                  (jinaResponse.visitedURLs?.length || 0) + (jinaResponse.readURLs?.length || 0),
              }
            : undefined,
        research_quality: {
          reasoning_effort: validatedParams.reasoning_effort,
          team_size: validatedParams.team_size,
          confidence_score: undefined,
        },
      };

      const validatedOutput = deepSearchOutputSchema.parse(transformedOutput);

      return {
        content: [{ type: 'text' as const, text: content }],
        structuredContent: validatedOutput,
      };
    } catch (error) {
      const simpleError = createSimpleError(error);

      return {
        content: [{ type: 'text' as const, text: `Error: ${simpleError.message}` }],
        structuredContent: { error: true, code: simpleError.code, message: simpleError.message },
        isError: true,
      };
    }
  }
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);

  if (process.env['MCP_DEBUG']) {
    console.error('JINA MCP server running on stdio');
  }
}

process.on('SIGINT', async () => {
  await mcpServer.close();
  process.exit(0);
});

if (require.main === module) {
  main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}
