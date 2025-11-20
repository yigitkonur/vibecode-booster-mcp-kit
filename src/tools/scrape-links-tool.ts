import type { ScrapeLinksParams, ScrapeLinksOutput } from '../schemas/scrape-links';
import { ScrapeDoClient } from '../services/scrape-do-client';
import { MarkdownCleaner } from '../services/markdown-cleaner';
import { createLLMProcessor, processContentWithLLM } from '../services/llm-processor';
import { removeMetaTags } from '../utils/markdown-formatter';

interface ToolOptions {
  sessionId?: string;
  logger?: (level: 'info' | 'error' | 'debug', message: string, sessionId: string) => Promise<void>;
}

export async function performScrapeLinks(
  params: ScrapeLinksParams,
  options: ToolOptions = {}
): Promise<{ content: string; structuredContent: ScrapeLinksOutput }> {
  const { sessionId, logger } = options;
  const startTime = Date.now();

  try {
    if (sessionId && logger) {
      await logger('info', `Scraping ${params.urls.length} URL(s) in ${params.mode} mode`, sessionId);
    }

    const client = new ScrapeDoClient();
    const markdownCleaner = new MarkdownCleaner();
    const llmProcessor = createLLMProcessor();

    // Scrape all URLs
    const results = await client.scrapeMultipleURLs(params.urls, {
      mode: params.mode,
      timeout: params.timeout,
      country: params.country,
      waitFor: params.waitFor,
    });

    let successful = 0;
    let failed = 0;
    let totalCredits = 0;
    const contents: string[] = [];

    // Process each result
    for (const result of results) {
      if (result.statusCode === 200 || result.statusCode < 400) {
        successful++;
        totalCredits += result.credits;

        // Clean HTML to markdown
        let content = markdownCleaner.processContent(result.content);

        // LLM processing if enabled
        if (params.use_llm && llmProcessor) {
          const llmResult = await processContentWithLLM(
            content,
            {
              use_llm: params.use_llm,
              what_to_extract: params.what_to_extract,
            },
            llmProcessor
          );
          content = llmResult.content;
        }

        // Remove meta tags
        content = removeMetaTags(content);

        contents.push(`## ${result.url}\n\n${content}`);
      } else {
        failed++;
        contents.push(`## ${result.url}\n\n❌ Failed to scrape: ${result.content}`);
      }
    }

    const executionTime = Date.now() - startTime;

    if (sessionId && logger) {
      await logger('info', `Completed: ${successful} successful, ${failed} failed, ${totalCredits} credits used`, sessionId);
    }

    // Format output
    const formattedContent = `# Scraped Content (${params.urls.length} URLs)\n\n${contents.join('\n\n---\n\n')}`;

    const metadata = {
      total_urls: params.urls.length,
      successful,
      failed,
      total_credits: totalCredits,
      execution_time_ms: executionTime,
    };

    return {
      content: formattedContent,
      structuredContent: {
        content: formattedContent,
        metadata,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (sessionId && logger) {
      await logger('error', errorMessage, sessionId);
    }

    const executionTime = Date.now() - startTime;

    return {
      content: `# ❌ Scraping Failed\n\n${errorMessage}`,
      structuredContent: {
        content: `# ❌ Scraping Failed\n\n${errorMessage}`,
        metadata: {
          total_urls: params.urls.length,
          successful: 0,
          failed: params.urls.length,
          total_credits: 0,
          execution_time_ms: executionTime,
        },
      },
    };
  }
}
