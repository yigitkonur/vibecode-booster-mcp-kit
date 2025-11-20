/**
 * Code planning deep research schema - optimized for feature planning
 * Forces comprehensive planning context to find optimal libraries and patterns
 */

import { z } from 'zod';

export const codePlanningResearchParamsShape = {
  deep_research_question: z
    .string()
    .min(1)
    .describe(
      `Provide complete feature planning context. The researcher starts fresh — explain like briefing a principal engineer on "what's the smartest way to build this without reinventing the wheel?"

**WHAT YOU'RE BUILDING:**
- Feature description and core functionality needed
- Complexity: small utility? mid-size feature? large system?
- Scale requirements: 100 users? 10k? 1M+?
- Critical requirements: real-time? offline-first? <100ms latency? GDPR compliant?

**CURRENT STACK:**
- Languages: TypeScript, Python, Go, etc.
- Frameworks: React, Next.js, FastAPI, etc.
- Database: PostgreSQL, MongoDB, Redis, etc.
- Architecture: monolith? microservices? serverless?
- Constraints: bundle size limits? browser support? must run on X platform?

**DESIRED OUTCOME:**
- Solve [problem] with minimal custom code using battle-tested libraries
- Must-have features vs nice-to-have
- Integration points with existing code (attach files below)
- Performance targets if any

**RESEARCH FOCUS:**
- Find: Production-grade libraries (high GitHub stars, active maintenance, good docs)
- Prefer: [Type-safe? Lightweight? Framework-specific? Batteries-included?]
- Avoid: [Deprecated libs? Paid-only? Specific tech to exclude?]
- Prioritize: Abstractions that reduce boilerplate and complexity

**QUESTIONS:**
1. What are the top 3-5 libraries/frameworks for [specific functionality] in [your stack]?
2. Which architectural pattern best fits [your use case at your scale]?
3. How do production apps implement [feature] — any proven patterns?
4. All-in-one solution vs compose-it-yourself — which approach and why?
5. What are the trade-offs (performance, bundle size, learning curve, maintenance)?

**TEMPLATE:**
\`\`\`
BUILDING:
Feature: [description]
Functionality: [what it needs to do]
Scale: [expected load]
Critical: [non-negotiable requirements]

CURRENT STACK:
- Framework: [Next.js 14, etc.]
- Backend: [Node + Express, etc.]
- Database: [Postgres 15, etc.]
- Constraints: [bundle <50kb, must support Safari, deploy on Vercel, etc.]

OUTCOME:
Implement [feature] using proven libraries/patterns, minimize custom code.
Must integrate with [existing system].
Must NOT [specific constraints].

RESEARCH FOCUS:
- Find: [GitHub repos with 5k+ stars for X]
- Prefer: [TypeScript-native, tree-shakeable, etc.]
- Avoid: [dependencies on jQuery, libraries without types, etc.]
- Prioritize: Solutions that reduce complexity

QUESTIONS:
1. Best library for [X functionality] in [stack]?
2. Pattern recommendations for [scenario]?
3. How do [similar companies/apps] solve this?
4. Integration approach with [existing system]?
5. Trade-offs between [option A] vs [option B]?
\`\`\`

Attach existing codebase files so recommendations fit your architecture. More context = better, more compatible suggestions.`
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
      `CRITICAL: Attach existing codebase files to ensure recommendations are compatible with your architecture, patterns, and style.

**ATTACH:**
- Entry points: app.ts, main.tsx, index.js (understand structure)
- Package.json / dependencies (avoid conflicts)
- Key architectural files showing patterns you use
- Related feature files for integration context
- Config files: tsconfig.json, vite.config.ts, etc.

**Examples:**
\`\`\`javascript
// Building new auth — attach existing patterns
[{
  path: "src/app/layout.tsx",
  description: "Current app providers and structure"
}, {
  path: "src/lib/api.ts",
  start_line: 1,
  end_line: 50,
  description: "Existing API client pattern to match"
}, {
  path: "package.json",
  description: "Current dependencies"
}]

// Adding real-time features — attach related code
[{
  path: "src/components/Dashboard.tsx",
  start_line: 45,
  end_line: 120,
  description: "Component that needs real-time updates"
}, {
  path: "src/hooks/useData.ts",
  description: "Current data fetching pattern"
}, {
  path: ".env.example",
  description: "Environment variables structure"
}]
\`\`\`

**Why attach:**
- Ensures library recommendations work with your stack
- Maintains code style consistency
- Identifies actual integration points
- Avoids suggesting incompatible patterns
- Provides realistic implementation estimates

Order files by importance. Include config files for version compatibility checks.`
    ),
};

export const codePlanningResearchParamsSchema = z.object(codePlanningResearchParamsShape);
export type CodePlanningResearchParams = z.infer<typeof codePlanningResearchParamsSchema>;

// Output schema
export const codePlanningResearchOutputShape = {
  content: z
    .string()
    .describe(
      'Comprehensive code planning research with library recommendations, architectural patterns, integration strategies, and trade-off analysis. Markdown formatted with GitHub links and code examples.'
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

export const codePlanningResearchOutputSchema = z.object(codePlanningResearchOutputShape);
export type CodePlanningResearchOutput = z.infer<typeof codePlanningResearchOutputSchema>;