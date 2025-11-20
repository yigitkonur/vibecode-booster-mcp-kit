/**
 * Expert intelligence deep research schema - optimized for deep learning
 * Forces comprehensive research context for any topic (technical or non-technical)
 */

import { z } from 'zod';

export const expertIntelligenceResearchParamsShape = {
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

**TEMPLATE:**
\`\`\`
TOPIC: [Precise topic]
WHY: Researching this because [decision/problem/goal]
ROLE: [Your context - developer, founder, student, etc.]

MY UNDERSTANDING:
Know: [What you already understand]
Uncertain: [What confuses you or seems contradictory]
Validate: [Assumptions to check]
Outdated: [Knowledge from X years ago, might have changed]

SCOPE:
Depth: [overview / detailed / expert-level]
Format: [conceptual / step-by-step / comparative / case studies]
Examples: [need code samples? diagrams? real implementations?]
Perspectives: [single best way? multiple options? trade-offs?]

PRIORITIES:
Sources: [official docs, blogs from X companies, GitHub repos, academic papers]
Recency: [2024+ only / any / include historical context]
Domain: [enterprise / startup / open-source / specific industry]
Style: [practical / theoretical / balanced / opinionated]

BOUNDARIES:
Exclude: [Avoid X, skip Y, don't cover Z]
Scope: [Limit to X ecosystem, focus only on Y aspect]
Constraints: [Beginner-friendly / assume expert / TypeScript only]
Time: [Quick overview / comprehensive deep-dive]

QUESTIONS:
1. [Main question about core concept]
2. [How to implement/use in practice]
3. [Trade-offs and alternatives]
4. [Common pitfalls and how to avoid]
5. [Real-world examples and case studies]
\`\`\`

**EXAMPLE - Technical:**
\`\`\`
TOPIC: CRDT (Conflict-free Replicated Data Types) for collaborative editing
WHY: Building real-time collaborative doc editor, need to choose sync algorithm
ROLE: Full-stack developer, intermediate level, familiar with React and WebSockets

MY UNDERSTANDING:
Know: CRDTs allow offline edits without conflicts, used by Figma/Notion
Uncertain: How they actually work under the hood, performance implications
Validate: "CRDTs are always better than Operational Transform" — true?
Outdated: Read about CRDTs in 2020, libraries have probably improved

SCOPE:
Depth: Detailed technical - need enough to make library choice and architect system
Format: Comparative analysis of CRDT types + practical implementation guide
Examples: Need TypeScript code examples, architecture diagrams for React apps
Perspectives: Compare Yjs vs Automerge vs custom — with honest trade-offs

PRIORITIES:
Sources: Engineering blogs from Figma/Linear/Notion, Yjs/Automerge official docs, GitHub production examples
Recency: 2023-2024 focus (field evolving rapidly, need current state)
Domain: Production SaaS applications (not academic research)
Style: Practical implementation focus with theory explained as needed

BOUNDARIES:
Exclude: Academic papers, pure theory, Operational Transform deep-dives
Scope: Limit to JavaScript/TypeScript ecosystem, text editing only (not drawing)
Constraints: Must work with React, assume cloud-deployed (not P2P/local-first focus)
Time: Comprehensive research acceptable (making critical architecture decision)

QUESTIONS:
1. What are the practical differences between Yjs and Automerge for text editing in React?
2. How do production apps (Figma, Notion, Linear) actually implement CRDTs?
3. What are performance characteristics — can CRDTs handle 50+ concurrent users?
4. How do I store CRDT updates in PostgreSQL while maintaining real-time sync?
5. What are common implementation mistakes and how to avoid them?
\`\`\`

**EXAMPLE - Non-Technical:**
\`\`\`
TOPIC: Developer productivity measurement for remote engineering teams
WHY: CTO of 20-person engineering team, need to improve velocity without micromanaging
ROLE: Technical leader, managing fully-remote team, concerned about burnout vs performance

MY UNDERSTANDING:
Know: DORA metrics exist, velocity is complex, lines-of-code is bad metric
Uncertain: What actually correlates with productivity? How to measure without surveillance?
Validate: "High PR volume = high productivity" — seems wrong but unsure why
Outdated: Last researched this pre-COVID (remote dynamics changed)

SCOPE:
Depth: Detailed practical guide — need actionable metrics and implementation approach
Format: Framework comparison + step-by-step implementation guide with examples
Examples: Real company case studies, actual metrics dashboards from eng teams
Perspectives: Multiple approaches with trade-offs (team size, culture, goals)

PRIORITIES:
Sources: Engineering blogs from CTOs (GitLab, Basecamp, Stripe), management literature, research studies
Recency: 2022+ (post-remote-work shift)
Domain: Tech startups/scale-ups (20-200 eng team size), remote-first culture
Style: Balanced (theory + practice), honest about limitations and pitfalls

BOUNDARIES:
Exclude: Enterprise waterfall approaches, surveillance tools, individual performance reviews
Scope: Focus on team health + output, not individual tracking
Constraints: Remote-first context, developer-friendly (no Big Brother vibes)
Time: Comprehensive research (strategic decision impacting team culture)

QUESTIONS:
1. What metrics actually correlate with sustainable team productivity?
2. How do successful remote-first companies (GitLab, Basecamp) measure engineering effectiveness?
3. How to balance quantitative metrics with qualitative team health indicators?
4. What are anti-patterns that damage morale while appearing to measure productivity?
5. How to implement metrics without creating perverse incentives (gaming the system)?
\`\`\`

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

**EXAMPLES:**
\`\`\`javascript
// Researching better patterns for existing code
[{
  path: "src/services/cache.ts",
  description: "Current caching implementation - research better patterns"
}, {
  path: "docs/architecture.md",
  description: "Current architecture - research if it scales"
}]

// Getting stack-compatible recommendations
[{
  path: "package.json",
  description: "Current dependencies for compatibility"
}, {
  path: "src/lib/api-client.ts",
  start_line: 20,
  end_line: 80,
  description: "Current API patterns - research improvements"
}]
\`\`\`

**BENEFITS:**
- Research considers your existing context
- Recommendations are compatible with your stack
- Can compare your implementation with standards
- Gets specific advice for your architecture

Optional but helpful when research relates to existing code/systems.`
    ),
};

export const expertIntelligenceResearchParamsSchema = z.object(
  expertIntelligenceResearchParamsShape
);
export type ExpertIntelligenceResearchParams = z.infer<
  typeof expertIntelligenceResearchParamsSchema
>;

// Output schema
export const expertIntelligenceResearchOutputShape = {
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
      total_tokens: z
        .number()
        .int()
        .describe('Total tokens consumed (input + searches + reasoning + output). Used for billing.'),
    })
    .optional()
    .describe('Token usage statistics'),
  sources: z
    .object({
      visited_urls: z
        .array(z.string())
        .describe('All URLs considered during search'),
      read_urls: z
        .array(z.string())
        .describe('URLs actually read to construct answer'),
      total_sources: z
        .number()
        .int()
        .describe('Total unique URLs found before filtering'),
    })
    .optional()
    .describe('Web sources consulted'),
  research_quality: z
    .object({
      reasoning_effort: z
        .enum(['low', 'medium', 'high'])
        .describe('Reasoning effort level used'),
      team_size: z.number().int().describe('Number of parallel agents used'),
      confidence_score: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe("Agent's confidence in answer quality (0-1)"),
    })
    .optional()
    .describe('Research quality metrics'),
};

export const expertIntelligenceResearchOutputSchema = z.object(
  expertIntelligenceResearchOutputShape
);
export type ExpertIntelligenceResearchOutput = z.infer<
  typeof expertIntelligenceResearchOutputSchema
>;