/**
 * Simple error handling for API requests
 */
export function createSimpleError(error: unknown): { message: string; code: string } {
  const err = error as { message?: string; response?: { status?: number }; code?: string };

  // Missing API key
  if (err.message?.includes('API_KEY')) {
    return { message: 'OPENROUTER_API_KEY environment variable required', code: 'AUTH_ERROR' };
  }

  // HTTP errors
  if (err.response?.status) {
    const status = err.response.status;
    switch (status) {
      case 401:
        return { message: 'Invalid API key', code: 'AUTH_ERROR' };
      case 429:
        return { message: 'Rate limit exceeded - try again later', code: 'RATE_LIMIT' };
      case 403:
        return { message: 'API quota exceeded', code: 'QUOTA_ERROR' };
      default:
        return { message: `API error: ${status}`, code: 'API_ERROR' };
    }
  }

  // Network/timeout errors
  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return { message: 'Request timeout - research may take up to 30 minutes', code: 'TIMEOUT' };
  }

  return { message: err.message || 'Unknown error occurred', code: 'UNKNOWN_ERROR' };
}
