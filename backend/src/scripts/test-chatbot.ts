/**
 * Test script for the database-constrained chatbot
 * Run this after starting the backend server
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api/chat';

async function testChat(message: string, language = 'en') {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: "${message}"`);
  console.log(`Language: ${language}`);
  console.log('='.repeat(60));
  
  try {
    const response = await axios.post(API_URL, {
      message,
      language
    });
    
    console.log('\n✅ Response:');
    console.log(response.data.response);
    console.log(`\nTimestamp: ${response.data.timestamp}`);
  } catch (error: any) {
    console.error('\n❌ Error:');
    console.error(error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🧪 Starting Chatbot Tests...\n');
  
  // Test 1: Query for a drug that might be in database
  await testChat('What is acetaminophen used for?', 'en');
  
  // Test 2: Query in Spanish
  await testChat('¿Cuáles son los efectos secundarios del paracetamol?', 'es');
  
  // Test 3: Query for multiple drugs
  await testChat('Tell me about any pain medications in the database', 'en');
  
  // Test 4: Query for drug not in database (should refuse politely)
  await testChat('What is the dosage for aspirin?', 'en');
  
  // Test 5: General medical question (should redirect to healthcare professional)
  await testChat('I have a headache, what should I take?', 'en');
  
  // Test 6: Query in Chinese
  await testChat('数据库中有哪些药物？', 'zh');
  
  console.log('\n\n✨ Tests completed!\n');
}

// Run tests
runTests().catch(console.error);
