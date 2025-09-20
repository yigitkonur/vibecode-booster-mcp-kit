import type { DeepSearchParams } from '../schemas/deepsearch';
import { makeApiRequest } from '../services/scrape-client';
import { createSimpleError } from '../utils/errors';
import { sanitizeContent } from '../utils/response-validator';

interface ResearchOptions {
  sessionId?: string;
  logger?: (level: 'info' | 'error' | 'debug', message: string, sessionId: string) => Promise<void>;
}

export async function performResearch(
  params: DeepSearchParams,
  options: ResearchOptions = {}
): Promise<{ content: string; structuredContent: object }> {
  const { sessionId, logger } = options;

  try {
    // Simple progress logging
    if (sessionId && logger) {
      await logger(
        'info',
        `Starting research: "${params.deep_research_question}" (30min max timeout)`,
        sessionId
      );
    }

    const response = await makeApiRequest(params);

    // Basic completion logging
    if (sessionId && logger) {
      const tokens = response.usage?.total_tokens;
      if (tokens) {
        await logger('info', `Research completed: ${tokens.toLocaleString()} tokens`, sessionId);
      }
    }

    // Extract and sanitize content
    const content = response.choices?.[0]?.message?.content || '';
    const sanitizedContent = sanitizeContent(content);

    return { content: sanitizedContent, structuredContent: response };
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
