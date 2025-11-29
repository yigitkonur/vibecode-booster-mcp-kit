/**
 * Web Scraper Client
 * Generic interface for URL scraping with automatic fallback modes
 */

import { parseEnv, SCRAPER } from '../config/index.js';

export interface ScrapeRequest {
  url: string;
  mode?: 'basic' | 'javascript';
  timeout?: number;
  country?: string;
}

export interface ScrapeResponse {
  content: string;
  statusCode: number;
  credits: number;
  headers?: Record<string, string>;
}

export interface BatchScrapeResult {
  results: Array<ScrapeResponse & { url: string }>;
  batchesProcessed: number;
  totalAttempted: number;
  rateLimitHits: number;
}

export class ScraperClient {
  private apiKey: string;
  private baseURL = 'https://api.scrape.do';

  constructor(apiKey?: string) {
    const env = parseEnv();
    this.apiKey = apiKey || env.SCRAPER_API_KEY;

    if (!this.apiKey) {
      throw new Error('SCRAPEDO_API_KEY is required');
    }
  }

  async scrape(request: ScrapeRequest, maxRetries = SCRAPER.RETRY_COUNT): Promise<ScrapeResponse> {
    const { url, mode = 'basic', timeout = 30, country } = request;

    const params = new URLSearchParams({
      url: url,
      token: this.apiKey,
      timeout: String(timeout * 1000),
    });

    if (mode === 'javascript') {
      params.append('render', 'true');
    }

    if (country) {
      params.append('geoCode', country.toUpperCase());
    }

    const apiUrl = `${this.baseURL}?${params.toString()}`;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: { Accept: 'text/html,application/json' },
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');

          if (response.status === 429) {
            if (attempt < maxRetries - 1) {
              const delay = SCRAPER.RETRY_DELAYS[attempt] || 8000;
              console.error(`[Scraper] Rate limited (429). Retry ${attempt + 1}/${maxRetries} after ${delay}ms`);
              await this.delay(delay);
              continue;
            }
            throw new Error('Scraper rate limited. Try fewer URLs or retry later.');
          }

          if (response.status >= 400 && response.status < 500) {
            throw new Error(`Scraper API error: ${response.status} ${errorText}`);
          }

          if (attempt < maxRetries - 1) {
            const delay = SCRAPER.RETRY_DELAYS[attempt] || 8000;
            console.error(`[Scraper] Retry ${attempt + 1}/${maxRetries} after ${delay}ms (status: ${response.status})`);
            await this.delay(delay);
            continue;
          }

          throw new Error(`Scraper API error: ${response.status} ${errorText}`);
        }

        const content = await response.text();
        const credits = mode === 'javascript' ? 5 : 1;

        return {
          content,
          statusCode: response.status,
          credits,
          headers: Object.fromEntries(response.headers.entries()),
        };
      } catch (error) {
        if (attempt === maxRetries - 1) {
          throw new Error(`Failed to scrape URL after ${maxRetries} attempts: ${error instanceof Error ? error.message : String(error)}`);
        }

        if (error instanceof Error && !error.message.includes('API error') && !error.message.includes('rate limited')) {
          const delay = SCRAPER.RETRY_DELAYS[attempt] || 8000;
          console.error(`[Scraper] Network error, retry ${attempt + 1}/${maxRetries} after ${delay}ms: ${error.message}`);
          await this.delay(delay);
        } else {
          throw error;
        }
      }
    }

    throw new Error('Unexpected retry loop exit');
  }

  async scrapeWithFallback(url: string, options: { timeout?: number } = {}): Promise<ScrapeResponse> {
    const attempts: Array<{ mode: 'basic' | 'javascript'; country?: string; description: string }> = [
      { mode: 'basic', description: 'basic mode' },
      { mode: 'javascript', description: 'javascript rendering' },
      { mode: 'javascript', country: 'us', description: 'javascript + US geo-targeting' },
    ];

    const attemptResults: string[] = [];

    for (const attempt of attempts) {
      try {
        const result = await this.scrape({
          url,
          mode: attempt.mode,
          timeout: options.timeout,
          country: attempt.country,
        });

        if (result.statusCode >= 200 && result.statusCode < 300) {
          if (attemptResults.length > 0) {
            console.error(`[Scraper] Success with ${attempt.description} after ${attemptResults.length} failed attempt(s)`);
          }
          return result;
        }

        if (result.statusCode === 404) {
          return { content: '404 - Page not found', statusCode: 404, credits: result.credits };
        }

        attemptResults.push(`${attempt.description}: ${result.statusCode}`);
        console.error(`[Scraper] Failed with ${attempt.description} (status: ${result.statusCode}), trying next fallback...`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        attemptResults.push(`${attempt.description}: ${msg}`);
        console.error(`[Scraper] Error with ${attempt.description}: ${msg}`);
      }
    }

    throw new Error(`Failed to scrape ${url} after trying all fallback modes:\n${attemptResults.join('\n')}`);
  }

  async scrapeMultiple(urls: string[], options: { timeout?: number } = {}): Promise<Array<ScrapeResponse & { url: string }>> {
    if (urls.length <= SCRAPER.BATCH_SIZE) {
      return this.processBatch(urls, options);
    }

    const result = await this.batchScrape(urls, options);
    return result.results;
  }

  async batchScrape(
    urls: string[],
    options: { timeout?: number } = {},
    onBatchComplete?: (batchNum: number, totalBatches: number, processed: number) => void
  ): Promise<BatchScrapeResult> {
    const totalBatches = Math.ceil(urls.length / SCRAPER.BATCH_SIZE);
    const allResults: Array<ScrapeResponse & { url: string }> = [];
    let rateLimitHits = 0;

    console.error(`[Scraper] Starting batch processing: ${urls.length} URLs in ${totalBatches} batch(es)`);

    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
      const startIdx = batchNum * SCRAPER.BATCH_SIZE;
      const endIdx = Math.min(startIdx + SCRAPER.BATCH_SIZE, urls.length);
      const batchUrls = urls.slice(startIdx, endIdx);

      console.error(`[Scraper] Processing batch ${batchNum + 1}/${totalBatches} (${batchUrls.length} URLs)`);

      const batchResults = await Promise.allSettled(
        batchUrls.map(url => this.scrapeWithFallback(url, options))
      );

      for (let i = 0; i < batchResults.length; i++) {
        const result = batchResults[i];
        const url = batchUrls[i] || '';

        if (result.status === 'fulfilled') {
          allResults.push({ ...result.value, url });
        } else {
          const errorMsg = result.reason instanceof Error ? result.reason.message : String(result.reason);

          if (errorMsg.includes('rate limited') || errorMsg.includes('429')) {
            rateLimitHits++;
          }

          allResults.push({ url, content: `Error: ${errorMsg}`, statusCode: 500, credits: 0 });
        }
      }

      onBatchComplete?.(batchNum + 1, totalBatches, allResults.length);
      console.error(`[Scraper] Completed batch ${batchNum + 1}/${totalBatches} (${allResults.length}/${urls.length} total)`);

      if (batchNum < totalBatches - 1) {
        await this.delay(500);
      }
    }

    return { results: allResults, batchesProcessed: totalBatches, totalAttempted: urls.length, rateLimitHits };
  }

  private async processBatch(urls: string[], options: { timeout?: number }): Promise<Array<ScrapeResponse & { url: string }>> {
    const results = await Promise.allSettled(urls.map(url => this.scrapeWithFallback(url, options)));

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return { ...result.value, url: urls[index] || '' };
      }
      return { url: urls[index] || '', content: `Error: ${result.reason}`, statusCode: 500, credits: 0 };
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
