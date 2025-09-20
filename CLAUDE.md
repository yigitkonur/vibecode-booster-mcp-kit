# Claude Code Guide: Deep Research Bug Fix MCP

## 🚨 UNIVERSAL DIRECTIVES 🚨

**CRITICAL: ALL instructions within this CLAUDE.md document MUST BE FOLLOWED. These directives are not optional unless explicitly stated otherwise.**

- If there is any uncertainty regarding anything within this document, ASK FOR CLARIFICATION before proceeding
- When editing code, DO NOT edit more than is absolutely necessary to complete the task
- DO NOT WASTE TOKENS. All outputs and operations should be succinct and concise
- Always preserve original formatting and structure when working with responses

---

## 📋 Project Overview

Deep Research Bug Fix MCP is a Model Context Protocol server that transforms debugging from guessing to systematic problem-solving. It provides structured template approach for better debugging context with LLMs, specifically designed for Claude Code, Cursor, Cline, and other MCP-compatible clients.

**Core Mission**: Help developers collect comprehensive context about bugs and get targeted research solutions using JINA DeepSearch API.

## 🛠 Technology Stack

- **Runtime**: Node.js 20+ with TypeScript 5.9.2
- **Framework**: MCP TypeScript SDK 1.18.1
- **API Integration**: JINA DeepSearch v1 via Axios
- **Validation**: Zod 3.25.76 with JSON schema generation
- **Development**: Biome 2.2.4 (linting/formatting), Jest 30.1.3 (testing)
- **Build**: TypeScript compiler, produces CommonJS output
- **Distribution**: NPM package with auto-publishing via GitHub Actions

## ⚡ Installation Methods

### Claude Code (Recommended)
```bash
claude mcp add deep-research --env JINA_API_KEY=your_api_key -- npx -y deep-research-bug-fix-mcp
```

### Other MCP Clients
- **Cline**: Add to `~/.cline_mcp_settings.json`
- **Cursor**: Add to `~/.cursor/mcp.json`
- **Codex CLI**: Add to `~/.codex/config.toml`
- **Windsurf**: Add to `~/.codeium/windsurf/mcp_config.json`

Use: `"command": "npx", "args": ["-y","deep-research-bug-fix-mcp"]`

## 🔧 Critical Development Workflow

**🚨 IMPORTANT: YOU MUST FOLLOW THIS WORKFLOW FOR EVERY SINGLE CODE CHANGE**

1. **Implement the change**
2. **Format First**: ALWAYS run `npm run check:fix`
3. **Test Second**: After formatting, run `npm test`
4. **Build Third**: After tests pass, run `npm run build`
5. **Verify**: Test MCP functionality with `echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node dist/index.js`

## 🎯 Core Tool: `deep_research`

### Purpose
Expert debugging assistant that transforms vague problems into structured research using comprehensive context collection.

### 🔑 The Template Structure (CRITICAL)
```
BACKGROUND: [Complete context - what were you trying to achieve?]
CURRENT ISSUE: [Exact problem, symptoms, timing]
EVIDENCE: [Error messages, logs, code snippets, versions]
GOAL: [Success criteria, constraints]
QUESTIONS:
1. [Root cause analysis]
2. [Configuration guidance]
3. [Best practices]
4. [Alternative approaches]
5. [Next debugging steps]
```

**This template is the heart of the tool. It forces comprehensive context collection that leads to better research results.**

### Key Parameters
- **`deep_research_question`** (required): Use structured template above
- **`reasoning_effort`**: "high" (default) | "medium" | "low"
- **`team_size`**: 5 (default) | 1-5 (reduce for cost control)
- **`budget_tokens`**: 10000 (default) | adjust for complexity
- **`boost_hostnames`**: Prioritize domains like `["stackoverflow.com", "docs.microsoft.com"]`

## 📁 Project Structure

```
src/
├── index.ts                 # Main MCP server entry point
├── schemas/deepsearch.ts    # Zod validation schemas
├── services/scrape-client.ts # JINA API client
├── tools/research-tool.ts   # Core research logic
├── types/
│   ├── api-types.ts        # JINA API interfaces
│   └── tool-types.ts       # Tool parameter types
└── utils/
    ├── constants.ts        # API configuration
    ├── errors.ts          # Error handling
    └── validators.ts      # Environment validation
```

## 🔧 Key Development Commands

- **Install dependencies**: `npm install`
- **Development mode**: `npm run dev`
- **Run tests**: `npm test`
- **Lint and format**: `npm run check`
- **Auto-fix formatting**: `npm run check:fix`
- **Build production**: `npm run build`
- **Test MCP protocol**: `echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node dist/index.js`

## 🏗 Architecture Principles

### Response Processing (CRITICAL RECENT FIX)
**YOU MUST PRESERVE ORIGINAL FORMATTING**: We recently fixed a critical bug where `sanitizeContent()` was destroying response formatting by replacing all newlines with spaces.

**Current Flow (CORRECT)**:
1. JINA API returns formatted markdown
2. Extract `response.choices?.[0]?.message?.content` directly
3. Return raw content with ALL formatting preserved
4. NO transformation, NO newline destruction

**DO NOT re-introduce any sanitization that modifies whitespace or formatting.**

### Error Handling
- Use `createSimpleError()` for consistent error formatting
- Validate environment variables with `validateEnvVar()`
- Return structured error responses for debugging

### Type Safety
- All functions are fully typed with TypeScript
- Use Zod schemas for runtime validation
- Generate JSON schemas from Zod for MCP protocol

## 📊 Performance Characteristics

- **Startup**: <1 second
- **Memory**: ~40MB RSS
- **Response**: ~1-2 seconds (depends on research complexity)
- **Bundle**: ~220KB optimized
- **Package Size**: 19.1 kB compressed, 75.8 kB unpacked

## 🔍 Troubleshooting Guide

| Issue | Root Cause | Solution |
|-------|------------|----------|
| Missing API key | `JINA_API_KEY` not set | Add to `.env` or environment |
| Tool not found | Build not run | Execute `npm run build` |
| Import errors | TypeScript issues | Check `tsconfig.json` and types |
| MCP protocol errors | Invalid JSON | Validate with MCP inspector |
| Response formatting broken | Sanitization re-introduced | Ensure no content transformation |

## 💡 Best Practices for Usage

1. **Use the template religiously** - Structured input = dramatically better results
2. **Include actual code snippets** - Don't just mention file names
3. **Copy exact error messages** - Every character matters for debugging
4. **Specify versions** - Dependency conflicts are common
5. **Set clear goals** - Define what success looks like
6. **Test with different reasoning_effort levels** - Balance speed vs quality

## 🛑 DO NOT TOUCH

**CRITICAL: Under no circumstances should you modify:**
- `.github/workflows/publish-npm.yml` (auto-publishing)
- `package.json` version field (managed by workflow)
- Any response formatting logic (preserves markdown structure)

## 🚀 Recent Major Updates

- ✅ **Formatting Preservation Fix**: Removed destructive `sanitizeContent()`
- ✅ **Claude Code Integration**: One-line installation support
- ✅ **Multi-Client Support**: Comprehensive installation table
- ✅ **Auto-Publishing**: NPM workflow on every push
- ✅ **Clean Architecture**: Lean 27-file structure

---

**Remember**: This tool transforms debugging from random guessing into systematic problem-solving. The structured template approach is what makes it effective.