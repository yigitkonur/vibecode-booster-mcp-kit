import axios from 'axios';
import { enhanceResponse } from '../src/services/response-enhancer';
import { makeApiRequest } from '../src/services/scrape-client';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Services', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('API Token Validation', () => {
    it('should throw an error when SCRAPEDO_TOKEN is not set', async () => {
      process.env.SCRAPEDO_TOKEN = undefined;

      await expect(makeApiRequest()).rejects.toThrow(
        'SCRAPEDO_TOKEN environment variable is required but not set'
      );
    });

    it('should throw an error when SCRAPEDO_TOKEN is empty', async () => {
      process.env.SCRAPEDO_TOKEN = '   ';

      await expect(makeApiRequest()).rejects.toThrow(
        'SCRAPEDO_TOKEN environment variable is required but not set'
      );
    });

    it('should not throw an error when SCRAPEDO_TOKEN is set', async () => {
      process.env.SCRAPEDO_TOKEN = 'test-token';
      mockedAxios.get.mockResolvedValueOnce({ data: 'test response' });

      await expect(makeApiRequest()).resolves.not.toThrow();
    });
  });

  describe('Request Construction', () => {
    beforeEach(() => {
      process.env.SCRAPEDO_TOKEN = 'test-token';
    });

    it('should always include token and output=markdown for main endpoint', async () => {
      const mockResponse = { data: 'markdown content' };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await makeApiRequest();

      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.scrape.do/', {
        params: {
          token: 'test-token',
          output: 'markdown',
        },
      });
    });

    it('should only include token for info endpoint', async () => {
      const mockResponse = { data: 'info response' };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await makeApiRequest({}, '/info/');

      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.scrape.do/info/', {
        params: {
          token: 'test-token',
        },
      });
    });

    it('should merge user parameters with mandatory parameters', async () => {
      const mockResponse = { data: 'markdown content' };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await makeApiRequest({
        url: 'https://example.com',
        customParam: 'value',
      });

      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.scrape.do/', {
        params: {
          token: 'test-token',
          output: 'markdown',
          url: 'https://example.com',
          customParam: 'value',
        },
      });
    });

    it('should use correct base URL', async () => {
      const mockResponse = { data: 'test' };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await makeApiRequest();

      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.scrape.do/', expect.anything());
    });
  });

  describe('Response Handling', () => {
    beforeEach(() => {
      process.env.SCRAPEDO_TOKEN = 'test-token';
    });

    it('should return the data property from successful response', async () => {
      const responseData = 'scraped markdown content';
      mockedAxios.get.mockResolvedValueOnce({
        data: responseData,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config: {},
      });

      const result = await makeApiRequest({ url: 'https://example.com' });

      // Should return raw axios response
      expect(result.data).toEqual(responseData);
      expect(result.status).toBe(200);
      expect(result.headers['content-type']).toBe('text/html');
    });

    it('should propagate errors from axios', async () => {
      const axiosError = new Error('Network error');
      mockedAxios.get.mockRejectedValueOnce(axiosError);

      await expect(makeApiRequest()).rejects.toThrow('Network error');
    });

    it('should propagate 4xx/5xx status errors', async () => {
      const axiosError = {
        response: {
          status: 429,
          statusText: 'Too Many Requests',
          data: { error: 'Rate limit exceeded' },
        },
        message: 'Request failed with status code 429',
      };
      mockedAxios.get.mockRejectedValueOnce(axiosError);

      await expect(makeApiRequest()).rejects.toEqual(axiosError);
    });
  });
});
