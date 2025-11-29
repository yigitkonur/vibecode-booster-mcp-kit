/**
 * Deep research schema - single unified research tool
 * Renamed from expert-intelligence for simplicity
 */

import { z } from 'zod';

export const deepResearchParamsShape = {
  deep_research_question: z
    .string()
    .min(1)
    .describe(
      `Provide complete research context. The researcher knows NOTHING about your situation — brief them like an expert consultant who just joined to investigate this topic thoroughly.

**TOPIC & WHY:**
- Precise topic you're researching
- Why this matters: what decision does it inform? What problem are you solving?
- Your role and what you're trying to accomplish
- Urgency: exploratory learning? critical decision needed?

**YOUR UNDERSTANDING:**
- What you already know (so research fills gaps, doesn't repeat basics)
- What you're uncertain or confused about
- Assumptions you want validated or challenged
- Specific areas where your knowledge might be outdated

**RESEARCH SCOPE:**
- **Depth needed:** Overview for decision-making? Detailed technical analysis? Expert-level deep dive?
- **Format preferred:** Conceptual explanation? Step-by-step guide? Comparative analysis? Case studies?
- **Examples needed:** Code samples? Architecture diagrams? Real-world implementations?
- **Perspectives:** Single best approach? Multiple options with trade-offs? Contrarian views?

**PRIORITIES:**
- **Sources:** Official docs? Academic papers? Engineering blogs? Community tutorials? GitHub examples?
- **Recency:** Must be 2024+ only? Any era acceptable? Historical context valuable?
- **Domain:** Enterprise focus? Startup/indie hacker? Open-source first? Specific industry?
- **Style:** Practical how-tos? Theoretical foundations? Balanced? Opinionated recommendations?

**BOUNDARIES:**
- **Exclude:** Topics to avoid, irrelevant tangents, specific technologies to skip
- **Scope limits:** Narrow to specific subset? Broad overview? Deep on one aspect?
- **Constraints:** Assume beginner-friendly? Require expert knowledge? Specific tech stack only?
- **Time/effort:** Quick overview (20 min read)? Comprehensive research (multiple hours)?

**QUESTIONS (3-7 specific):**
1. [Most critical question]
2. [Second most important]
3. [Third question]
4. [Additional question]
5. [Follow-up question]

Be thorough — the researcher can't ask follow-ups. Front-load all context.`
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
      `Attach reference files for context when researching improvements, comparisons, or integrations.

**USE WHEN:**
- Researching how to improve existing implementation
- Comparing your approach with best practices
- Getting technology recommendations based on current stack
- Understanding integration strategies with existing systems
- Analyzing architecture decisions

Optional but helpful when research relates to existing code/systems.`
    ),
};

export const deepResearchParamsSchema = z.object(deepResearchParamsShape);
export type DeepResearchParams = z.infer<typeof deepResearchParamsSchema>;

// Output schema
export const deepResearchOutputShape = {
  content: z
    .string()
    .describe(
      'Comprehensive expert research with multi-perspective analysis, evidence-based insights, and actionable recommendations. Markdown formatted with citations and examples.'
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

export const deepResearchOutputSchema = z.object(deepResearchOutputShape);
export type DeepResearchOutput = z.infer<typeof deepResearchOutputSchema>;
