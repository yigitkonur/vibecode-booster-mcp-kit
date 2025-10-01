/**
 * Generic research schemas for comprehensive topic exploration
 * Template-based approach for structured research requests
 */

import { z } from 'zod';

export const genericResearchParamsShape = {
  // --- Core Parameter (Required) ---
  research_question: z
    .string()
    .min(1)
    .describe(
      `Use \`comprehensive_research\` for in-depth exploration of any topic. To get the best results, provide comprehensive context following this structured template:

**Research Topic:**
- State your main research topic clearly and specifically
- Provide context about why you're researching this
- Explain your current understanding level (beginner, intermediate, advanced)
- Mention any specific angles or perspectives you're interested in

**Key Questions:**
- List 3-7 specific questions you want answered
- Prioritize questions from most to least important
- Be specific about what information you need
- Include any sub-questions or related queries

**Expected Depth & Detail:**
- Specify the level of technical depth needed (high-level overview, detailed technical, expert-level)
- Indicate preferred format (conceptual explanation, step-by-step guide, comparative analysis, etc.)
- Mention any specific examples or use cases you want covered
- State if you need code examples, diagrams, or practical demonstrations

**Research Priorities:**
- Prioritize source types (e.g., "prioritize academic papers", "focus on practical tutorials", "prefer official documentation")
- Specify content recency if relevant (e.g., "latest 2024 information", "historical perspective")
- Mention any domains or fields to emphasize (e.g., "focus on enterprise applications", "prioritize open-source solutions")
- Indicate preference for theoretical vs practical content

**Research Boundaries:**
- Specify what to exclude or avoid
- Set scope limitations (e.g., "limit to JavaScript ecosystem", "exclude paid/proprietary solutions")
- Mention time constraints if relevant (e.g., "quick overview needed", "comprehensive deep-dive acceptable")
- Define any constraints or requirements (e.g., "must be beginner-friendly", "assume advanced knowledge")

**Template Structure:**
\`\`\`
TOPIC: [Your main research topic with context]

QUESTIONS:
1. [Most important question]
2. [Second question]
3. [Third question]
...

DEPTH: [high-level/detailed/expert-level] - [Preferred format and examples needed]

PRIORITIES:
- Source types: [academic/practical/official docs/community content]
- Recency: [latest/any/historical]
- Domain focus: [specific field or application area]
- Content style: [theoretical/practical/balanced]

BOUNDARIES:
- Exclude: [What to avoid]
- Scope: [Limitations or focus areas]
- Constraints: [Any specific requirements]
\`\`\`

**Example Usage:**
\`\`\`
TOPIC: Machine learning model deployment in production environments
I'm an intermediate developer looking to understand the complete pipeline from trained model to production serving. Currently familiar with training models but new to deployment.

QUESTIONS:
1. What are the standard architectures for ML model serving?
2. How do I handle model versioning and rollbacks?
3. What monitoring and observability practices are essential?
4. How do I optimize inference latency and throughput?
5. What are the security considerations for ML APIs?

DEPTH: detailed-technical - Include code examples, architecture diagrams, and real-world case studies from major tech companies

PRIORITIES:
- Source types: Prioritize engineering blogs from companies like Netflix, Uber, Google; official documentation from MLOps tools
- Recency: Focus on 2023-2024 practices (recent MLOps evolution)
- Domain focus: Production-grade systems, not research papers
- Content style: Practical implementation guides with code

BOUNDARIES:
- Exclude: Academic research papers, theoretical ML algorithms, model training details
- Scope: Limit to REST API and gRPC serving, exclude edge deployment
- Constraints: Assume cloud-native Kubernetes environment, Python/Docker stack
\`\`\`

Think of this as briefing a research assistant who needs complete context to deliver exactly what you need!`
    ),

  // --- Quality & Effort Control ---
  // Defaulted to high quality. Tune these down to manage cost and speed.
  reasoning_effort: z
    .enum(['low', 'medium', 'high'])
    .optional()
    .default('high')
    .describe(
      "Controls the research thoroughness. **Default: 'high'** for comprehensive analysis. Use 'medium' for faster, balanced results or 'low' for quick overviews."
    ),
  budget_tokens: z
    .number()
    .int()
    .optional()
    .default(10000)
    .describe(
      'Maximum token budget for the research process. **Default: 10000**. Increase for deeper research, decrease for cost control.'
    ),
  max_attempts: z
    .number()
    .int()
    .optional()
    .default(3)
    .describe(
      'Number of self-correction loops for refining the answer. **Default: 3**. Higher values improve quality but take longer.'
    ),
  team_size: z
    .number()
    .int()
    .optional()
    .default(3)
    .describe(
      "Parallel agents for 'divide and conquer' research. **Default: 3** for maximum breadth. Set to 1 for focused, cost-effective research."
    ),

  // --- Source & Behavior Control ---
  no_direct_answer: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      '**Default: true**. Forces fresh web searches for all information. Set to false only if recent internal knowledge is acceptable.'
    ),
  structured_output: z
    .object({})
    .passthrough()
    .optional()
    .describe(
      'Force specific JSON output format. Use for machine-readable results instead of narrative markdown. Optional - use only when needed.'
    ),
  max_returned_urls: z
    .number()
    .int()
    .optional()
    .default(100)
    .describe('**Default: 100**. Maximum source URLs to include as citations.'),
  search_provider: z
    .string()
    .optional()
    .describe('EXPERIMENTAL: Focus search on specific source (e.g., arxiv for academic research).'),

  // --- Domain & Language Control ---
  boost_hostnames: z
    .array(z.string())
    .optional()
    .describe(
      "Prioritize specific domains during research. Example: ['stackoverflow.com', 'github.com']. Use sparingly to avoid limiting discovery."
    ),
  exclude_hostnames: z
    .array(z.string())
    .optional()
    .describe(
      "Block specific domains completely. Example: ['pinterest.com', 'quora.com']. Use to filter low-quality sources."
    ),
  only_hostnames: z
    .array(z.string())
    .optional()
    .describe(
      'RESTRICT research to ONLY these domains. Use with extreme caution as it severely limits scope.'
    ),
  search_language_code: z
    .string()
    .regex(/^[a-z]{2}$/)
    .optional()
    .describe(
      'Two-letter language code (ISO 639-1) for search queries. Useful for region-specific research. Leave unset for automatic.'
    ),
  language_code: z
    .string()
    .regex(/^[a-z]{2}$/)
    .optional()
    .describe(
      'Two-letter language code (ISO 639-1) for final answer language. Leave unset for automatic detection.'
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
      `Attach reference files to provide context for your research. Useful for:
- Comparing code implementations with best practices
- Analyzing documentation against your understanding
- Getting feedback on designs or architectures
- Understanding existing codebases before research

**Examples:**
\`\`\`
file_attachments: [{
  path: "docs/architecture.md",
  description: "Current architecture - research better patterns"
}]

file_attachments: [
  {
    path: "src/api/handler.js",
    start_line: 45,
    end_line: 120,
    description: "Current implementation to improve"
  },
  {
    path: "package.json",
    description: "Dependencies for compatibility check"
  }
]
\`\`\`

**Features:**
- Automatic language detection and syntax highlighting
- Smart truncation for large files (>600 lines)
- Line numbers for easy reference
- Graceful handling of missing files
- Files appended as formatted markdown sections

**When to use:**
- Researching improvements for existing code
- Comparing your implementation with standards
- Getting technology recommendations based on current stack
- Understanding how to integrate with existing systems`
    ),
};

export const genericResearchParamsSchema = z.object(genericResearchParamsShape);

export type GenericResearchParams = z.infer<typeof genericResearchParamsSchema>;

// Output schema remains the same as deep_research (same API response structure)
export const genericResearchOutputShape = {
  content: z
    .string()
    .describe(
      'The comprehensive research result synthesized by the agent, formatted in Markdown with citations.'
    ),
  metadata: z
    .object({
      id: z.string().describe('Unique identifier for this research task.'),
      model: z.string().describe('The Jina AI model used for research.'),
      created: z.number().describe('Unix timestamp of when research was initiated.'),
      finish_reason: z
        .string()
        .optional()
        .describe('Reason research concluded (e.g., "stop", "budget_exhausted").'),
    })
    .describe('Core metadata about the research request.'),
  usage: z
    .object({
      prompt_tokens: z.number().int().describe('Tokens in the initial input question.'),
      completion_tokens: z.number().int().describe('Tokens in the final generated answer.'),
      total_tokens: z
        .number()
        .int()
        .describe(
          'Total tokens consumed by entire process (searches, page reads, reasoning). Used for billing.'
        ),
    })
    .optional()
    .describe('Token usage statistics for the operation.'),
  sources: z
    .object({
      visited_urls: z
        .array(z.string())
        .describe('All URLs the agent considered potentially relevant during search.'),
      read_urls: z
        .array(z.string())
        .describe('URLs actually downloaded and read to construct the answer.'),
      total_sources: z
        .number()
        .int()
        .describe('Total unique URLs found by search engine before filtering.'),
    })
    .optional()
    .describe('Information about web sources consulted during research.'),
  research_quality: z
    .object({
      reasoning_effort: z
        .enum(['low', 'medium', 'high'])
        .describe('Reasoning effort level used for this research.'),
      team_size: z.number().int().describe('Number of parallel agents used.'),
      confidence_score: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe("Agent's self-evaluated confidence in answer quality and completeness."),
    })
    .optional()
    .describe('Metrics reflecting research quality and effort.'),
};

export const genericResearchOutputSchema = z.object(genericResearchOutputShape);

export type GenericResearchOutput = z.infer<typeof genericResearchOutputSchema>;
