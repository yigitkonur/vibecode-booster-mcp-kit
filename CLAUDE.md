# Claude Code Guide: MCP Server Template Development

The ultimate guide for building production-ready MCP servers using the comprehensive template.

## 🎯 Template Overview

This template provides a complete foundation for building MCP servers that integrate with any third-party API. It combines:

- **Atomic Architecture**: Clean, maintainable code structure
- **Full Documentation**: Extensive tutorials and examples
- **Type Safety**: Strict TypeScript with comprehensive interfaces
- **Best Practices**: Industry-standard patterns and conventions
- **Production Ready**: Docker, testing, and deployment included

## 🚀 Quick Start

### 1. Create Your MCP Server

```bash
# Copy template to new project
cp -r mcp-server-template my-openai-mcp
cd my-openai-mcp

# Install dependencies
npm install

# Customize for your service (see customization section below)
```

### 2. Basic Customization

Replace template placeholders with your service details:

```bash
# Service name (PascalCase)
find . -name "*.ts" -o -name "*.md" | xargs sed -i '' 's/{{SERVICE_NAME}}/OpenAI/g'

# API token environment variable
find . -name "*.ts" -o -name "*.md" | xargs sed -i '' 's/{{API_TOKEN_ENV_VAR}}/OPENAI_API_KEY/g'

# Service name (kebab-case)
find . -name "*.ts" -o -name "*.md" | xargs sed -i '' 's/{{service-name}}/openai/g'

# Service domain
find . -name "*.ts" -o -name "*.md" | xargs sed -i '' 's/{{service-domain}}/openai.com/g'
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Add your API credentials
echo "OPENAI_API_KEY=your_api_key_here" >> .env
```

### 4. Claude Code Integration

Add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "openai": {
      "command": "node",
      "args": ["/absolute/path/to/my-openai-mcp/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your_openai_api_key_here"
      }
    }
  }
}
```

## 🛠 Development Workflow

### Phase 1: Service Integration

**1. Define API Types**
```typescript
// src/types/api-types.ts
export interface OpenAIApiParams {
  model?: string;
  messages?: Array<{role: string, content: string}>;
  temperature?: number;
  max_tokens?: number;
  [key: string]: unknown;
}

export interface OpenAIResponse {
  content: string;
  metadata: {
    model: string;
    tokensUsed: number;
    processingTime: number;
  };
}
```

**2. Configure API Client**
```typescript
// src/utils/constants.ts
export const API_CONFIG = {
  BASE_URL: 'https://api.openai.com',
  COMPLETIONS_ENDPOINT: '/v1/chat/completions',
  DEFAULT_MODEL: 'gpt-3.5-turbo',
  DEFAULT_TEMPERATURE: 0.7,
} as const;
```

**3. Update API Client**
```typescript
// src/services/api-client.ts (renamed from scrape-client.ts)
export async function makeApiRequest(params: Record<string, unknown> = {}, endpoint: string = '') {
  const apiKey = validateEnvVar('OPENAI_API_KEY');

  const requestParams: OpenAIApiParams = {
    model: API_CONFIG.DEFAULT_MODEL,
    temperature: API_CONFIG.DEFAULT_TEMPERATURE,
    ...params,
  };

  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  return await axios.post(url, requestParams, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }
  });
}
```

### Phase 2: Tool Development

**1. Define Tools**
```typescript
// src/tool-definitions.ts
export const toolDefinitions = [
  {
    name: 'generate_text',
    description: 'Generate text using OpenAI models. Supports various models and parameters.',
    parameters: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'The text prompt for generation.'
        },
        model: {
          type: 'string',
          enum: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
          default: 'gpt-3.5-turbo'
        },
        temperature: {
          type: 'number',
          minimum: 0,
          maximum: 2,
          default: 0.7
        },
        max_tokens: {
          type: 'integer',
          minimum: 1,
          maximum: 4000,
          default: 1000
        }
      },
      required: ['prompt']
    }
  }
];
```

**2. Implement Tools**
```typescript
// src/tools/text-generator.ts
export async function generateText(params: GenerateTextParams): Promise<string> {
  const { prompt, model = 'gpt-3.5-turbo', temperature = 0.7, max_tokens = 1000 } = params;

  const requestParams = {
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature,
    max_tokens,
  };

  const response = await makeApiRequest(requestParams, '/v1/chat/completions');
  const enhancedResponse = enhanceResponse(response, { prompt, model });

  return formatServiceResponse(enhancedResponse);
}
```

**3. Wire Up in Main Server**
```typescript
// src/index.ts
case 'generate_text': {
  validateRequiredParams(args, ['prompt']);
  const result = await generateText({
    prompt: args!['prompt'] as string,
    model: args!['model'] as string,
    temperature: args!['temperature'] as number,
    max_tokens: args!['max_tokens'] as number,
  });
  return createTextResponse(result);
}
```

### Phase 3: Testing & Validation

**1. Unit Testing**
```bash
# Test individual components
npm test -- text-generator.test.ts

# Test API client
npm test -- api-client.test.ts

# Test tool definitions
npm test -- tool-definitions.test.ts
```

**2. Integration Testing**
```bash
# Test tool execution
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "generate_text", "arguments": {"prompt": "Hello, world!"}}}' | node dist/index.js

# Test with Claude Code
# Use the tool in Claude Code to verify end-to-end functionality
```

**3. Build & Deploy**
```bash
# Build project
npm run build

# Run quality checks
npm run check

# Docker build
docker build -t my-openai-mcp .
```

## 📚 Service-Specific Examples

### AI/ML Services (OpenAI, Anthropic, Cohere)

**Tool Pattern: Text Generation**
```typescript
export const generateText: ToolDefinition = {
  name: 'generate_text',
  description: 'Generate text using AI model with customizable parameters.',
  parameters: {
    type: 'object',
    properties: {
      prompt: { type: 'string', description: 'Input prompt' },
      model: { type: 'string', enum: ['gpt-3.5-turbo', 'gpt-4'] },
      temperature: { type: 'number', minimum: 0, maximum: 2 },
      max_tokens: { type: 'integer', minimum: 1, maximum: 4000 }
    },
    required: ['prompt']
  }
};
```

**Response Formatting:**
```typescript
export function formatAIResponse(response: AIResponse): string {
  const { content, model, tokens_used, processing_time } = response;
  return [
    `# AI Generated Content`,
    `Model: ${model} | Tokens: ${tokens_used} | Time: ${processing_time}ms`,
    `---`,
    ``,
    content
  ].join('\n');
}
```

### Data Services (APIs, Databases, Search)

**Tool Pattern: Search/Query**
```typescript
export const searchData: ToolDefinition = {
  name: 'search_data',
  description: 'Search through data with filters and pagination.',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query' },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      filters: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          date_range: { type: 'string', enum: ['week', 'month', 'year'] }
        }
      }
    },
    required: ['query']
  }
};
```

### Payment Services (Stripe, PayPal)

**Tool Pattern: Transaction Creation**
```typescript
export const createPayment: ToolDefinition = {
  name: 'create_payment',
  description: 'Create a payment intent with amount and currency.',
  parameters: {
    type: 'object',
    properties: {
      amount: { type: 'integer', description: 'Amount in cents' },
      currency: { type: 'string', enum: ['usd', 'eur', 'gbp'], default: 'usd' },
      customer_id: { type: 'string', description: 'Customer identifier' }
    },
    required: ['amount', 'customer_id']
  }
};
```

### Media Services (Image, Video, Audio)

**Tool Pattern: Media Processing**
```typescript
export const processImage: ToolDefinition = {
  name: 'process_image',
  description: 'Process image with operations like resize, crop, filter.',
  parameters: {
    type: 'object',
    properties: {
      image_url: { type: 'string', description: 'Source image URL' },
      operations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['resize', 'crop', 'filter'] },
            params: { type: 'object' }
          }
        }
      }
    },
    required: ['image_url', 'operations']
  }
};
```

## 🔧 Advanced Customization

### Custom Response Enhancer

```typescript
// src/services/response-enhancer.ts
export function enhanceResponse(response: AxiosResponse, context: RequestContext): ServiceResponse {
  return {
    content: response.data.choices?.[0]?.message?.content || response.data,
    metadata: {
      statusCode: response.status,
      contentType: response.headers['content-type'],
      contentLength: JSON.stringify(response.data).length,
      requestId: response.headers['x-request-id'],
      model: context.model,
      tokensUsed: response.data.usage?.total_tokens,
      processingTime: Date.now() - context.startTime,
    }
  };
}
```

### Custom Validation

```typescript
// src/utils/validators.ts
export function validateOpenAIParams(params: OpenAIApiParams): void {
  if (params.temperature && (params.temperature < 0 || params.temperature > 2)) {
    throw new Error('Temperature must be between 0 and 2');
  }

  if (params.max_tokens && params.max_tokens > 4000) {
    throw new Error('Max tokens cannot exceed 4000');
  }
}
```

### Error Handling Patterns

```typescript
// src/tools/base-tool.ts
export async function handleToolExecution<T>(
  toolFn: () => Promise<T>,
  context: { toolName: string; params: unknown }
): Promise<T> {
  try {
    return await toolFn();
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    if (error.response?.status === 401) {
      throw new Error('Invalid API key. Please check your credentials.');
    }
    throw new Error(`${context.toolName} failed: ${error.message}`);
  }
}
```

## 🧪 Testing Strategies

### Unit Testing Pattern

```typescript
// tests/tools/text-generator.test.ts
describe('generateText', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';
  });

  it('should generate text with default parameters', async () => {
    const mockResponse = {
      data: {
        choices: [{ message: { content: 'Generated text' } }],
        usage: { total_tokens: 50 }
      },
      status: 200,
      headers: { 'x-request-id': 'req-123' }
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const result = await generateText({ prompt: 'Test prompt' });

    expect(result).toContain('Generated text');
    expect(result).toContain('Tokens: 50');
  });

  it('should handle API errors gracefully', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

    await expect(generateText({ prompt: 'Test' }))
      .rejects.toThrow('generate_text failed: API Error');
  });
});
```

### Integration Testing

```typescript
// tests/integration/server.test.ts
describe('MCP Server Integration', () => {
  it('should list all available tools', async () => {
    const response = await request(server)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list'
      });

    expect(response.body.result.tools).toHaveLength(3);
    expect(response.body.result.tools[0].name).toBe('generate_text');
  });

  it('should execute tools successfully', async () => {
    const response = await request(server)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'generate_text',
          arguments: { prompt: 'Hello' }
        }
      });

    expect(response.body.result.content[0].text).toContain('Generated text');
  });
});
```

## 🚀 Production Deployment

### Docker Configuration

```dockerfile
# Multi-stage build for production
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --frozen-lockfile
COPY src/ ./src/
COPY tsconfig.json ./
RUN npm run build

FROM node:20-alpine AS production
RUN apk upgrade --no-cache
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --frozen-lockfile && npm cache clean --force
COPY --from=builder /app/dist ./dist
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Environment Variables

```bash
# Production .env
NODE_ENV=production
OPENAI_API_KEY=your_production_api_key
MCP_DEBUG=false

# Optional performance tuning
MAX_CONCURRENT_REQUESTS=10
REQUEST_TIMEOUT=30000
RATE_LIMIT_PER_MINUTE=60
```

### Health Monitoring

```typescript
// src/utils/health.ts
export async function healthCheck(): Promise<HealthStatus> {
  try {
    const response = await makeApiRequest({}, '/models');
    return {
      status: 'healthy',
      apiConnectivity: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      apiConnectivity: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
```

## 🎯 Best Practices

### Code Organization

1. **Atomic Architecture**: One responsibility per file
2. **Clear Interfaces**: Well-defined TypeScript interfaces
3. **Error Boundaries**: Comprehensive error handling
4. **Logging**: Structured logging for debugging
5. **Documentation**: JSDoc for all public functions

### API Integration

1. **Authentication**: Secure credential management
2. **Rate Limiting**: Respect service limits
3. **Retry Logic**: Handle transient failures
4. **Caching**: Cache responses when appropriate
5. **Monitoring**: Track API usage and performance

### Claude Code Integration

1. **Tool Descriptions**: Clear, actionable descriptions
2. **Parameter Validation**: Validate all inputs
3. **Response Formatting**: Consistent formatting
4. **Error Messages**: Helpful error information
5. **Performance**: Optimize for fast responses

## 📋 Customization Checklist

Follow the complete customization checklist in `CUSTOMIZATION_CHECKLIST.md`:

- [ ] Replace all template placeholders
- [ ] Configure API client for your service
- [ ] Define tool schemas and implementations
- [ ] Update tests for your service
- [ ] Configure environment variables
- [ ] Test integration with Claude Code
- [ ] Deploy and verify functionality

## 🔗 Resources & References

### Template Documentation
- **README.md**: Complete template overview
- **CUSTOMIZATION_CHECKLIST.md**: Step-by-step guide
- **WORKING_EXAMPLE.md**: Quick start instructions

### MCP Resources
- [Model Context Protocol Specification](https://github.com/modelcontextprotocol/specification)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude Code Documentation](https://docs.anthropic.com/claude-code)

### Development Tools
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Docker Documentation](https://docs.docker.com/)

## 💡 Tips & Tricks

### Development Efficiency
- Use the template's extensive inline documentation
- Follow the atomic architecture patterns
- Leverage the comprehensive test examples
- Use the provided Docker configuration

### Debugging Techniques
- Enable MCP debug logging for protocol issues
- Use structured logging for application debugging
- Test tools independently before Claude Code integration
- Monitor API usage and rate limits

### Performance Optimization
- Cache API responses when possible
- Implement request deduplication
- Use streaming for large responses
- Monitor memory usage and optimize accordingly

---

**Ready to build your MCP server?** Start with the customization checklist and follow this guide step by step. The template provides everything you need for a production-ready implementation!