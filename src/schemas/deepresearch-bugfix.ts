/**
 * Bug fix deep research schema - optimized for debugging
 * Forces comprehensive bug reporting with all necessary context
 */

import { z } from 'zod';

export const bugfixResearchParamsShape = {
  deep_research_question: z
    .string()
    .min(1)
    .describe(
      `Provide a complete bug investigation brief. The researcher has ZERO context — explain everything like filing a detailed bug report to a senior engineer who needs to reproduce and fix this.

**CONTEXT:**
- What were you trying to accomplish?
- Environment: OS, runtime versions (Node 18.x, Python 3.11, etc.), key dependencies
- When did this start? (after update? new feature? always broken?)
- Relevant setup or configuration

**THE BUG:**
- **Exact error messages** with full stack traces (copy-paste word-for-word, don't summarize)
- **Unexpected behavior** described precisely (what you see vs what should happen)
- **Reproduction steps** (numbered: 1. Do X, 2. Run Y, 3. Error appears)
- Frequency: Does it happen always? Intermittently? Under specific conditions?

**WHAT YOU'VE TRIED:**
- Solutions attempted and their exact results
- Workarounds discovered (even partial ones)
- Related Stack Overflow threads or GitHub issues found
- Configuration changes tested

**QUESTIONS:**
1. What is the root cause of [specific error/behavior]?
2. Why does [X] fail when [Y condition occurs]?
3. What's the correct way to [accomplish goal] in [your context]?
4. Are there known issues with [library@version] causing this?
5. What debugging steps can isolate the problem further?

**TEMPLATE:**
\`\`\`
CONTEXT:
Building: [what you're working on]
Stack: [framework, language, key libraries with versions]
Environment: [OS, Node version, etc.]
Started: [when bug appeared]

THE BUG:
When I [action], this happens:

[PASTE FULL ERROR WITH STACK TRACE - don't truncate]

Expected: [what should happen]
Actual: [what happens instead]

Reproduce:
1. [exact step]
2. [exact step]
3. [error occurs]

TRIED:
- [Solution A]: [exact result]
- [Solution B]: [exact result]
- Found this thread: [URL] - didn't work because [reason]

QUESTIONS:
1. What causes [specific error pattern in the stack trace]?
2. Why does [X component] fail with [Y input]?
3. How do I properly [accomplish the original goal]?
\`\`\`

Be exhaustive — share every detail, frustration, and piece of evidence. The more context, the faster the solution.`
    ),

  file_attachments: z
    .array(
      z.object({
        path: z.string().describe('File path (absolute or relative)'),
        start_line: z.number().int().positive().optional().describe('Start line (1-indexed)'),
        end_line: z.number().int().positive().optional().describe('End line (1-indexed)'),
        description: z.string().optional().describe('What to focus on in this file'),
      })
    )
    .optional()
    .describe(
      `Attach files containing buggy code, config, dependencies, or related context.

**MUST ATTACH:**
- The exact file(s) where error occurs
- Configuration files: package.json, tsconfig.json, .env.example, docker-compose.yml
- Related files that interact with broken code
- Test files showing the failure

**Examples:**
\`\`\`javascript
// Single file with line range
[{
  path: "src/api/users.ts",
  start_line: 45,
  end_line: 78,
  description: "getUserById() function throwing the error"
}]

// Multiple related files
[{
  path: "src/components/DataTable.tsx",
  start_line: 120,
  end_line: 150,
  description: "useEffect causing infinite re-renders"
}, {
  path: "package.json",
  description: "Check dependency versions"
}, {
  path: "tsconfig.json",
  description: "TypeScript config for type errors"
}]
\`\`\`

**Best practices:**
- Use line ranges to focus on problem areas
- Attach config files for environment issues
- Include multiple files if they interact
- Order by relevance (most important first)`
    ),
};

export const bugfixResearchParamsSchema = z.object(bugfixResearchParamsShape);
export type BugfixResearchParams = z.infer<typeof bugfixResearchParamsSchema>;

// Output schema
export const bugfixResearchOutputShape = {
  content: z
    .string()
    .describe(
      'Comprehensive bug fix answer with root cause analysis, solutions, and workarounds. Markdown formatted with citations.'
    ),
  metadata: z
    .object({
      id: z.string().describe('Unique identifier for this research task'),
      model: z.string().describe('AI model used for research'),
      created: z.number().describe('Unix timestamp when research started'),
      finish_reason: z
        .string()
        .optional()
        .describe('Why research concluded: "stop", "budget_exhausted", etc.'),
    })
    .describe('Research request metadata'),
  usage: z
    .object({
      prompt_tokens: z.number().int().describe('Tokens in input question'),
      completion_tokens: z.number().int().describe('Tokens in generated answer'),
      total_tokens: z.number().int().describe('Total tokens (input + output + reasoning)'),
      prompt_tokens_details: z
        .object({
          text_tokens: z.number().int().optional().describe('Text tokens in prompt'),
          cached_tokens: z.number().int().optional().describe('Cached tokens'),
        })
        .optional()
        .describe('Detailed prompt token breakdown'),
      completion_tokens_details: z
        .object({
          reasoning_tokens: z.number().int().optional().describe('Tokens used for reasoning'),
        })
        .optional()
        .describe('Detailed completion token breakdown'),
      num_sources_used: z.number().int().optional().describe('Number of web sources used'),
    })
    .optional()
    .describe('Token usage and source statistics'),
  annotations: z
    .array(
      z.object({
        type: z.literal('url_citation').describe('Type of annotation'),
        url_citation: z
          .object({
            url: z.string().describe('Source URL'),
            start_index: z.number().int().describe('Start position in content'),
            end_index: z.number().int().describe('End position in content'),
            title: z.string().describe('Source title'),
          })
          .describe('Citation details'),
      })
    )
    .optional()
    .describe('Source citations from web search'),
};

export const bugfixResearchOutputSchema = z.object(bugfixResearchOutputShape);
export type BugfixResearchOutput = z.infer<typeof bugfixResearchOutputSchema>;