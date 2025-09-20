export function validateEnvVar(varName: string): string {
  const value = process.env[varName];
  if (!value?.trim()) {
    throw new Error(`${varName} environment variable is required but not set`);
  }
  return value;
}
