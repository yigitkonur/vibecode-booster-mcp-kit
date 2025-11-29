/**
 * Markdown formatting utilities
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
