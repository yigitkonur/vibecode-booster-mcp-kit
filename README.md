# Reddit Enhanced MCP

MCP server for Reddit research, web search with CTR-weighted aggregation, deep research, and web scraping.

> Need to know what devs actually think? Search Reddit, grab the top posts, read the highest-voted comments. Or run batch web searches with consensus URL ranking. All in one MCP server.

## Features

- **`search_reddit`** - Search Reddit via Google (Serper API). Returns 10 results per query with publication date.
- **`get_reddit_post`** - Fetch full posts with threaded comments via Reddit OAuth API. Comments sorted by score.
- **`web_search`** - Batch web search (up to 100 keywords) with **CTR-weighted aggregation** and consensus URL ranking.
- **`scrape_links`** - Extract content from URLs with automatic fallback (basic → JS rendering → geo-targeting).
- **`deep_research`** - Deep research via OpenRouter API with multi-perspective analysis.

## Quick Start

### 1. Get API Keys

**Serper API:**
1. Sign up at [serper.dev](https://serper.dev)
2. Get your API key from dashboard

**Reddit App:**
1. Go to [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Click "create another app..." → Select "script" type
3. Copy the client_id (under app name) and client_secret

### 2. Install

```bash
git clone https://github.com/yigitkonur/reddit-enhanced-mcp.git
cd reddit-enhanced-mcp
npm install
npm run build
```

### 3. Configure MCP Client

**For Windsurf / Cursor / Claude Desktop:**

Add to your MCP config (`~/.cursor/mcp.json` or similar):

```json
{
  "mcpServers": {
    "reddit": {
      "command": "node",
      "args": ["/absolute/path/to/reddit-enhanced-mcp/dist/index.js"],
      "env": {
        "SERPER_API_KEY": "your-serper-key",
        "REDDIT_CLIENT_ID": "your-reddit-client-id",
        "REDDIT_CLIENT_SECRET": "your-reddit-secret"
      }
    }
  }
}
```

## Testing

### Test with MCP Inspector

```bash
# Set your keys
export SERPER_API_KEY="your-key"
export REDDIT_CLIENT_ID="your-id"
export REDDIT_CLIENT_SECRET="your-secret"

# List tools
npx @modelcontextprotocol/inspector --cli node dist/index.js --method tools/list

# Test search
npx @modelcontextprotocol/inspector --cli node dist/index.js \
  --method tools/call \
  --tool-name search_reddit \
  --tool-arg 'queries=["cursor vs windsurf"]'

# Test post fetch
npx @modelcontextprotocol/inspector --cli node dist/index.js \
  --method tools/call \
  --tool-name get_reddit_post \
  --tool-arg 'urls=["https://www.reddit.com/r/ChatGPTCoding/comments/1htlx48/"]'
```

## Tool Parameters

### `search_reddit`
| Parameter | Type | Description |
|-----------|------|-------------|
| `queries` | `string[]` | Search queries (max 10, parallel) |
| `date_after` | `string?` | Filter: only results after YYYY-MM-DD |

### `get_reddit_post`
| Parameter | Type | Description |
|-----------|------|-------------|
| `urls` | `string[]` | Reddit post URLs (2-50, batched in groups of 10) |
| `fetch_comments` | `boolean?` | Fetch comments? Set false for post-only queries. Default: true |
| `max_comments` | `number?` | Override auto-allocation. Leave empty for smart allocation |

**Smart Comment Allocation:**
- Total budget: 1,000 comments distributed across all posts
- 2 posts: ~500 comments/post (deep dive, capped at 200)
- 10 posts: 100 comments/post
- 50 posts: 20 comments/post (quick scan)
- Automatic batching: 10 concurrent requests max

### `scrape_links`
| Parameter | Type | Description |
|-----------|------|-------------|
| `urls` | `string[]` | URLs to scrape (3-50, batched in groups of 30) |
| `use_llm` | `boolean?` | Enable AI extraction. Default: true |
| `what_to_extract` | `string?` | AI extraction instructions |

**Dynamic Token Allocation:**
- Total budget: 32,000 tokens distributed across all URLs
- 3 URLs: ~10,666 tokens/URL (deep extraction)
- 10 URLs: 3,200 tokens/URL (detailed)
- 50 URLs: 640 tokens/URL (high-level scan)
- Automatic batching: 30 concurrent requests max

### `web_search`
| Parameter | Type | Description |
|-----------|------|-------------|
| `keywords` | `string[]` | Search keywords (5-100, parallel) |

**Aggregation Features:**
- URLs appearing in multiple searches are ranked by CTR-weighted score
- Position 1 = 100 points, Position 10 = 12.56 points
- Consensus URLs (≥3 searches) marked with ✓
- Fallback: if <5 consensus URLs, threshold lowers to ≥2, then ≥1

## Output Examples

**Search Reddit:**
```
## 🔍 "cursor vs windsurf"

**1. Cursor vs. Windsurf: Real-World Experience** • 📅 5 months ago
https://reddit.com/r/ChatGPTCoding/comments/...
> I've tried both and found the results are quite similar...
```

**Web Search (Aggregated):**
```
## The Perfect Search Results (Aggregated from 10 Queries)

Based on 10 distinct searches, we identified **8 high-consensus resources**.

> Note: Frequency filter lowered to ≥2 due to result diversity.

### 🥇 Top Consensus Resources

#### #1: The 5 Most Popular Node.js Frameworks (Score: 100.0) ⭐ HIGHEST CONSENSUS
- **Appeared in:** 4 queries ("top node.js frameworks", "nodejs benchmark", ...)
- **Best ranking:** Position 2
- **Description:** Details · Express.js: The Proven Champion · Nest.js...
- **Why it's #1:** Appeared in 4 searches showing strong cross-query relevance.
- **URL:** https://dev.to/leapcell/...

#### #2: What NodeJS framework do you use? (Score: 98.9)
- **Appeared in:** 2 queries ("top frameworks", "modern nodejs")
- **Best ranking:** Position 1
...

---

### 📈 Metadata

- **Total Queries:** 10 (keyword1, keyword2, keyword3, ...)
- **Unique URLs Found:** 86 — top by frequency: url1 (4x), url2 (3x), ...
- **Consensus Threshold:** ≥2 appearances
```

**Post:**
```
## Cursor vs. Windsurf: Real-World Experience

**r/ChatGPTCoding** • u/furkangulsen • ⬆️ 168 • 💬 122 comments

### Top Comments (20/122 shown, sorted by score)

- **u/moosepiss** _(+83)_
  I keep bouncing back and forth...

  - **u/furkangulsen** **[OP]** _(+7)_
    Totally agree with your points...
```

## License

MIT
