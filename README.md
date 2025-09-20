# JINA DeepSearch MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AI-powered web research MCP server using JINA DeepSearch API.

## Quick Start

```bash
# Setup
npm install
cp .env.example .env
echo "JINA_API_KEY=your_jina_api_key" >> .env

# Build and test
npm run build
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node dist/index.js
```

## Claude Code Integration

Add to `.mcp.json`:

```json
{
  "mcpServers": {
    "jina-deepsearch": {
      "command": "node",
      "args": ["/path/to/jina-deepsearch-mcp/dist/index.js"],
      "env": {
        "JINA_API_KEY": "your_jina_api_key"
      }
    }
  }
}
```

## Tool: deepsearch.research

Research any topic with AI-powered web search and get comprehensive, cited results.

**Parameters:**
- `query` (required): Research question
- `reasoning_effort`: "low" | "medium" | "high" (default: medium)
- `team_size`: Number of parallel agents (default: 1)
- `budget_tokens`: Token limit for cost control
- `good_domains` / `bad_domains` / `only_domains`: Domain filtering
- `search_query_language` / `answer_and_think_language`: Language control (ISO 639-1)

**Example:**
```bash
echo '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "deepsearch.research",
    "arguments": {
      "query": "latest AI developments 2024",
      "reasoning_effort": "medium",
      "good_domains": ["arxiv.org", "nature.com"]
    }
  }
}' | node dist/index.js
```

## Features

- Multi-language support
- Domain filtering controls
- Quality vs speed settings
- Token budget management
- Real-time progress logging
- Comprehensive source citations

## Development

```bash
npm run dev     # Development mode
npm test        # Run tests
npm run check   # Lint and format
```

## License

MIT License - see [LICENSE](LICENSE) file.

## Author

Yiğit Konur - [@yigitkonur](https://github.com/yigitkonur)