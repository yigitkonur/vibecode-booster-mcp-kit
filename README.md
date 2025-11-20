# 🔍 Deep Research MCP

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/yigitkonur/deep-research-bug-fix-mcp/workflows/CI/badge.svg)](https://github.com/yigitkonur/deep-research-bug-fix-mcp/actions)

> **MCP for AI-powered deep research and code validation** 🕵️‍♂️  
> 4 specialized tools: Bug Fixing, Code Planning, Expert Intelligence, and Task Validation

## 🤔 What This Is

An MCP server that provides AI-powered web research through OpenRouter, optimized for coding tasks. Uses structured templates to get better context and comprehensive answers for debugging, architecture planning, and technical research.

**Four Specialized Tools:**
1. **🐛 Bug Fix Research** - Deep-dive debugging with root cause analysis
2. **🏗️ Code Planning** - Library discovery and architecture recommendations  
3. **🧠 Expert Intelligence** - Comprehensive research on any topic
4. **✅ Task Completion Validator** - Carmack-grade code validation before shipping

Powered by **OpenRouter** with support for models like:
- `x-ai/grok-4.1-fast` (recommended - with web search)
- `perplexity/sonar-pro` 
- Any OpenRouter model supporting `search_parameters`

## 🚀 Installation

### Claude Code (Recommended)

```bash
claude mcp add deep-research --scope user --env OPENROUTER_API_KEY=sk-or-v1-your-api-key -- npx -y deep-research-bug-fix-mcp
```

### Windsurf (Full Example)

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "deep-research": {
      "command": "node",
      "args": ["/absolute/path/to/deep-research-bug-fix-mcp/dist/index.js"],
      "disabled": false,
      "env": {
        "OPENROUTER_API_KEY": "sk-or-v1-your-api-key",
        "OPENROUTER_BASE_URL": "https://openrouter.ai/api/v1",
        "RESEARCH_MODEL": "x-ai/grok-4.1-fast",
        "API_TIMEOUT_MS": "1800000",
        "DEFAULT_REASONING_EFFORT": "high",
        "DEFAULT_MAX_URLS": "30"
      }
    }
  }
}
```

### Other MCP Clients

**Cline** (`~/.cline_mcp_settings.json`):
```json
{
  "mcpServers": {
    "deep-research": {
      "command": "npx",
      "args": ["-y", "deep-research-bug-fix-mcp"],
      "env": {
        "OPENROUTER_API_KEY": "sk-or-v1-your-api-key",
        "RESEARCH_MODEL": "x-ai/grok-4.1-fast"
      }
    }
  }
}
```

**Cursor** (`~/.cursor/mcp.json`): Same JSON as Cline

### Local Development

```bash
git clone https://github.com/yigitkonur/deep-research-bug-fix-mcp.git
cd deep-research-bug-fix-mcp
npm install
npm run build
echo "OPENROUTER_API_KEY=sk-or-v1-your-api-key" > .env
node dist/index.js
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

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | **Required** - Your OpenRouter API key | - |
| `RESEARCH_MODEL` | Model to use for research | `x-ai/grok-4.1-fast` |
| `OPENROUTER_BASE_URL` | OpenRouter API base URL | `https://openrouter.ai/api/v1` |
| `API_TIMEOUT_MS` | Request timeout (30min for deep research) | `1800000` |
| `DEFAULT_REASONING_EFFORT` | Reasoning depth: low/medium/high | `high` |
| `DEFAULT_MAX_URLS` | Max web sources (capped at 30 for Grok) | `100` |
| `MCP_DEBUG` | Enable debug logging | `false` |

### Tool Parameters

**Required:**
- `deep_research_question` - Structured problem description

**Optional:**
- `file_attachments` - Array of files to include for context
  - `path` - File path (absolute or relative)
  - `start_line` - Optional line range start
  - `end_line` - Optional line range end  
  - `description` - What to focus on in this file

### Supported Models

Any OpenRouter model with `search_parameters` support:
- ✅ `x-ai/grok-4.1-fast` - Fast reasoning + web search (30 sources max)
- ✅ `perplexity/sonar-pro` - Optimized for research
- ⚠️ Other models may not support web search features

## 📎 File Attachments

Attach one or more files to provide code context for your research question. Files are read from disk and included with full content, line numbers, and syntax highlighting.

### Usage Patterns

**Single File:**
```typescript
file_attachments: [{
  path: "src/services/payment.ts",
  description: "Payment service with suspected memory leak"
}]
```

**Multiple Files with Line Ranges:**
```typescript
file_attachments: [
  {
    path: "src/components/DataTable.tsx",
    start_line: 45,
    end_line: 120,
    description: "Component lifecycle methods causing the issue"
  },
  {
    path: "package.json",
    description: "Dependencies for version checking"
  }
]
```

### Features
- Automatic language detection and syntax highlighting
- Smart truncation for large files (>600 lines)
- Line numbers for easy reference
- Graceful handling of missing files
- Files appended as formatted markdown sections

### Best Practices
- Attach only relevant files to avoid token waste
- Use line ranges to focus on specific problem areas
- Include configuration files (package.json, tsconfig.json) when relevant
- Add descriptions to guide the AI's attention
- Order files by importance (most relevant first)

### Example with File Attachment

```typescript
deep_research({
  deep_research_question: `
  BACKGROUND: React app with performance issues in data table component
  CURRENT ISSUE: Memory leak causing browser to slow down after 5 minutes
  EVIDENCE: Chrome DevTools shows increasing heap size
  GOAL: Identify and fix memory leak
  QUESTIONS:
  1. What's causing the memory leak?
  2. Which lifecycle hooks need cleanup?
  3. Are there closure issues?
  `,
  file_attachments: [
    {
      path: "src/components/DataTable.tsx",
      start_line: 1,
      end_line: 200,
      description: "Main component with suspected leak"
    },
    {
      path: "src/hooks/useDataFetch.ts",
      description: "Custom hook managing data fetching"
    }
  ]
})
```

## 🔄 How It Works

```
Problem → Structured Template → OpenRouter Web Search → AI Analysis → Detailed Solution
```

**The template structure ensures:**
1. Complete context for accurate research
2. Specific problem definition
3. All relevant technical details included
4. Clear success criteria

**OpenRouter handles:**
- Real-time web search across 30+ sources
- Citation tracking and verification
- Deep reasoning with extended context

## 🛠️ Development

```bash
git clone https://github.com/yigitkonur/deep-research-bug-fix-mcp.git
cd deep-research-bug-fix-mcp
npm install
npm run build     # Build TypeScript → dist/
npm run dev       # Watch mode
npm run lint      # Check code quality
npm run format    # Format with Biome
```

### Testing

```bash
# Test initialization
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | node dist/index.js

# List available tools
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' | node dist/index.js

# Test a research query
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"deepresearch_bugfix","arguments":{"deep_research_question":"Test question"}}}' | node dist/index.js
```

## 📝 License

MIT © [Yiğit Konur](https://github.com/yigitkonur)

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 🔗 Links

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [MCP Protocol Spec](https://modelcontextprotocol.io/)
- [Report Issues](https://github.com/yigitkonur/deep-research-bug-fix-mcp/issues)