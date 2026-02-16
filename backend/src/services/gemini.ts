import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase';

// Lazy initialization helper for Gemini AI
function getGeminiAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

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

    // Extract potential drug names (remove common words in multiple languages)
    const commonWords = [
      // English
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

      // Chinese
      '告诉',
      '我',
      '关于',
      '是',
      '什么',
      '的',
      '药',
      '药物',

      // Korean
      '에',
      '대해',
      '알려주세요',
      '알려',
      '주세요',
      '는',
      '이',
      '가',
      '을',
      '를',

      // Spanish
      'cuéntame',
      'sobre',
      'qué',
      'es',
      'el',
      'la',
      'los',
      'las',
      'un',
      'una',
      'información',
      'medicamento',
      'medicina',

      // Italian
      'dimmi',
      'di',
      'che',
      'cos',
      'è',
      'il',
      'la',
      'lo',
      'i',
      'le',
      'gli',
      'un',
      'una',
      'informazioni',
      'farmaco',
      'medicina',
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

  const genAI = getGeminiAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Define multilingual "Tell me about" phrases
  const tellMeAboutPhrases = [
    'tell me about', // English
    '告诉我关于', // Chinese
    '에 대해 알려주세요', // Korean
    'cuéntame sobre', // Spanish
    'dimmi di', // Italian
  ];

  // Check if this is an initial "Tell me about" query
  const messageTrimmed = message.trim();
  const isInitialQuery = tellMeAboutPhrases.some((phrase) =>
    messageTrimmed.toLowerCase().startsWith(phrase.toLowerCase())
  );

  // Define valid keywords in multiple languages
  const validKeywords = [
    // English
    'counseling',
    'adverse effects',
    'side effects',
    'pregnancy precautions',
    'pregnancy',
    'children precautions',
    'children',
    'breastfeeding precautions',
    'breastfeeding',

    // Chinese
    '咨询',
    '用法',
    '不良反应',
    '副作用',
    '妊娠注意事项',
    '妊娠',
    '怀孕',
    '儿童注意事项',
    '儿童',
    '哺乳注意事项',
    '哺乳',

    // Korean
    '상담',
    '복용법',
    '부작용',
    '임신 주의사항',
    '임신',
    '어린이 주의사항',
    '어린이',
    '수유 주의사항',
    '수유',

    // Spanish
    'asesoramiento',
    'consejos',
    'efectos adversos',
    'efectos secundarios',
    'precauciones durante el embarazo',
    'embarazo',
    'precauciones para niños',
    'niños',
    'precauciones durante la lactancia',
    'lactancia',

    // Italian
    'consulenza',
    'consigli',
    'effetti avversi',
    'effetti collaterali',
    'precauzioni in gravidanza',
    'gravidanza',
    'precauzioni per bambini',
    'bambini',
    "precauzioni durante l'allattamento",
    'allattamento',
  ];

  // Check if user query contains valid keywords
  const messageLower = message.toLowerCase();
  const hasValidKeyword = validKeywords.some((keyword) =>
    messageLower.includes(keyword.toLowerCase())
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

    // Define keyword list for different languages
    const keywordListForPrompt: Record<string, string> = {
      English:
        'counseling, adverse effects, pregnancy precautions, children precautions, or breastfeeding precautions',
      Chinese:
        '咨询/用法、不良反应/副作用、妊娠注意事项、儿童注意事项或哺乳注意事项',
      Korean:
        '상담/복용법, 부작용, 임신 주의사항, 어린이 주의사항 또는 수유 주의사항',
      Spanish:
        'asesoramiento, efectos adversos, precauciones durante el embarazo, precauciones para niños o precauciones durante la lactancia',
      Italian:
        "consulenza, effetti avversi, precauzioni in gravidanza, precauzioni per bambini o precauzioni durante l'allattamento",
    };

    const keywordList =
      keywordListForPrompt[language] || keywordListForPrompt['English'];

    const prompt = `You are MedGuide Assistant. Provide a brief, clear explanation of what this medication is used for based on the INDICATIONS information below.

LANGUAGE: Respond in ${language}

DATABASE INFORMATION:
${drugData}

USER QUESTION: ${message}

Instructions:
- Explain what the medication is used for in a friendly, conversational way
- Keep it concise (2-3 sentences)
- Add this at the end: "If you'd like more information, you can ask about: ${keywordList}."`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  // For follow-up queries, check if they used valid keywords
  if (!hasValidKeyword) {
    // Return multilingual error message based on language
    const keywordMessages: Record<string, string> = {
      English:
        "I can only provide specific information when you use these keywords in your question:\n\n• Counseling (how to take the medication)\n• Adverse effects (side effects)\n• Pregnancy precautions\n• Children precautions\n• Breastfeeding precautions\n\nFor example, you can ask: 'What are the adverse effects?' or 'Tell me about pregnancy precautions.'",

      Chinese:
        "我只能在您的问题中使用这些关键词时提供具体信息：\n\n• 咨询/用法（如何服用药物）\n• 不良反应/副作用\n• 妊娠注意事项/怀孕\n• 儿童注意事项/儿童\n• 哺乳注意事项/哺乳\n\n例如，您可以问：'不良反应是什么？'或'告诉我关于妊娠注意事项'。",

      Korean:
        "다음 키워드를 질문에 사용할 때만 구체적인 정보를 제공할 수 있습니다:\n\n• 상담/복용법 (약물 복용 방법)\n• 부작용\n• 임신 주의사항/임신\n• 어린이 주의사항/어린이\n• 수유 주의사항/수유\n\n예를 들어: '부작용은 무엇인가요?' 또는 '임신 주의사항에 대해 알려주세요'라고 물어볼 수 있습니다.",

      Spanish:
        "Solo puedo proporcionar información específica cuando usa estas palabras clave en su pregunta:\n\n• Asesoramiento/consejos (cómo tomar el medicamento)\n• Efectos adversos/efectos secundarios\n• Precauciones durante el embarazo/embarazo\n• Precauciones para niños/niños\n• Precauciones durante la lactancia/lactancia\n\nPor ejemplo, puede preguntar: '¿Cuáles son los efectos adversos?' o 'Cuéntame sobre las precauciones durante el embarazo'.",

      Italian:
        "Posso fornire informazioni specifiche solo quando usi queste parole chiave nella tua domanda:\n\n• Consulenza/consigli (come assumere il farmaco)\n• Effetti avversi/effetti collaterali\n• Precauzioni in gravidanza/gravidanza\n• Precauzioni per bambini/bambini\n• Precauzioni durante l'allattamento/allattamento\n\nAd esempio, puoi chiedere: 'Quali sono gli effetti avversi?' o 'Dimmi delle precauzioni in gravidanza'.",
    };

    return keywordMessages[language] || keywordMessages['English'];
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
