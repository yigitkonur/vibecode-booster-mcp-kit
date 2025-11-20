#!/usr/bin/env node

// Direct API test to verify OpenRouter connectivity
const OpenAI = require('openai').default;

async function testDirectAPI() {
  console.log('Testing direct OpenRouter API connection...\n');
  
  const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: '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',
    timeout: 30 * 60 * 1000, // 30 minutes
  });

  try {
    console.log('Making API request to OpenRouter with Perplexity Sonar Deep Research...\n');
    
    const response = await openai.chat.completions.create({
      model: 'perplexity/sonar-deep-research',
      messages: [
        { role: 'user', content: 'What is the capital city of Turkey?' }
      ],
    });

    console.log('\n=== SUCCESS ===\n');
    console.log('Response ID:', response.id);
    console.log('Model:', response.model);
    console.log('Created:', new Date(response.created * 1000).toISOString());
    console.log('\nContent:', response.choices[0].message.content);
    console.log('\nUsage:');
    console.log('  Prompt tokens:', response.usage?.prompt_tokens);
    console.log('  Completion tokens:', response.usage?.completion_tokens);
    console.log('  Total tokens:', response.usage?.total_tokens);
    
  } catch (error) {
    console.error('\n=== ERROR ===\n');
    console.error('Message:', error.message);
    console.error('Status:', error.status);
    console.error('Code:', error.code);
    console.error('Type:', error.type);
    console.error('\nError details:', error);
    
    if (error.response) {
      console.error('\nResponse status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testDirectAPI();
