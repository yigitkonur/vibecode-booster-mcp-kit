/**
 * TEMPLATE: MCP Tool Definitions for Third-Party API Integration
 *
 * CUSTOMIZATION GUIDE:
 * 1. Replace example tool definitions with your service's actual tools
 * 2. Update parameter schemas to match your API requirements
 * 3. Add proper descriptions that explain what each tool does
 * 4. Include cost/usage information if relevant
 * 5. Define proper validation rules for parameters
 *
 * TUTORIAL: Tool definitions are JSON Schema objects that:
 * - Define the interface between Claude Code and your MCP server
 * - Validate parameters before tool execution
 * - Generate documentation for users
 * - Enable auto-completion in development environments
 *
 * JSON Schema Best Practices:
 * - Use descriptive property names and descriptions
 * - Include examples in descriptions when helpful
 * - Set appropriate types (string, integer, boolean, array, object)
 * - Define required vs optional parameters clearly
 * - Add enum constraints for limited value sets
 * - Include default values for optional parameters
 */

/**
 * TUTORIAL: Tool Definition Structure
 *
 * Each tool definition contains:
 * - name: Unique identifier (snake_case recommended)
 * - description: Clear explanation of what the tool does
 * - parameters: JSON Schema defining the tool's input structure
 *
 * TODO: Replace these example tools with your service's actual tools
 */
export const toolDefinitions = [
  // TODO: Replace this section with your actual tool definitions
  //
  // Examples for different service types:

  // ==============================================================================
  // EXAMPLE: Status/Info Tool (Common for most APIs)
  // ==============================================================================
  {
    name: 'check_status',
    description:
      'Retrieves the current API status, usage limits, and account information. No parameters required.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },

  // ==============================================================================
  // EXAMPLE: Simple Tool with Required Parameter
  // ==============================================================================
  {
    name: 'example_simple_tool',
    description:
      'TODO: Replace with your tool description. Explain what it does, any costs, and usage examples.',
    parameters: {
      type: 'object',
      properties: {
        // TODO: Replace with your actual parameters
        input_text: {
          type: 'string',
          description: 'The text to process or analyze.',
        },
        format: {
          type: 'string',
          description: 'Output format preference.',
          enum: ['json', 'text', 'markdown'],
          default: 'text',
        },
      },
      required: ['input_text'],
    },
  },

  // ==============================================================================
  // EXAMPLE: Complex Tool with Multiple Parameters
  // ==============================================================================
  {
    name: 'example_complex_tool',
    description:
      'TODO: Replace with your advanced tool description. Include performance characteristics and limitations.',
    parameters: {
      type: 'object',
      properties: {
        // TODO: Customize these parameters for your service
        query: {
          type: 'string',
          description: 'The search query or input text.',
        },
        limit: {
          type: 'integer',
          description: 'Maximum number of results to return. Range: 1-100.',
          minimum: 1,
          maximum: 100,
          default: 10,
        },
        filters: {
          type: 'object',
          description: 'Optional filters to apply to the search.',
          properties: {
            category: {
              type: 'string',
              description: 'Filter by category.',
            },
            date_range: {
              type: 'string',
              description: 'Date range filter (e.g., "last_week", "last_month").',
              enum: ['last_day', 'last_week', 'last_month', 'last_year'],
            },
          },
          additionalProperties: false,
        },
        advanced_options: {
          type: 'object',
          description: 'Advanced processing options.',
          properties: {
            enable_analytics: {
              type: 'boolean',
              description: 'Enable detailed analytics in the response.',
              default: false,
            },
            quality_level: {
              type: 'string',
              description: 'Processing quality vs speed trade-off.',
              enum: ['fast', 'standard', 'high'],
              default: 'standard',
            },
          },
        },
      },
      required: ['query'],
    },
  },

  // ==============================================================================
  // EXAMPLE: Array/List Processing Tool
  // ==============================================================================
  {
    name: 'example_batch_tool',
    description:
      'TODO: Replace with your batch processing tool description. Explain input limits and processing time.',
    parameters: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          description: 'Array of items to process.',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Unique identifier for this item.',
              },
              data: {
                type: 'string',
                description: 'The data to process for this item.',
              },
            },
            required: ['id', 'data'],
          },
          minItems: 1,
          maxItems: 50,
        },
        batch_options: {
          type: 'object',
          description: 'Options for batch processing.',
          properties: {
            parallel: {
              type: 'boolean',
              description: 'Process items in parallel for faster results.',
              default: true,
            },
            stop_on_error: {
              type: 'boolean',
              description: 'Stop processing if any item fails.',
              default: false,
            },
          },
        },
      },
      required: ['items'],
    },
  },

  // TODO: Remove the example tools above and add your service-specific tools below
  //
  // Templates for different service types:

  // AI/ML Service Example:
  // {
  //   name: 'generate_text',
  //   description: 'Generate text using AI model. Specify model, prompt, and generation parameters.',
  //   parameters: {
  //     type: 'object',
  //     properties: {
  //       prompt: { type: 'string', description: 'The input prompt for text generation.' },
  //       model: { type: 'string', enum: ['gpt-3.5-turbo', 'gpt-4', 'claude-3'], default: 'gpt-3.5-turbo' },
  //       temperature: { type: 'number', minimum: 0, maximum: 2, default: 0.7 },
  //       max_tokens: { type: 'integer', minimum: 1, maximum: 4000, default: 1000 },
  //     },
  //     required: ['prompt'],
  //   },
  // },

  // Data Service Example:
  // {
  //   name: 'search_records',
  //   description: 'Search through database records with filters and pagination.',
  //   parameters: {
  //     type: 'object',
  //     properties: {
  //       query: { type: 'string', description: 'Search query string.' },
  //       table: { type: 'string', description: 'Database table to search.' },
  //       limit: { type: 'integer', minimum: 1, maximum: 1000, default: 10 },
  //       offset: { type: 'integer', minimum: 0, default: 0 },
  //     },
  //     required: ['query', 'table'],
  //   },
  // },

  // Payment Service Example:
  // {
  //   name: 'create_payment',
  //   description: 'Create a payment intent for processing. Returns payment URL and status.',
  //   parameters: {
  //     type: 'object',
  //     properties: {
  //       amount: { type: 'integer', description: 'Amount in cents (e.g., 2000 for $20.00).' },
  //       currency: { type: 'string', enum: ['usd', 'eur', 'gbp'], default: 'usd' },
  //       customer_id: { type: 'string', description: 'Customer identifier.' },
  //     },
  //     required: ['amount', 'customer_id'],
  //   },
  // },

  // Media Service Example:
  // {
  //   name: 'process_image',
  //   description: 'Process an image with specified operations (resize, filter, format conversion).',
  //   parameters: {
  //     type: 'object',
  //     properties: {
  //       image_url: { type: 'string', description: 'URL of the image to process.' },
  //       operations: {
  //         type: 'array',
  //         items: {
  //           type: 'object',
  //           properties: {
  //             type: { type: 'string', enum: ['resize', 'crop', 'filter', 'convert'] },
  //             params: { type: 'object', description: 'Operation-specific parameters.' },
  //           },
  //         },
  //       },
  //     },
  //     required: ['image_url', 'operations'],
  //   },
  // },

] as const;

/**
 * TUTORIAL: Validation Best Practices
 *
 * When defining parameter schemas:
 *
 * 1. **Type Safety**: Always specify the correct type (string, number, boolean, array, object)
 * 2. **Required Fields**: Only mark fields as required if they're absolutely necessary
 * 3. **Validation Rules**: Use min/max, enum, pattern for validation
 * 4. **Defaults**: Provide sensible defaults for optional parameters
 * 5. **Descriptions**: Write clear descriptions that explain the parameter's purpose
 * 6. **Examples**: Include examples in descriptions when the usage isn't obvious
 * 7. **Nested Objects**: Use proper object schemas for complex nested parameters
 * 8. **Arrays**: Define item schemas for arrays to ensure type safety
 *
 * JSON Schema Reference: https://json-schema.org/understanding-json-schema/
 */
