# 🔍 Deep Research MCP

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/yigitkonur/deep-research-bug-fix-mcp/workflows/CI/badge.svg)](https://github.com/yigitkonur/deep-research-bug-fix-mcp/actions)

> **MCP for AI-powered deep research and code validation** 🕵️‍♂️  
> 4 specialized tools: Bug Fixing, Code Planning, Expert Intelligence, and Task Validation

## 🤔 What This Is

An MCP server that provides AI-powered web research through OpenRouter, optimized for coding tasks. Uses structured templates to get better context and comprehensive answers for debugging, architecture planning, technical research, and production-ready code validation.

**Four Specialized Tools:**
1. **🐛 Bug Fix Research** - Deep-dive debugging with root cause analysis across Stack Overflow, GitHub issues, and official docs
2. **🏗️ Code Planning** - Library discovery and architecture recommendations from battle-tested solutions  
3. **🧠 Expert Intelligence** - Comprehensive multi-perspective research on any topic (technical or non-technical)
4. **✅ Task Completion Validator** - Carmack-grade forensic code validation with 3-attempt retry logic and comprehensive analysis

**Key Features:**
- 🔄 **Intelligent Retry Logic** - Task validator automatically retries up to 3 times if JSON parsing fails, falling back to raw markdown on final failure
- 📋 **Enhanced Input Schemas** - 100x more detailed parameter descriptions with examples and validation criteria
- 🎯 **Production-Ready Validation** - Mars Rover standards enforcement: error handling, logging, DRY/SOLID compliance
- 🔍 **Forensic Code Analysis** - Reads actual files from disk, verifies execution proofs, detects deception patterns
- 📊 **Trust Scoring** - Honesty metric comparing claimed vs actual completion with fraud detection

Powered by **OpenRouter** with support for models like:
- `x-ai/grok-4.1-fast` (recommended - with web search)
- `google/gemini-2.0-flash` (recommended for task validation)
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

## ✅ Task Completion Validator

The **Carmack-Grade Task Completion Validator** performs forensic code analysis before production deployment, enforcing John Carmack's Mars Rover standards where remote fixes are impossible.

### What It Validates

**Code Quality (Carmack's Commandments):**
- ✅ **Error Handling is GOD**: Every I/O operation has try-catch with recovery
- ✅ **Observability is Salvation**: Critical decisions logged with full context
- ✅ **DRY is Divine Law**: <5% code duplication allowed
- ✅ **SOLID is Scripture**: Single responsibility, proper abstractions maintained
- ✅ **Honesty is Mandatory**: Claimed completion matches actual implementation

**Validation Process:**
1. Reads actual files from disk (no fake file claims)
2. Scans for stub functions, TODOs, missing error handling
3. Verifies execution proofs against claimed working features
4. Calculates actual completion % from implementation
5. Compares claimed vs actual to generate trust_score (0.0-1.0)
6. Detects deception patterns and fraud indicators
7. Provides complete fixes (500+ char code solutions)

### Intelligent Retry System

**3-Attempt Retry Logic:**
- Attempt 1: Initial validation with helpful guidance
- Attempt 2: Retry if JSON parsing fails or schema mismatch
- Attempt 3: Final attempt with stern warnings
- Fallback: Returns raw markdown if all 3 attempts fail (graceful degradation)

### Required Parameters

```typescript
{
  original_request: "Complete PRD-format requirements (hierarchical, with MUST/SHOULD/COULD priorities)",
  claimed_percentage: 85, // Your honest assessment (0-100)
  completion_claim: "Detailed evidence: what's implemented, tested, working vs broken",
  working_features: ["Login with JWT", "Logout with session cleanup"] // Only list fully working features
}
```

### Optional But Recommended

```typescript
{
  non_working_features: ["Password reset", "Email verification"], // Honesty improves trust_score
  full_file_content_files: [
    { path: "src/auth.ts", description: "Authentication logic" },
    { path: "tests/auth.test.ts", description: "Unit tests" }
  ],
  execution_proof: "$ npm test\n✓ All tests passed\n$ curl /api/login\n{token: 'eyJ...'}",
  error_logs: "2024-11-20 ERROR: Connection timeout at db.ts:45", // Transparency valued
  attempt_number: 1 // Increment on resubmission
}
```

### Output Structure

**Core Verdict:**
- `ship_it`: boolean (true = production ready, false = needs work)
- `severity`: COMPLETE | MINOR_INCOMPLETE | MODERATE_INCOMPLETE | MAJOR_INCOMPLETE | CRITICAL_INCOMPLETE | FRAUD_DETECTED
- `actual_percentage`: Calculated from code analysis (0-100)
- `trust_score`: Honesty metric (1.0=perfect, 0.0=fraud)

**Detailed Analysis:**
- `critical_issues`: Blocking problems with complete 500+ char fixes
- `working_features_validated`: Claimed vs actually working with false claims identified
- `code_quality_analysis`: Error handling, logging, DRY/SOLID assessment  
- `next_priority_fix`: #1 most critical issue with ready-to-paste solution
- `detailed_report`: 1000+ char comprehensive narrative

**Carmack Metrics:**
- `error_handling_score`: % of I/O operations with proper error handling (0-100)
- `logging_score`: % of critical points with logging (0-100)
- `dry_compliance`: boolean (code duplication check)
- `solid_compliance`: boolean (architecture principles check)

### Example Usage

```typescript
validate_task_completion({
  original_request: `
    1. User Authentication System
       1.1 Login with email/password (MUST have: validation, hashing, sessions, rate limiting)
       1.2 Logout (MUST have: session cleanup, token invalidation)
       1.3 Password reset (SHOULD have: email verification, token expiry)
    2. Dashboard
       2.1 Display user statistics (MUST have: real-time data, error states)
  `,
  claimed_percentage: 80,
  completion_claim: `
    Implemented login (auth.ts:45-120) with bcrypt hashing and JWT generation.
    Tested successfully - see execution_proof.
    Logout works (auth.ts:125-145) with session cleanup.
    Password reset partially done - email works but token expiry missing.
    Dashboard displays stats but no error handling yet.
  `,
  working_features: [
    "Login with email validation and JWT",
    "Logout with session invalidation"
  ],
  non_working_features: [
    "Password reset token expiry",
    "Dashboard error handling"
  ],
  full_file_content_files: [
    { path: "src/auth.ts", description: "Core authentication" },
    { path: "src/dashboard.ts", description: "Dashboard component" }
  ],
  execution_proof: `
    $ npm test
    ✓ Login test passed (auth generates JWT)
    ✓ Logout test passed (session cleared)
    ✗ Password reset test failed (token doesn't expire)
    
    $ curl -X POST /api/login
    {"status": 200, "token": "eyJhbGc..."}
  `,
  error_logs: `
    2024-11-20 10:30:15 ERROR: Unhandled promise rejection
      at dashboard.ts:67
      TypeError: Cannot read property 'stats' of undefined
  `
})
```

### Trust Score Calculation

```
Start at 1.0
If claimed > actual by:
  >30% → ×0.2 (severe dishonesty)
  20-30% → ×0.4 (major exaggeration)  
  10-20% → ×0.6 (significant exaggeration)
  5-10% → ×0.8 (minor exaggeration)

Additional penalties:
- Stub functions in working_features: ×0.5
- Unhandled errors while claiming working: ×0.6
- Missing error handling: ×0.5
- False test claims: ×0.7

Score interpretation:
≥0.8 = Honest professional
0.6-0.8 = Minor exaggeration
0.4-0.6 = Significant honesty issues
<0.4 = Deceptive or incompetent
```

### Deception Detection

The validator identifies these red flags:
- `FAKE_FILES`: Non-existent files listed
- `STUB_CODE`: NotImplementedError/pass functions in "working" features
- `FALSE_WORKING_CLAIMS`: Features claimed as working but execution shows failures
- `NO_ERROR_HANDLING`: I/O operations without try-catch
- `INFLATED_NUMBERS`: >20% discrepancy between claimed and actual
- `EXECUTION_CONTRADICTS_CLAIMS`: Proof shows failures for claimed working features

### Mars Rover Test

**The Core Question:** "Would this code survive on Mars where remote fixes are impossible?"

If NO → `ship_it: false` with specific fixes required

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