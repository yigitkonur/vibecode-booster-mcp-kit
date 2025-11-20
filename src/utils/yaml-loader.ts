import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';

export interface ToolDefinition {
  name: string;
  title: string;
  description: string;
}

export interface ToolsConfig {
  tools: ToolDefinition[];
}

/**
 * Load and parse YAML configuration file
 */
export function loadToolsConfig(configPath: string): ToolsConfig {
  try {
    const absolutePath = path.isAbsolute(configPath)
      ? configPath
      : path.join(__dirname, '../../', configPath);

    const fileContents = fs.readFileSync(absolutePath, 'utf8');
    const config = yaml.load(fileContents) as ToolsConfig;

    if (!config || !Array.isArray(config.tools)) {
      throw new Error('Invalid tools configuration: must contain tools array');
    }

    return config;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load tools config from ${configPath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get tool definition by name
 */
export function getToolDefinition(config: ToolsConfig, toolName: string): ToolDefinition | undefined {
  return config.tools.find(tool => tool.name === toolName);
}
