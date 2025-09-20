import { makeApiRequest } from '../src/services/scrape-client';
import { checkCredits } from '../src/tools/credits-tool';
import { scrapeInteractive } from '../src/tools/interactive-scraper';
import { scrapeJavascript } from '../src/tools/js-scraper';
import { scrapePremium } from '../src/tools/premium-scraper';
import { scrapeSimple } from '../src/tools/simple-scraper';

// Mock the API client module
jest.mock('../src/services/scrape-client');
const mockedMakeApiRequest = makeApiRequest as jest.MockedFunction<typeof makeApiRequest>;

describe('Tools', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('checkCredits', () => {
    it('should call makeApiRequest with correct endpoint', async () => {
      const mockResponse = {
        IsActive: true,
        ConcurrentRequest: 40,
        MaxMonthlyRequest: 3500000,
        RemainingConcurrentRequest: 15,
        RemainingMonthlyRequest: 2565023,
      };

      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await checkCredits();

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({}, '/info/');
      expect(mockedMakeApiRequest).toHaveBeenCalledTimes(1);
    });

    it('should transform PascalCase keys to snake_case', async () => {
      const mockResponse = {
        IsActive: true,
        ConcurrentRequest: 40,
        MaxMonthlyRequest: 3500000,
        RemainingConcurrentRequest: 15,
        RemainingMonthlyRequest: 2565023,
      };

      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const result = await checkCredits();

      expect(result).toEqual({
        is_active: true,
        concurrency_limit: 40,
        remaining_concurrency: 15,
        monthly_limit: 3500000,
        remaining_monthly_requests: 2565023,
      });
    });

    it('should handle inactive account status', async () => {
      const mockResponse = {
        IsActive: false,
        ConcurrentRequest: 0,
        MaxMonthlyRequest: 0,
        RemainingConcurrentRequest: 0,
        RemainingMonthlyRequest: 0,
      };

      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const result = await checkCredits();

      expect(result).toEqual({
        is_active: false,
        concurrency_limit: 0,
        remaining_concurrency: 0,
        monthly_limit: 0,
        remaining_monthly_requests: 0,
      });
    });

    it('should propagate errors from scrapeDoClient', async () => {
      const error = new Error('API Error');
      mockedMakeApiRequest.mockRejectedValueOnce(error);

      await expect(checkCredits()).rejects.toThrow('API Error');
    });
  });

  describe('scrapeSimple', () => {
    it('should call scrapeDoClient with correct parameters when follow_redirects is true', async () => {
      const mockResponse = '# Test Page\n\nThis is test content in markdown format.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://httpbin.org/html',
        follow_redirects: true,
      };

      await scrapeSimple(params);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://httpbin.org/html',
        disableRedirection: false,
      });
      expect(mockedMakeApiRequest).toHaveBeenCalledTimes(1);
    });

    it('should call scrapeDoClient with correct parameters when follow_redirects is false', async () => {
      const mockResponse = '# Test Page\n\nThis is test content in markdown format.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://example.com/redirect',
        follow_redirects: false,
      };

      await scrapeSimple(params);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://example.com/redirect',
        disableRedirection: true,
      });
    });

    it('should default follow_redirects to true when not specified', async () => {
      const mockResponse = '# Default Test\n\nContent with default redirect behavior.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://example.com/page',
      };

      await scrapeSimple(params);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://example.com/page',
        disableRedirection: false,
      });
    });

    it('should return the response from scrapeDoClient', async () => {
      const baseMarkdown =
        '# Test Page\n\nThis is scraped markdown content.\n\n## Section\n\nMore content here.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: baseMarkdown,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://example.com/test',
      };

      const result = await scrapeSimple(params);

      // Expect enhanced format with metadata header
      expect(result).toContain('# Title: Test Page');
      expect(result).toContain('Status: 200 | Content-Type: text/html | Size: 78 bytes');
      expect(result).toContain('URL: https://example.com/test');
      expect(result).toContain('---');
      expect(result).toContain(baseMarkdown);
    });

    it('should handle complex URLs correctly', async () => {
      const mockResponse = '# Query Results\n\nSearch results in markdown.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://example.com/search?q=test+query&page=1&sort=date',
        follow_redirects: true,
      };

      await scrapeSimple(params);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://example.com/search?q=test+query&page=1&sort=date',
        disableRedirection: false,
      });
    });

    it('should propagate errors from scrapeDoClient', async () => {
      const error = new Error('Network timeout');
      mockedMakeApiRequest.mockRejectedValueOnce(error);

      const params = {
        url: 'https://unreachable.example.com',
      };

      await expect(scrapeSimple(params)).rejects.toThrow('Network timeout');
    });

    it('should handle HTTP error responses', async () => {
      const httpError = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { error: 'Page not found' },
        },
        message: 'Request failed with status code 404',
      };
      mockedMakeApiRequest.mockRejectedValueOnce(httpError);

      const params = {
        url: 'https://example.com/missing-page',
      };

      await expect(scrapeSimple(params)).rejects.toEqual(httpError);
    });
  });

  describe('scrapePremium', () => {
    it('should call scrapeDoClient with correct parameters including super=true', async () => {
      const mockResponse = '# Premium Content\n\nContent from residential proxy.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://www.amazon.de/dp/B08H93ZRK9',
        country: 'DE',
      };

      await scrapePremium(params);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://www.amazon.de/dp/B08H93ZRK9',
        super: true,
        geoCode: 'DE',
      });
      expect(mockedMakeApiRequest).toHaveBeenCalledTimes(1);
    });

    it('should default country to US when not specified', async () => {
      const mockResponse = '# US Content\n\nContent from US residential proxy.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://example.com/us-only',
      };

      await scrapePremium(params);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://example.com/us-only',
        super: true,
        geoCode: 'US',
      });
    });

    it('should handle different country codes correctly', async () => {
      const mockResponse = '# JP Content\n\nContent from Japan proxy.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://www.amazon.co.jp/dp/B08H93ZRK9',
        country: 'JP',
      };

      await scrapePremium(params);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://www.amazon.co.jp/dp/B08H93ZRK9',
        super: true,
        geoCode: 'JP',
      });
    });

    it('should return the response from scrapeDoClient', async () => {
      const baseMarkdown =
        '# Protected Site\n\n## Geo-restricted Content\n\nThis content is only available from DE proxies.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: baseMarkdown,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://geo-restricted.example.com',
        country: 'DE',
      };

      const result = await scrapePremium(params);

      // Expect enhanced format with metadata header
      expect(result).toContain('# Title: Protected Site');
      expect(result).toContain('Status: 200 | Content-Type: text/html | Size: 92 bytes');
      expect(result).toContain('URL: https://geo-restricted.example.com');
      expect(result).toContain('---');
      expect(result).toContain(baseMarkdown);
    });

    it('should handle URLs with complex query parameters', async () => {
      const mockResponse = '# Search Results\n\nRegion-specific search results.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://example.com/search?region=eu&lang=de&sort=price',
        country: 'DE',
      };

      await scrapePremium(params);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://example.com/search?region=eu&lang=de&sort=price',
        super: true,
        geoCode: 'DE',
      });
    });

    it('should propagate errors from scrapeDoClient', async () => {
      const error = new Error('Proxy connection failed');
      mockedMakeApiRequest.mockRejectedValueOnce(error);

      const params = {
        url: 'https://protected-site.example.com',
        country: 'FR',
      };

      await expect(scrapePremium(params)).rejects.toThrow('Proxy connection failed');
    });

    it('should handle rate limiting errors correctly', async () => {
      const rateLimitError = {
        response: {
          status: 429,
          statusText: 'Too Many Requests',
          data: { error: 'Premium proxy rate limit exceeded' },
        },
        message: 'Request failed with status code 429',
      };
      mockedMakeApiRequest.mockRejectedValueOnce(rateLimitError);

      const params = {
        url: 'https://heavy-protected.example.com',
        country: 'US',
      };

      await expect(scrapePremium(params)).rejects.toEqual(rateLimitError);
    });
  });

  describe('scrapeJavascript', () => {
    it('should call scrapeDoClient with render=true and basic parameters', async () => {
      const mockResponse = '# SPA Content\n\nContent loaded by JavaScript.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://example.com/spa',
      };

      await scrapeJavascript(params);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://example.com/spa',
        render: true,
      });
      expect(mockedMakeApiRequest).toHaveBeenCalledTimes(1);
    });

    it('should include customWait when wait_ms is provided and > 0', async () => {
      const mockResponse = '# Delayed Content\n\nContent after waiting.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://example.com/slow-spa',
        wait_ms: 3000,
      };

      await scrapeJavascript(params);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://example.com/slow-spa',
        render: true,
        customWait: 3000,
      });
    });

    it('should not include customWait when wait_ms is 0', async () => {
      const mockResponse = '# Immediate Content\n\nNo waiting.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://example.com/fast-spa',
        wait_ms: 0,
      };

      await scrapeJavascript(params);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://example.com/fast-spa',
        render: true,
      });
    });

    it('should include waitSelector when wait_for_selector is provided', async () => {
      const mockResponse = '# Product Page\n\nProduct data loaded.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://example.com/product',
        wait_for_selector: '#product-grid',
      };

      await scrapeJavascript(params);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://example.com/product',
        render: true,
        waitSelector: '#product-grid',
      });
    });

    it('should include super=true when use_residential_proxy is true', async () => {
      const mockResponse = '# Protected SPA\n\nContent from residential proxy.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://protected-spa.example.com',
        use_residential_proxy: true,
      };

      await scrapeJavascript(params);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://protected-spa.example.com',
        render: true,
        super: true,
      });
    });

    it('should not include super when use_residential_proxy is false', async () => {
      const mockResponse = '# Standard SPA\n\nContent from datacenter proxy.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://spa.example.com',
        use_residential_proxy: false,
      };

      await scrapeJavascript(params);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://spa.example.com',
        render: true,
      });
    });

    it('should combine all parameters correctly', async () => {
      const mockResponse = '# Complex SPA\n\nFully loaded content with all options.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://complex-spa.example.com',
        wait_ms: 5000,
        wait_for_selector: '.dynamic-content',
        use_residential_proxy: true,
      };

      await scrapeJavascript(params);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://complex-spa.example.com',
        render: true,
        customWait: 5000,
        waitSelector: '.dynamic-content',
        super: true,
      });
    });

    it('should return the response from scrapeDoClient', async () => {
      const baseMarkdown =
        '# React App\n\n## Dynamic Section\n\nThis content was loaded by React components.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: baseMarkdown,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://react-app.example.com',
      };

      const result = await scrapeJavascript(params);

      // Expect enhanced format with metadata header
      expect(result).toContain('# Title: React App');
      expect(result).toContain('Status: 200 | Content-Type: text/html | Size: 77 bytes');
      expect(result).toContain('URL: https://react-app.example.com');
      expect(result).toContain('---');
      expect(result).toContain(baseMarkdown);
    });

    it('should handle CSS selectors with special characters', async () => {
      const mockResponse = '# Selector Test\n\nFound the element.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://example.com/test',
        wait_for_selector: 'div[data-testid="product-list"] .item:first-child',
      };

      await scrapeJavascript(params);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://example.com/test',
        render: true,
        waitSelector: 'div[data-testid="product-list"] .item:first-child',
      });
    });

    it('should propagate errors from scrapeDoClient', async () => {
      const error = new Error('Browser rendering failed');
      mockedMakeApiRequest.mockRejectedValueOnce(error);

      const params = {
        url: 'https://broken-spa.example.com',
      };

      await expect(scrapeJavascript(params)).rejects.toThrow('Browser rendering failed');
    });

    it('should handle timeout errors correctly', async () => {
      const timeoutError = {
        response: {
          status: 408,
          statusText: 'Request Timeout',
          data: { error: 'Browser rendering timeout' },
        },
        message: 'Request failed with status code 408',
      };
      mockedMakeApiRequest.mockRejectedValueOnce(timeoutError);

      const params = {
        url: 'https://slow-spa.example.com',
        wait_ms: 35000, // Max wait time
      };

      await expect(scrapeJavascript(params)).rejects.toEqual(timeoutError);
    });
  });

  describe('scrapeInteractive', () => {
    it('should call scrapeDoClient with render=true and translated actions', async () => {
      const mockResponse = '# Interactive Result\n\nContent after form submission.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://example.com/search',
        actions: [
          { type: 'fill' as const, selector: '#query', value: 'test' },
          { type: 'click' as const, selector: '#search-btn' },
        ],
      };

      await scrapeInteractive(params);

      const expectedActions = JSON.stringify([
        { Action: 'Fill', Selector: '#query', Value: 'test' },
        { Action: 'Click', Selector: '#search-btn' },
      ]);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://example.com/search',
        render: true,
        playWithBrowser: expectedActions,
      });
      expect(mockedMakeApiRequest).toHaveBeenCalledTimes(1);
    });

    it('should handle click actions correctly', async () => {
      const mockResponse = '# Click Result\n\nButton was clicked.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://example.com/page',
        actions: [{ type: 'click' as const, selector: '.submit-button' }],
      };

      await scrapeInteractive(params);

      const expectedActions = JSON.stringify([{ Action: 'Click', Selector: '.submit-button' }]);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://example.com/page',
        render: true,
        playWithBrowser: expectedActions,
      });
    });

    it('should handle fill actions correctly', async () => {
      const mockResponse = '# Fill Result\n\nForm was filled.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://example.com/form',
        actions: [
          { type: 'fill' as const, selector: '#username', value: 'testuser' },
          { type: 'fill' as const, selector: '#password', value: 'secret123' },
        ],
      };

      await scrapeInteractive(params);

      const expectedActions = JSON.stringify([
        { Action: 'Fill', Selector: '#username', Value: 'testuser' },
        { Action: 'Fill', Selector: '#password', Value: 'secret123' },
      ]);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://example.com/form',
        render: true,
        playWithBrowser: expectedActions,
      });
    });

    it('should handle wait actions correctly', async () => {
      const mockResponse = '# Wait Result\n\nWaited for content to load.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://example.com/slow',
        actions: [
          { type: 'wait' as const, value: '3000' },
          { type: 'click' as const, selector: '.dynamic-button' },
        ],
      };

      await scrapeInteractive(params);

      const expectedActions = JSON.stringify([
        { Action: 'Wait', Timeout: 3000 },
        { Action: 'Click', Selector: '.dynamic-button' },
      ]);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://example.com/slow',
        render: true,
        playWithBrowser: expectedActions,
      });
    });

    it('should use default timeout for wait actions without value', async () => {
      const mockResponse = '# Default Wait\n\nUsed default timeout.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://example.com/page',
        actions: [{ type: 'wait' as const }],
      };

      await scrapeInteractive(params);

      const expectedActions = JSON.stringify([{ Action: 'Wait', Timeout: 1000 }]);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://example.com/page',
        render: true,
        playWithBrowser: expectedActions,
      });
    });

    it('should handle complex action sequences correctly', async () => {
      const mockResponse = '# Complex Flow\n\nCompleted multi-step form interaction.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://example.com/checkout',
        actions: [
          { type: 'fill' as const, selector: '#email', value: 'user@example.com' },
          { type: 'fill' as const, selector: '#address', value: '123 Main St' },
          { type: 'click' as const, selector: '#continue-btn' },
          { type: 'wait' as const, value: '2000' },
          { type: 'fill' as const, selector: '#card-number', value: '4111111111111111' },
          { type: 'click' as const, selector: '#submit-payment' },
        ],
      };

      await scrapeInteractive(params);

      const expectedActions = JSON.stringify([
        { Action: 'Fill', Selector: '#email', Value: 'user@example.com' },
        { Action: 'Fill', Selector: '#address', Value: '123 Main St' },
        { Action: 'Click', Selector: '#continue-btn' },
        { Action: 'Wait', Timeout: 2000 },
        { Action: 'Fill', Selector: '#card-number', Value: '4111111111111111' },
        { Action: 'Click', Selector: '#submit-payment' },
      ]);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://example.com/checkout',
        render: true,
        playWithBrowser: expectedActions,
      });
    });

    it('should return the response from scrapeDoClient', async () => {
      const baseMarkdown = '# Login Success\n\nUser has been logged in successfully.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: baseMarkdown,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://example.com/login',
        actions: [
          { type: 'fill' as const, selector: '#username', value: 'admin' },
          { type: 'fill' as const, selector: '#password', value: 'password' },
          { type: 'click' as const, selector: '#login-btn' },
        ],
      };

      const result = await scrapeInteractive(params);

      // Expect enhanced format with metadata header
      expect(result).toContain('# Title: Login Success');
      expect(result).toContain('Status: 200 | Content-Type: text/html | Size: 54 bytes');
      expect(result).toContain('URL: https://example.com/login');
      expect(result).toContain('---');
      expect(result).toContain(baseMarkdown);
    });

    it('should handle selectors with special characters', async () => {
      const mockResponse = '# Special Selectors\n\nHandled complex selectors.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://example.com/complex',
        actions: [
          { type: 'click' as const, selector: 'button[data-testid="submit"]:not(.disabled)' },
          {
            type: 'fill' as const,
            selector: 'input[name="search"][type="text"]',
            value: 'test query',
          },
        ],
      };

      await scrapeInteractive(params);

      const expectedActions = JSON.stringify([
        { Action: 'Click', Selector: 'button[data-testid="submit"]:not(.disabled)' },
        { Action: 'Fill', Selector: 'input[name="search"][type="text"]', Value: 'test query' },
      ]);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://example.com/complex',
        render: true,
        playWithBrowser: expectedActions,
      });
    });

    it('should throw error for unsupported action types', async () => {
      const params = {
        url: 'https://example.com/page',
        actions: [{ type: 'unsupported' as 'click' | 'fill' | 'wait', selector: '#test' }],
      };

      await expect(scrapeInteractive(params)).rejects.toThrow(
        'Unsupported action type: unsupported'
      );
    });

    it('should propagate errors from scrapeDoClient', async () => {
      const error = new Error('Browser automation failed');
      mockedMakeApiRequest.mockRejectedValueOnce(error);

      const params = {
        url: 'https://broken-site.example.com',
        actions: [{ type: 'click' as const, selector: '#button' }],
      };

      await expect(scrapeInteractive(params)).rejects.toThrow('Browser automation failed');
    });

    it('should handle empty actions array', async () => {
      const mockResponse = '# No Actions\n\nJust loaded the page.';
      mockedMakeApiRequest.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {} as any,
      });

      const params = {
        url: 'https://example.com/page',
        actions: [],
      };

      await scrapeInteractive(params);

      const expectedActions = JSON.stringify([]);

      expect(mockedMakeApiRequest).toHaveBeenCalledWith({
        url: 'https://example.com/page',
        render: true,
        playWithBrowser: expectedActions,
      });
    });
  });
});
