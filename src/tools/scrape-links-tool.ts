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
      await logger('info', `Starting scrape: ${params.urls.length} URL(s), mode=${params.mode}, LLM=${params.use_llm}`, sessionId);
    }

    const client = new ScrapeDoClient();
    const markdownCleaner = new MarkdownCleaner();
    const llmProcessor = createLLMProcessor();

    // Scrape all URLs
    const results = await client.scrapeMultipleURLs(params.urls, {
      mode: params.mode,
      timeout: params.timeout,
      country: params.country,
    });

    if (sessionId && logger) {
      await logger('info', `Scraping complete. Processing ${results.length} results...`, sessionId);
    }

    let successful = 0;
    let failed = 0;
    let totalCredits = 0;
    const contents: string[] = [];

    // Process each result with progress logging
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      
      if (!result) continue;
      
      if (sessionId && logger) {
        await logger('info', `[${i + 1}/${results.length}] Processing ${result.url}`, sessionId);
      }
      
      if (result.statusCode === 200 || result.statusCode < 400) {
        successful++;
        totalCredits += result.credits;

        // Clean HTML to markdown
        let content = markdownCleaner.processContent(result.content);

        // LLM processing if enabled
        if (params.use_llm && llmProcessor) {
          if (sessionId && logger) {
            await logger('info', `[${i + 1}/${results.length}] Applying LLM extraction...`, sessionId);
          }
          
          const llmResult = await processContentWithLLM(
            content,
            {
              use_llm: params.use_llm,
              what_to_extract: params.what_to_extract,
            },
            llmProcessor
          );
          content = llmResult.content;
          
          if (sessionId && logger) {
            const status = llmResult.processed ? 'complete' : 'skipped';
            await logger('info', `[${i + 1}/${results.length}] LLM processing ${status}`, sessionId);
          }
        }

        // Remove meta tags
        content = removeMetaTags(content);

        contents.push(`## ${result.url}\n\n${content}`);
      } else {
        failed++;
        contents.push(`## ${result.url}\n\n❌ Failed to scrape: ${result.content}`);
        
        if (sessionId && logger) {
          await logger('error', `[${i + 1}/${results.length}] Failed: ${result.statusCode}`, sessionId);
        }
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
