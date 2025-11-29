/**
 * URL Aggregator Utility
 * Aggregates search results across multiple queries, calculates CTR-weighted scores,
 * and generates consensus-based rankings.
 */

import { CTR_WEIGHTS } from '../config/index.js';
import type { KeywordSearchResult } from '../clients/search.js';

/**
 * Aggregated URL data structure
 */
interface AggregatedUrl {
  url: string;
  title: string;
  snippet: string;
  frequency: number;
  positions: number[];
  queries: string[];
  bestPosition: number;
  totalScore: number;
}

/**
 * Ranked URL with normalized score
 */
export interface RankedUrl {
  url: string;
  title: string;
  snippet: string;
  rank: number;
  score: number;
  frequency: number;
  positions: number[];
  queries: string[];
  bestPosition: number;
  isConsensus: boolean;
}

/**
 * Aggregation result containing all processed data
 */
interface AggregationResult {
  rankedUrls: RankedUrl[];
  totalUniqueUrls: number;
  totalQueries: number;
  frequencyThreshold: number;
  thresholdNote?: string;
}

/**
 * Get CTR weight for a position (1-10)
 * Positions beyond 10 get minimal weight
 */
function getCtrWeight(position: number): number {
  if (position >= 1 && position <= 10) {
    return CTR_WEIGHTS[position] ?? 0;
  }
  // Positions beyond 10 get diminishing returns
  return Math.max(0, 10 - (position - 10) * 0.5);
}

/**
 * Aggregate results from multiple searches
 * Flattens all results, deduplicates by URL, and tracks frequency/positions
 */
function aggregateResults(searches: KeywordSearchResult[]): Map<string, AggregatedUrl> {
  const urlMap = new Map<string, AggregatedUrl>();

  for (const search of searches) {
    for (const result of search.results) {
      const normalizedUrl = normalizeUrl(result.link);
      const existing = urlMap.get(normalizedUrl);

      if (existing) {
        existing.frequency += 1;
        existing.positions.push(result.position);
        existing.queries.push(search.keyword);
        existing.bestPosition = Math.min(existing.bestPosition, result.position);
        existing.totalScore += getCtrWeight(result.position);
        // Keep best title/snippet (from highest position)
        if (result.position < existing.positions[0]) {
          existing.title = result.title;
          existing.snippet = result.snippet;
        }
      } else {
        urlMap.set(normalizedUrl, {
          url: result.link,
          title: result.title,
          snippet: result.snippet,
          frequency: 1,
          positions: [result.position],
          queries: [search.keyword],
          bestPosition: result.position,
          totalScore: getCtrWeight(result.position),
        });
      }
    }
  }

  return urlMap;
}

/**
 * Normalize URL for deduplication
 * Removes trailing slashes, www prefix, and normalizes protocol
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    let host = parsed.hostname.replace(/^www\./, '');
    let path = parsed.pathname.replace(/\/$/, '') || '/';
    return `${host}${path}${parsed.search}`.toLowerCase();
  } catch {
    return url.toLowerCase().replace(/\/$/, '');
  }
}

/**
 * Filter URLs by minimum frequency
 * Returns URLs appearing in at least minFrequency searches
 */
function filterByFrequency(
  urlMap: Map<string, AggregatedUrl>,
  minFrequency: number
): AggregatedUrl[] {
  const filtered: AggregatedUrl[] = [];
  
  for (const url of urlMap.values()) {
    if (url.frequency >= minFrequency) {
      filtered.push(url);
    }
  }

  return filtered;
}

/**
 * Calculate weighted scores and normalize to 100.0
 * Returns sorted array with rank assignments
 */
function calculateWeightedScores(urls: AggregatedUrl[]): RankedUrl[] {
  if (urls.length === 0) return [];

  // Sort by total score descending
  const sorted = [...urls].sort((a, b) => b.totalScore - a.totalScore);

  // Find max score for normalization
  const maxScore = sorted[0].totalScore;

  // Map to ranked URLs with normalized scores
  return sorted.map((url, index) => ({
    url: url.url,
    title: url.title,
    snippet: url.snippet,
    rank: index + 1,
    score: maxScore > 0 ? (url.totalScore / maxScore) * 100 : 0,
    frequency: url.frequency,
    positions: url.positions,
    queries: url.queries,
    bestPosition: url.bestPosition,
    isConsensus: url.frequency >= 3,
  }));
}

/**
 * Mark consensus status for a URL
 * Returns "✓" if frequency >= 3, else "✗"
 */
export function markConsensus(frequency: number): string {
  return frequency >= 3 ? '✓' : '✗';
}

/**
 * Generate justification for why a URL is ranked at its position
 */
function generateJustification(url: RankedUrl, rank: number): string {
  const parts: string[] = [];
  
  if (url.frequency >= 4) {
    parts.push(`Appeared in ${url.frequency} different searches showing strong cross-query relevance`);
  } else if (url.frequency >= 3) {
    parts.push(`Found across ${url.frequency} searches indicating solid topical coverage`);
  } else {
    parts.push(`Appeared in ${url.frequency} search${url.frequency > 1 ? 'es' : ''}`);
  }
  
  if (url.bestPosition === 1) {
    parts.push('ranked #1 in at least one search');
  } else if (url.bestPosition <= 3) {
    parts.push(`best position was top-3 (#${url.bestPosition})`);
  }
  
  return parts.join(', ') + '.';
}

/**
 * Generate enhanced narrative output for consensus URLs
 */
export function generateEnhancedOutput(
  rankedUrls: RankedUrl[],
  allKeywords: string[],
  totalUniqueUrls: number,
  frequencyThreshold: number,
  thresholdNote?: string
): string {
  const lines: string[] = [];
  
  // Header
  lines.push(`## The Perfect Search Results (Aggregated from ${allKeywords.length} Queries)`);
  lines.push('');
  lines.push(`Based on ${allKeywords.length} distinct searches, we identified **${rankedUrls.length} high-consensus resources**. Here's what the data reveals:`);
  lines.push('');
  
  if (thresholdNote) {
    lines.push(`> ${thresholdNote}`);
    lines.push('');
  }
  
  // Top Consensus Resources
  lines.push('### 🥇 Top Consensus Resources');
  lines.push('');
  
  for (const url of rankedUrls.slice(0, 20)) {
    const highConsensus = url.frequency >= 4 ? ' ⭐ HIGHEST CONSENSUS' : '';
    lines.push(`#### #${url.rank}: ${url.title} (Score: ${url.score.toFixed(1)})${highConsensus}`);
    
    // Appeared in queries
    const queriesList = url.queries.map(q => `"${q}"`).join(', ');
    lines.push(`- **Appeared in:** ${url.frequency} queries (${queriesList})`);
    
    // Best ranking
    lines.push(`- **Best ranking:** Position ${url.bestPosition}`);
    
    // Description (truncated snippet)
    const description = url.snippet.length > 200 
      ? url.snippet.substring(0, 197) + '...' 
      : url.snippet;
    lines.push(`- **Description:** ${description}`);
    
    // Justification
    lines.push(`- **Why it's #${url.rank}:** ${generateJustification(url, url.rank)}`);
    
    // URL
    lines.push(`- **URL:** ${url.url}`);
    lines.push('');
  }
  
  // Metadata section
  lines.push('---');
  lines.push('');
  lines.push('### 📈 Metadata');
  lines.push('');
  lines.push(`- **Total Queries:** ${allKeywords.length} (${allKeywords.join(', ')})`);
  
  // Sort all URLs by frequency for the unique URLs list
  const sortedByFreq = [...rankedUrls].sort((a, b) => b.frequency - a.frequency);
  const urlFreqList = sortedByFreq
    .slice(0, 30)
    .map(u => {
      const shortUrl = u.url.length > 40 ? u.url.substring(0, 37) + '...' : u.url;
      return `${shortUrl} (${u.frequency}x)`;
    })
    .join(', ');
  
  lines.push(`- **Unique URLs Found:** ${totalUniqueUrls} — top by frequency: ${urlFreqList}`);
  lines.push(`- **Consensus Threshold:** ≥${frequencyThreshold} appearances`);
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Full aggregation pipeline with fallback thresholds
 * Tries ≥3, falls back to ≥2, then ≥1 if needed
 */
export function aggregateAndRank(
  searches: KeywordSearchResult[],
  minConsensusUrls: number = 5
): AggregationResult {
  const urlMap = aggregateResults(searches);
  const totalUniqueUrls = urlMap.size;
  const totalQueries = searches.length;

  // Try thresholds in order: 3, 2, 1
  const thresholds = [3, 2, 1];
  let rankedUrls: RankedUrl[] = [];
  let usedThreshold = 3;
  let thresholdNote: string | undefined;

  for (const threshold of thresholds) {
    const filtered = filterByFrequency(urlMap, threshold);
    rankedUrls = calculateWeightedScores(filtered);

    if (rankedUrls.length >= minConsensusUrls || threshold === 1) {
      usedThreshold = threshold;
      if (threshold < 3) {
        thresholdNote = `Note: Frequency filter lowered to ≥${threshold} due to result diversity.`;
      }
      break;
    }
  }

  return {
    rankedUrls,
    totalUniqueUrls,
    totalQueries,
    frequencyThreshold: usedThreshold,
    thresholdNote,
  };
}

/**
 * Build URL lookup map for quick consensus checking during result formatting
 */
export function buildUrlLookup(rankedUrls: RankedUrl[]): Map<string, RankedUrl> {
  const lookup = new Map<string, RankedUrl>();
  
  for (const url of rankedUrls) {
    const normalized = normalizeUrl(url.url);
    lookup.set(normalized, url);
    // Also store original URL
    lookup.set(url.url.toLowerCase(), url);
  }

  return lookup;
}

/**
 * Look up a URL in the ranked results
 */
export function lookupUrl(url: string, lookup: Map<string, RankedUrl>): RankedUrl | undefined {
  const normalized = normalizeUrl(url);
  return lookup.get(normalized) || lookup.get(url.toLowerCase());
}
