/**
 * Markdown cleaner service using Turndown for HTML to Markdown conversion
 */
import TurndownService from 'turndown';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

// Remove script, style, nav, footer, aside elements
turndown.remove(['script', 'style', 'nav', 'footer', 'aside', 'noscript']);

export class MarkdownCleaner {
  /**
   * Process HTML content and convert to clean Markdown
   * NEVER throws - returns original content on any error for graceful degradation
   */
  processContent(htmlContent: string): string {
    try {
      // Handle null/undefined/non-string inputs gracefully
      if (!htmlContent || typeof htmlContent !== 'string') {
        return htmlContent || '';
      }

      // If already markdown (no HTML tags), return as-is
      if (!htmlContent.includes('<')) {
        return htmlContent.trim();
      }

      // Remove HTML comments before conversion
      let content = htmlContent.replace(/<!--[\s\S]*?-->/g, '');

      // Convert HTML to Markdown using Turndown
      content = turndown.turndown(content);

      // Clean up whitespace
      content = content.replace(/\n{3,}/g, '\n\n');
      content = content.trim();

      return content;
    } catch (error) {
      // Log error but don't crash - return original content for graceful degradation
      console.error(
        '[MarkdownCleaner] processContent failed:',
        error instanceof Error ? error.message : String(error),
        '| Content length:',
        htmlContent?.length ?? 0
      );
      // Return original content if conversion fails
      return htmlContent || '';
    }
  }
}
