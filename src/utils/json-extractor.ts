/**
 * Utility to extract JSON from text that may be wrapped in markdown code blocks
 * Grok sometimes returns JSON wrapped in ```json blocks despite being told not to
 */

/**
 * Extract JSON from text, handling markdown code blocks
 */
export function extractJson(text: string): string {
  // Remove markdown code blocks if present
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch?.[1]) {
    return jsonBlockMatch[1].trim();
  }

  // Remove generic code blocks
  const codeBlockMatch = text.match(/```\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch?.[1]) {
    return codeBlockMatch[1].trim();
  }

  // Return as-is if no code blocks found
  return text.trim();
}

/**
 * Parse JSON with markdown extraction
 */
export function parseJsonSafely(text: string): object | null {
  try {
    const extracted = extractJson(text);
    return JSON.parse(extracted);
  } catch (error) {
    return null;
  }
}
