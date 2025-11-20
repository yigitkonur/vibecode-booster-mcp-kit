import type { GenericResearchParams } from '../schemas/deepresearch-generic';
import { FileAttachmentService } from '../services/file-attachment';
import { makeApiRequest } from '../services/scrape-client';
import { createSimpleError } from '../utils/errors';

interface ResearchOptions {
  sessionId?: string;
  logger?: (level: 'info' | 'error' | 'debug', message: string, sessionId: string) => Promise<void>;
}

export async function performGenericResearch(
  params: GenericResearchParams,
  options: ResearchOptions = {}
): Promise<{ content: string; structuredContent: object }> {
  const { sessionId, logger } = options;

  try {
    // Simple progress logging
    if (sessionId && logger) {
      await logger(
        'info',
        `Starting generic research: "${params.research_question.substring(0, 100)}..." (30min max timeout)`,
        sessionId
      );
    }

    // Process file attachments if present
    let enhancedQuestion = params.research_question;
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
      enhancedQuestion = params.research_question + attachmentsMarkdown;
    }

    // Append compression instruction for optimal token usage with strict output limits
    enhancedQuestion +=
      '\n\nResearch exhaustively across max sources/URLs, then synthesize into ultra-compressed output: use abbreviated nested bullets, strip all filler words, maximize info density per token—spend heavily on input, minimize output tokens. Research max budget is 100,000 words, but research output max budget (the final answer you will return) is ideally less than 1,000 words but for same rare cases it can be up to 2000 words at MAX. (not including code examples)';

    // Transform to DeepSearchParams format with maximum quality defaults
    const apiParams = {
      deep_research_question: enhancedQuestion,
      reasoning_effort: 'high' as const,
      budget_tokens: 100000,
      max_attempts: 3,
      team_size: 5,
      no_direct_answer: true,
      max_returned_urls: 100,
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
