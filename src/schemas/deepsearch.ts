/**
 * JINA DeepSearch schemas, re-architected for maximum default quality and
 * to provide interactive guidance for iterative refinement.
 */

import { z } from 'zod';

export const deepSearchParamsShape = {
  // --- Core Parameter (Required) ---
  deep_research_question: z
    .string()
    .min(1)
    .describe(
      `The comprehensive research request. To get the best results, structure your input using the following template, providing as much detail as possible.

**Template for Optimal Results:**
\`\`\`
BACKGROUND: [Provide the complete story and context. What were you trying to achieve? What have you tried so far?]
CURRENT ISSUE: [Describe the exact problem you're facing. Include symptoms and when it started.]
EVIDENCE: [Share all technical details, error messages, logs, code snippets, version numbers, and reproduction steps.]
GOAL: [Clearly state what success looks like. What is your desired outcome and what are your constraints?]
QUESTIONS:
1. [What is the root cause of... ?]
2. [How can I configure X to achieve Y?]
3. [What are the best practices for Z in my context?]
4. [What are alternative approaches to my current method?]
5. [What are the next debugging steps I should take?]
\`\`\`

Think of this as explaining your entire situation to an expert who just walked into the room — provide every detail to get the best possible solution.`
    ),

  // --- Quality & Effort Control ---
  // Defaulted to high quality. Tune these down to manage cost and speed.
  reasoning_effort: z
    .enum(['low', 'medium', 'high'])
    .optional()
    .default('high')
    .describe(
      "Controls the agent's thoroughness. **Default: 'high'** for the most comprehensive analysis. If the research is too slow or costly, consider setting this to 'medium' for a faster, more balanced approach."
    ),
  budget_tokens: z
    .number()
    .int()
    .optional()
    .default(10000)
    .describe(
      "The maximum token budget for the entire research process. **Default: 10000**. If the agent stops prematurely with a 'budget_exhausted' reason, increase this value. To enforce stricter cost control, lower this value."
    ),
  max_attempts: z
    .number()
    .int()
    .optional()
    .default(3)
    .describe(
      'The number of self-correction loops for refining the answer. **Default: 3**. If the final answer still feels incomplete or misses the mark, increasing this allows for more internal revisions, though it will take longer.'
    ),
  team_size: z
    .number()
    .int()
    .optional()
    .default(5)
    .describe(
      "The number of parallel agents using a 'divide and conquer' strategy. **Default: 5** for maximum research breadth. This is powerful but costly. If you need to significantly reduce cost, setting `team_size` to 1 is the most effective way."
    ),

  // --- Source & Behavior Control ---
  no_direct_answer: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "**Default: false**. If you suspect the agent's internal knowledge is outdated and require a fresh web search for every detail, set this to `true`."
    ),
  structured_output: z
    .object({})
    .passthrough()
    .optional()
    .describe(
      'Forces the final answer into a specific JSON format. Use this when you need reliable, machine-readable data instead of a narrative Markdown answer.'
    ),
  max_returned_urls: z
    .number()
    .int()
    .optional()
    .default(10)
    .describe(
      '**Default: 10**. The maximum number of source URLs to include as citations in the final answer.'
    ),
  search_provider: z
    .enum(['arxiv'])
    .optional()
    .describe(
      "EXPERIMENTAL: Focuses the search on a specific source. Set to 'arxiv' for technical or scientific research questions to prioritize academic papers."
    ),

  // --- Domain & Language Control ---
  boost_hostnames: z
    .array(z.string())
    .optional()
    .describe(
      "A list of preferred domains to prioritize during research. Use this to guide the agent toward trusted sources. Example: ['wikipedia.org', 'jina.ai']"
    ),
  exclude_hostnames: z
    .array(z.string())
    .optional()
    .describe(
      "A list of blocked domains to completely ignore. Use this to filter out known low-quality or irrelevant sites. Example: ['spam.com', 'ad-network.net']"
    ),
  only_hostnames: z
    .array(z.string())
    .optional()
    .describe(
      'Restricts the agent to ONLY read content from this list of domains. Use with caution, as this can severely limit the research scope.'
    ),
  search_language_code: z
    .string()
    .regex(/^[a-z]{2}$/)
    .optional()
    .describe(
      'A two-letter language code (ISO 639-1) to force search queries into a specific language, useful for finding region-specific information.'
    ),
  language_code: z
    .string()
    .regex(/^[a-z]{2}$/)
    .optional()
    .describe(
      'A two-letter language code (ISO 639-1) to force the language of the final answer and all intermediate reasoning steps.'
    ),
};

export const deepSearchParamsSchema = z.object(deepSearchParamsShape);

export type DeepSearchParams = z.infer<typeof deepSearchParamsSchema>;

// Output schema for JINA DeepSearch API responses (remains unchanged)
export const deepSearchOutputShape = {
  content: z
    .string()
    .describe(
      'The final, comprehensive answer synthesized by the agent, formatted in Markdown with citations.'
    ),
  metadata: z
    .object({
      id: z.string().describe('A unique identifier for this specific research task.'),
      model: z.string().describe('The Jina AI model used for the research process.'),
      created: z.number().describe('The Unix timestamp of when the research task was initiated.'),
      finish_reason: z
        .string()
        .optional()
        .describe('The reason the research process concluded (e.g., "stop", "budget_exhausted").'),
    })
    .describe('Core metadata about the research request.'),
  usage: z
    .object({
      prompt_tokens: z
        .number()
        .int()
        .describe('The number of tokens in the initial input question.'),
      completion_tokens: z
        .number()
        .int()
        .describe('The number of tokens in the final generated answer.'),
      total_tokens: z
        .number()
        .int()
        .describe(
          'The total tokens consumed by the entire process, including all searches, page reads, and reasoning steps. This is the primary value used for billing.'
        ),
    })
    .optional()
    .describe('Token usage statistics for the entire operation.'),
  sources: z
    .object({
      visited_urls: z
        .array(z.string())
        .describe(
          'A comprehensive list of all URLs the agent considered potentially relevant during its search phase.'
        ),
      read_urls: z
        .array(z.string())
        .describe(
          'A subset of visited URLs. These are the pages the agent actually downloaded and read to construct the answer.'
        ),
      total_sources: z
        .number()
        .int()
        .describe(
          'The total number of unique URLs found by the search engine before any filtering.'
        ),
    })
    .optional()
    .describe('Information about the web sources consulted during the research.'),
  research_quality: z
    .object({
      reasoning_effort: z
        .enum(['low', 'medium', 'high'])
        .describe('The reasoning effort level that was used for this research task.'),
      team_size: z.number().int().describe('The number of parallel agents that were used.'),
      confidence_score: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe(
          "The agent's self-evaluated confidence level in the quality and completeness of its final answer."
        ),
    })
    .optional()
    .describe('Metrics reflecting the quality and effort of the research process.'),
};

export const deepSearchOutputSchema = z.object(deepSearchOutputShape);

export type DeepSearchOutput = z.infer<typeof deepSearchOutputSchema>;
