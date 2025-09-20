/**
 * Simple error handling for JINA API
 */

export function createSimpleError(error: any): { message: string; code: string } {
  // Missing API key
  if (error.message?.includes('JINA_API_KEY')) {
    return { message: 'JINA_API_KEY environment variable required', code: 'AUTH_ERROR' };
  }

  // HTTP errors
  if (error.response?.status) {
    const status = error.response.status;
    switch (status) {
      case 401:
        return { message: 'Invalid JINA API key', code: 'AUTH_ERROR' };
      case 429:
        return { message: 'Rate limit exceeded - try again later', code: 'RATE_LIMIT' };
      case 403:
        return { message: 'API quota exceeded', code: 'QUOTA_ERROR' };
      default:
        return { message: `API error: ${status}`, code: 'API_ERROR' };
    }
  }

  // Network/timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return { message: 'Request timeout - try reducing parameters', code: 'TIMEOUT' };
  }

  return { message: error.message || 'Unknown error occurred', code: 'UNKNOWN_ERROR' };
}