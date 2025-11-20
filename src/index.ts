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
  genericResearchOutputSchema,
  genericResearchOutputShape,
  genericResearchParamsSchema,
  genericResearchParamsShape,
} from './schemas/deepresearch-generic';
import { performBugfixResearch } from './tools/bugfix-research-tool';
import { performCodePlanningResearch } from './tools/code-planning-research-tool';
import { performGenericResearch } from './tools/generic-research-tool';
import { MCP_CONFIG } from './utils/constants';
import { createSimpleError } from './utils/errors';

dotenv.config();

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
mcpServer.registerTool(
  'deepresearch_bugfix',
  {
    title: 'deepresearch_bugfix',
    description:
      "**CRITICAL: You MUST use this ONLY for debugging and fixing bugs, if you have tried to fix something and it never worked, then you HAVE TO USE THIS TOOL TO FIX THIS BUG.**\n\nThis is your unlimited debugging assistant. When you face a bug and your internal analysis doesn't lead to a 100% certain solution, use this tool. It performs comprehensive research to find root causes and proven solutions.\n\n**When to use:**\n- Encountering errors, exceptions, or unexpected behavior\n- Application crashes or hangs\n- Performance issues or memory leaks\n- Integration failures with external services\n- Configuration problems\n- Dependency conflicts\n- Security vulnerabilities discovered\n\n**What makes this effective:**\n- Structured template forces comprehensive context collection\n- Searches across StackOverflow, GitHub issues, official docs\n- Finds similar bug reports and their solutions\n- Identifies root causes from symptoms\n- Provides multiple solution approaches with trade-offs\n\n**Required information:**\n- Complete background and what you were trying to accomplish\n- Exact error messages and logs (word-for-word)\n- Code snippets showing the problematic area\n- Environment details (versions, dependencies, OS)\n- Reproduction steps\n- What you've already tried\n\n**Pro tip:** Attach files with `file_attachments` parameter for better context. Include the files where the bug occurs, configuration files, and dependency manifests.\n\nDon't hesitate to use this tool abundantly during debugging - it's specifically designed for this purpose!",
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

      // Transform response to output schema
      const perplexityResponse = structuredContent as {
        id?: string;
        model?: string;
        created?: number;
        choices?: Array<{ finish_reason?: string }>;
        usage?: {
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
        };
        visitedURLs?: string[];
        readURLs?: string[];
      };
      const transformedOutput = {
        content,
        metadata: {
          id: perplexityResponse.id || 'unknown',
          model: perplexityResponse.model || 'perplexity/sonar-deep-research',
          created: perplexityResponse.created || Date.now(),
          finish_reason: perplexityResponse.choices?.[0]?.finish_reason || 'unknown',
        },
        usage: perplexityResponse.usage
          ? {
              prompt_tokens: perplexityResponse.usage.prompt_tokens || 0,
              completion_tokens: perplexityResponse.usage.completion_tokens || 0,
              total_tokens: perplexityResponse.usage.total_tokens || 0,
            }
          : undefined,
        sources:
          perplexityResponse.visitedURLs || perplexityResponse.readURLs
            ? {
                visited_urls: perplexityResponse.visitedURLs || [],
                read_urls: perplexityResponse.readURLs || [],
                total_sources:
                  (perplexityResponse.visitedURLs?.length || 0) + (perplexityResponse.readURLs?.length || 0),
              }
            : undefined,
        research_quality: {
          reasoning_effort: 'high' as const,
          team_size: 5,
          confidence_score: undefined,
        },
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

// Register generic research tool
mcpServer.registerTool(
  'deepresearch_generic',
  {
    title: 'deepresearch_generic',
    description:
      '**Use this tool for comprehensive exploration of any topic, technology, or concept.**\n\nPerfect for general knowledge gathering and understanding complex subjects when you need deep, structured research.\n\n**When to use:**\n- Learning new technologies or frameworks\n- Understanding industry best practices\n- Comparing different approaches or solutions\n- Researching architectural patterns\n- Exploring new domains or concepts\n- Technology evaluation and selection\n- Understanding complex algorithms or systems\n- Market research and competitive analysis\n\n**What makes this effective:**\n- Structured template ensures comprehensive research coverage\n- Searches across official documentation, blogs, tutorials, academic papers\n- Provides multiple perspectives and comparisons\n- Includes practical examples and use cases\n- Identifies pros, cons, and trade-offs\n\n**Required information:**\n- Clear research topic with context\n- Specific questions you want answered (3-7 questions)\n- Expected depth level (high-level overview, detailed technical, expert-level)\n- Research priorities (source types, recency, domain focus)\n- Research boundaries (what to exclude, scope limitations)\n\n**Pro tip:** Use `file_attachments` to provide context about your existing codebase or architecture when researching how to integrate new technologies or approaches.\n\nUse this tool whenever you need to deeply understand something before making technical decisions!',
    inputSchema: genericResearchParamsShape,
    outputSchema: genericResearchOutputShape,
  },
  async (args, extra) => {
    try {
      const validatedParams = genericResearchParamsSchema.parse(args);

      // Simple logger function
      const logger = async (
        level: 'info' | 'error' | 'debug',
        message: string,
        sessionId: string
      ) => {
        await mcpServer.server.sendLoggingMessage({ level, data: message }, sessionId);
      };

      const sessionId = extra?.sessionId || 'default';
      const { content, structuredContent } = await performGenericResearch(validatedParams, {
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
      const perplexityResponse = structuredContent as {
        id?: string;
        model?: string;
        created?: number;
        choices?: Array<{ finish_reason?: string }>;
        usage?: {
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
        };
        visitedURLs?: string[];
        readURLs?: string[];
      };
      const transformedOutput = {
        content,
        metadata: {
          id: perplexityResponse.id || 'unknown',
          model: perplexityResponse.model || 'perplexity/sonar-deep-research',
          created: perplexityResponse.created || Date.now(),
          finish_reason: perplexityResponse.choices?.[0]?.finish_reason || 'unknown',
        },
        usage: perplexityResponse.usage
          ? {
              prompt_tokens: perplexityResponse.usage.prompt_tokens || 0,
              completion_tokens: perplexityResponse.usage.completion_tokens || 0,
              total_tokens: perplexityResponse.usage.total_tokens || 0,
            }
          : undefined,
        sources:
          perplexityResponse.visitedURLs || perplexityResponse.readURLs
            ? {
                visited_urls: perplexityResponse.visitedURLs || [],
                read_urls: perplexityResponse.readURLs || [],
                total_sources:
                  (perplexityResponse.visitedURLs?.length || 0) + (perplexityResponse.readURLs?.length || 0),
              }
            : undefined,
        research_quality: {
          reasoning_effort: 'high' as const,
          team_size: 5,
          confidence_score: undefined,
        },
      };

      const validatedOutput = genericResearchOutputSchema.parse(transformedOutput);

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
mcpServer.registerTool(
  'deepresearch_code_planning',
  {
    title: 'deepresearch_code_planning',
    description:
      '**CRITICAL: Use this tool for comprehensive pre-development research when starting a NEW coding project, especially if user ask your opinion while planning something you are not very sure.**\n\nThis tool is your expert technical co-founder who researches everything BEFORE you write a single line of code. It helps you make informed decisions about frameworks, architecture, integrations, and implementation strategies backed by production examples and best practices.\n\n**When to use:**\n- Starting a new project and choosing the right tech stack\n- Evaluating framework options and their trade-offs\n- Planning architecture and design patterns\n- Researching integration strategies with third-party services\n- Understanding best practices for your specific domain\n- Finding production-ready examples on GitHub (sorted by stars)\n- Extracting quick-start guides and setup procedures\n- Building on top of existing code (use file_attachments)\n- Making technology decisions with confidence\n\n**What this tool researches for you:**\n\n1. **Technology Stack Analysis:**\n   - Framework comparisons (React vs Vue, Express vs Fastify)\n   - Database selection (PostgreSQL vs MongoDB, when to use each)\n   - API architecture (REST vs GraphQL vs gRPC)\n   - Infrastructure decisions (serverless vs containers)\n\n2. **Best Practices & Patterns:**\n   - Architecture patterns (microservices, monolith, event-driven)\n   - Code organization and project structure\n   - Testing strategies and tools\n   - Security practices (auth, encryption, OWASP)\n   - Performance optimization approaches\n\n3. **GitHub Repository Intelligence:**\n   - Finds top repos with most stars for any topic\n   - Extracts quick-start guides from popular projects\n   - Analyzes production-grade implementations\n   - Identifies common patterns and anti-patterns\n   - Discovers integration examples\n\n4. **Integration Planning:**\n   - Authentication providers (Auth0, Clerk, Supabase Auth)\n   - Payment processing (Stripe, PayPal - which fits your use case)\n   - Email services (SendGrid vs AWS SES - cost comparison)\n   - File storage (S3, Cloudinary - features and pricing)\n   - Real-time features (WebSocket, SSE, WebRTC)\n   - Search functionality (Elasticsearch, Algolia, Meilisearch)\n   - Communication styles (REST vs gRPC vs GraphQL for each service)\n\n5. **Existing Codebase Compatibility:**\n   - Use `file_attachments` to share your existing code\n   - Research recommendations compatible with current architecture\n   - Avoid suggesting conflicting approaches\n   - Understand integration points and constraints\n\n**Required information:**\n- Project overview (what you\'re building, scale, requirements)\n- Technology stack constraints and preferences\n- Best practices areas to research\n- GitHub repository analysis needs\n- Integration requirements (auth, payments, email, etc.)\n- Research priorities (official docs, blogs, GitHub, tutorials)\n- Research boundaries (language limits, budget, compliance)\n\n**Pro tip:** This tool excels when you provide existing code via `file_attachments`. Attach your package.json, main entry files, or key modules to ensure research recommendations are compatible with what you\'ve already built.\n\n**Example use cases:**\n- "Research best frameworks for building a real-time collaborative editor like Google Docs"\n- "Find top GitHub repos for CRDT implementations and extract their quick-start guides"\n- "Compare Stripe vs PayPal for B2B SaaS subscription billing"\n- "Research authentication strategies for multi-tenant applications"\n- "Find production examples of microservices architecture in TypeScript"\n\nUse this tool BEFORE planning your implementation - it will save you from costly architecture mistakes and help you build on proven patterns!',
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

      // Transform response to output schema
      const perplexityResponse = structuredContent as {
        id?: string;
        model?: string;
        created?: number;
        choices?: Array<{ finish_reason?: string }>;
        usage?: {
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
        };
        visitedURLs?: string[];
        readURLs?: string[];
      };
      const transformedOutput = {
        content,
        metadata: {
          id: perplexityResponse.id || 'unknown',
          model: perplexityResponse.model || 'perplexity/sonar-deep-research',
          created: perplexityResponse.created || Date.now(),
          finish_reason: perplexityResponse.choices?.[0]?.finish_reason || 'unknown',
        },
        usage: perplexityResponse.usage
          ? {
              prompt_tokens: perplexityResponse.usage.prompt_tokens || 0,
              completion_tokens: perplexityResponse.usage.completion_tokens || 0,
              total_tokens: perplexityResponse.usage.total_tokens || 0,
            }
          : undefined,
        sources:
          perplexityResponse.visitedURLs || perplexityResponse.readURLs
            ? {
                visited_urls: perplexityResponse.visitedURLs || [],
                read_urls: perplexityResponse.readURLs || [],
                total_sources:
                  (perplexityResponse.visitedURLs?.length || 0) + (perplexityResponse.readURLs?.length || 0),
              }
            : undefined,
        research_quality: {
          reasoning_effort: 'high' as const,
          team_size: 5,
          confidence_score: undefined,
        },
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
