/**
 * TEMPLATE: Generic API Client for Third-Party Services
 *
 * CUSTOMIZATION GUIDE:
 * 1. Replace {{SERVICE_NAME}} with your service name (e.g., "OpenAI", "Stripe", "GitHub")
 * 2. Update {{API_TOKEN_ENV_VAR}} with your API token environment variable name
 * 3. Modify {{ApiParams}} type to match your API's parameter structure
 * 4. Update the request logic to match your API's requirements (GET/POST, headers, etc.)
 * 5. Adjust authentication method (token, API key, bearer token, etc.)
 *
 * This file demonstrates the "Pure API Client" pattern:
 * - Contains ONLY HTTP request logic, no business logic
 * - Returns raw axios responses for maximum flexibility
 * - Handles authentication consistently across all requests
 * - Provides a single point of configuration for API calls
 */

import axios from 'axios';
import type { {{SERVICE_NAME}}ApiParams } from '../types/api-types';
import { API_CONFIG } from '../utils/constants';
import { validateEnvVar } from '../utils/validators';

/**
 * Makes a request to the {{SERVICE_NAME}} API
 *
 * TUTORIAL: This function demonstrates several MCP server best practices:
 *
 * 1. **Environment Variable Validation**: Always validate required env vars early
 * 2. **Parameter Merging**: Combine default params with user-provided params
 * 3. **Flexible Endpoints**: Support multiple API endpoints with one function
 * 4. **Raw Response Return**: Return axios response for maximum flexibility
 * 5. **Error Propagation**: Let axios errors bubble up for proper handling
 *
 * @param params - Request parameters to send to the API
 * @param endpoint - API endpoint path (defaults to main endpoint)
 * @returns Promise resolving to the raw axios response
 */
export async function makeApiRequest(params: Record<string, unknown> = {}, endpoint: string = '') {
  // STEP 1: Validate required authentication
  // TODO: Replace 'SCRAPEDO_TOKEN' with your service's token env var (e.g., 'OPENAI_API_KEY')
  const token = validateEnvVar('{{API_TOKEN_ENV_VAR}}');

  // STEP 2: Build request parameters
  // TODO: Customize this based on your API's required parameters
  const requestParams: {{SERVICE_NAME}}ApiParams = {
    // TODO: Update authentication parameter name (token, api_key, key, etc.)
    token,
    ...params,
  };

  // STEP 3: Apply endpoint-specific defaults
  // TODO: Customize default parameters for your main endpoint
  // Example: For OpenAI, you might set model, temperature, etc.
  if (!endpoint || endpoint === '/') {
    // TODO: Replace with your service's default parameters
    requestParams.output = API_CONFIG.DEFAULT_OUTPUT_FORMAT;
  }

  // STEP 4: Build final URL
  const url = endpoint ? `${API_CONFIG.BASE_URL}${endpoint}` : `${API_CONFIG.BASE_URL}/`;

  // STEP 5: Make the HTTP request
  // TODO: Customize request method and headers for your API
  // Examples:
  // - POST with JSON body: axios.post(url, requestParams)
  // - GET with auth header: axios.get(url, { headers: { 'Authorization': `Bearer ${token}` }, params: requestParams })
  return await axios.get(url, { params: requestParams });
}
