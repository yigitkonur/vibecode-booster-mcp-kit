# 🔍 Deep Research Bug Fix MCP

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/yigitkonur/deep-research-bug-fix-mcp/workflows/CI/badge.svg)](https://github.com/yigitkonur/deep-research-bug-fix-mcp/actions)

> **MCP for deep-dive bug research** 🕵️‍♂️
> When bugs get weird and Stack Overflow doesn't help, this tool gives your coding agent better context for research.

## 🤔 What this is

When coding with LLMs, bug solving skills can sometimes stay pretty limited. There's this template structure that asks for the situation exactly as it is, and it uses JINA for deep research. When the flow works like this and the template is solid, you get really good responses back and your coding efficiency shoots up big time.

It's not magic, just a well-defined template. Your LLM fills that template properly, and JINA deep research does a good job. So your coding agent (Claude Code, Cursor, or whatever you use) never gets stuck.

## 🚀 Installation

### Claude Code (Recommended)

```bash
claude mcp add deep-research --scope user --env JINA_API_KEY=your_api_key -- npx -y deep-research-bug-fix-mcp
```

### Other MCP Clients

| Client | Config file & location | Installation |
|--|--|--|
| **Cline** | `~/.cline_mcp_settings.json` | ```json "mcpServers": { "deep-research": { "command": "npx", "args": ["-y","deep-research-bug-fix-mcp"], "env": { "JINA_API_KEY": "your_api_key" } } } ```
| **Cursor** | `~/.cursor/mcp.json` or `.cursor/mcp.json` | Same JSON as Cline |
| **Codex CLI** | `~/.codex/config.toml` | ```toml [mcp_servers.deep-research] command = "npx" args = ["-y","deep-research-bug-fix-mcp"] env = { JINA_API_KEY = "your_api_key" } ```
| **Windsurf** | `~/.codeium/windsurf/mcp_config.json` | Same JSON as Cline/Cursor |

### Manual Setup

```bash
npm install -g deep-research-bug-fix-mcp
echo "JINA_API_KEY=your_api_key" >> .env
```

## 🎯 The Template Structure

```
BACKGROUND: [What were you building? What changed?]
CURRENT ISSUE: [What's broken? Be specific]
EVIDENCE: [Error messages, logs, versions, code snippets]
GOAL: [What does success look like?]
QUESTIONS:
1. [What's the root cause?]
2. [How to configure X without breaking Y?]
3. [What would an experienced dev do?]
4. [What are alternative approaches?]
5. [What to debug next?]
```

## 📋 Example Usage

### TypeScript Build Error

```typescript
deep_research_question: `
BACKGROUND: React project was working, updated dependencies, now getting TypeScript errors.

CURRENT ISSUE: "Property 'replaceAll' does not exist on type 'string'" - but it should exist.

EVIDENCE:
- Error: src/utils/formatter.ts(23,34): error TS2339: Property 'replaceAll' does not exist on type 'string'
- TypeScript: 4.9.5
- tsconfig target: "ES2020"
- Node: 18.17.0
- Code: const cleaned = text.replaceAll(/[^\w\s]/g, '');

GOAL: Fix build for deployment with clean solution.

QUESTIONS:
1. Why isn't replaceAll recognized in TS 4.9.5?
2. Should I update TypeScript or change approach?
3. What's the most reliable string replacement method?
4. How to prevent this in future?
5. Any polyfill considerations?
`
```

### OAuth Session Issues

```typescript
deep_research_question: `
BACKGROUND: Next.js app with GitHub OAuth. Login works on my machine, but users get randomly logged out.

CURRENT ISSUE: Session persistence inconsistent. Happens more on mobile/incognito.

EVIDENCE:
- next-auth v4.24.5 with GitHub provider
- Cookies: secure: true, httpOnly: true, sameSite: 'lax'
- Error: "JWT session token signature verification failed"
- DevTools shows cookies present but session.user undefined
- req.nextauth.token randomly null

GOAL: Reliable sessions across all browsers until explicit logout.

QUESTIONS:
1. Why do JWT signatures fail intermittently?
2. Best cookie settings for cross-browser compatibility?
3. How to debug without going crazy?
4. Alternative session strategies?
5. Mobile browser specific issues?
`
```

## ⚙️ Configuration

### Basic Settings
- **`deep_research_question`** (required): Your structured problem description
- **`reasoning_effort`**: "high" (default) | "medium" | "low"

### Advanced Options
- **`team_size`**: 1-5 parallel agents (default: 5)
- **`budget_tokens`**: Token limit (default: 10000)
- **`boost_hostnames`**: Prioritize domains like `["stackoverflow.com", "docs.microsoft.com"]`
- **`exclude_hostnames`**: Block unreliable sources

## 🔄 How It Works

```
Bug happens → Fill template → Get research → Apply solution
```

The template forces you to:
1. Explain full context
2. Be specific about the problem
3. Include all relevant details
4. Define what success looks like

Then JINA research gives your LLM better information to work with.

## 🛠 Development

```bash
npm run dev       # Development mode
npm test          # Run tests
npm run check     # Lint and format
npm run build     # Production build
```