/**
 * Code planning deep research schema - simplified interface with maximum quality defaults
 * Specialized for pre-development research: frameworks, best practices, repos, integrations
 */

import { z } from 'zod';

export const codePlanningResearchParamsShape = {
  // --- Core Parameter (Required) ---
  code_planning_question: z
    .string()
    .min(1)
    .describe(
      `Use \`deepresearch_code_planning\` for comprehensive pre-development research when starting a new coding project. This tool specializes in helping you make informed decisions about frameworks, architecture, best practices, and implementation strategies BEFORE writing code.

**WHEN TO USE THIS TOOL:**
- Starting a new project and need to choose the right tech stack
- Evaluating framework options and their trade-offs
- Understanding best practices for a specific domain
- Finding production-ready examples on GitHub with high stars
- Planning integrations with third-party services
- Building on top of existing code and need compatible approaches
- Researching quick-start guides and setup procedures
- Understanding architectural patterns for your use case

**PROJECT OVERVIEW:**
Provide comprehensive context about what you're planning to build:
- **What are you building?** (Detailed description of the project)
- **Why are you building it?** (Problem it solves, target audience)
- **Scale expectations:** (Expected users, data volume, traffic patterns)
- **Critical requirements:** (Performance, security, compliance, accessibility)
- **Timeline constraints:** (MVP deadline, full launch date)
- **Team context:** (Solo dev, team size, skill levels)
- **Deployment target:** (Cloud provider, on-premise, edge, hybrid)

**TECHNOLOGY STACK RESEARCH:**
Help the AI understand your constraints and preferences:
- **Programming language:** (Required: Python, JavaScript, Go, Rust, etc. or "help me choose")
- **Current knowledge:** (What you already know, what you need to learn)
- **Framework preferences:** (Specific frameworks to research or "recommend best options")
- **Database requirements:** (SQL vs NoSQL, specific needs like full-text search, time-series, graphs)
- **API architecture:** (REST, GraphQL, gRPC, WebSocket, or "help me choose")
- **Frontend needs:** (SPA, SSR, SSG, mobile app, desktop app)
- **Infrastructure:** (Serverless, containers, VMs, edge computing)
- **Existing constraints:** (Must use specific technologies due to team/company/integration requirements)

**BEST PRACTICES & PATTERNS:**
Areas to research for your project:
- **Architecture patterns:** (Microservices, monolith, serverless, event-driven, hexagonal, CQRS, etc.)
- **Code organization:** (Project structure, module boundaries, naming conventions)
- **Testing strategy:** (Unit, integration, e2e, test frameworks, coverage targets)
- **Security practices:** (Authentication, authorization, data encryption, input validation, OWASP)
- **Performance optimization:** (Caching strategies, database indexing, CDN usage, lazy loading)
- **Error handling:** (Logging, monitoring, alerting, graceful degradation)
- **Documentation:** (API docs, code comments, architecture diagrams)
- **CI/CD pipeline:** (Build, test, deploy automation)

**GITHUB REPOSITORY ANALYSIS:**
Request specific repository research:
- **Find repos:** "Search GitHub for [topic] repositories with most stars"
- **Quick start extraction:** "Extract quick-start guides from top 5 [framework] repos"
- **Production examples:** "Find production-grade implementations of [pattern] in [language]"
- **Compare approaches:** "Compare implementation styles across popular [type] projects"
- **Common pitfalls:** "Identify common mistakes in [framework] projects on GitHub"
- **Integration examples:** "Find examples of [serviceA] + [serviceB] integration"
- **Boilerplate analysis:** "Analyze best starter templates for [stack]"

**INTEGRATION CAPABILITIES:**
Third-party services and integrations to research:
- **Authentication/Authorization:** (OAuth, JWT, SAML, Auth0, Firebase Auth, Clerk, etc.)
- **Payment processing:** (Stripe, PayPal, Square - which fits your use case?)
- **Email services:** (SendGrid, AWS SES, Mailgun - pricing and features)
- **File storage:** (S3, Cloudinary, Uploadcare - image optimization, CDN)
- **Real-time features:** (WebSocket, Server-Sent Events, WebRTC, Pusher, Ably)
- **Search functionality:** (Elasticsearch, Algolia, Meilisearch, Typesense)
- **Analytics:** (Google Analytics, Mixpanel, PostHog, Plausible)
- **Monitoring/Logging:** (Sentry, LogRocket, Datadog, New Relic)
- **Communication style:** Specify if you need gRPC, REST, GraphQL, or message queues for integrations
- **API compatibility:** Research if services have SDKs for your chosen language
- **Pricing research:** Understand cost implications at your expected scale

**EXISTING CODEBASE CONTEXT (Use file_attachments):**
If you're building on top of existing code, attach relevant files to provide context:
- **What's already implemented:** (Existing features, modules, services)
- **Architecture constraints:** (Current patterns, tech stack, dependencies)
- **Integration points:** (Where new code needs to connect)
- **Code style:** (Follow existing conventions)
- **Tech debt:** (Known issues to avoid or fix)
- **Performance bottlenecks:** (Areas to improve or work around)

**RESEARCH PRIORITIES:**
Guide the research focus:
- **Source preferences:**
  * "Prioritize official documentation and getting-started guides"
  * "Focus on production-ready examples from major tech companies"
  * "Prefer community tutorials and practical guides"
  * "Include academic papers for theoretical foundation"
  * "Look for GitHub repos with 10k+ stars"
  * "Find engineering blogs from companies at similar scale"
- **Recency requirements:**
  * "Latest 2024-2025 information only (framework versions change fast)"
  * "Include historical context for mature technologies"
  * "Focus on LTS (Long Term Support) versions"
- **Domain focus:**
  * "Enterprise-grade solutions with SOC2 compliance"
  * "Indie hacker / solo developer friendly stack"
  * "Startup MVP with fast iteration"
  * "Open-source first approach"
- **Content style:**
  * "Practical implementation guides with code examples"
  * "High-level architecture comparison"
  * "Detailed technical specifications"
  * "Step-by-step tutorials"

**RESEARCH BOUNDARIES:**
Define clear limitations for focused research:
- **Language constraints:** "Only [Python/JavaScript/Go] solutions - exclude other languages"
- **Framework constraints:** "Must be compatible with [existing framework]"
- **Licensing:** "Open-source only" or "Commercial licenses acceptable"
- **Hosting constraints:** "Must run on [AWS/GCP/Azure/Vercel/Railway/Supabase]"
- **Budget limitations:** "Free tier sufficient" or "Budget up to $X/month"
- **Team skill level:** "Beginner-friendly" or "Assume expert-level knowledge"
- **Time constraints:** "Need production-ready solution, avoid bleeding-edge"
- **Compliance requirements:** "GDPR/HIPAA/SOC2 compliant solutions only"
- **Exclusions:** "Avoid [technology X], exclude paid-only services, skip deprecated frameworks"

**COMPREHENSIVE TEMPLATE STRUCTURE:**
\`\`\`
PROJECT OVERVIEW:
Building: [Detailed project description]
Target: [Audience and use case]
Scale: [Expected load and growth]
Critical Requirements: [Non-negotiable features/constraints]
Timeline: [MVP and launch dates]
Team: [Size and skill levels]
Deployment: [Infrastructure preferences]

TECHNOLOGY STACK RESEARCH:
Language: [Required or help choose]
Current Knowledge: [What team knows]
Framework Options: [List to research or recommend]
Database: [Type and specific requirements]
API Style: [REST/GraphQL/gRPC or help choose]
Frontend: [SPA/SSR/SSG/mobile]
Infrastructure: [Serverless/containers/VMs]
Existing Constraints: [Must-use technologies]

BEST PRACTICES TO RESEARCH:
- Architecture: [Patterns to explore]
- Code Organization: [Structure needs]
- Testing: [Strategy and tools]
- Security: [Specific concerns]
- Performance: [Optimization areas]
- Error Handling: [Monitoring approach]
- Documentation: [What's needed]
- CI/CD: [Pipeline requirements]

GITHUB REPOSITORY ANALYSIS:
- Find: [Top repos for specific topic]
- Extract: [Quick-start guides from repos]
- Compare: [Implementation approaches]
- Learn: [Production patterns from examples]
- Identify: [Common pitfalls to avoid]

INTEGRATION REQUIREMENTS:
- Auth: [Type and provider options]
- Payments: [Provider and features needed]
- Email: [Service requirements]
- Storage: [File handling needs]
- Real-time: [WebSocket/SSE requirements]
- Search: [Full-text search needs]
- Analytics: [Tracking requirements]
- Monitoring: [Observability needs]
- Communication Style: [gRPC vs REST vs GraphQL]
- API SDKs: [Language support needed]
- Pricing: [Cost considerations at scale]

EXISTING CODEBASE (attach files):
- Already Implemented: [Existing features]
- Architecture: [Current patterns]
- Integration Points: [Where to connect]
- Style Guide: [Conventions to follow]
- Tech Debt: [Known issues]
- Performance: [Current bottlenecks]

RESEARCH PRIORITIES:
- Sources: [Official docs, blogs, GitHub, academic]
- Recency: [Latest versions vs LTS vs any]
- Domain: [Enterprise, startup, indie hacker]
- Style: [Practical, theoretical, comparative]

RESEARCH BOUNDARIES:
- Language: [Constraints or exclusions]
- Framework: [Compatibility requirements]
- Licensing: [Open-source, commercial]
- Hosting: [Platform constraints]
- Budget: [Cost limitations]
- Skill Level: [Team capabilities]
- Time: [Stability requirements]
- Compliance: [Regulatory needs]
- Exclusions: [What to avoid]

SPECIFIC QUESTIONS:
1. [Framework selection and comparison]
2. [Architecture pattern recommendations]
3. [Integration implementation approaches]
4. [Performance and scalability strategies]
5. [Security best practices for this use case]
6. [Testing strategy and tools]
7. [Deployment and DevOps approach]
8. [Common pitfalls and how to avoid them]
9. [Cost optimization strategies]
10. [Timeline and complexity estimates]
\`\`\`

**EXAMPLE USAGE:**
\`\`\`
PROJECT OVERVIEW:
Building: Real-time collaborative document editor (like Google Docs)
Target: Small teams (10-50 users per document), B2B SaaS
Scale: Expect 1000 documents, 10k users in first year
Critical Requirements: Sub-100ms latency, conflict-free replicas, offline support
Timeline: MVP in 3 months, launch in 6 months
Team: 3 full-stack devs (intermediate level)
Deployment: Prefer cloud platform with auto-scaling

TECHNOLOGY STACK RESEARCH:
Language: TypeScript (frontend and backend for code sharing)
Current Knowledge: Team knows React, Node.js, PostgreSQL
Framework Options: Research Next.js vs Remix vs Vite+React for frontend, Express vs Fastify vs Nest.js for backend
Database: Need real-time capabilities - research PostgreSQL with real-time extensions vs Firebase vs Supabase vs custom WebSocket
API Style: Need real-time bidirectional communication - research WebSocket vs Server-Sent Events vs gRPC streaming
Frontend: SPA with SSR for SEO
Infrastructure: Prefer serverless/managed services to minimize DevOps
Existing Constraints: Must use TypeScript, prefer Vercel for frontend deployment

BEST PRACTICES TO RESEARCH:
- Architecture: Research Operational Transformation (OT) vs CRDT for conflict resolution
- Code Organization: Monorepo vs separate repos for frontend/backend
- Testing: E2E testing strategies for real-time collaborative features
- Security: Row-level security for multi-tenant documents, XSS prevention in rich text
- Performance: Optimistic UI updates, efficient diff algorithms, connection pooling
- Error Handling: Handling network disconnections gracefully, data synchronization recovery
- Documentation: Architectural decision records for CRDT choices
- CI/CD: Automated preview deployments for PRs

GITHUB REPOSITORY ANALYSIS:
- Find: Top 10 CRDT implementation repos with most stars
- Extract: Quick-start guides from Yjs, Automerge, and Y-CRDT documentation
- Compare: Compare Yjs vs Automerge for TypeScript projects - performance, bundle size, community
- Learn: Find production examples of collaborative editing (analyze Notion, Linear, Figma architecture from their engineering blogs)
- Identify: Common mistakes in WebSocket connection management and reconnection logic

INTEGRATION REQUIREMENTS:
- Auth: Research Clerk vs Auth0 vs Supabase Auth - need social login + email
- Payments: Stripe subscription billing (research Elements vs Checkout)
- Email: Transactional emails for invitations - research Resend vs SendGrid pricing at 100k emails/month
- Storage: Document attachments up to 10MB - research S3 vs Cloudinary vs Supabase Storage
- Real-time: Core feature - research native WebSocket vs Socket.io vs Supabase Realtime vs Ably
- Search: Full-text search in documents - research PostgreSQL full-text vs Elasticsearch vs Algolia cost
- Analytics: User behavior tracking - research PostHog vs Mixpanel for B2B SaaS
- Monitoring: Research Sentry vs LogRocket for error tracking + session replay
- Communication Style: Real-time requires WebSocket, but also need REST API for CRUD - research hybrid approach
- API SDKs: All services must have TypeScript SDKs
- Pricing: Calculate costs at 10k users with real-time connections

EXISTING CODEBASE (attach files):
We already have:
- Basic Next.js app with authentication (Attach: src/app/auth/* files)
- PostgreSQL schema for users and documents (Attach: schema.sql)
- Component library with design system (Attach: src/components/ui/* files)
Need to research how to integrate CRDT library with existing React components and PostgreSQL storage.

RESEARCH PRIORITIES:
- Sources: Prioritize official Yjs/Automerge docs, engineering blogs from Notion/Linear/Figma, GitHub repos with production examples
- Recency: Latest 2024 information (CRDT field is evolving rapidly)
- Domain: Focus on production-ready B2B SaaS implementations
- Style: Need both high-level architecture AND detailed code examples for CRDT integration

RESEARCH BOUNDARIES:
- Language: TypeScript only - exclude Python/Go examples
- Framework: Must work with React and Next.js
- Licensing: Open-source preferred, commercial acceptable if reasonably priced
- Hosting: Must run on Vercel (frontend) and Railway/Supabase (backend)
- Budget: Target under $500/month at 10k users
- Skill Level: Team is intermediate - prefer well-documented solutions over cutting-edge
- Time: Need proven stable solutions - avoid alpha/beta frameworks
- Compliance: No specific compliance yet, but plan for GDPR compliance later
- Exclusions: Avoid Firebase (vendor lock-in concerns), exclude solutions requiring Rust/WASM compilation

SPECIFIC QUESTIONS:
1. Should we use Yjs or Automerge for CRDT? What are trade-offs for TypeScript + React + PostgreSQL stack?
2. What's the best architecture for storing CRDT updates in PostgreSQL while maintaining real-time sync?
3. How do production apps (Notion, Linear) handle offline-first with conflict resolution?
4. What's the optimal WebSocket connection management strategy for 10k concurrent users?
5. How to implement proper security/authorization in collaborative documents (row-level security)?
6. What testing strategies work for CRDT-based applications?
7. How to deploy and scale WebSocket servers on Railway or similar platforms?
8. What are common performance pitfalls in collaborative editors and how to avoid them?
9. Should we use a managed service like Ably or build custom WebSocket server?
10. What's realistic timeline for MVP with our team's skill level?
\`\`\`

**FILE ATTACHMENTS USAGE:**
When you have existing code that new features will build upon, attach relevant files to help the AI understand:
- Existing architecture and patterns to follow
- Tech stack and dependencies already in use
- Code style and conventions
- Integration points where new code needs to fit
- Performance characteristics to maintain or improve

This context ensures research recommendations are compatible with your existing codebase rather than suggesting conflicting approaches.

Think of this tool as your expert technical co-founder who researches everything before you write a single line of code - ensuring you make informed decisions backed by production examples, best practices, and real-world trade-offs!`
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
      `Attach existing codebase files to provide context for planning new features or additions. This is CRITICAL when building on top of existing implementations, as it ensures research recommendations are compatible with your current architecture.

**When to Attach Files:**
- You have existing code and need to add new features on top
- You want to ensure new frameworks/libraries are compatible
- You need to follow existing code style and patterns
- You're researching how to refactor or improve existing implementation
- You want to understand how to integrate new services with current architecture

**What to Attach:**
- **Entry points:** main.ts, index.js, app.py (understand app structure)
- **Configuration:** package.json, requirements.txt, go.mod (current dependencies)
- **Database schemas:** schema.sql, migrations (data model understanding)
- **Core modules:** Key business logic files that new features interact with
- **Architecture docs:** README.md, ARCHITECTURE.md (existing patterns)
- **API routes:** Existing endpoint definitions (integration points)
- **Component library:** Shared UI components (maintain consistency)

**Examples:**
\`\`\`
// Attach existing auth implementation when researching payment integration
file_attachments: [
  {
    path: "src/auth/middleware.ts",
    description: "Current JWT auth - need payment endpoints to use same pattern"
  },
  {
    path: "src/database/schema.sql",
    description: "User schema - need to add subscription fields for payments"
  },
  {
    path: "package.json",
    description: "Current dependencies - ensure new libraries don't conflict"
  }
]

// Attach multiple related files for comprehensive context
file_attachments: [
  {
    path: "src/app/layout.tsx",
    start_line: 1,
    end_line: 50,
    description: "Next.js app structure - need real-time features to integrate here"
  },
  {
    path: "src/lib/database.ts",
    description: "Current Supabase setup - need to understand for CRDT storage research"
  },
  {
    path: "src/components/ui/editor.tsx",
    start_line: 100,
    end_line: 200,
    description: "Current text editor component - researching how to add collaborative editing"
  }
]
\`\`\`

**Benefits:**
- Research recommendations match your existing stack
- Avoid suggesting incompatible frameworks or patterns
- Understand existing constraints and tech debt
- Maintain code style consistency
- Identify integration points accurately
- Provide realistic implementation estimates based on current code

**Features:**
- Automatic language detection and syntax highlighting
- Smart truncation for large files (>600 lines)
- Line numbers for easy reference
- Graceful handling of missing files
- Files appended as formatted markdown sections

**Best Practices:**
- Attach 3-10 most relevant files (avoid overloading with too many)
- Use line ranges to focus on specific sections
- Add descriptions to explain why each file is relevant
- Include configuration files (package.json, tsconfig.json, etc.)
- Order files by importance (most critical first)
- Update attachments as project evolves`
    ),
};

export const codePlanningResearchParamsSchema = z.object(codePlanningResearchParamsShape);

export type CodePlanningResearchParams = z.infer<typeof codePlanningResearchParamsSchema>;

// Output schema (same structure as other research tools)
export const codePlanningResearchOutputShape = {
  content: z
    .string()
    .describe(
      'Comprehensive code planning research synthesized by the agent, formatted in Markdown with citations, examples, and actionable recommendations.'
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

export const codePlanningResearchOutputSchema = z.object(codePlanningResearchOutputShape);

export type CodePlanningResearchOutput = z.infer<typeof codePlanningResearchOutputSchema>;
