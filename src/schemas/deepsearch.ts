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
      `Use \`deep_research\` if you need comprehensive answer for any question. To get best results, you must deliver ALL of them:

**Background Context:**
- Provide complete background of your situation
- Include all relevant technical details, configurations, and environment specifics
- Mention what you were trying to accomplish originally
- Detail any previous attempts or solutions you've tried

**Current Issue Description:**
- Explain exactly what problem you're facing now
- Include error messages, logs, or symptoms (word-for-word)
- Describe when the issue started occurring
- Note any patterns or triggers you've observed

**Evidence & Details:**
- Share all relevant code snippets, configuration files, or settings
- Include version numbers, dependencies, and system specifications
- Provide step-by-step reproduction steps
- Mention any workarounds or temporary fixes you've discovered

**What You Want to Accomplish:**
- Clearly state your end goal or desired outcome
- Explain why this specific solution approach matters
- Include any constraints, requirements, or limitations you're working within

**Specific Questions:**
Break your main question into multiple focused sub-questions such as:
- What is the root cause of [specific symptom]?
- How can I configure [specific component] to achieve [desired behavior]?
- What are the best practices for [specific scenario] in [your context]?
- Are there alternative approaches to [your current method]?
- What debugging steps should I follow to isolate [specific issue]?

**Template Structure:**
\`\`\`
BACKGROUND: [Complete story from the beginning]
CURRENT ISSUE: [Exact problem with all symptoms]
EVIDENCE: [All technical details, errors, logs]
GOAL: [What success looks like]
QUESTIONS:
1. [Root cause question]
2. [Solution approach question]  
3. [Best practices question]
4. [Alternative methods question]
5. [Debugging/troubleshooting question]
\`\`\`

Think of this as explaining your entire situation to an expert who just walked into the room — share every frustration, detail, and piece of evidence like you're having a thorough conversation with someone who can actually solve your problem and call this tool by using that template! Do not use 'boost_hostnames' if not mandatory!`
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
    .default(3)
    .describe(
      "The number of parallel agents using a 'divide and conquer' strategy. **Default: 3** for maximum research breadth. This is powerful but costly. If you need to significantly reduce cost, setting `team_size` to 1 is the most effective way."
    ),

  // --- Source & Behavior Control ---
  no_direct_answer: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "**Default: true**. If you suspect the agent's internal knowledge is outdated and require a fresh web search for every detail, set this to `true`."
    ),
  structured_output: z
    .object({})
    .passthrough()
    .optional()
    .describe(
      'Forces the final answer into a specific JSON format. Use this when you need reliable, machine-readable data instead of a narrative Markdown answer. Do NOT use it if not mandatory.'
    ),
  max_returned_urls: z
    .number()
    .int()
    .optional()
    .default(100)
    .describe(
      '**Default: 100**. The maximum number of source URLs to include as citations in the final answer.'
    ),
  search_provider: z
    .string()
    .optional()
    .describe(
      'EXPERIMENTAL: Focuses the search on a specific source for technical or scientific research questions.'
    ),

  // --- Domain & Language Control ---
  boost_hostnames: z
    .array(z.string())
    .optional()
    .describe(
      "A list of preferred domains to prioritize during research. Use this to guide the agent toward trusted sources ONLY IF NEEDED. Do NOT use it and make agent free to choose its own site and do not limit its creativity. Example: ['site1.com', 'site2.com']"
    ),
  exclude_hostnames: z
    .array(z.string())
    .optional()
    .describe(
      "A list of blocked domains to completely ignore. Use this to filter out known low-quality or irrelevant sites. Example: ['lorem.com', 'ipsum.com']"
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
      'A two-letter language code (ISO 639-1) to force search queries into a specific language, useful for finding region-specific information. For top quality, do not modify this and keep agent free.'
    ),
  language_code: z
    .string()
    .regex(/^[a-z]{2}$/)
    .optional()
    .describe(
      'A two-letter language code (ISO 639-1) to force the language of the final answer and all intermediate reasoning steps. For top quality, do not modify this and keep agent free.'
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
