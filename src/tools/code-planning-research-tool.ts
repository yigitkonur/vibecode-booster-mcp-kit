import type { CodePlanningResearchParams } from '../schemas/deepresearch-code-planning';
import { FileAttachmentService } from '../services/file-attachment';
import { makeApiRequest } from '../services/scrape-client';
import { RESEARCH_DEFAULTS } from '../utils/constants';
import { createSimpleError } from '../utils/errors';

interface ResearchOptions {
  sessionId?: string;
  logger?: (level: 'info' | 'error' | 'debug', message: string, sessionId: string) => Promise<void>;
}

export async function performCodePlanningResearch(
  params: CodePlanningResearchParams,
  options: ResearchOptions = {}
): Promise<{ content: string; structuredContent: object }> {
  const { sessionId, logger } = options;

  try {
    // Simple progress logging
    if (sessionId && logger) {
      await logger(
        'info',
        `Starting code planning research: "${params.deep_research_question.substring(0, 100)}..." (30min max timeout)`,
        sessionId
      );
    }

    // Process file attachments if present
    let enhancedQuestion = params.deep_research_question;
    if (params.file_attachments && params.file_attachments.length > 0) {
      if (sessionId && logger) {
        await logger(
          'info',
          `Processing ${params.file_attachments.length} file attachment(s)...`,
          sessionId
        );
      }

      const fileService = new FileAttachmentService();
      const attachmentsMarkdown = await fileService.formatAttachments(params.file_attachments);
      enhancedQuestion = params.deep_research_question + attachmentsMarkdown;
    }

    // Code planning system prompt - guides library discovery and architectural decisions
    const systemPrompt = `You are a principal engineer and technical architect with unlimited reasoning capacity. Your task is to research battle-tested libraries, patterns, and approaches to minimize custom code.

RESEARCH METHODOLOGY:
1. GITHUB ANALYSIS: Prioritize repos with 5k+ stars, active maintenance (commits in last 3 months), good documentation
2. EVALUATE ABSTRACTION LEVEL: Find libraries that solve the EXACT problem - not too general, not too specific
3. CHECK COMPATIBILITY: Verify framework compatibility, bundle size impact, TypeScript support, browser/runtime support
4. PRODUCTION PROOF: Look for "used by" sections, case studies from real companies, production examples
5. COMPARE TRADE-OFFS: Bundle size vs features, complexity vs flexibility, learning curve vs power
6. ARCHITECTURAL PATTERNS: Research how production apps structure this functionality (Notion, Linear, Vercel, etc.)
7. INTEGRATION STRATEGY: If code attached, ensure recommendations FIT existing patterns and style

You have UNLIMITED THINKING TOKENS - use them to reason deeply about:
- What exact functionality is needed vs nice-to-have
- Which libraries are actively maintained and widely adopted
- How recommended solutions integrate with attached codebase
- What the hidden complexity costs are
- Whether to use all-in-one solution or compose smaller libs
- Real-world performance characteristics at scale

FINAL ANSWER FORMAT (high info density, comprehensive but concise):
- TOP RECOMMENDATIONS: [3-5 libraries ranked with GitHub stars and why each fits]
- ARCHITECTURAL APPROACH: [Pattern to use - with real-world examples]
- INTEGRATION GUIDE: [How to add to existing stack - reference attached files if provided]
- TRADE-OFF ANALYSIS: [Honest pros/cons of each option]
- CODE EXAMPLES: [Minimal working examples showing the approach]
- AVOID: [What NOT to use and why]

Max 2000 words final answer (excluding code blocks). Focus on actionable recommendations with evidence. Every statement backed by GitHub links, docs, or production examples. NO generic advice, NO unverified claims.`;

    // Transform to DeepSearchParams format with configuration defaults
    const apiParams = {
      deep_research_question: enhancedQuestion,
      system_prompt: systemPrompt,
      reasoning_effort: RESEARCH_DEFAULTS.REASONING_EFFORT,
      budget_tokens: RESEARCH_DEFAULTS.BUDGET_TOKENS,
      max_attempts: RESEARCH_DEFAULTS.MAX_ATTEMPTS,
      team_size: RESEARCH_DEFAULTS.TEAM_SIZE,
      no_direct_answer: true,
      max_returned_urls: RESEARCH_DEFAULTS.MAX_URLS,
    };

    // biome-ignore lint/suspicious/noExplicitAny: API params are dynamically constructed from different schemas
    const response = await makeApiRequest(apiParams as any);

    // Basic completion logging
    if (sessionId && logger) {
      const tokens = response.usage?.total_tokens;
      if (tokens) {
        await logger('info', `Research completed: ${tokens.toLocaleString()} tokens`, sessionId);
      }
    }

    // Extract content directly from JSON response
    const content = response.choices?.[0]?.message?.content || '';

    return { content, structuredContent: response };
  } catch (error) {
    const simpleError = createSimpleError(error);

    // Simple error logging
    if (sessionId && logger) {
      await logger('error', simpleError.message, sessionId);
    }

    return {
      content: `Error: ${simpleError.message}`,
      structuredContent: {
        content: `Error: ${simpleError.message}`,
        metadata: { id: 'error', model: 'error', created: Date.now() },
        error: true,
        code: simpleError.code,
        message: simpleError.message,
      },
    };
  }
}
