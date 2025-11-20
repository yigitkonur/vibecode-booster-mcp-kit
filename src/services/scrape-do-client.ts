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

    // Build query parameters
    const params = new URLSearchParams({
      url: url,
      token: this.apiKey,
      timeout: String(timeout * 1000),
      render: mode === 'javascript' ? 'true' : 'false',
      super: mode === 'premium' ? 'true' : 'false',
    });

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
        const credits = mode === 'javascript' ? 5 : mode === 'premium' ? 10 : 1;

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

  async scrapeMultipleURLs(urls: string[], request: Omit<ScrapeDoRequest, 'url'>): Promise<Array<ScrapeDoResponse & { url: string }>> {
    const results = await Promise.allSettled(
      urls.map(url => this.scrapeURL({ ...request, url }))
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
