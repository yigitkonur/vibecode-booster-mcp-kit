# MCP Server Template Customization Checklist

Use this checklist to systematically customize the template for your specific third-party API service.

## 🎯 Phase 1: Initial Setup

### 1.1 Project Setup
- [ ] Copy template to new project directory
- [ ] Run `npm install` to install dependencies
- [ ] Copy `.env.example` to `.env`
- [ ] Update project name in `package.json`

### 1.2 Service Identification
- [ ] Choose your service name (e.g., "OpenAI", "Stripe", "GitHub")
- [ ] Identify API base URL
- [ ] Determine authentication method (API key, token, OAuth, etc.)
- [ ] Review API documentation for endpoints and parameters

## 🔧 Phase 2: Core Configuration

### 2.1 Replace Template Placeholders

Search and replace the following throughout the codebase:

- [ ] `JINA` → Your service name (PascalCase)
- [ ] `JINA_API_KEY` → Your API token variable name
- [ ] `jina-deepsearch` → Your service name (kebab-case)
- [ ] `jina.ai` → Your service domain (e.g., "openai.com")

**Files to update:**
- [ ] `src/types/api-types.ts`
- [ ] `src/services/scrape-client.ts`
- [ ] `src/utils/constants.ts`
- [ ] `src/index.ts`
- [ ] `.env.example`

### 2.2 Environment Variables
- [ ] Update `.env.example` with your service's required variables
- [ ] Add your API credentials to `.env`
- [ ] Update environment variable names in `src/utils/validators.ts`

### 2.3 API Configuration
- [ ] Update `API_CONFIG.BASE_URL` in `src/utils/constants.ts`
- [ ] Add any additional endpoints your service needs
- [ ] Set appropriate default parameters
- [ ] Configure timeout and rate limiting if needed

## 🛠 Phase 3: API Integration

### 3.1 API Types
In `src/types/api-types.ts`:
- [ ] Replace `JINAApiParams` with your API's parameters
- [ ] Add authentication fields (token, api_key, etc.)
- [ ] Include service-specific parameters
- [ ] Define raw response interface
- [ ] Define normalized response interface

### 3.2 API Client
In `src/services/scrape-client.ts`:
- [ ] Update authentication parameter name
- [ ] Modify request method if needed (GET/POST)
- [ ] Add required headers for your service
- [ ] Update default parameters logic
- [ ] Customize error handling if needed

### 3.3 Response Enhancement
In `src/services/response-enhancer.ts`:
- [ ] Customize metadata extraction for your service
- [ ] Update response transformation logic
- [ ] Add service-specific processing

## 🔨 Phase 4: Tool Development

### 4.1 Define Your Tools
In `src/tool-definitions.ts`:
- [ ] Remove example tool definitions
- [ ] Add your service's tool definitions
- [ ] Define parameter schemas for each tool
- [ ] Add proper descriptions and examples

### 4.2 Implement Tool Functions
For each tool:
- [ ] Create new file in `src/tools/`
- [ ] Implement tool function with proper typing
- [ ] Add parameter validation
- [ ] Handle service-specific logic
- [ ] Return formatted responses

### 4.3 Update Main Router
In `src/index.ts`:
- [ ] Remove example tool imports
- [ ] Import your actual tool functions
- [ ] Update switch statement cases
- [ ] Add parameter validation for each tool
- [ ] Test error handling paths

## 📋 Phase 5: Types and Interfaces

### 5.1 Tool Parameter Types
In `src/types/tool-types.ts`:
- [ ] Define parameter interfaces for each tool
- [ ] Add proper documentation
- [ ] Include optional parameters with defaults
- [ ] Export all interfaces

### 5.2 Response Types
In `src/types/response-types.ts`:
- [ ] Update response interface for your service
- [ ] Add metadata fields relevant to your API
- [ ] Include any service-specific response data

## 🧪 Phase 6: Testing

### 6.1 Update Test Files
- [ ] Update `tests/` files with your service details
- [ ] Replace mock API responses with your service's format
- [ ] Add tests for your specific tools
- [ ] Test parameter validation
- [ ] Test error conditions

### 6.2 Manual Testing
- [ ] Build project: `npm run build`
- [ ] Test tool listing: `echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node dist/index.js`
- [ ] Test each tool with sample parameters
- [ ] Verify error handling works correctly

## 📚 Phase 7: Documentation

### 7.1 Update Documentation
- [ ] Customize `README.md` with your service details
- [ ] Update examples in documentation
- [ ] Add service-specific setup instructions
- [ ] Document any special requirements

### 7.2 Code Comments
- [ ] Update inline comments with service-specific details
- [ ] Add JSDoc comments for all public functions
- [ ] Document any complex business logic
- [ ] Add usage examples in comments

## 🚀 Phase 8: Deployment Preparation

### 8.1 Production Configuration
- [ ] Set up production environment variables
- [ ] Configure error reporting
- [ ] Set up logging if needed
- [ ] Test Docker build if using containers

### 8.2 Integration with Claude Code
- [ ] Update `.mcp.json` configuration
- [ ] Test with Claude Code locally
- [ ] Verify all tools work as expected
- [ ] Document setup instructions for users

## ✅ Phase 9: Quality Assurance

### 9.1 Code Quality
- [ ] Run linting: `npm run check`
- [ ] Fix any linting issues: `npm run check:fix`
- [ ] Run all tests: `npm test`
- [ ] Verify 100% test pass rate

### 9.2 Security Review
- [ ] Ensure no secrets in code
- [ ] Validate all user inputs
- [ ] Review error messages for information leakage
- [ ] Test rate limiting if applicable

### 9.3 Performance Testing
- [ ] Test with realistic payloads
- [ ] Verify timeout handling
- [ ] Test concurrent requests if supported
- [ ] Monitor memory usage

## 📦 Phase 10: Distribution

### 10.1 Package Preparation
- [ ] Update version in `package.json`
- [ ] Write release notes
- [ ] Create distribution package
- [ ] Test installation from package

### 10.2 Documentation Finalization
- [ ] Write user installation guide
- [ ] Create API reference documentation
- [ ] Add troubleshooting guide
- [ ] Include contribution guidelines

## 🔄 Maintenance Considerations

### Ongoing Tasks
- [ ] Monitor API changes from your service
- [ ] Update dependencies regularly
- [ ] Add new tools as service APIs evolve
- [ ] Gather user feedback and iterate
- [ ] Keep documentation up to date

## 🆘 Common Issues Checklist

If you encounter problems, check:
- [ ] All placeholders have been replaced
- [ ] Environment variables are set correctly
- [ ] API credentials have proper permissions
- [ ] Tool names match exactly between files
- [ ] Parameter types are consistent
- [ ] All imports are resolved correctly
- [ ] TypeScript compilation passes
- [ ] Tests are updated for your service

## 📋 Service-Specific Examples

### For AI/ML Services
- [ ] Add model selection parameters
- [ ] Implement streaming responses if supported
- [ ] Add prompt engineering utilities
- [ ] Handle token limits and costs

### For Payment Services
- [ ] Implement webhook handling
- [ ] Add currency conversion support
- [ ] Include fraud detection parameters
- [ ] Handle PCI compliance requirements

### For Data/Search Services
- [ ] Add pagination support
- [ ] Implement query builders
- [ ] Support multiple data formats
- [ ] Add filtering and sorting options

### For Media/Content Services
- [ ] Support file uploads/downloads
- [ ] Add format conversion capabilities
- [ ] Implement batch processing
- [ ] Handle large file transfers

---

**Tip**: Work through this checklist systematically. Each phase builds on the previous one, so complete them in order for the smoothest experience.

**Need help?** Check the extensive inline documentation in each file - every major concept is explained with examples and best practices.