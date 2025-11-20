import type { SearchMultipleParams, SearchMultipleOutput } from '../schemas/search-multiple';
import { SerperClient } from '../services/serper-client';

interface ToolOptions {
  sessionId?: string;
  logger?: (level: 'info' | 'error' | 'debug', message: string, sessionId: string) => Promise<void>;
}

export async function performSearchMultiple(
  params: SearchMultipleParams,
  options: ToolOptions = {}
): Promise<{ content: string; structuredContent: SearchMultipleOutput }> {
  const { sessionId, logger } = options;
  const startTime = Date.now();

  try {
    if (sessionId && logger) {
      await logger('info', `Searching for ${params.keywords.length} keyword(s)`, sessionId);
    }

    const client = new SerperClient();
    const response = await client.searchMultiple(params.keywords);

    // Format results as markdown
    let markdown = `# Search Results for ${response.totalKeywords} Keywords\n\n`;
    markdown += `*You can now select URLs to scrape or refine your keywords based on these results.*\n\n`;

    let totalResults = 0;

    response.searches.forEach((search, index) => {
      markdown += `## Search Results — \`${search.keyword}\`\n\n`;

      search.results.slice(0, 10).forEach((result, resultIndex) => {
        const position = resultIndex + 1;
        markdown += `${position}. **[${result.title}](${result.link})**`;

        if (result.snippet) {
          let snippet = result.snippet;
          if (snippet.length > 200) {
            snippet = snippet.substring(0, 200) + '...';
          }

          if (result.date) {
            markdown += ` — *${result.date}* - ${snippet}\n`;
          } else {
            markdown += ` — ${snippet}\n`;
          }
        } else {
          markdown += '\n';
        }

        totalResults++;
      });

      if (search.related && search.related.length > 0) {
        const relatedSuggestions = search.related
          .slice(0, 8)
          .map((r: string) => `\`${r}\``)
          .join(', ');

        markdown += `\n*Related searches:* ${relatedSuggestions}\n\n`;
      }

      if (index < response.searches.length - 1) {
        markdown += `---\n\n`;
      }
    });

    const executionTime = Date.now() - startTime;

    if (sessionId && logger) {
      await logger('info', `Search completed: ${totalResults} results found in ${executionTime}ms`, sessionId);
    }

    const metadata = {
      total_keywords: response.totalKeywords,
      total_results: totalResults,
      execution_time_ms: executionTime,
    };

    return {
      content: markdown,
      structuredContent: {
        content: markdown,
        metadata,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (sessionId && logger) {
      await logger('error', errorMessage, sessionId);
    }

    const executionTime = Date.now() - startTime;

    const errorContent = `# ❌ Search Failed\n\n${errorMessage}\n\n**Tip:** Make sure SERPER_API_KEY is set in your environment variables.`;

    return {
      content: errorContent,
      structuredContent: {
        content: errorContent,
        metadata: {
          total_keywords: params.keywords.length,
          total_results: 0,
          execution_time_ms: executionTime,
        },
      },
    };
  }
}
