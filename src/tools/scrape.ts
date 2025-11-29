/**
 * Scrape Links Tool Handler
 */

import type { ScrapeLinksParams, ScrapeLinksOutput } from '../schemas/scrape-links.js';
import { ScraperClient } from '../clients/scraper.js';
import { MarkdownCleaner } from '../services/markdown-cleaner.js';
import { createLLMProcessor, processContentWithLLM } from '../services/llm-processor.js';
import { removeMetaTags } from '../utils/markdown-formatter.js';
import { SCRAPER } from '../config/index.js';

interface ToolOptions {
  sessionId?: string;
  logger?: (level: 'info' | 'error' | 'debug', message: string, sessionId: string) => Promise<void>;
}

function calculateTokenAllocation(urlCount: number): number {
  return Math.floor(SCRAPER.MAX_TOKENS_BUDGET / urlCount);
}

function enhanceExtractionInstruction(instruction: string | undefined): string {
  const base = instruction || 'Extract the main content and key information from this page.';
  return `${base}\n\n${SCRAPER.EXTRACTION_SUFFIX}`;
}

export async function handleScrapeLinks(
  params: ScrapeLinksParams,
  options: ToolOptions = {}
): Promise<{ content: string; structuredContent: ScrapeLinksOutput }> {
  const { sessionId, logger } = options;
  const startTime = Date.now();

  try {
    const tokensPerUrl = calculateTokenAllocation(params.urls.length);
    const totalBatches = Math.ceil(params.urls.length / SCRAPER.BATCH_SIZE);

    if (sessionId && logger) {
      await logger('info', `Starting scrape: ${params.urls.length} URL(s), ${tokensPerUrl} tokens/URL, ${totalBatches} batch(es)`, sessionId);
    }

    const client = new ScraperClient();
    const markdownCleaner = new MarkdownCleaner();
    const llmProcessor = createLLMProcessor();

    const enhancedInstruction = params.use_llm
      ? enhanceExtractionInstruction(params.what_to_extract)
      : undefined;

    const results = await client.scrapeMultiple(params.urls, { timeout: params.timeout });

    if (sessionId && logger) {
      await logger('info', `Scraping complete. Processing ${results.length} results...`, sessionId);
    }

    let successful = 0;
    let failed = 0;
    let totalCredits = 0;
    const contents: string[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (!result) continue;

      if (sessionId && logger) {
        await logger('info', `[${i + 1}/${results.length}] Processing ${result.url}`, sessionId);
      }

      if (result.statusCode >= 200 && result.statusCode < 300) {
        successful++;
        totalCredits += result.credits;

        let content = markdownCleaner.processContent(result.content);

        if (params.use_llm && llmProcessor) {
          if (sessionId && logger) {
            await logger('info', `[${i + 1}/${results.length}] Applying LLM extraction (${tokensPerUrl} tokens)...`, sessionId);
          }

          const llmResult = await processContentWithLLM(
            content,
            { use_llm: params.use_llm, what_to_extract: enhancedInstruction, max_tokens: tokensPerUrl },
            llmProcessor
          );
          content = llmResult.content;

          if (sessionId && logger) {
            await logger('info', `[${i + 1}/${results.length}] LLM processing ${llmResult.processed ? 'complete' : 'skipped'}`, sessionId);
          }
        }

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

    const allocationHeader = `**Token Allocation:** ${tokensPerUrl.toLocaleString()} tokens/URL (${params.urls.length} URLs, ${SCRAPER.MAX_TOKENS_BUDGET.toLocaleString()} total budget)`;
    const statusHeader = `**Status:** ✅ ${successful} successful | ❌ ${failed} failed | 📦 ${totalBatches} batch(es)`;
    const formattedContent = `# Scraped Content (${params.urls.length} URLs)\n\n${allocationHeader}\n${statusHeader}\n\n---\n\n${contents.join('\n\n---\n\n')}`;

    const metadata = {
      total_urls: params.urls.length,
      successful,
      failed,
      total_credits: totalCredits,
      execution_time_ms: executionTime,
      tokens_per_url: tokensPerUrl,
      total_token_budget: SCRAPER.MAX_TOKENS_BUDGET,
      batches_processed: totalBatches,
    };

    return { content: formattedContent, structuredContent: { content: formattedContent, metadata } };
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
