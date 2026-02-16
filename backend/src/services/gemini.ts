import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface Drug {
  id: number;
  drug_name: string;
  counseling: string | null;
  adverse_effects: string | null;
  indications: string | null;
  precautions_pregnancy: string | null;
  precautions_children: string | null;
  precautions_breastfeeding: string | null;
}

/**
 * Search for drugs in the database based on the user's query
 */
async function searchDrugsInDatabase(query: string): Promise<Drug[]> {
  try {
    console.log('[Gemini] Searching database for:', query);

    // Clean and prepare search query
    const searchTerm = query.toLowerCase().trim();

    // Extract potential drug names (remove common words)
    const commonWords = [
      'tell',
      'me',
      'about',
      'what',
      'is',
      'the',
      'a',
      'an',
      'for',
      'information',
      'on',
      'drug',
      'medication',
      'medicine',
    ];
    const keywords = searchTerm
      .split(/\s+/)
      .filter((word) => !commonWords.includes(word) && word.length > 2);

    console.log('[Gemini] Search keywords:', keywords);

    // Search using fuzzy matching and keywords
    const { data, error } = await supabase
      .from('drugs')
      .select('*')
      .or(
        keywords
          .map(
            (kw) =>
              `drug_name.ilike.%${kw}%,counseling.ilike.%${kw}%,indications.ilike.%${kw}%,adverse_effects.ilike.%${kw}%`
          )
          .join(',')
      )
      .limit(10);

    if (error) {
      console.error('[Gemini] Database search error:', error);
      return [];
    }

    console.log('[Gemini] Found', data?.length || 0, 'drugs');
    if (data && data.length > 0) {
      console.log(
        '[Gemini] Drug names:',
        data.map((d) => d.drug_name).join(', ')
      );
    }

    return data || [];
  } catch (error) {
    console.error('[Gemini] Error searching drugs:', error);
    return [];
  }
}

/**
 * Format drug data for the AI prompt
 */
function formatDrugData(
  drugs: Drug[],
  infoType: 'indications' | 'full' = 'full'
): string {
  if (drugs.length === 0) {
    return 'No medication information found in the database.';
  }

  if (infoType === 'indications') {
    // Only show indications (what the medication is used for)
    return drugs
      .map(
        (drug) => `
MEDICATION: ${drug.drug_name}
INDICATIONS (What it's used for): ${drug.indications || 'Not available'}
---`
      )
      .join('\n');
  }

  // Full information
  return drugs
    .map(
      (drug) => `
MEDICATION: ${drug.drug_name}
ID: ${drug.id}
INDICATIONS: ${drug.indications || 'Not available'}
COUNSELING: ${drug.counseling || 'Not available'}
ADVERSE EFFECTS: ${drug.adverse_effects || 'Not available'}
PREGNANCY PRECAUTIONS: ${drug.precautions_pregnancy || 'Not available'}
CHILDREN PRECAUTIONS: ${drug.precautions_children || 'Not available'}
BREASTFEEDING PRECAUTIONS: ${drug.precautions_breastfeeding || 'Not available'}
---`
    )
    .join('\n');
}

/**
 * Chat with constrained database context
 */
export const chat = async (
  message: string,
  language: string = 'en'
): Promise<string> => {
  console.log('[Gemini Chat] User message:', message);
  console.log('[Gemini Chat] Language:', language);

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Check if this is an initial "Tell me about" query
  const isInitialQuery = /^tell me about/i.test(message.trim());

  // Define valid keywords for specific information
  const validKeywords = [
    'counseling',
    'adverse effects',
    'side effects',
    'pregnancy precautions',
    'pregnancy',
    'children precautions',
    'children',
    'breastfeeding precautions',
    'breastfeeding',
  ];

  // Check if user query contains valid keywords
  const messageLower = message.toLowerCase();
  const hasValidKeyword = validKeywords.some((keyword) =>
    messageLower.includes(keyword)
  );

  // Search for relevant drugs in the database
  const drugs = await searchDrugsInDatabase(message);

  console.log('[Gemini Chat] Database search returned', drugs.length, 'drugs');

  // If no drugs found
  if (drugs.length === 0) {
    return "I don't have information about that medication in my database. Please consult a healthcare professional.";
  }

  // For initial queries, only show indications
  if (isInitialQuery) {
    const drugData = formatDrugData(drugs, 'indications');

    const prompt = `You are MedGuide Assistant. Provide a brief, clear explanation of what this medication is used for based on the INDICATIONS information below.

LANGUAGE: Respond in ${language}

DATABASE INFORMATION:
${drugData}

USER QUESTION: ${message}

Instructions:
- Explain what the medication is used for in a friendly, conversational way
- Keep it concise (2-3 sentences)
- Add this at the end: "If you'd like more information, you can ask about: counseling, adverse effects, pregnancy precautions, children precautions, or breastfeeding precautions."`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  // For follow-up queries, check if they used valid keywords
  if (!hasValidKeyword) {
    return "I can only provide specific information when you use these keywords in your question:\n\n• Counseling (how to take the medication)\n• Adverse effects (side effects)\n• Pregnancy precautions\n• Children precautions\n• Breastfeeding precautions\n\nFor example, you can ask: 'What are the adverse effects?' or 'Tell me about pregnancy precautions.'";
  }

  // For keyword-based queries, provide full information
  const drugData = formatDrugData(drugs, 'full');

  const prompt = `You are MedGuide Assistant. Answer the user's question using ONLY the information from the database below.

CRITICAL RULES:
1. Only provide information that is explicitly in the DATABASE INFORMATION section
2. Focus on the specific aspect the user asked about (counseling, adverse effects, pregnancy precautions, children precautions, or breastfeeding precautions)
3. Be concise and clear
4. Always add a disclaimer: "This is for informational purposes only. Please consult your healthcare provider."

LANGUAGE: Respond in ${language}

DATABASE INFORMATION:
${drugData}

USER QUESTION: ${message}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  console.log('[Gemini Chat] Response generated, length:', text.length);

  return text;
};
