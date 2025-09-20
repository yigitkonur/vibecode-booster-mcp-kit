# Deep Research Bug Fix MCP

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/yigitkonur/deep-research-bug-fix-mcp/workflows/CI/badge.svg)](https://github.com/yigitkonur/deep-research-bug-fix-mcp/actions)

**The ultimate debugging companion for Claude Code** — an AI-powered research tool designed specifically for developers who need comprehensive context collection and intelligent problem-solving assistance.

## 🎯 Why This Tool Exists

When you're stuck on a bug and your usual debugging approaches aren't working, this MCP server becomes your expert pair programming partner. It's designed to:

- **Collect comprehensive context** about your problem
- **Build a complete story** of what you're trying to achieve
- **Research solutions** using structured templates that lead to better results
- **Provide detailed analysis** with citations and multiple approaches

## 🚀 Quick Start

```bash
# Setup
npm install
cp .env.example .env
echo "JINA_API_KEY=your_api_key" >> .env

# Build and test
npm run build
npm test
```

## 🔧 Claude Code Integration

Add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "deep-research": {
      "command": "node",
      "args": ["/absolute/path/to/deep-research-bug-fix-mcp/dist/index.js"],
      "env": {
        "JINA_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## 🧠 The `deep_research` Tool

This isn't just another search tool — it's a **structured problem-solving assistant** that excels at:

### Core Philosophy
> *"When you face a bug and your internal analysis doesn't lead to a 100% certain solution, that's when you should definitely use this tool."*

### The Power of Context Collection

The tool uses a **structured template approach** that transforms vague problems into actionable research:

```
BACKGROUND: [Complete story and context - what were you trying to achieve?]
CURRENT ISSUE: [Exact problem you're facing, including symptoms and timing]
EVIDENCE: [Technical details, error messages, logs, code snippets, versions]
GOAL: [What success looks like, desired outcome, constraints]
QUESTIONS:
1. [What is the root cause of...?]
2. [How can I configure X to achieve Y?]
3. [What are the best practices for Z in my context?]
4. [What are alternative approaches to my current method?]
5. [What are the next debugging steps I should take?]
```

### Why This Template Works

**For Claude Code users**, this structured approach:
- ✅ **Eliminates ambiguity** — no more "it doesn't work" descriptions
- ✅ **Builds complete context** — like explaining to an expert who just walked in
- ✅ **Focuses research** — gets targeted solutions, not generic advice
- ✅ **Provides actionable outcomes** — specific next steps and alternatives

## 📋 Usage Examples

### Example 1: TypeScript Build Error
```typescript
// In Claude Code, use the deep_research tool:
deep_research_question: `
BACKGROUND: Building a React TypeScript project that was working yesterday. Updated dependencies including @types/node from 18.x to 20.x and now getting build failures.

CURRENT ISSUE: TypeScript compilation fails with "Property 'replaceAll' does not exist on type 'string'" even though replaceAll should be available in modern JS.

EVIDENCE:
- Error: src/utils/formatter.ts(23,34): error TS2339: Property 'replaceAll' does not exist on type 'string'
- TypeScript version: 4.9.5
- tsconfig.json target: "ES2020"
- Node version: 18.17.0
- Code snippet: const cleaned = text.replaceAll(/[^\w\s]/g, '');

GOAL: Fix the build so deployment can proceed. Need to understand why replaceAll isn't recognized and get the cleanest solution.

QUESTIONS:
1. What is the root cause of replaceAll not being recognized in TS 4.9.5?
2. How should I configure TypeScript for proper string method support?
3. What are the best practices for handling this across different environments?
4. What are alternative approaches if replaceAll isn't available?
5. Should I update TypeScript version or change the polyfill approach?
`
```

### Example 2: Authentication Flow Bug
```typescript
deep_research_question: `
BACKGROUND: Implementing OAuth2 flow in Next.js 14 app. Users can log in successfully, but session persistence is inconsistent. Some users get logged out randomly, others stay logged in indefinitely.

CURRENT ISSUE: Session cookies are being set but not consistently read across requests. Happens more on mobile browsers and in incognito mode.

EVIDENCE:
- Using next-auth v4.24.5 with GitHub provider
- Cookie settings: secure: true, httpOnly: true, sameSite: 'lax'
- Error logs: "JWT session token signature verification failed"
- Browser DevTools shows cookies present but session.user is undefined
- Middleware.ts runs but req.nextauth.token is null randomly

GOAL: Reliable session persistence across all browsers and devices. Users should stay logged in until explicit logout.

QUESTIONS:
1. What causes JWT signature verification to fail intermittently?
2. How should I configure next-auth cookies for cross-browser compatibility?
3. What are the best practices for session debugging in Next.js?
4. What are alternative session storage approaches for this scenario?
5. What debugging steps should I take to isolate mobile browser issues?
`
```

### Example 3: Performance Investigation
```typescript
deep_research_question: `
BACKGROUND: React app loading slowly on mobile devices. Desktop performance is fine, but mobile users report 5-8 second load times. Lighthouse shows good scores on desktop but poor mobile performance.

CURRENT ISSUE: Mobile Lighthouse shows "Largest Contentful Paint" at 4.2s and "First Input Delay" warnings. Bundle size seems reasonable at 234KB gzipped.

EVIDENCE:
- Mobile Lighthouse score: 67/100
- Desktop Lighthouse score: 94/100
- Webpack bundle analyzer shows React Router taking 45KB
- Network tab shows waterfall delays on mobile
- Using React 18.2.0, Vite 4.4.0
- Mobile test on iPhone 12, Android Pixel 6

GOAL: Achieve mobile Lighthouse score above 90 and sub-2 second load times. Need to identify specific mobile bottlenecks.

QUESTIONS:
1. What are the primary causes of mobile vs desktop performance gaps?
2. How can I optimize React Router bundle size impact?
3. What are the best practices for mobile React performance?
4. What are alternative bundling strategies for mobile optimization?
5. What debugging tools should I use for mobile-specific performance analysis?
`
```

## ⚙️ Configuration Options

### Essential Parameters

- **`deep_research_question`** (required): Your structured problem description
- **`reasoning_effort`**: "low" | "medium" | "high" (default: "high")
  - **high**: Maximum thoroughness, best for complex bugs
  - **medium**: Balanced speed/quality for most scenarios
  - **low**: Quick research for simple questions

### Advanced Control

- **`team_size`**: 1-5 parallel agents (default: 5) — reduce for cost control
- **`budget_tokens`**: Token limit (default: 10000) — increase for complex research
- **`max_attempts`**: Self-correction loops (default: 3) — for refining answers
- **`boost_hostnames`**: Prioritize specific domains (e.g., ["stackoverflow.com", "docs.microsoft.com"])
- **`exclude_hostnames`**: Block low-quality sources
- **`only_hostnames`**: Restrict to specific domains for focused research

## 🎨 Integration Benefits for Claude Code

### Context-Driven Development
This tool transforms how you approach debugging in Claude Code:

1. **Structured Problem Definition** — Forces you to clearly articulate the issue
2. **Comprehensive Research** — Gathers information you might have missed
3. **Multiple Solution Paths** — Provides alternatives and best practices
4. **Cited Sources** — Links to documentation and examples for verification
5. **Progressive Refinement** — Self-correcting research for better accuracy

### Example Claude Code Workflow
```typescript
// 1. Hit a bug while coding
// 2. Use deep_research tool with structured template
// 3. Get comprehensive analysis with multiple approaches
// 4. Apply solution with confidence, knowing alternatives exist
// 5. Learn best practices for future similar issues
```

## 🔍 What Makes This Different

### Traditional Approach:
- "Search for error message"
- "Try random Stack Overflow answers"
- "Hope it works"

### This Tool's Approach:
- **Context Collection**: Full problem context with background
- **Systematic Research**: Multiple sources, cross-referenced information
- **Solution Synthesis**: Combines insights into actionable recommendations
- **Best Practice Integration**: Not just fixes, but proper approaches
- **Alternative Planning**: Multiple paths forward if primary solution fails

## 🛠 Development

```bash
npm run dev       # Development with watch mode
npm test          # Run test suite
npm run check     # Lint and format check
npm run check:fix # Auto-fix formatting issues
npm run build     # Production build
```

## 📊 Performance

- **Startup**: <1 second
- **Memory**: ~40MB RSS
- **Response Time**: ~1-2 seconds (depends on research complexity)
- **Cost Control**: Token budgets and effort levels for cost management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all CI checks pass
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

## 👨‍💻 Author

Yiğit Konur - [@yigitkonur](https://github.com/yigitkonur)

---

*"Think of this as explaining your entire situation to an expert who just walked into the room — provide every detail to get the best possible solution."*