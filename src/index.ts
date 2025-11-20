#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as dotenv from 'dotenv';
import {
  bugfixResearchOutputSchema,
  bugfixResearchOutputShape,
  bugfixResearchParamsSchema,
  bugfixResearchParamsShape,
} from './schemas/deepresearch-bugfix';
import {
  codePlanningResearchOutputSchema,
  codePlanningResearchOutputShape,
  codePlanningResearchParamsSchema,
  codePlanningResearchParamsShape,
} from './schemas/deepresearch-code-planning';
import {
  expertIntelligenceResearchOutputSchema,
  expertIntelligenceResearchOutputShape,
  expertIntelligenceResearchParamsSchema,
  expertIntelligenceResearchParamsShape,
} from './schemas/deepresearch-expert-intelligence';
import {
  taskCompletionValidatorOutputSchema,
  taskCompletionValidatorOutputShape,
  taskCompletionValidatorParamsSchema,
  taskCompletionValidatorParamsShape,
} from './schemas/task-completion-validator';
import { performBugfixResearch } from './tools/bugfix-research-tool';
import { performCodePlanningResearch } from './tools/code-planning-research-tool';
import { performExpertIntelligenceResearch } from './tools/expert-intelligence-tool';
import { performTaskCompletionValidation } from './tools/task-completion-validator-tool';
import { API_CONFIG, MCP_CONFIG } from './utils/constants';
import { createSimpleError } from './utils/errors';
import { validateApiKey } from './utils/validators';
import { type ToolsConfig, getToolDefinition, loadToolsConfig } from './utils/yaml-loader';

// Load environment variables
dotenv.config();

// Validate API configuration on startup
validateApiKey(API_CONFIG.API_KEY);

// Load tool definitions from YAML
let toolsConfig: ToolsConfig;
try {
  toolsConfig = loadToolsConfig(MCP_CONFIG.TOOLS_CONFIG_PATH);
} catch (error) {
  console.error('Failed to load tools configuration:', error);
  process.exit(1);
}

const mcpServer = new McpServer(
  {
    name: MCP_CONFIG.SERVER_NAME,
    version: MCP_CONFIG.SERVER_VERSION,
    description: MCP_CONFIG.DESCRIPTION,
    icons: [
      {
        src: MCP_CONFIG.ICONS.FAVICON,
        sizes: '32x32',
        mimeType: 'image/x-icon',
      },
    ],
    license: MCP_CONFIG.LICENSE,
    author: `${MCP_CONFIG.AUTHOR.name} <${MCP_CONFIG.AUTHOR.email}>`,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register bug fix research tool
const bugfixTool = getToolDefinition(toolsConfig, 'deepresearch_bugfix');
if (!bugfixTool) {
  throw new Error('deepresearch_bugfix tool definition not found in YAML config');
}

mcpServer.registerTool(
  bugfixTool.name,
  {
    title: bugfixTool.title,
    description: bugfixTool.description,
    inputSchema: bugfixResearchParamsShape,
    outputSchema: bugfixResearchOutputShape,
  },
  async (args, extra) => {
    try {
      const validatedParams = bugfixResearchParamsSchema.parse(args);

      // Simple logger function
      const logger = async (
        level: 'info' | 'error' | 'debug',
        message: string,
        sessionId: string
      ) => {
        await mcpServer.server.sendLoggingMessage({ level, data: message }, sessionId);
      };

      const sessionId = extra?.sessionId || 'default';
      const { content, structuredContent } = await performBugfixResearch(validatedParams, {
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

      // Transform response to output schema (xAI API format)
      const apiResponse = structuredContent as any;
      const transformedOutput = {
        content,
        metadata: {
          id: apiResponse.id || 'unknown',
          model: apiResponse.model || 'perplexity/sonar-deep-research',
          created: apiResponse.created || Date.now(),
          finish_reason: apiResponse.choices?.[0]?.finish_reason || 'unknown',
        },
        usage: apiResponse.usage,
        annotations: apiResponse.choices?.[0]?.message?.annotations,
      };

      const validatedOutput = bugfixResearchOutputSchema.parse(transformedOutput);

      return {
        content: [{ type: 'text' as const, text: content }],
        structuredContent: validatedOutput,
      };
    } catch (error) {
      const simpleError = createSimpleError(error);

      return {
        content: [{ type: 'text' as const, text: `Error: ${simpleError.message}` }],
        structuredContent: {
          error: true,
          code: simpleError.code,
          message: simpleError.message,
        },
        isError: true,
      };
    }
  }
);

// Register expert intelligence research tool
const expertIntelligenceTool = getToolDefinition(toolsConfig, 'deepresearch_expert_intelligence');
if (!expertIntelligenceTool) {
  throw new Error('deepresearch_expert_intelligence tool definition not found in YAML config');
}

mcpServer.registerTool(
  expertIntelligenceTool.name,
  {
    title: expertIntelligenceTool.title,
    description: expertIntelligenceTool.description,
    inputSchema: expertIntelligenceResearchParamsShape,
    outputSchema: expertIntelligenceResearchOutputShape,
  },
  async (args, extra) => {
    try {
      const validatedParams = expertIntelligenceResearchParamsSchema.parse(args);

      // Simple logger function
      const logger = async (
        level: 'info' | 'error' | 'debug',
        message: string,
        sessionId: string
      ) => {
        await mcpServer.server.sendLoggingMessage({ level, data: message }, sessionId);
      };

      const sessionId = extra?.sessionId || 'default';
      const { content, structuredContent } = await performExpertIntelligenceResearch(validatedParams, {
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

      // Transform response to output schema (xAI API format)
      const apiResponse = structuredContent as any;
      const transformedOutput = {
        content,
        metadata: {
          id: apiResponse.id || 'unknown',
          model: apiResponse.model || 'perplexity/sonar-deep-research',
          created: apiResponse.created || Date.now(),
          finish_reason: apiResponse.choices?.[0]?.finish_reason || 'unknown',
        },
        usage: apiResponse.usage,
        annotations: apiResponse.choices?.[0]?.message?.annotations,
      };

      const validatedOutput = expertIntelligenceResearchOutputSchema.parse(transformedOutput);

      return {
        content: [{ type: 'text' as const, text: content }],
        structuredContent: validatedOutput,
      };
    } catch (error) {
      const simpleError = createSimpleError(error);

      return {
        content: [{ type: 'text' as const, text: `Error: ${simpleError.message}` }],
        structuredContent: {
          error: true,
          code: simpleError.code,
          message: simpleError.message,
        },
        isError: true,
      };
    }
  }
);

// Register code planning research tool
const codePlanningTool = getToolDefinition(toolsConfig, 'deepresearch_code_planning');
if (!codePlanningTool) {
  throw new Error('deepresearch_code_planning tool definition not found in YAML config');
}

mcpServer.registerTool(
  codePlanningTool.name,
  {
    title: codePlanningTool.title,
    description: codePlanningTool.description,
    inputSchema: codePlanningResearchParamsShape,
    outputSchema: codePlanningResearchOutputShape,
  },
  async (args, extra) => {
    try {
      const validatedParams = codePlanningResearchParamsSchema.parse(args);

      // Simple logger function
      const logger = async (
        level: 'info' | 'error' | 'debug',
        message: string,
        sessionId: string
      ) => {
        await mcpServer.server.sendLoggingMessage({ level, data: message }, sessionId);
      };

      const sessionId = extra?.sessionId || 'default';
      const { content, structuredContent } = await performCodePlanningResearch(validatedParams, {
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

      // Transform response to output schema (xAI API format)
      const apiResponse = structuredContent as any;
      const transformedOutput = {
        content,
        metadata: {
          id: apiResponse.id || 'unknown',
          model: apiResponse.model || 'perplexity/sonar-deep-research',
          created: apiResponse.created || Date.now(),
          finish_reason: apiResponse.choices?.[0]?.finish_reason || 'unknown',
        },
        usage: apiResponse.usage,
        annotations: apiResponse.choices?.[0]?.message?.annotations,
      };

      const validatedOutput = codePlanningResearchOutputSchema.parse(transformedOutput);

      return {
        content: [{ type: 'text' as const, text: content }],
        structuredContent: validatedOutput,
      };
    } catch (error) {
      const simpleError = createSimpleError(error);

      return {
        content: [{ type: 'text' as const, text: `Error: ${simpleError.message}` }],
        structuredContent: {
          error: true,
          code: simpleError.code,
          message: simpleError.message,
        },
        isError: true,
      };
    }
  }
);

// Register task completion validator tool
const validatorTool = getToolDefinition(toolsConfig, 'validate_task_completion');
if (!validatorTool) {
  throw new Error('validate_task_completion tool definition not found in YAML config');
}

mcpServer.registerTool(
  validatorTool.name,
  {
    title: validatorTool.title,
    description: validatorTool.description,
    inputSchema: taskCompletionValidatorParamsShape,
    outputSchema: taskCompletionValidatorOutputShape,
  },
  async (args, extra) => {
    try {
      const validatedParams = taskCompletionValidatorParamsSchema.parse(args);

      // Simple logger function
      const logger = async (
        level: 'info' | 'error' | 'debug',
        message: string,
        sessionId: string
      ) => {
        await mcpServer.server.sendLoggingMessage({ level, data: message }, sessionId);
      };

      const sessionId = extra?.sessionId || 'default';
      const { content, structuredContent } = await performTaskCompletionValidation(validatedParams, {
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
        return {
          content: [{ type: 'text' as const, text: content }],
          structuredContent: structuredContent,
          isError: true,
        };
      }

      // Validate and return structured output
      const validatedOutput = taskCompletionValidatorOutputSchema.parse(structuredContent);

      return {
        content: [{ type: 'text' as const, text: content }],
        structuredContent: validatedOutput,
      };
    } catch (error) {
      const simpleError = createSimpleError(error);

      return {
        content: [{ type: 'text' as const, text: `Error: ${simpleError.message}` }],
        structuredContent: {
          error: true,
          code: simpleError.code,
          message: simpleError.message,
        },
        isError: true,
      };
    }
  }
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);

  if (process.env['MCP_DEBUG']) {
    console.error('Perplexity Deep Research MCP server running on stdio');
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
