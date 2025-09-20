#!/usr/bin/env node

/**
 * JINA DeepSearch MCP Server
 *
 * This is the main entry point for the JINA DeepSearch MCP server.
 * Features ultra-simple integration with direct API calls and clear timeout guidance.
 */

// Core MCP SDK imports
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Environment variables support
import * as dotenv from 'dotenv';

// Import tool definitions and implementations
import { toolDefinitions } from './tool-definitions';
import { performResearch } from './tools/research-tool';

// Import Zod schemas and intelligent defaults
import { deepSearchParamsSchema, optimizeParameters } from './schemas/deepsearch';

// Import utilities and configuration
import { MCP_CONFIG } from './utils/constants';
import { createTextResponse } from './utils/formatters';

// Load environment variables from .env file
dotenv.config();

/**
 * Create the MCP server instance
 *
 * TUTORIAL: The Server constructor takes two arguments:
 * 1. Server info: name and version for identification
 * 2. Capabilities: what features this server supports
 *
 * TODO: Update the server description comment with your service details
 */
const server = new Server(
  {
    name: MCP_CONFIG.SERVER_NAME, // Your server's unique identifier
    version: MCP_CONFIG.SERVER_VERSION, // Semantic version for your server
  },
  {
    capabilities: {
      tools: {}, // Enable tool support (required for all API integration servers)
      // Optional capabilities you can enable:
      // resources: {},    // For serving static resources
      // prompts: {},      // For providing reusable prompts
      // logging: {},      // For advanced logging features
    },
  }
);

/**
 * TUTORIAL: Tool Listing Handler
 *
 * This handler responds to requests for available tools. Claude Code calls this
 * to understand what functionality your server provides. It returns:
 * - Tool names: Unique identifiers for each tool
 * - Descriptions: Human-readable explanations of what each tool does
 * - Input schemas: JSON schemas defining required and optional parameters
 *
 * The toolDefinitions array is imported from tool-definitions.ts and contains
 * all the metadata about your tools in a centralized location.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: toolDefinitions.map((tool) => ({
      name: tool.name, // Tool identifier (e.g., 'generate_text')
      description: tool.description, // Human-readable description
      inputSchema: tool.parameters, // JSON schema for parameters
    })),
  };
});

/**
 * TUTORIAL: Tool Execution Handler
 *
 * This is the heart of your MCP server. It receives tool execution requests
 * from Claude Code and routes them to the appropriate tool implementation.
 *
 * Request Flow:
 * 1. Receive tool name and arguments from Claude Code
 * 2. Validate the tool name exists
 * 3. Validate required parameters are present
 * 4. Call the appropriate tool function
 * 5. Return formatted response or error
 *
 * Error Handling:
 * - Parameter validation errors
 * - API errors from your service
 * - Network errors
 * - Unknown tool errors
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // JINA DeepSearch tool router
    switch (name) {
      case 'deepsearch_research': {
        // Step 1: Apply intelligent defaults based on query complexity
        const query = args?.query as string;
        if (!query?.trim()) {
          throw new Error('Query parameter is required');
        }

        const optimizedParams = optimizeParameters(query, args || {});

        // Step 2: Validate with Zod schema (provides detailed error messages)
        const validatedParams = deepSearchParamsSchema.parse(optimizedParams);

        // Step 3: Perform the research with validated parameters
        const result = await performResearch(validatedParams);
        return createTextResponse(result);
      }

      // Handle unknown tools
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    // Enhanced error handling with Zod-specific messages
    if (error instanceof Error) {
      // Zod validation errors contain helpful guidance
      return createTextResponse(`Error: ${error.message}`, true);
    }
    return createTextResponse('Error: Unknown error occurred', true);
  }
});

/**
 * TUTORIAL: Server Startup Function
 *
 * This function initializes the transport layer and starts the server.
 * For MCP servers used with Claude Code, stdio transport is standard.
 *
 * Transport Types:
 * - StdioServerTransport: Communicates via stdin/stdout (standard for Claude Code)
 * - SSEServerTransport: Server-sent events for web-based clients
 * - Custom transports: Can be implemented for specific use cases
 */
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Optional debug logging (controlled by MCP_DEBUG environment variable)
  if (process.env['MCP_DEBUG']) {
    console.error('JINA MCP server running on stdio');
  }
}

/**
 * TUTORIAL: Graceful Shutdown Handler
 *
 * Handle SIGINT (Ctrl+C) gracefully by:
 * 1. Closing server connections properly
 * 2. Cleaning up any open resources
 * 3. Exiting with success code
 *
 * This prevents connection leaks and ensures clean shutdown.
 */
process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});

/**
 * TUTORIAL: Server Entry Point
 *
 * Only start the server if this file is run directly (not imported).
 * This allows the file to be imported for testing without starting the server.
 *
 * Error Handling:
 * - Catch startup errors and exit with error code
 * - Log errors for debugging
 * - Prevent hanging processes
 */
if (require.main === module) {
  main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}
