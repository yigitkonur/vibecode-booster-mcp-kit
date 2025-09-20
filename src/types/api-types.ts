/**
 * TEMPLATE: API Types and Interfaces for Third-Party Services
 *
 * CUSTOMIZATION GUIDE:
 * 1. Replace {{SERVICE_NAME}} with your service name
 * 2. Update {{SERVICE_NAME}}ApiParams with your API's specific parameters
 * 3. Add response interfaces that match your API's response format
 * 4. Include both raw and normalized response types if needed for data transformation
 *
 * TUTORIAL: This file demonstrates type safety best practices:
 * - Interface segregation: Separate interfaces for different API concerns
 * - Optional parameters: Use ? for optional API parameters
 * - Index signatures: [key: string]: unknown for flexible parameter passing
 * - Response normalization: Convert API responses to consistent internal formats
 */

/**
 * Parameters that can be sent to {{SERVICE_NAME}} API
 *
 * TUTORIAL: This interface defines the shape of API request parameters:
 * - Use optional properties (?) for parameters that aren't always required
 * - Include common authentication fields (token, api_key, etc.)
 * - Add service-specific parameters based on your API documentation
 * - The index signature allows passing additional parameters dynamically
 *
 * EXAMPLES for different services:
 * - OpenAI: model, prompt, temperature, max_tokens, etc.
 * - Stripe: amount, currency, customer, payment_method, etc.
 * - GitHub: owner, repo, per_page, page, etc.
 */
export interface {{SERVICE_NAME}}ApiParams {
  // TODO: Replace these with your service's actual parameters

  // Common authentication parameters (choose one that matches your API):
  token?: string;           // Generic token-based auth
  // api_key?: string;      // Alternative: API key
  // access_token?: string; // Alternative: OAuth access token

  // Common request parameters (customize for your service):
  url?: string;             // For services that process URLs
  // id?: string;           // For services that work with resource IDs
  // query?: string;        // For search-based services
  // data?: unknown;        // For services that accept arbitrary data

  // Service-specific parameters (replace with your API's parameters):
  output?: string;          // Example: output format preference
  // model?: string;        // Example: for AI services
  // limit?: number;        // Example: for paginated responses
  // format?: string;       // Example: response format

  // Flexible parameter support for additional API parameters
  [key: string]: unknown;
}

/**
 * Raw response from {{SERVICE_NAME}} API (preserves original format)
 *
 * TUTORIAL: Raw response interfaces capture the exact format returned by the API:
 * - Preserve original field names and casing (PascalCase, snake_case, etc.)
 * - Use this when you need to handle the API response exactly as received
 * - Helpful for debugging and understanding the original API structure
 *
 * TODO: Replace with your service's actual response structure
 */
export interface Raw{{SERVICE_NAME}}Response {
  // TODO: Define the exact structure your API returns
  // Example fields (replace with actual API response fields):
  IsActive: boolean;
  ConcurrentRequest: number;
  MaxMonthlyRequest: number;
  RemainingConcurrentRequest: number;
  RemainingMonthlyRequest: number;
}

/**
 * Normalized response (converted to consistent internal format)
 *
 * TUTORIAL: Normalized interfaces provide consistent naming and structure:
 * - Convert to snake_case or camelCase for consistency
 * - Add computed fields or transform data types if needed
 * - Makes the rest of your codebase independent of API format changes
 * - Easier to work with in TypeScript
 *
 * TODO: Define your normalized response structure
 */
export interface {{SERVICE_NAME}}Response {
  // TODO: Define your normalized response structure
  // Example: Convert from Raw{{SERVICE_NAME}}Response to consistent format
  is_active: boolean;
  concurrency_limit: number;
  remaining_concurrency: number;
  monthly_limit: number;
  remaining_monthly_requests: number;
}
