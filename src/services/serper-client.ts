import { parseEnvironmentVariables } from '../utils/env-config';

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
  position: number;
}

export interface KeywordSearchResult {
  keyword: string;
  results: SearchResult[];
  totalResults: number;
  related: string[];
}

export interface MultipleSearchResponse {
  searches: KeywordSearchResult[];
  totalKeywords: number;
  executionTime: number;
}

export class SerperClient {
  private apiKey: string;
  private baseURL = 'https://google.serper.dev';

  constructor(apiKey?: string) {
    const env = parseEnvironmentVariables();
    this.apiKey = apiKey || env.SERPER_API_KEY || '';

    if (!this.apiKey) {
      throw new Error('SERPER_API_KEY is required for search functionality');
    }
  }

  async searchMultiple(keywords: string[]): Promise<MultipleSearchResponse> {
    const startTime = Date.now();

    try {
      const searchQueries = keywords.map(keyword => ({ q: keyword }));

      const response = await fetch(`${this.baseURL}/search`, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchQueries),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`SERPER API error: ${response.status} ${errorText}`);
      }

      const data = await response.json() as any;
      const responses = Array.isArray(data) ? data : [data];

      const searches: KeywordSearchResult[] = responses.map((resp: any, index: number) => {
        const results: SearchResult[] = (resp.organic || []).map((item: any, idx: number) => ({
          title: item.title || 'No title',
          link: item.link || '#',
          snippet: item.snippet || '',
          date: item.date,
          position: item.position || idx + 1,
        }));

        const totalResults = resp.searchInformation?.totalResults
          ? parseInt(String(resp.searchInformation.totalResults).replace(/,/g, ''), 10)
          : results.length;

        const related = (resp.relatedSearches || []).map((r: any) => r.query || '');

        return {
          keyword: keywords[index] || '',
          results,
          totalResults,
          related,
        };
      });

      return {
        searches,
        totalKeywords: keywords.length,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      throw new Error(`Failed to search: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
