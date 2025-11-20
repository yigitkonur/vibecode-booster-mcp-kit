import OpenAI from 'openai';
import type { DeepSearchParams } from '../schemas/deepsearch';
import type { JINAResponse } from '../types/api-types';
import { API_CONFIG } from '../utils/constants';

export async function makeApiRequest(params: DeepSearchParams): Promise<JINAResponse> {
  const openai = new OpenAI({
    baseURL: API_CONFIG.BASE_URL,
    apiKey: API_CONFIG.API_KEY,
    timeout: API_CONFIG.TIMEOUT_MS,
  });

  const { deep_research_question, ...restParams } = params;
  
  const response = await openai.chat.completions.create({
    model: API_CONFIG.MODEL,
    messages: [{ role: 'user', content: deep_research_question }],
    ...restParams,
  });

  return response as unknown as JINAResponse;
}
