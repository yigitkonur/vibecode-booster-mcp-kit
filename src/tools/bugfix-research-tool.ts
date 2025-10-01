import type { BugfixResearchParams } from '../schemas/deepresearch-bugfix';
import { FileAttachmentService } from '../services/file-attachment';
import { makeApiRequest } from '../services/scrape-client';
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

    // Set maximum quality defaults internally (not exposed to user)
    const apiParams = {
      deep_research_question: enhancedQuestion,
      reasoning_effort: 'high' as const,
      budget_tokens: 20000,
      max_attempts: 3,
      team_size: 5,
      no_direct_answer: true,
      max_returned_urls: 100,
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
