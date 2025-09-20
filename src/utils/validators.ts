/**
 * Parameter validation utilities
 */

/**
 * Validates that required parameters are present and not null/undefined
 * @param args - The arguments object to validate
 * @param params - Array of required parameter names
 * @throws Error if any required parameter is missing
 */
export function validateRequiredParams(
  args: Record<string, unknown> | undefined,
  params: string[]
): void {
  if (!args) {
    throw new Error(`Missing required parameters: ${params.join(', ')}`);
  }

  for (const param of params) {
    if (args[param] === undefined || args[param] === null) {
      throw new Error(`Missing required parameter: ${param}`);
    }
  }
}

/**
 * Validates that an environment variable is set
 * @param varName - Name of the environment variable
 * @returns The environment variable value
 * @throws Error if the environment variable is not set
 */
export function validateEnvVar(varName: string): string {
  const value = process.env[varName];
  if (!value?.trim()) {
    throw new Error(`${varName} environment variable is required but not set`);
  }
  return value;
}
