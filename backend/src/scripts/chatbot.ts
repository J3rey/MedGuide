import * as dotenv from 'dotenv';
import * as readline from 'readline';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

// Mock database with medication information
const medicationDatabase: Record<string, any> = {
  aspirin: {
    name: 'Aspirin',
    usage: 'Pain relief, fever reduction, anti-inflammatory',
    dosage: '325-650mg every 4-6 hours as needed',
    sideEffects: 'Stomach upset, heartburn, nausea, increased bleeding risk',
    counselling: 'Take with food or milk to reduce stomach upset. Take with a full glass of water. Do not lie down for 30 minutes after taking.',
    warnings: 'Do not use if allergic to aspirin or NSAIDs. Consult doctor if you have bleeding disorders.'
  },
  ibuprofen: {
    name: 'Ibuprofen',
    usage: 'Pain relief, fever reduction, inflammation',
    dosage: '200-400mg every 4-6 hours as needed',
    sideEffects: 'Stomach pain, heartburn, nausea, vomiting, gas, diarrhea, constipation, dizziness, headache',
    counselling: 'Take with food or milk. Do not exceed 1200mg in 24 hours without medical supervision.',
    warnings: 'May increase risk of heart attack or stroke. Avoid if you have kidney problems.'
  },
  acetaminophen: {
    name: 'Acetaminophen (Tylenol)',
    usage: 'Pain relief and fever reduction',
    dosage: '325-650mg every 4-6 hours, max 3000mg per day',
    sideEffects: 'Generally well-tolerated. Rare: allergic reactions, liver damage with overdose',
    counselling: 'Do not exceed recommended dose. Avoid alcohol while taking this medication.',
    warnings: 'Overdose can cause severe liver damage. Read labels carefully as many products contain acetaminophen.'
  }
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: '/gemini-2.5-flash' });

// Search database for medication info
function searchDatabase(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  // Find medication in database
  for (const [key, med] of Object.entries(medicationDatabase)) {
    if (lowerQuery.includes(key) || lowerQuery.includes(med.name.toLowerCase())) {
      // Determine what information the user is asking for
      if (lowerQuery.includes('dose') || lowerQuery.includes('dosage') || lowerQuery.includes('how much')) {
        return `${med.name} Dosage: ${med.dosage}`;
      } else if (lowerQuery.includes('side effect') || lowerQuery.includes('adverse')) {
        return `${med.name} Side Effects: ${med.sideEffects}`;
      } else if (lowerQuery.includes('warning') || lowerQuery.includes('caution')) {
        return `${med.name} Warnings: ${med.warnings}`;
      } else if (lowerQuery.includes('counsel') || lowerQuery.includes('how to take')) {
        return `${med.name} Counselling: ${med.counselling}`;
      } else if (lowerQuery.includes('use') || lowerQuery.includes('what is') || lowerQuery.includes('what does')) {
        return `${med.name} - Usage: ${med.usage}`;
      } else {
        // Return general info
        return `${med.name} Information:\n- Usage: ${med.usage}\n- Dosage: ${med.dosage}\n- Side Effects: ${med.sideEffects}`;
      }
    }
  }
  
  return 'No medication information found in database. Please ask about Aspirin, Ibuprofen, or Acetaminophen.';
}

async function chat(userMessage: string): Promise<string> {
  // First, search the database
  const dbInfo = searchDatabase(userMessage);
  
  // If no info found, provide helpful guidance
  if (dbInfo.includes('No medication information found')) {
    const prompt = `You are a helpful medical information assistant chatbot. A user asked: "${userMessage}"

Unfortunately, this information is not available in our database. 

Politely explain that:
1. You can only provide information from your database about Aspirin, Ibuprofen, and Acetaminophen
2. You can answer questions about: usage, dosage, side effects, warnings, and counselling information
3. Suggest they rephrase their question to ask about one of these medications

Be friendly, professional, and concise (2-3 sentences).`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
  
  // Use Gemini to format the database information in a friendly way
  const prompt = `You are a helpful medical information assistant. A user asked: "${userMessage}"

The database contains the following information:
${dbInfo}

Format this information in a clear, friendly, and professional response. Keep it concise (2-3 paragraphs maximum). Only use the information provided from the database - do not add external medical advice.`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  return text;
}

async function main() {
  console.log('='.repeat(70));
  console.log('🏥 MedGuide Chatbot - Medication Information Assistant');
  console.log('='.repeat(70));
  console.log('\nAvailable medications in database:');
  console.log('- Aspirin');
  console.log('- Ibuprofen');
  console.log('- Acetaminophen (Tylenol)');
  console.log('\nAsk me anything about these medications!');
  console.log('Type "exit" or "quit" to end the conversation.\n');
  console.log('='.repeat(70));
  console.log();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askQuestion = () => {
    rl.question('You: ', async (userInput) => {
      const input = userInput.trim();
      
      if (!input) {
        askQuestion();
        return;
      }
      
      if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
        console.log('\n👋 Thank you for using MedGuide Chatbot. Stay healthy!');
        rl.close();
        return;
      }
      
      try {
        console.log('\n🤖 Assistant: ');
        const response = await chat(input);
        console.log(response);
        console.log('\n' + '-'.repeat(70) + '\n');
      } catch (error: any) {
        console.error('❌ Error:', error.message);
        console.log();
      }
      
      askQuestion();
    });
  };

  askQuestion();
}

// Check API key before starting
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ ERROR: GEMINI_API_KEY not found in environment variables');
  console.log('Please add GEMINI_API_KEY to your .env file');
  process.exit(1);
}

main();