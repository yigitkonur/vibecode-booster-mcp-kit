import type { LLMConfig } from '../config/index.js';

interface ProcessContentRequest {
  content: string;
  instruction: string | undefined;
  maxRetries: number | undefined;
  timeout: number | undefined;
}

interface ProcessContentResult {
  success: boolean;
  processedContent?: string;
  error?: string;
}

export class LLMService {
  private configs: LLMConfig[];
  private currentConfigIndex: number = 0;

  constructor(configs: LLMConfig[]) {
    this.configs = configs;
  }

  async processContent(request: ProcessContentRequest): Promise<ProcessContentResult> {
    const { content, instruction, maxRetries = 3, timeout = 300000 } = request;

    if (!content || content.trim().length === 0) {
      return { success: false, error: 'Empty content provided' };
    }

    const prompt = instruction
      ? `Extract and clean the following content. Focus on: ${instruction}\n\nContent:\n${content}`
      : `Clean and extract the main content from the following text, removing navigation, ads, and irrelevant elements:\n\n${content}`;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const config = this.configs[this.currentConfigIndex % this.configs.length];
        
        if (!config) {
          throw new Error('No LLM configuration available');
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(`${config.baseURL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            model: config.model,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: 4000,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          throw new Error(`LLM API error: ${response.status} ${errorText}`);
        }

        const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
        const processedContent = data.choices?.[0]?.message?.content;

        if (processedContent) {
          return { success: true, processedContent };
        }

        throw new Error('No content in LLM response');
      } catch (error) {
        if (attempt === maxRetries - 1) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }

        // Try next config on failure
        this.currentConfigIndex++;
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    return { success: false, error: 'All LLM processing attempts failed' };
  }
}
