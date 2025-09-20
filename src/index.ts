#!/usr/bin/env node

/**
 * TEMPLATE: MCP Server for Third-Party API Integration
 *
 * CUSTOMIZATION GUIDE:
 * 1. Replace {{SERVICE_NAME}} with your service name throughout
 * 2. Update tool imports to match your actual tool functions
 * 3. Modify the switch statement cases to match your tool names
 * 4. Update parameter validation for each tool
 * 5. Customize error handling if needed
 *
 * TUTORIAL: This is the main entry point for your MCP server
 *
 * MCP (Model Context Protocol) Architecture:
 * 1. **Server Creation**: Initialize server with name and capabilities
 * 2. **Tool Registration**: Register available tools and their schemas
 * 3. **Request Handling**: Handle tool execution requests from clients
 * 4. **Transport Layer**: Use stdio for communication with Claude Code
 * 5. **Error Handling**: Proper error responses for failed operations
 *
 * Key Concepts:
 * - **Tools**: Functions that Claude Code can call (like API endpoints)
 * - **Schemas**: JSON schemas that define tool parameters and validation
 * - **Transport**: How the server communicates (stdio, HTTP, etc.)
 * - **Handlers**: Functions that process different types of MCP requests
 */

// Core MCP SDK imports - these stay the same for all MCP servers
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Environment variables support - essential for API keys and configuration
import * as dotenv from 'dotenv';

// Import your tool definitions and implementations
// TODO: Update these imports to match your actual tool structure
import { toolDefinitions } from './tool-definitions';

// TODO: Replace these with your actual tool function imports
// Examples for different service types:
// - AI Services: import { generateText, createImage, transcribeAudio } from './tools/...';
// - Data Services: import { searchData, createRecord, updateRecord } from './tools/...';
// - Utility Services: import { convertFormat, validateData, processFile } from './tools/...';
import { checkCredits } from './tools/credits-tool';
import { scrapeInteractive } from './tools/interactive-scraper';
import { scrapeJavascript } from './tools/js-scraper';
import { scrapePremium } from './tools/premium-scraper';
import { scrapeSimple } from './tools/simple-scraper';

// Import utilities and configuration
import { MCP_CONFIG } from './utils/constants';
import { createTextResponse } from './utils/formatters';
import { validateRequiredParams } from './utils/validators';

// Load environment variables from .env file
// TUTORIAL: This should happen early in your application lifecycle
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
    name: MCP_CONFIG.SERVER_NAME,        // Your server's unique identifier
    version: MCP_CONFIG.SERVER_VERSION,  // Semantic version for your server
  },
  {
    capabilities: {
      tools: {},  // Enable tool support (required for all API integration servers)
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
      name: tool.name,           // Tool identifier (e.g., 'generate_text')
      description: tool.description,  // Human-readable description
      inputSchema: tool.parameters,   // JSON schema for parameters
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
    // TUTORIAL: Tool Router
    // This switch statement routes tool calls to their implementations.
    // Each case should:
    // 1. Validate required parameters
    // 2. Call the tool function with properly typed arguments
    // 3. Return a formatted response
    //
    // TODO: Replace these cases with your actual tools
    switch (name) {
      // Example: Service status/info tool (common for most APIs)
      case 'check_credits': {
        // No parameters needed for this tool
        const result = await checkCredits();
        return createTextResponse(JSON.stringify(result, null, 2));
      }

      // TODO: Replace these example tools with your service's actual tools
      // Pattern for tools with required parameters:
      case 'scrape_simple': {
        validateRequiredParams(args, ['url']);  // Validate required params
        const result = await scrapeSimple({
          url: args!['url'] as string,
          follow_redirects: args!['follow_redirects'] as boolean,
        });
        return createTextResponse(result);
      }

      case 'scrape_premium': {
        validateRequiredParams(args, ['url']);
        const result = await scrapePremium({
          url: args!['url'] as string,
          country: args!['country'] as string,
        });
        return createTextResponse(result);
      }

      case 'scrape_javascript': {
        validateRequiredParams(args, ['url']);
        const result = await scrapeJavascript({
          url: args!['url'] as string,
          wait_ms: args!['wait_ms'] as number,
          wait_for_selector: args!['wait_for_selector'] as string,
          use_residential_proxy: args!['use_residential_proxy'] as boolean,
        });
        return createTextResponse(result);
      }

      // Example: Tool with complex parameter validation
      case 'scrape_interactive': {
        validateRequiredParams(args, ['url', 'actions']);
        const result = await scrapeInteractive({
          url: args!['url'] as string,
          actions: args!['actions'] as Array<{
            type: 'click' | 'fill' | 'wait';
            selector?: string;
            value?: string;
          }>,
        });
        return createTextResponse(result);
      }

      // Handle unknown tools
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    // TUTORIAL: Error Response
    // Always return properly formatted error responses
    // The createTextResponse utility handles MCP response formatting
    return createTextResponse(
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      true  // Mark as error response
    );
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
    console.error('{{SERVICE_NAME}} MCP server running on stdio');
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
