# Claude Code Guide: Deep Research Bug Fix MCP

Production-ready debugging companion for Claude Code developers.

## 🎯 Quick Setup

### Install & Configure

```bash
# Install
npm install && npm run build

# Configure API key
cp .env.example .env
echo "JINA_API_KEY=your_api_key" >> .env
```

### Claude Code Integration

Add to `.mcp.json`:

```json
{
  "mcpServers": {
    "deep-research": {
      "command": "node",
      "args": ["/absolute/path/to/deep-research-bug-fix-mcp/dist/index.js"],
      "env": {
        "JINA_API_KEY": "your_api_key"
      }
    }
  }
}
```

## 🛠 Tool: `deep_research`

### Purpose
Expert debugging assistant that transforms vague problems into structured research using comprehensive context collection.

### Core Parameter
- **`deep_research_question`** (required): Use the structured template for best results

### Template Structure
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

### Control Parameters
- **`reasoning_effort`**: "high" (default) | "medium" | "low"
- **`team_size`**: 5 (default) | 1-5 (reduce for cost control)
- **`budget_tokens`**: 10000 (default) | adjust for complexity
- **`boost_hostnames`**: ["stackoverflow.com", "docs.microsoft.com"] (optional)

## 🔧 Usage Examples

### TypeScript Build Error
```typescript
deep_research_question: `
BACKGROUND: React TypeScript project failing after dependency update.
CURRENT ISSUE: "Property 'replaceAll' does not exist on type 'string'"
EVIDENCE: TS 4.9.5, target: ES2020, Node 18.17.0
GOAL: Fix build for deployment
QUESTIONS:
1. Why isn't replaceAll recognized?
2. How to configure TS for string methods?
3. Best practices for compatibility?
`
```

### Performance Issue
```typescript
deep_research_question: `
BACKGROUND: React app slow on mobile, fast on desktop.
CURRENT ISSUE: Mobile Lighthouse 67/100, LCP 4.2s
EVIDENCE: Bundle 234KB gzipped, React Router 45KB
GOAL: Mobile score >90, <2s load time
QUESTIONS:
1. Mobile vs desktop performance gaps?
2. Bundle optimization strategies?
3. Mobile-specific debugging tools?
`
```

## 🚀 Development Commands

```bash
npm run dev       # Development mode
npm test          # Run tests
npm run check     # Lint and format
npm run build     # Production build
```

## 📊 Performance

- **Startup**: <1 second
- **Memory**: ~40MB RSS
- **Response**: ~1-2 seconds
- **Bundle**: 220KB optimized

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| Missing API key | Add `JINA_API_KEY` to `.env` |
| Tool not found | Run `npm run build` |
| Build errors | Check TypeScript configuration |

## 💡 Best Practices

1. **Use the template** - Structured input = better results
2. **Include code snippets** - Don't just mention file names
3. **Add error messages** - Copy exact error text
4. **Specify versions** - Include relevant version numbers
5. **Set clear goals** - Define what success looks like

---

*This tool transforms debugging from guessing to systematic problem-solving.*