import type { BugfixResearchParams } from '../schemas/deepresearch-bugfix';
import { FileAttachmentService } from '../services/file-attachment';
import { makeApiRequest } from '../services/scrape-client';
import { RESEARCH_DEFAULTS } from '../utils/constants';
import { createSimpleError } from '../utils/errors';

interface ResearchOptions {
  sessionId?: string;
  logger?: (level: 'info' | 'error' | 'debug', message: string, sessionId: string) => Promise<void>;
}

export async function performBugfixResearch(
  params: BugfixResearchParams,
  options: ResearchOptions = {}
): Promise<{ content: string; structuredContent: object }> {
  const { sessionId, logger } = options;

  try {
    // Simple progress logging
    if (sessionId && logger) {
      await logger(
        'info',
        `Starting bug fix research: "${params.deep_research_question.substring(0, 100)}..." (30min max timeout)`,
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

    // Bug fix system prompt - guides deep root cause analysis
    const systemPrompt = `You are an expert debugging assistant with unlimited reasoning capacity. Your task is to perform EXHAUSTIVE research to identify root causes and proven solutions.

RESEARCH METHODOLOGY:
1. THINK STEP-BY-STEP: Break down the error/bug systematically - what could cause each symptom?
2. SEARCH STRATEGICALLY: Prioritize official documentation, GitHub issues, Stack Overflow accepted answers, and engineering blogs
3. ANALYZE ERROR MESSAGES: Search exact error text, examine stack traces line-by-line, identify the failing component
4. VERIFY SOLUTIONS: Only recommend fixes with evidence (GitHub commits, official docs, or multiple confirmed reports)
5. CONSIDER CONTEXT: If code files are attached, reference specific line numbers and patterns you observe
6. CHECK VERSIONS: Version mismatches cause 80% of "it should work" bugs - verify compatibility
7. EXPLORE EDGE CASES: Consider environment differences, timing issues, race conditions, and async problems

You have UNLIMITED THINKING TOKENS - use them to reason deeply about:
- Why this specific error occurs in this specific context
- What the stack trace reveals about execution flow
- How the attached code interacts with dependencies
- What changed that could have triggered this
- Similar issues others have solved and how

FINAL ANSWER FORMAT (high info density, comprehensive but concise):
- Root Cause: [Specific technical reason - be precise]
- Solution: [Step-by-step fix with exact commands/code]
- Why It Works: [Brief technical explanation]
- Prevention: [How to avoid this in future]
- Related Issues: [Similar problems and their solutions]

Max 2000 words final answer (excluding code blocks). Every sentence must add value. Use bullet points, code examples, and clear structure. NO filler, NO obvious statements, NO repeating the question back.`;

    // Set configuration defaults
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

    const response = await makeApiRequest(apiParams);

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
