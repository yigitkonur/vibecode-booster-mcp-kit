/**
 * TEMPLATE: Application Constants and Configuration
 *
 * CUSTOMIZATION GUIDE:
 * 1. Update API_CONFIG with your service's API details
 * 2. Modify MCP_CONFIG with your server name and version
 * 3. Customize TOOL_COSTS if your service has usage costs/limits
 * 4. Add service-specific configuration sections as needed
 *
 * TUTORIAL: This file centralizes all configuration:
 * - `as const` prevents accidental modification and enables better type inference
 * - Separate configs by concern (API, MCP server, costs, etc.)
 * - Use SCREAMING_SNAKE_CASE for constants
 * - Group related configuration options together
 */

/**
 * {{SERVICE_NAME}} API configuration
 *
 * TUTORIAL: This section contains all API-related configuration:
 * - Base URL: The root URL for all API requests
 * - Endpoints: Specific API endpoints your tools will use
 * - Defaults: Default parameter values to reduce repetition
 * - Timeouts: Request timeout configurations
 *
 * TODO: Replace with your service's API configuration
 */
export const API_CONFIG = {
  // TODO: Update with your service's base URL
  BASE_URL: 'https://api.{{service-domain}}.com',

  // TODO: Define your service's endpoints
  INFO_ENDPOINT: '/info/',
  // USERS_ENDPOINT: '/users/',        // Example for user management
  // SEARCH_ENDPOINT: '/search/',      // Example for search functionality
  // STATUS_ENDPOINT: '/status/',      // Example for service status

  // TODO: Set default parameters for your service
  DEFAULT_OUTPUT_FORMAT: 'json',      // Common formats: json, xml, markdown, text
  // DEFAULT_MODEL: 'gpt-3.5-turbo',  // Example for AI services
  // DEFAULT_LIMIT: 10,               // Example for paginated APIs
  // DEFAULT_TIMEOUT: 30000,          // Example timeout in milliseconds

  // TODO: Add service-specific defaults
  DEFAULT_COUNTRY: 'US',
  DEFAULT_WAIT_MS: 0,
} as const;

/**
 * MCP server configuration
 *
 * TUTORIAL: This section configures the MCP server itself:
 * - SERVER_NAME: Unique identifier for your MCP server
 * - SERVER_VERSION: Semantic version for your server
 * - CAPABILITIES: Optional server capabilities
 *
 * TODO: Customize for your specific MCP server
 */
export const MCP_CONFIG = {
  // TODO: Update with your server name (use kebab-case)
  SERVER_NAME: 'mcp-{{service-name}}',

  // TODO: Update version following semantic versioning
  SERVER_VERSION: '1.0.0',

  // Optional: Add server capabilities configuration
  // SUPPORTS_PROGRESS: true,         // If your tools support progress reporting
  // SUPPORTS_CANCELLATION: false,   // If your tools support cancellation
  // MAX_CONCURRENT_TOOLS: 5,        // Maximum concurrent tool executions
} as const;

/**
 * Tool cost/usage information
 *
 * TUTORIAL: Many APIs have usage limits or costs per operation:
 * - Credit systems: Track how many credits each operation costs
 * - Rate limits: Define request limits per time period
 * - Quotas: Monthly or daily usage limits
 *
 * TODO: Customize based on your service's pricing/limits model
 * If your service doesn't have costs, you can remove this section
 */
export const TOOL_COSTS = {
  // TODO: Define costs for each of your tools (adjust names and values)
  BASIC_OPERATION: 1,
  PREMIUM_OPERATION: 10,
  ADVANCED_OPERATION: 5,
  BATCH_OPERATION: 25,

  // Example ranges for operations with variable costs
  VARIABLE_OPERATION_MIN: 5,
  VARIABLE_OPERATION_MAX: 25,

  // Example rate limiting
  // MAX_REQUESTS_PER_MINUTE: 60,
  // MAX_REQUESTS_PER_HOUR: 1000,
} as const;

/**
 * Service-specific configuration
 *
 * TUTORIAL: Add sections for service-specific configuration:
 * - Feature flags: Enable/disable certain functionality
 * - Regional settings: Multi-region or localization settings
 * - Quality settings: Performance vs quality trade-offs
 *
 * TODO: Add any additional configuration sections your service needs
 */

// Example: Feature flags for conditional functionality
// export const FEATURE_FLAGS = {
//   ENABLE_CACHING: true,
//   ENABLE_ANALYTICS: false,
//   ENABLE_EXPERIMENTAL_FEATURES: false,
// } as const;

// Example: Quality/performance settings
// export const QUALITY_SETTINGS = {
//   DEFAULT_QUALITY: 'standard',    // Options: draft, standard, high
//   MAX_RETRIES: 3,
//   TIMEOUT_MS: 30000,
// } as const;
