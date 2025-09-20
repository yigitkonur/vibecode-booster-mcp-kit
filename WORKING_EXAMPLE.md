# Working Template Example

This directory contains a template that needs to be customized before it can be used. The template includes placeholder values like `{{SERVICE_NAME}}` that need to be replaced with actual values.

## Quick Start: Create a Working Example

To create a working example from this template:

1. **Copy the template:**
   ```bash
   cp -r mcp-server-template my-openai-mcp
   cd my-openai-mcp
   ```

2. **Replace placeholders:**
   ```bash
   # Replace service name placeholders
   find . -name "*.ts" -o -name "*.md" -o -name "*.json" | \
     xargs sed -i '' 's/{{SERVICE_NAME}}/OpenAI/g'

   find . -name "*.ts" -o -name "*.md" -o -name "*.json" | \
     xargs sed -i '' 's/{{API_TOKEN_ENV_VAR}}/OPENAI_API_KEY/g'

   find . -name "*.ts" -o -name "*.md" -o -name "*.json" | \
     xargs sed -i '' 's/{{service-name}}/openai/g'

   find . -name "*.ts" -o -name "*.md" -o -name "*.json" | \
     xargs sed -i '' 's/{{service-domain}}/openai.com/g'
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

5. **Update tool implementations:**
   - Edit `src/tool-definitions.ts` to define your OpenAI tools
   - Edit `src/tools/` files to implement your tool functions
   - Update `src/index.ts` to wire up your tools

6. **Test the build:**
   ```bash
   npm run build
   npm test
   ```

## Template Structure

This template provides:

- **Comprehensive documentation**: Every file contains extensive tutorial comments
- **Type safety**: Full TypeScript support with strict mode
- **Atomic architecture**: Single responsibility principle for maintainability
- **Best practices**: Industry-standard patterns for MCP servers
- **Flexible configuration**: Environment-based configuration system
- **Testing framework**: Jest test suite with examples

## Key Files to Customize

1. **`src/types/api-types.ts`** - Define your API request/response types
2. **`src/utils/constants.ts`** - Configure API endpoints and defaults
3. **`src/tool-definitions.ts`** - Define your MCP tools and their schemas
4. **`src/tools/`** - Implement your tool functions
5. **`src/index.ts`** - Wire up tools in the main server
6. **`.env.example`** - Document required environment variables

## Next Steps

1. Follow the customization checklist in `CUSTOMIZATION_CHECKLIST.md`
2. Read the extensive documentation in `README.md`
3. Review the inline comments in each source file
4. Check the examples for different service types

The template is designed to work with any third-party API by following the customization patterns throughout the codebase.