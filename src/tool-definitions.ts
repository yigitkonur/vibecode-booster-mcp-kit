/**
 * JINA DeepSearch MCP Tool Definitions
 *
 * Ultra-clean tool definitions using Zod schemas with intelligent defaults.
 */

import { zodToJsonSchema } from 'zod-to-json-schema';
import { deepSearchParamsSchema } from './schemas/deepsearch';

/**
 * Enhanced tool definition with real-world examples and clear guidance
 */
export const toolDefinitions = [
  {
    name: 'deepsearch_research',
    description: [
      '🔍 **Comprehensive AI-Powered Research Tool**',
      '',
      'Performs deep web research using JINA DeepSearch with multi-agent analysis.',
      '',
      '**Perfect for:**',
      '• "Latest developments in quantum computing 2024"',
      '• "Compare React vs Vue performance benchmarks"',
      '• "Academic papers on climate change mitigation"',
      '• "Best practices for TypeScript error handling"',
      '',
      '⚡ **Smart Defaults:** Parameters auto-optimize based on query complexity',
      '⏰ **Timeout Safe:** Automatically prevents parameter combinations that cause timeouts',
      '🌍 **Multilingual:** Supports research in 20+ languages',
      '📚 **Academic Mode:** Special optimization for research papers and citations',
      '',
      '**Pro Tips:**',
      '• Be specific: "Python async patterns" vs "Python programming"',
      '• Use arxiv_optimized_search for academic research',
      '• Add good_domains for targeted searches: ["github.com", "stackoverflow.com"]',
    ].join('\n'),
    parameters: zodToJsonSchema(deepSearchParamsSchema, {
      name: 'DeepSearchParams',
      $refStrategy: 'none',
    }),
  },
] as const;
