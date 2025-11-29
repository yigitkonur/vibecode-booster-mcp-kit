# Reddit Research MCP

MCP server for Reddit research, web search aggregation, and scraping.

## Tools

| Tool | Description |
|------|-------------|
| `search_reddit` | Search Reddit via Serper (10 results/query, date filtering) |
| `get_reddit_post` | Fetch posts + comments via Reddit OAuth (2-50 URLs, batched) |
| `web_search` | Batch search with CTR-weighted consensus ranking (up to 100 keywords) |
| `scrape_links` | Extract content with JS rendering fallback (3-50 URLs) |
| `deep_research` | Multi-perspective research via OpenRouter |

## Setup

```bash
npm install && npm run build
```

Add to MCP config:

```json
{
  "mcpServers": {
    "reddit": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "SERPER_API_KEY": "...",
        "REDDIT_CLIENT_ID": "...",
        "REDDIT_CLIENT_SECRET": "...",
        "SCRAPEDO_API_KEY": "...",
        "OPENROUTER_API_KEY": "..."
      }
    }
  }
}
```

## API Keys

- **Serper**: [serper.dev](https://serper.dev)
- **Reddit**: [reddit.com/prefs/apps](https://reddit.com/prefs/apps) → "script" type
- **Scrape.do**: [scrape.do](https://scrape.do)
- **OpenRouter**: [openrouter.ai](https://openrouter.ai)

## Test

```bash
npx @modelcontextprotocol/inspector --cli node dist/index.js --method tools/list
```

## License

MIT
