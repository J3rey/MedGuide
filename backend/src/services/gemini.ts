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
    const commonWords = ['tell', 'me', 'about', 'what', 'is', 'the', 'a', 'an', 'for', 'information', 'on', 'drug', 'medication','medicine'];
    const keywords = searchTerm
      .split(/\s+/)
      .filter(word => !commonWords.includes(word) && word.length > 2);
    
    console.log('[Gemini] Search keywords:', keywords);
    
    // Search using fuzzy matching and keywords
    const { data, error } = await supabase
      .from('drugs')
      .select('*')
      .or(
        keywords.map(kw => 
          `drug_name.ilike.%${kw}%,counseling.ilike.%${kw}%,indications.ilike.%${kw}%,adverse_effects.ilike.%${kw}%`
        ).join(',')
      )
      .limit(10);

    if (error) {
      console.error('[Gemini] Database search error:', error);
      return [];
    }

    console.log('[Gemini] Found', data?.length || 0, 'drugs');
    if (data && data.length > 0) {
      console.log('[Gemini] Drug names:', data.map(d => d.drug_name).join(', '));
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
function formatDrugData(drugs: Drug[]): string {
  if (drugs.length === 0) {
    return 'No medication information found in the database.';
  }

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

  // Search for relevant drugs in the database
  const drugs = await searchDrugsInDatabase(message);
  const drugData = formatDrugData(drugs);
  
  console.log('[Gemini Chat] Database search returned', drugs.length, 'drugs');

  // Create a strict prompt that constrains the AI to only use database information
  const prompt = `You are MedGuide Assistant, a medication information chatbot. Your role is to help users understand their medications based ONLY on information from our database.

CRITICAL RULES:
1. You can ONLY provide information that is explicitly present in the DATABASE INFORMATION section below
2. If the database does not contain information about a medication the user asks about, you MUST say: "I don't have information about that medication in my database. Please consult a healthcare professional."
3. NEVER provide medical information from your general knowledge
4. NEVER make up or infer information that isn't in the database
5. Always include a disclaimer that this is for informational purposes only and they should consult healthcare professionals
6. If the user asks about drug interactions, side effects, or specific medical advice that isn't in the database, direct them to consult a healthcare professional

LANGUAGE: Respond in ${language}

DATABASE INFORMATION:
${drugData}

USER QUESTION: ${message}

Remember: Answer ONLY based on the database information above. If the information isn't there, say so clearly.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  console.log('[Gemini Chat] Response generated, length:', text.length);

  return text;
};
