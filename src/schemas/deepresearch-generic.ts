/**
 * Generic deep research schema - simplified interface with maximum quality defaults
 * For comprehensive topic exploration with structured research approach
 */

import { z } from 'zod';

export const genericResearchParamsShape = {
  // --- Core Parameter (Required) ---
  research_question: z
    .string()
    .min(1)
    .describe(
      `Use \`deepresearch_generic\` for in-depth exploration of any topic. To get the best results, provide comprehensive context following this structured template:

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

// Output schema (same structure as bugfix)
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
