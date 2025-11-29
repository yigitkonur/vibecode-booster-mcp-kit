/**
 * Markdown formatting utilities for clean output
 */

export function removeMetaTags(content: string): string {
  if (!content || typeof content !== 'string') {
    return content;
  }

  const lines = content.split('\n');
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim();
    return !trimmed.startsWith('- Meta:') && !trimmed.startsWith('Meta:');
  });

  return filteredLines.join('\n');
}

interface ErrorDetails {
  toolName: string;
  url?: string;
  error: string;
  executionTime?: number;
  guidance?: string;
}

export function formatError(details: ErrorDetails): string {
  const { toolName, url, error, executionTime, guidance } = details;

  let markdown = `# ❌ ${toolName} Failed\n\n`;

  if (url) {
    markdown += `Failed to process: ${url}\n\n`;
  }

  markdown += `## Error\n${error}\n\n`;

  if (guidance) {
    markdown += `## Solution\n${guidance}\n\n`;
  }

  if (executionTime) {
    markdown += `\n---\n*Failed after ${(executionTime / 1000).toFixed(2)}s*`;
  }

  return markdown;
}

export function formatScrapingSuccess(content: string, url: string): string {
  const cleanContent = removeMetaTags(content);
  return `# Scraped Content from ${url}\n\n${cleanContent}\n`;
}

export const ERROR_GUIDANCE = {
  INVALID_API_KEY: 'Check your API key in environment variables (SCRAPEDO_API_KEY or SERPER_API_KEY)',
  INSUFFICIENT_CREDITS: 'Purchase credits or check your Scrape.do account balance',
  TIMEOUT: 'Increase timeout or try a different scraping mode',
  NETWORK_ERROR: 'Check your internet connection and API endpoint availability',
};
