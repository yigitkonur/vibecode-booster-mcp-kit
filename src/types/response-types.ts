/**
 * Response format types for enhanced scraping responses
 */

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
 * MCP tool response content structure
 */
export interface McpToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}
