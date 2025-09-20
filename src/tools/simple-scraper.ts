/**
 * TEMPLATE: Example Tool Implementation
 *
 * CUSTOMIZATION GUIDE:
 * 1. Replace function name and description with your tool's purpose
 * 2. Update parameter types to match your API requirements
 * 3. Modify the API request logic for your service
 * 4. Customize response processing and formatting
 * 5. Update cost/usage information in comments
 *
 * TUTORIAL: This file demonstrates the "Single Tool" pattern:
 * - One file per tool for atomic responsibility
 * - Clear parameter validation and type safety
 * - Consistent error handling and response formatting
 * - Separation of API calls, processing, and formatting
 */

import { enhanceResponse } from '../services/response-enhancer';
import { makeApiRequest } from '../services/scrape-client';
import type { {{SERVICE_NAME}}RequestParams, ExampleToolParams } from '../types/tool-types';
import { formatScrapedContent } from '../utils/formatters';

/**
 * TEMPLATE: Example tool function
 *
 * TUTORIAL: Tool Function Structure:
 * 1. **Clear Documentation**: Explain what the tool does, costs, limitations
 * 2. **Parameter Destructuring**: Extract and validate parameters with defaults
 * 3. **API Request Preparation**: Build request parameters for your service
 * 4. **API Call**: Use the generic API client to make requests
 * 5. **Response Processing**: Transform raw response to useful format
 * 6. **Return Formatting**: Return consistently formatted response
 *
 * TODO: Replace this example with your actual tool implementation
 *
 * Examples for different tool types:
 * - AI Tool: generateText(prompt, model, temperature)
 * - Data Tool: searchRecords(query, filters, limit)
 * - Utility Tool: convertFormat(data, fromFormat, toFormat)
 * - Media Tool: processImage(url, operations, quality)
 *
 * @param params - Tool-specific parameters (replace ExampleToolParams)
 * @returns Processed result as string (or customize return type)
 */
export async function exampleTool(params: ExampleToolParams): Promise<string> {
  // STEP 1: Parameter extraction and validation
  // TODO: Replace with your tool's actual parameters
  const { url, follow_redirects = true } = params;

  // STEP 2: Prepare API request parameters
  // TODO: Customize this for your service's API format
  const requestParams: {{SERVICE_NAME}}RequestParams = {
    // Map tool parameters to API parameters
    url,
    disableRedirection: !follow_redirects,

    // Add service-specific parameters:
    // model: params.model || 'default-model',
    // quality: params.quality || 'standard',
    // format: params.format || 'json',
  };

  // STEP 3: Make API request
  // TODO: Update endpoint if your tool uses a specific API endpoint
  const response = await makeApiRequest(requestParams);

  // STEP 4: Process response
  // TODO: Customize response processing for your service
  const enhancedResponse = enhanceResponse(response, url);

  // STEP 5: Format and return result
  // TODO: Customize formatting based on your tool's output needs
  return formatScrapedContent(enhancedResponse, url);
}

/**
 * TEMPLATE: Alternative tool patterns for different service types
 */

// Example: AI/ML service tool
// export async function generateText(params: GenerateTextParams): Promise<string> {
//   const { prompt, model = 'gpt-3.5-turbo', temperature = 0.7, max_tokens = 1000 } = params;
//
//   const requestParams = {
//     model,
//     messages: [{ role: 'user', content: prompt }],
//     temperature,
//     max_tokens,
//   };
//
//   const response = await makeApiRequest(requestParams, '/completions');
//   return response.data.choices[0].message.content;
// }

// Example: Data service tool
// export async function searchData(params: SearchDataParams): Promise<string> {
//   const { query, limit = 10, filters = {} } = params;
//
//   const requestParams = {
//     q: query,
//     limit,
//     ...filters,
//   };
//
//   const response = await makeApiRequest(requestParams, '/search');
//   return JSON.stringify(response.data.results, null, 2);
// }

// Example: Utility service tool
// export async function convertFormat(params: ConvertFormatParams): Promise<string> {
//   const { data, from_format, to_format, options = {} } = params;
//
//   const requestParams = {
//     input: data,
//     input_format: from_format,
//     output_format: to_format,
//     options,
//   };
//
//   const response = await makeApiRequest(requestParams, '/convert');
//   return response.data.converted_data;
// }
