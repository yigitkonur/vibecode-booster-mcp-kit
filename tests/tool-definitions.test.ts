import { toolDefinitions } from '../src/tool-definitions';

describe('Tool Definitions', () => {
  it('should have exactly 5 tool definitions', () => {
    expect(toolDefinitions).toHaveLength(5);
  });

  it('should include all required tools', () => {
    const toolNames = toolDefinitions.map((tool) => tool.name);
    expect(toolNames).toContain('scrape_simple');
    expect(toolNames).toContain('scrape_premium');
    expect(toolNames).toContain('scrape_javascript');
    expect(toolNames).toContain('scrape_interactive');
    expect(toolNames).toContain('check_credits');
  });

  describe('scrape_simple definition', () => {
    const scrapeTool = toolDefinitions.find((tool) => tool.name === 'scrape_simple');

    it('should have correct name and description', () => {
      expect(scrapeTool?.name).toBe('scrape_simple');
      expect(scrapeTool?.description).toContain('standard datacenter proxy');
      expect(scrapeTool?.description).toContain('Cost: 1 credit');
    });

    it('should have correct parameters structure', () => {
      expect(scrapeTool?.parameters.type).toBe('object');
      expect(scrapeTool?.parameters.required).toEqual(['url']);
      expect(scrapeTool?.parameters.properties.url).toEqual({
        type: 'string',
        description: 'The target URL to scrape.',
      });
      expect(scrapeTool?.parameters.properties.follow_redirects).toEqual({
        type: 'boolean',
        description: 'Set to false to stop at the first response and not follow HTTP redirects.',
        default: true,
      });
    });
  });

  describe('scrape_premium definition', () => {
    const premiumTool = toolDefinitions.find((tool) => tool.name === 'scrape_premium');

    it('should have correct name and description', () => {
      expect(premiumTool?.name).toBe('scrape_premium');
      expect(premiumTool?.description).toContain('residential proxy');
      expect(premiumTool?.description).toContain('Cost: 10 credits');
    });

    it('should have correct parameters structure', () => {
      expect(premiumTool?.parameters.type).toBe('object');
      expect(premiumTool?.parameters.required).toEqual(['url']);
      expect(premiumTool?.parameters.properties.country).toEqual({
        type: 'string',
        description: "The two-letter ISO country code for the proxy (e.g., 'US', 'DE', 'JP').",
        default: 'US',
      });
    });
  });

  describe('scrape_javascript definition', () => {
    const jsTool = toolDefinitions.find((tool) => tool.name === 'scrape_javascript');

    it('should have correct name and description', () => {
      expect(jsTool?.name).toBe('scrape_javascript');
      expect(jsTool?.description).toContain('headless browser');
      expect(jsTool?.description).toContain('Cost: 5 credits');
    });

    it('should have correct parameters structure', () => {
      expect(jsTool?.parameters.type).toBe('object');
      expect(jsTool?.parameters.required).toEqual(['url']);
      expect(jsTool?.parameters.properties.wait_ms).toEqual({
        type: 'integer',
        description:
          'Milliseconds to wait after the page loads before capturing content. Range: 0-35000.',
        default: 0,
      });
      expect(jsTool?.parameters.properties.use_residential_proxy).toEqual({
        type: 'boolean',
        description:
          'Set to true to use a residential proxy with the browser, for heavily protected JavaScript sites.',
        default: false,
      });
    });
  });

  describe('scrape_interactive definition', () => {
    const interactiveTool = toolDefinitions.find((tool) => tool.name === 'scrape_interactive');

    it('should have correct name and description', () => {
      expect(interactiveTool?.name).toBe('scrape_interactive');
      expect(interactiveTool?.description).toContain('browser actions');
      expect(interactiveTool?.description).toContain('Cost: 5-25 credits');
    });

    it('should have correct parameters structure', () => {
      expect(interactiveTool?.parameters.type).toBe('object');
      expect(interactiveTool?.parameters.required).toEqual(['url', 'actions']);
      expect(interactiveTool?.parameters.properties.actions.type).toBe('array');
      expect(interactiveTool?.parameters.properties.actions.items.properties.type.enum).toEqual([
        'click',
        'fill',
        'wait',
      ]);
    });
  });

  describe('check_credits definition', () => {
    const creditsTool = toolDefinitions.find((tool) => tool.name === 'check_credits');

    it('should have correct name and description', () => {
      expect(creditsTool?.name).toBe('check_credits');
      expect(creditsTool?.description).toContain('API credits');
      expect(creditsTool?.description).toContain('concurrency limits');
    });

    it('should have no required parameters', () => {
      expect(creditsTool?.parameters.type).toBe('object');
      expect(creditsTool?.parameters.required).toEqual([]);
      expect(Object.keys(creditsTool?.parameters.properties || {})).toHaveLength(0);
    });
  });
});
