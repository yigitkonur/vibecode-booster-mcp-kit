/**
 * Client exports
 */

export { ScraperClient, type ScrapeRequest, type ScrapeResponse, type BatchScrapeResult } from './scraper.js';
export { SearchClient, type SearchResult, type KeywordSearchResult, type MultipleSearchResponse, type RedditSearchResult } from './search.js';
export { RedditClient, calculateCommentAllocation, type Post, type Comment, type PostResult, type BatchPostResult, type CommentAllocation } from './reddit.js';
export { ResearchClient, type ResearchParams, type ResearchResponse } from './research.js';
