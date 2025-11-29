/**
 * Simple markdown cleaner service
 * Converts HTML to markdown and cleans up scraped content
 */
export class MarkdownCleaner {
  processContent(htmlContent: string): string {
    if (!htmlContent || typeof htmlContent !== 'string') {
      return htmlContent;
    }

    // Basic HTML to markdown conversion
    let content = htmlContent;

    // Remove script and style tags
    content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Remove HTML comments
    content = content.replace(/<!--[\s\S]*?-->/g, '');

    // Basic tag cleanup (preserve structure if already markdown)
    if (!content.includes('<')) {
      return content;
    }

    // Simple conversions
    content = content.replace(/<br\s*\/?>/gi, '\n');
    content = content.replace(/<\/p>/gi, '\n\n');
    content = content.replace(/<p[^>]*>/gi, '');
    content = content.replace(/<\/div>/gi, '\n');
    content = content.replace(/<div[^>]*>/gi, '');

    // Headers
    content = content.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n');
    content = content.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n');
    content = content.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n');

    // Lists
    content = content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    content = content.replace(/<\/ul>/gi, '\n');
    content = content.replace(/<ul[^>]*>/gi, '');

    // Links
    content = content.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');

    // Strong/bold
    content = content.replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gi, '**$2**');

    // Emphasis/italic
    content = content.replace(/<(em|i)[^>]*>(.*?)<\/\1>/gi, '*$2*');

    // Remove remaining HTML tags
    content = content.replace(/<[^>]+>/g, '');

    // Decode HTML entities
    content = content.replace(/&nbsp;/g, ' ');
    content = content.replace(/&quot;/g, '"');
    content = content.replace(/&apos;/g, "'");
    content = content.replace(/&lt;/g, '<');
    content = content.replace(/&gt;/g, '>');
    content = content.replace(/&amp;/g, '&');

    // Clean up whitespace
    content = content.replace(/\n{3,}/g, '\n\n');
    content = content.trim();

    return content;
  }
}
