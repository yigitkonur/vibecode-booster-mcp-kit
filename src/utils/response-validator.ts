/**
 * Basic content validation
 */

/**
 * Basic content sanitization - remove HTML and normalize whitespace
 */
export function sanitizeContent(content: string): string {
  if (!content || typeof content !== 'string') return '';

  return content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}