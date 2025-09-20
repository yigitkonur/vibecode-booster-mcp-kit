/**
 * JINA DeepSearch Response Formatting Utilities
 *
 * This file provides specialized formatting for JINA DeepSearch API responses.
 * Features comprehensive research result presentation with URL tracking and metadata.
 */

import type { JINAApiParams, JINAResponse } from '../types/api-types';

/**
 * Formats JINA DeepSearch research results with comprehensive metadata
 *
 * @param response - JINA API response
 * @param params - Original request parameters
 * @returns Formatted research results
 */
export function formatResearchResponse(response: JINAResponse, params: JINAApiParams): string {
  const content = response.choices?.[0]?.message?.content || 'No research results available';
  const tokensUsed = response.usage?.total_tokens;
  const visitedUrls = response.visitedURLs || [];
  const readUrls = response.readURLs || [];

  // Build the formatted response
  const parts = ['# 🔍 JINA DeepSearch Research Results', '', `**Query:** ${params.query}`];

  // Add research parameters if provided
  if (params.reasoning_effort) {
    parts.push(`**Reasoning Effort:** ${params.reasoning_effort}`);
  }
  if (params.team_size) {
    parts.push(`**Team Size:** ${params.team_size} agents`);
  }
  if (params.budget_tokens) {
    parts.push(`**Budget:** ${params.budget_tokens} tokens`);
  }

  parts.push('', '---', '');

  // Add main research content
  parts.push(content);

  // Add metadata section
  if (tokensUsed || visitedUrls.length > 0 || readUrls.length > 0) {
    parts.push('', '---', '', '## 📊 Research Metadata');

    if (tokensUsed) {
      parts.push(`**Tokens Used:** ${tokensUsed.toLocaleString()}`);
    }

    if (visitedUrls.length > 0) {
      parts.push(`**URLs Visited:** ${visitedUrls.length}`);
      for (const url of visitedUrls.slice(0, 10)) {
        parts.push(`• ${url}`);
      }
      if (visitedUrls.length > 10) {
        parts.push(`• ... and ${visitedUrls.length - 10} more`);
      }
    }

    if (readUrls.length > 0) {
      parts.push(`**URLs Successfully Read:** ${readUrls.length}`);
      for (const url of readUrls.slice(0, 10)) {
        parts.push(`• ${url}`);
      }
      if (readUrls.length > 10) {
        parts.push(`• ... and ${readUrls.length - 10} more`);
      }
    }
  }

  return parts.join('\n');
}

/**
 * Utility function for human-readable data sizes
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
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
