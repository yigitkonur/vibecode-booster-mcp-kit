import { parseEnvironmentVariables } from '../utils/env-config';

export interface ScrapeDoRequest {
  url: string;
  mode: 'basic' | 'premium' | 'javascript' | undefined;
  timeout: number | undefined;
  country: string | undefined;
  waitFor: number | undefined;
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

  async scrapeURL(request: ScrapeDoRequest): Promise<ScrapeDoResponse> {
    const { url, mode = 'basic', timeout = 30, country, waitFor } = request;

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

    if (mode === 'javascript' && waitFor) {
      params.append('waitForSelector', String(waitFor));
    }

    const apiUrl = `${this.baseURL}?${params.toString()}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
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
      throw new Error(`Failed to scrape URL: ${error instanceof Error ? error.message : String(error)}`);
    }
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
