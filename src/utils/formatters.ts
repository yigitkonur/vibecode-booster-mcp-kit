/**
 * TEMPLATE: Content Formatting Utilities
 *
 * CUSTOMIZATION GUIDE:
 * 1. Update {{SERVICE_NAME}}Response type import to match your service
 * 2. Customize formatting functions for your service's response types
 * 3. Add service-specific formatting utilities as needed
 * 4. Modify metadata extraction logic for your API responses
 * 5. Update content presentation format (markdown, JSON, etc.)
 *
 * TUTORIAL: This file provides consistent response formatting across all tools:
 * - Standardizes how responses are presented to users
 * - Extracts and displays metadata in a readable format
 * - Handles different response types gracefully
 * - Provides utilities for common formatting needs
 */

import type { {{SERVICE_NAME}}Response } from '../types/response-types';

/**
 * TUTORIAL: Utility function for human-readable data sizes
 *
 * This is a generic utility that works for any service that reports data sizes.
 * Useful for APIs that return file sizes, content lengths, or data usage.
 *
 * @param bytes - Size in bytes
 * @returns Formatted size string (e.g., "1.2 KB", "3.4 MB")
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * TUTORIAL: Generic content title extraction
 *
 * Useful for services that return content with titles (web scraping, document APIs, etc.)
 * Customize the regex pattern based on your service's content format.
 *
 * TODO: Update the extraction logic for your service's content format
 * Examples:
 * - HTML: /<title>(.+)<\/title>/i
 * - JSON: Extract from specific field like data.title
 * - XML: Extract from <title> or other elements
 *
 * @param content - Content to search for title
 * @returns Extracted title or undefined if not found
 */
export function extractTitle(content: string): string | undefined {
  // TODO: Customize title extraction for your service
  // Current implementation extracts markdown H1 titles
  const titleMatch = content.match(/^# (.+)$/m);
  return titleMatch?.[1];

  // Examples for other content types:
  // HTML: return content.match(/<title>(.+?)<\/title>/i)?.[1];
  // JSON: const parsed = JSON.parse(content); return parsed.title;
  // XML: return content.match(/<title>(.+?)<\/title>/i)?.[1];
}

/**
 * TUTORIAL: Main response formatting function
 *
 * This function creates a consistent presentation format for all tool responses.
 * It handles both simple string responses and complex response objects with metadata.
 *
 * Customization points:
 * - Update metadata fields to match your service's response structure
 * - Modify header format to highlight important information
 * - Add service-specific formatting for different response types
 *
 * TODO: Update response type and formatting logic for your service
 *
 * @param response - Response from your service (string or enhanced response object)
 * @param fallbackUrl - Fallback identifier when response is a simple string
 * @returns Formatted content with metadata header
 */
export function formatServiceResponse(
  response: string | {{SERVICE_NAME}}Response,
  fallbackIdentifier?: string
): string {
  // TUTORIAL: Handle backward compatibility for simple string responses
  if (typeof response === 'string') {
    const content = response;
    const title = extractTitle(content);

    // TODO: Customize metadata header for your service
    const header = [
      title ? `# Title: ${title}` : '# {{SERVICE_NAME}} Response',
      `Status: 200 | Content-Type: application/json | Size: ${formatSize(content.length)}`,
      fallbackIdentifier ? `ID: ${fallbackIdentifier}` : '',
      '---',
      '',
    ].join('\n');

    return header + content;
  }

  // TUTORIAL: Handle enhanced response format with metadata
  const { content, metadata } = response;
  // TODO: Update these field names to match your service's metadata structure
  const { statusCode, contentType, contentLength, finalUrl, title } = metadata;

  // TODO: Customize header format for your service's metadata
  const header = [
    title ? `# Title: ${title}` : '# {{SERVICE_NAME}} Response',
    `Status: ${statusCode} | Content-Type: ${contentType} | Size: ${formatSize(contentLength)}`,
    `URL: ${finalUrl}`,
    // Add more metadata fields as needed:
    // `Model: ${metadata.model}`,              // For AI services
    // `Credits Used: ${metadata.creditsUsed}`, // For usage-based services
    // `Processing Time: ${metadata.processingTime}ms`, // For performance metrics
    '---',
    '',
  ].join('\n');

  return header + content;
}

/**
 * TUTORIAL: Legacy function name for backward compatibility
 *
 * TODO: Remove this after updating all tool files to use formatServiceResponse
 */
export function formatScrapedContent(
  response: string | {{SERVICE_NAME}}Response,
  fallbackUrl?: string
): string {
  return formatServiceResponse(response, fallbackUrl);
}

/**
 * TUTORIAL: MCP Response Creation Utility
 *
 * This function creates standardized MCP protocol responses that Claude Code expects.
 * All tool functions should return responses created by this utility for consistency.
 *
 * MCP Response Format:
 * - content: Array of content blocks (text, images, etc.)
 * - isError: Optional flag to mark error responses
 * - metadata: Optional additional metadata
 *
 * @param text - Text content to return to Claude Code
 * @param isError - Whether this is an error response
 * @returns Formatted MCP response object
 */
export function createTextResponse(text: string, isError = false) {
  return {
    content: [{ type: 'text' as const, text }],
    ...(isError && { isError: true }),
  };
}

/**
 * TEMPLATE: Additional formatting utilities for different service types
 *
 * TODO: Add service-specific formatting functions as needed
 */

// Example: Format AI/ML service responses
// export function formatAIResponse(response: AIResponse): string {
//   const { content, model, tokens_used, processing_time } = response;
//   const header = [
//     `# AI Generated Content`,
//     `Model: ${model} | Tokens: ${tokens_used} | Time: ${processing_time}ms`,
//     '---',
//     '',
//   ].join('\n');
//   return header + content;
// }

// Example: Format data service responses
// export function formatDataResponse(response: DataResponse): string {
//   const { results, total_count, query_time } = response;
//   const header = [
//     `# Search Results`,
//     `Found: ${results.length} of ${total_count} | Query Time: ${query_time}ms`,
//     '---',
//     '',
//   ].join('\n');
//   return header + JSON.stringify(results, null, 2);
// }

// Example: Format financial/payment service responses
// export function formatPaymentResponse(response: PaymentResponse): string {
//   const { transaction_id, amount, currency, status } = response;
//   const header = [
//     `# Payment Transaction`,
//     `ID: ${transaction_id} | Amount: ${amount} ${currency.toUpperCase()} | Status: ${status}`,
//     '---',
//     '',
//   ].join('\n');
//   return header + JSON.stringify(response, null, 2);
// }

// Example: Format media processing service responses
// export function formatMediaResponse(response: MediaResponse): string {
//   const { file_url, operations, file_size, processing_time } = response;
//   const header = [
//     `# Media Processing Complete`,
//     `File: ${file_url} | Size: ${formatSize(file_size)} | Time: ${processing_time}ms`,
//     `Operations: ${operations.join(', ')}`,
//     '---',
//     '',
//   ].join('\n');
//   return header + JSON.stringify(response, null, 2);
// }

/**
 * TUTORIAL: Formatting Best Practices
 *
 * 1. **Consistency**: Use the same header format across all tools
 * 2. **Metadata**: Include relevant metadata that helps users understand the response
 * 3. **Readability**: Use clear separators and formatting for easy scanning
 * 4. **Size Information**: Always include content size for large responses
 * 5. **Error Context**: Provide helpful context in error messages
 * 6. **Performance Data**: Include timing information when relevant
 * 7. **Resource Usage**: Show credits, tokens, or other usage metrics
 * 8. **Identifiers**: Include IDs, URLs, or other identifiers for tracking
 */
