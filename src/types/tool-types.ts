/**
 * Tool parameter interfaces for all scraping tools
 */

/**
 * Base parameters for all scraping operations
 */
export interface BaseScrapeParams {
  url: string;
}

/**
 * Parameters for simple scraping with datacenter proxy
 */
export interface ScrapeSimpleParams extends BaseScrapeParams {
  follow_redirects?: boolean;
}

/**
 * Parameters for premium scraping with residential proxy
 */
export interface ScrapePremiumParams extends BaseScrapeParams {
  country?: string;
}

/**
 * Parameters for JavaScript-enabled scraping
 */
export interface ScrapeJavascriptParams extends BaseScrapeParams {
  wait_ms?: number;
  wait_for_selector?: string;
  use_residential_proxy?: boolean;
}

/**
 * Browser automation action definition
 */
export interface BrowserAction {
  type: 'click' | 'fill' | 'wait';
  selector?: string;
  value?: string;
}

/**
 * Parameters for interactive scraping with browser actions
 */
export interface ScrapeInteractiveParams extends BaseScrapeParams {
  actions: BrowserAction[];
}

/**
 * Internal request parameters sent to Scrape.do API
 */
export interface ScrapeDoRequestParams {
  url: string;
  disableRedirection?: boolean;
  super?: boolean;
  geoCode?: string;
  render?: boolean;
  customWait?: number;
  waitSelector?: string;
  playWithBrowser?: string;
  [key: string]: unknown;
}
