import type { ExpertIntelligenceResearchParams } from '../schemas/deepresearch-expert-intelligence';
import { FileAttachmentService } from '../services/file-attachment';
import { makeApiRequest } from '../services/scrape-client';
import { RESEARCH_DEFAULTS } from '../utils/constants';
import { createSimpleError } from '../utils/errors';

interface ResearchOptions {
  sessionId?: string;
  logger?: (level: 'info' | 'error' | 'debug', message: string, sessionId: string) => Promise<void>;
}

export async function performExpertIntelligenceResearch(
  params: ExpertIntelligenceResearchParams,
  options: ResearchOptions = {}
): Promise<{ content: string; structuredContent: object }> {
  const { sessionId, logger } = options;

  try {
    // Simple progress logging
    if (sessionId && logger) {
      await logger(
        'info',
        `Starting expert intelligence research: "${params.deep_research_question.substring(0, 100)}..." (30min max timeout)`,
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

    // Expert intelligence system prompt - enables comprehensive multi-perspective research
    const systemPrompt = `You are an expert research consultant with unlimited reasoning capacity and access to comprehensive information sources. Your task is to provide evidence-based, multi-perspective analysis on ANY topic (technical or non-technical).

RESEARCH METHODOLOGY:
1. SOURCE DIVERSITY: Official documentation, academic papers, engineering blogs, case studies, industry reports, expert opinions
2. CURRENT + HISTORICAL: Latest developments AND foundational context - show evolution of thinking
3. MULTIPLE PERSPECTIVES: Present different schools of thought, competing approaches, and their proponents
4. EVIDENCE-BASED: Every claim backed by citations - who said it, where, when, and why they're credible
5. CHALLENGE ASSUMPTIONS: Question common wisdom, identify where conventional thinking is outdated
6. PRACTICAL + THEORETICAL: Balance academic rigor with real-world applicability
7. CONTRARIAN VIEWS: Include minority opinions that may be valuable - don't just report consensus

You have UNLIMITED THINKING TOKENS - use them to reason deeply about:
- What the core question is really asking (beyond surface level)
- How different domains approach similar problems
- What recent developments have changed the landscape
- Where expert consensus exists and where it doesn't
- What trade-offs exist between competing approaches
- How theory translates to practice

FINAL ANSWER FORMAT (high info density, comprehensive but concise):
- CURRENT STATE: [What's the status quo? What do we know?]
- KEY INSIGHTS: [Most important findings - backed by evidence]
- PERSPECTIVES: [Different approaches/schools of thought with pros/cons]
- TRADE-OFFS: [Honest analysis of competing priorities]
- PRACTICAL IMPLICATIONS: [How this applies in real scenarios]
- WHAT'S CHANGING: [Recent developments and future directions]
- CONSENSUS VS DEBATE: [Where experts agree and where they don't]

Max 2000 words final answer. Dense with insights, light on filler. Use examples, data, and citations. Structure with clear sections. NO platitudes, NO stating the obvious, NO repeating back what was asked.`;

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
