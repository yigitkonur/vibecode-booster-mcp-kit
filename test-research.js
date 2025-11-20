#!/usr/bin/env node

// Simple test script to verify the deep research functionality
const { performGenericResearch } = require('./dist/tools/generic-research-tool');

async function testResearch() {
  console.log('Starting deep research test with Perplexity Sonar...\n');
  
  const params = {
    research_question: 'What is the capital city of Turkey? Please provide a direct answer with the city name.',
  };

  const logger = async (level, message, sessionId) => {
    console.log(`[${level.toUpperCase()}] [${sessionId}] ${message}`);
  };

  try {
    const result = await performGenericResearch(params, {
      sessionId: 'test-session',
      logger,
    });

    console.log('\n=== RESEARCH RESULT ===\n');
    console.log('Content:', result.content);
    console.log('\n=== STRUCTURED CONTENT ===\n');
    console.log(JSON.stringify(result.structuredContent, null, 2));
  } catch (error) {
    console.error('\n=== ERROR DETAILS ===\n');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Response Status:', error.response?.status);
    console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Full Error:', error);
  }
}

testResearch();
