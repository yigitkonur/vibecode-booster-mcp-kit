/**
 * Validate required environment variable
 */
export function validateEnvVar(varName: string): string {
  const value = process.env[varName];
  if (!value?.trim()) {
    throw new Error(`${varName} environment variable is required but not set`);
  }
  return value;
}

/**
 * Validate API key is configured
 */
export function validateApiKey(apiKey: string): void {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error(
      'OPENROUTER_API_KEY environment variable is required. Please set it in your .env file or environment.'
    );
  }
}
