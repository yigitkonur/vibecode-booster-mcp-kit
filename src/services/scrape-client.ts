import axios from 'axios';
import type { DeepSearchParams } from '../schemas/deepsearch';
import type { JINAResponse } from '../types/api-types';
import { API_CONFIG } from '../utils/constants';
import { validateEnvVar } from '../utils/validators';

export async function makeApiRequest(params: DeepSearchParams): Promise<JINAResponse> {
  const apiKey = validateEnvVar('JINA_API_KEY');

  const { deep_research_question, ...restParams } = params;
  const payload = {
    model: 'jina-deepsearch-v1',
    messages: [{ role: 'user', content: deep_research_question }],
    ...restParams,
  };

  const response = await axios.post(API_CONFIG.BASE_URL, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    timeout: API_CONFIG.TIMEOUT_MS, // 30 minutes max timeout
  });

  return response.data as JINAResponse;
}
