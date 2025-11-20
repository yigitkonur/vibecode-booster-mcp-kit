/**
 * Bug fix deep research schema - simplified interface with maximum quality defaults
 * Exposes only essential parameters, sets optimal research quality internally
 */

import { z } from 'zod';

export const bugfixResearchParamsShape = {
  // --- Core Parameter (Required) ---
  deep_research_question: z
    .string()
    .min(1)
    .describe(
      `Use \`deepresearch_bugfix\` if you need comprehensive answer for any question. To get best results, you must deliver ALL of them:

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

Think of this as explaining your entire situation to an expert who just walked into the room — share every frustration, detail, and piece of evidence like you're having a thorough conversation with someone who can actually solve your problem!`
    ),

  // --- File Attachments ---
  file_attachments: z
    .array(
      z.object({
        path: z.string().describe('Absolute or relative path to the file to attach'),
        start_line: z
          .number()
          .int()
          .positive()
          .optional()
          .describe(
            'Optional starting line number (1-indexed, inclusive) for partial file content'
          ),
        end_line: z
          .number()
          .int()
          .positive()
          .optional()
          .describe('Optional ending line number (1-indexed, inclusive) for partial file content'),
        description: z
          .string()
          .optional()
          .describe('Optional description providing context about this file or what to focus on'),
      })
    )
    .optional()
    .describe(
      `Attach one or more files to provide code context for your research question. Files are read from disk and appended to your research question with full content, line numbers, and syntax highlighting.

**Usage Patterns:**
1. **Single File**: Attach one file with full content
2. **Multiple Files**: Attach multiple related files for comprehensive context
3. **Line Ranges**: Focus on specific sections using start_line and end_line
4. **With Descriptions**: Add context about each file's relevance

**Examples:**
\`\`\`
// Attach full file
file_attachments: [{
  path: "src/services/payment.ts",
  description: "Payment service with suspected memory leak"
}]

// Attach specific lines from multiple files
file_attachments: [
  {
    path: "src/components/DataTable.tsx",
    start_line: 45,
    end_line: 120,
    description: "Component lifecycle methods causing the issue"
  },
  {
    path: "package.json",
    description: "Dependencies for version checking"
  }
]
\`\`\`

**Features:**
- Automatic language detection and syntax highlighting
- Smart truncation for large files (>600 lines)
- Line numbers for easy reference
- Graceful handling of missing files
- Files appended as formatted markdown sections

**Best Practices:**
- Attach only relevant files to avoid token waste
- Use line ranges to focus on specific problem areas
- Include configuration files (package.json, tsconfig.json) when relevant
- Add descriptions to guide the AI's attention
- Order files by importance (most relevant first)`
    ),
};

export const bugfixResearchParamsSchema = z.object(bugfixResearchParamsShape);

export type BugfixResearchParams = z.infer<typeof bugfixResearchParamsSchema>;

// Output schema for bug fix research
export const bugfixResearchOutputShape = {
  content: z
    .string()
    .describe(
      'The final, comprehensive answer synthesized by the agent, formatted in Markdown with citations.'
    ),
  metadata: z
    .object({
      id: z.string().describe('A unique identifier for this specific research task.'),
      model: z.string().describe('The AI model used for the research process.'),
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

export const bugfixResearchOutputSchema = z.object(bugfixResearchOutputShape);

export type BugfixResearchOutput = z.infer<typeof bugfixResearchOutputSchema>;
