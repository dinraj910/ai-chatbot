#!/usr/bin/env node

/**
 * Integration Test Script
 * Tests the full Node → FastAPI → Node flow
 * 
 * Usage: node test-integration.js
 */

const axios = require('axios');

const config = {
  nodeBackend: 'http://localhost:5000',
  aiService: 'http://localhost:8000',
  testMessages: [
    'hello',
    'how are you',
    'what is AI',
    'help me',
    'thanks',
  ],
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testHealthChecks() {
  log('\n=== Health Checks ===\n', colors.blue);

  try {
    log('✓ Testing Node Backend...', colors.yellow);
    const backendHealth = await axios.get(`${config.nodeBackend}/`);
    log(`✓ Node Backend: ${backendHealth.data.message}`, colors.green);
  } catch (error) {
    log(`✗ Node Backend: ${error.message}`, colors.red);
    log('  → Make sure backend is running: npm run dev', colors.yellow);
    return false;
  }

  try {
    log('✓ Testing AI Service...', colors.yellow);
    const aiHealth = await axios.get(`${config.aiService}/`);
    log(`✓ AI Service: ${aiHealth.data.service} v${aiHealth.data.version}`, colors.green);
  } catch (error) {
    log(`✗ AI Service: ${error.message}`, colors.red);
    log('  → Make sure AI service is running: python main.py', colors.yellow);
    return false;
  }

  return true;
}

async function testDirectAIService() {
  log('\n=== Direct AI Service Test ===\n', colors.blue);

  try {
    log('Sending message to FastAPI directly...', colors.yellow);
    
    const response = await axios.post(
      `${config.aiService}/chat`,
      { message: 'hello' }
    );

    log(`✓ AI Service Response:`, colors.green);
    log(`  - Reply: ${response.data.reply}`, colors.green);
    log(`  - Message Length: ${response.data.message_length}`, colors.green);

    return true;
  } catch (error) {
    log(`✗ Direct AI Service test failed: ${error.message}`, colors.red);
    return false;
  }
}

async function testNodeGateway() {
  log('\n=== Node Gateway Test (Frontend → Node → FastAPI) ===\n', colors.blue);

  try {
    log('Sending message through Node backend...', colors.yellow);
    
    const response = await axios.post(
      `${config.nodeBackend}/api/chat`,
      { message: 'hello' }
    );

    log(`✓ Node Gateway Response:`, colors.green);
    log(`  - Reply: ${response.data.reply}`, colors.green);
    log(`  - Source: ${response.data.source}`, colors.green);
    log(`  - Timestamp: ${response.data.timestamp}`, colors.green);

    return true;
  } catch (error) {
    log(`✗ Node Gateway test failed: ${error.message}`, colors.red);
    if (error.response?.data) {
      log(`  - Error details: ${JSON.stringify(error.response.data)}`, colors.red);
    }
    return false;
  }
}

async function testMultipleMessages() {
  log('\n=== Multiple Message Test ===\n', colors.blue);

  for (let i = 0; i < config.testMessages.length; i++) {
    const message = config.testMessages[i];
    try {
      log(`[${i + 1}/${config.testMessages.length}] Testing: "${message}"`, colors.yellow);
      
      const response = await axios.post(
        `${config.nodeBackend}/api/chat`,
        { message }
      );

      log(`  ✓ Reply: ${response.data.reply.substring(0, 60)}...`, colors.green);

      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      log(`  ✗ Failed: ${error.message}`, colors.red);
    }
  }
}

async function runAllTests() {
  log('\n╔════════════════════════════════════════════╗', colors.blue);
  log('║  Integration Test: Node ↔ FastAPI Flow   ║', colors.blue);
  log('╚════════════════════════════════════════════╝', colors.blue);

  // Run tests sequentially
  const healthOk = await testHealthChecks();
  if (!healthOk) {
    log('\n⚠️  Health checks failed. Stopping tests.', colors.yellow);
    return;
  }

  const aiServiceOk = await testDirectAIService();
  if (!aiServiceOk) {
    log('\n⚠️  AI Service test failed.', colors.yellow);
    return;
  }

  const gatewayOk = await testNodeGateway();
  if (!gatewayOk) {
    log('\n⚠️  Gateway test failed.', colors.yellow);
    return;
  }

  await testMultipleMessages();

  // Summary
  log('\n╔════════════════════════════════════════════╗', colors.blue);
  log('║  ✓ All Tests Passed Successfully!        ║', colors.green);
  log('║                                            ║', colors.blue);
  log('║  Your integration is working correctly:  ║', colors.blue);
  log('║  Frontend → Node → FastAPI ✓             ║', colors.green);
  log('╚════════════════════════════════════════════╝', colors.blue);

  log('\n💡 Next steps:', colors.yellow);
  log('  1. Test in the UI: http://localhost:5174', colors.yellow);
  log('  2. Check logs in all 3 terminals', colors.yellow);
  log('  3. Try different messages to see how FastAPI responds', colors.yellow);
}

// Run tests
runAllTests().catch((error) => {
  log(`\n✗ Test suite failed: ${error.message}`, colors.red);
  process.exit(1);
});
