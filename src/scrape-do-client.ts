import axios from 'axios';

/**
 * Parameters that can be sent to Scrape.do API
 */
interface ScrapeDoApiParams {
  url?: string;
  token?: string;
  output?: string;
  disableRedirection?: boolean;
  super?: boolean;
  geoCode?: string;
  render?: boolean;
  customWait?: number;
  waitSelector?: string;
  playWithBrowser?: string;
  [key: string]: unknown;
}

/**
 * Enhanced response from Scrape.do API with metadata
 */
export interface ScrapeDoResponse {
  content: string;
  metadata: {
    statusCode: number;
    contentType: string;
    contentLength: number;
    finalUrl: string;
    title?: string;
  };
}

/**
 * Scrape.do API client for making requests to scraping endpoints
 * @param params - Request parameters to send to the API
 * @param endpoint - API endpoint path (defaults to main scraping endpoint)
 * @returns Promise resolving to the API response data or enhanced response with metadata
 */
export async function scrapeDoClient(
  params: Record<string, unknown> = {},
  endpoint: string = ''
): Promise<string | ScrapeDoResponse> {
  const token = process.env['SCRAPEDO_TOKEN'];
  if (!token?.trim()) {
    throw new Error('SCRAPEDO_TOKEN environment variable is required but not set');
  }

  const requestParams: ScrapeDoApiParams = {
    token,
    ...params,
  };

  // Enforce markdown output for main scraping endpoint
  if (!endpoint || endpoint === '/') {
    requestParams.output = 'markdown';
  }

  const baseUrl = 'https://api.scrape.do';
  const url = endpoint ? `${baseUrl}${endpoint}` : `${baseUrl}/`;

  const response = await axios.get(url, { params: requestParams });

  // For info endpoint, return raw data
  if (endpoint.includes('/info/')) {
    return response.data;
  }

  // For scraping endpoints, extract metadata and return enhanced response
  const content = response.data as string;
  const statusCode = response.status || 200;
  const contentType = response.headers?.['content-type'] || 'text/html';
  const contentLength = typeof content === 'string' ? content.length : 0;
  const finalUrl = params.url as string; // Scrape.do follows redirects internally

  // Extract title from markdown content if available (only if content is a string)
  const titleMatch = typeof content === 'string' ? content.match(/^# (.+)$/m) : null;
  const title = titleMatch?.[1];

  const metadata: ScrapeDoResponse['metadata'] = {
    statusCode,
    contentType,
    contentLength,
    finalUrl,
  };

  if (title) {
    metadata.title = title;
  }

  return {
    content,
    metadata,
  };
}
