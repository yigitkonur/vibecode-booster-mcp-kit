import { parseEnvironmentVariables } from '../utils/env-config';

export interface ScrapeDoRequest {
  url: string;
  mode: 'basic' | 'premium' | 'javascript' | undefined;
  timeout: number | undefined;
  country: string | undefined;
}

export interface ScrapeDoResponse {
  content: string;
  statusCode: number;
  credits: number;
  headers?: Record<string, string>;
}

export class ScrapeDoClient {
  private apiKey: string;
  private baseURL = 'https://api.scrape.do';

  constructor(apiKey?: string) {
    const env = parseEnvironmentVariables();
    this.apiKey = apiKey || env.SCRAPEDO_API_KEY;

    if (!this.apiKey) {
      throw new Error('SCRAPEDO_API_KEY is required');
    }
  }

  async scrapeURL(request: ScrapeDoRequest, maxRetries: number = 3): Promise<ScrapeDoResponse> {
    const { url, mode = 'basic', timeout = 30, country } = request;

    // Block premium/super mode - enterprise only
    if (mode === 'premium') {
      throw new Error('Premium/Super Proxy mode is not available in your plan. Use basic or javascript mode instead.');
    }

    // Build query parameters - only add params when needed
    const params = new URLSearchParams({
      url: url,
      token: this.apiKey,
      timeout: String(timeout * 1000),
    });

    // Only add render param for javascript mode
    if (mode === 'javascript') {
      params.append('render', 'true');
    }

    // Only add geoCode if specified
    if (country) {
      params.append('geoCode', country.toUpperCase());
    }

    // Note: Scrape.do handles wait times automatically in JavaScript mode
    // The 'timeout' parameter controls maximum wait time
    // Custom wait/selector parameters are not supported by their API

    const apiUrl = `${this.baseURL}?${params.toString()}`;
    const baseDelay = 1000; // 1 second

    // Retry logic with exponential backoff
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'text/html,application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          
          // Don't retry on client errors (4xx) except 429 (rate limit)
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw new Error(`Scrape.do API error: ${response.status} ${errorText}`);
          }
          
          // Retry on server errors (5xx) or rate limits (429)
          if (attempt < maxRetries - 1) {
            const delay = baseDelay * Math.pow(2, attempt);
            console.error(`[Scrape.do] Retry ${attempt + 1}/${maxRetries} after ${delay}ms for ${url} (status: ${response.status})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          throw new Error(`Scrape.do API error: ${response.status} ${errorText}`);
        }

        const content = await response.text();
        
        // Extract credits from headers
        const credits = mode === 'javascript' ? 5 : 1;

        return {
          content,
          statusCode: response.status,
          credits,
          headers: Object.fromEntries(response.headers.entries()),
        };
      } catch (error) {
        // If this is the last attempt, throw the error
        if (attempt === maxRetries - 1) {
          throw new Error(`Failed to scrape URL after ${maxRetries} attempts: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        // Otherwise, wait and retry (only for network errors)
        if (error instanceof Error && !error.message.includes('API error')) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.error(`[Scrape.do] Network error, retry ${attempt + 1}/${maxRetries} after ${delay}ms: ${error.message}`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Don't retry API errors
          throw error;
        }
      }
    }
    
    // This should never be reached, but TypeScript needs it
    throw new Error('Unexpected retry loop exit');
  }

  async scrapeURLWithFallback(url: string, request: Omit<ScrapeDoRequest, 'url' | 'mode'>): Promise<ScrapeDoResponse> {
    const attempts: Array<{ mode: 'basic' | 'javascript'; country?: string; description: string }> = [
      { mode: 'basic', description: 'basic mode' },
      { mode: 'javascript', description: 'javascript rendering' },
      { mode: 'javascript', country: 'us', description: 'javascript + US geo-targeting' },
    ];

    let lastError: Error | null = null;
    const attemptResults: string[] = [];

    for (const attempt of attempts) {
      try {
        const result = await this.scrapeURL({
          url,
          mode: attempt.mode,
          timeout: request.timeout,
          country: attempt.country,
        });

        // Success - return immediately
        if (result.statusCode === 200 || result.statusCode < 400) {
          if (attemptResults.length > 0) {
            console.error(`[Scrape.do] Success with ${attempt.description} after ${attemptResults.length} failed attempt(s)`);
          }
          return result;
        }

        // 404 means content not found - no point trying other modes
        if (result.statusCode === 404) {
          return {
            content: '404 - Page not found',
            statusCode: 404,
            credits: result.credits,
          };
        }

        // Other non-200 status - try next fallback
        attemptResults.push(`${attempt.description}: ${result.statusCode}`);
        lastError = new Error(`Status ${result.statusCode}`);
        console.error(`[Scrape.do] Failed with ${attempt.description} (status: ${result.statusCode}), trying next fallback...`);
      } catch (error) {
        attemptResults.push(`${attempt.description}: ${error instanceof Error ? error.message : String(error)}`);
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[Scrape.do] Error with ${attempt.description}: ${lastError.message}`);
      }
    }

    // All attempts failed
    throw new Error(`Failed to scrape ${url} after trying all fallback modes:\n${attemptResults.join('\n')}`);
  }

  async scrapeMultipleURLs(urls: string[], request: Omit<ScrapeDoRequest, 'url'>): Promise<Array<ScrapeDoResponse & { url: string }>> {
    // Always use intelligent fallback mechanism (basic → javascript → javascript+geo)
    const results = await Promise.allSettled(
      urls.map(url => this.scrapeURLWithFallback(url, request))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return { ...result.value, url: urls[index] || '' };
      } else {
        return {
          url: urls[index] || '',
          content: `Error: ${result.reason}`,
          statusCode: 500,
          credits: 0,
        };
      }
    });
  }
}
