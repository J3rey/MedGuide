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
      'it',

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

type DrugInfoType =
  | 'indications'
  | 'counseling'
  | 'adverse_effects'
  | 'pregnancy'
  | 'children'
  | 'breastfeeding';

const infoTypeMatchers: Array<{
  type: DrugInfoType;
  patterns: RegExp[];
}> = [
  {
    type: 'adverse_effects',
    patterns: [
      /\bside\s+effects?\b/i,
      /\badverse\s+(effects?|reactions?)\b/i,
      /\bbad\s+(effects?|reactions?)\b/i,
      /\bnegative\s+(effects?|reactions?)\b/i,
      /\bunwanted\s+(effects?|reactions?)\b/i,
      /\bcommon\s+(effects?|reactions?)\b/i,
      /\bwhat\s+can\s+happen\b/i,
      /\bmake\s+me\s+(feel\s+)?(sick|dizzy|nauseous|tired)\b/i,
      /\bnausea|vomiting|rash|dizziness|headache|diarrhea|constipation\b/i,
    ],
  },
  {
    type: 'counseling',
    patterns: [
      /\bhow\s+(do|should|can)\s+i\s+(take|use)\b/i,
      /\bhow\s+to\s+(take|use)\b/i,
      /\bwhen\s+(do|should|can)\s+i\s+(take|use)\b/i,
      /\bwith\s+(food|meals?|milk|water)\b/i,
      /\bwithout\s+(food|meals?)\b/i,
      /\bdos(e|age)\b/i,
      /\binstructions?\b/i,
      /\bdirections?\b/i,
      /\bhow\s+often\b/i,
      /\bhow\s+many\b/i,
      /\balcohol\b/i,
      /\bavoid\b/i,
      /\bstorage|store\b/i,
      /\bcounsel(l)?ing\b/i,
      /\bwhat\s+should\s+i\s+know\b/i,
    ],
  },
  {
    type: 'pregnancy',
    patterns: [
      /\bpregnan(cy|t)\b/i,
      /\bunborn\s+baby\b/i,
      /\bthird\s+trimester\b/i,
      /\bfirst\s+trimester\b/i,
      /\bsecond\s+trimester\b/i,
      /\bplanning\s+pregnancy\b/i,
      /\btrying\s+to\s+conceive\b/i,
    ],
  },
  {
    type: 'children',
    patterns: [
      /\bchildren\b/i,
      /\bchild\b/i,
      /\bkids?\b/i,
      /\binfants?\b/i,
      /\bbabies\b/i,
      /\bbaby\b/i,
      /\bteenagers?\b/i,
      /\bp(a)?ediatric\b/i,
      /\bunder\s+\d+\b/i,
      /\b\d+\s*(year|month)s?\s+old\b/i,
    ],
  },
  {
    type: 'breastfeeding',
    patterns: [
      /\bbreast\s*feeding\b/i,
      /\bbreastfeeding\b/i,
      /\bnursing\b/i,
      /\blactation\b/i,
      /\bbreast\s+milk\b/i,
      /\bnursing\s+infant\b/i,
    ],
  },
  {
    type: 'indications',
    patterns: [
      /\bwhat\s+is\s+(it|this)\s+for\b/i,
      /\bwhat\s+is\s+(it|this)\s+used\s+for\b/i,
      /\bused\s+to\s+(treat|help|reduce)\b/i,
      /\bwhat\s+does\s+(it|this)\s+(treat|do)\b/i,
      /\bwhy\s+(do|would|should)\s+i\s+(take|use)\b/i,
      /\bindications?\b/i,
      /\buses?\b/i,
      /\btreats?\b/i,
      /\bhelps?\s+with\b/i,
    ],
  },
];

function detectRequestedInfoType(message: string): DrugInfoType | null {
  for (const matcher of infoTypeMatchers) {
    if (matcher.patterns.some((pattern) => pattern.test(message))) {
      return matcher.type;
    }
  }

  return null;
}

function getDrugFieldValue(drug: Drug, infoType: DrugInfoType): string | null {
  switch (infoType) {
    case 'indications':
      return drug.indications;
    case 'counseling':
      return drug.counseling;
    case 'adverse_effects':
      return drug.adverse_effects;
    case 'pregnancy':
      return drug.precautions_pregnancy;
    case 'children':
      return drug.precautions_children;
    case 'breastfeeding':
      return drug.precautions_breastfeeding;
    default:
      return null;
  }
}

function getDrugInfoLabel(infoType: DrugInfoType): string {
  switch (infoType) {
    case 'indications':
      return 'Uses';
    case 'counseling':
      return 'How to take it';
    case 'adverse_effects':
      return 'Side effects';
    case 'pregnancy':
      return 'Pregnancy safety';
    case 'children':
      return 'Children safety';
    case 'breastfeeding':
      return 'Breastfeeding safety';
    default:
      return 'Medication information';
  }
}

function formatDirectDatabaseAnswer(
  drug: Drug,
  infoType: DrugInfoType
): string {
  const label = getDrugInfoLabel(infoType);
  const value = getDrugFieldValue(drug, infoType);

  if (!value) {
    return `${label} information for ${drug.drug_name} is not available in our database. Please consult your pharmacist or healthcare provider for accurate information.`;
  }

  return `${label} for ${drug.drug_name}:\n\n${value}\n\nThis information is from our database and is for informational purposes only. Please consult your pharmacist or healthcare provider for personalized medical advice.`;
}

/**
 * Chat with constrained database context
 */
export const chat = async (
  message: string,
  language: string = 'en',
  medications: string[] = []
): Promise<string> => {
  console.log('[Gemini Chat] User message:', message);
  console.log('[Gemini Chat] Language:', language);
  console.log('[Gemini Chat] Medication context:', medications);

  // Define multilingual "Tell me about" phrases
  const tellMeAboutPhrases = [
    'tell me about', // English
    '告诉我关于', // Chinese
    '에 대해 알려주세요', // Korean
    'cuéntame sobre', // Spanish
    'dimmi di', // Italian
    'beritahu saya tentang', // Indonesian
    'beritahu saya', // Indonesian
    'मुझे बताएं', // Hindi
    'के बारे में बताएं', // Hindi
  ];

  // Check if this is an initial "Tell me about" query
  const messageTrimmed = message.trim();
  const isInitialQuery = tellMeAboutPhrases.some((phrase) =>
    messageTrimmed.toLowerCase().startsWith(phrase.toLowerCase())
  );

  // Define valid keywords in multiple languages
  const validKeywords = [
    // English - expanded to catch more variations
    'counseling',
    'counsel',
    'how to take',
    'indication',
    'indications',
    'used for',
    'what is it for',
    'dosage',
    'dose',
    'adverse effects',
    'adverse affects',
    'side effects',
    'side affects',
    'effects',
    'affects',
    'pregnancy precautions',
    'pregnancy',
    'pregnant',
    'safe during pregnancy',
    'safe for pregnancy',
    'children precautions',
    'children',
    'kids',
    'pediatric',
    'safe for children',
    'breastfeeding precautions',
    'breastfeeding',
    'nursing',
    'lactation',
    'safe for breastfeeding',

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

    // Indonesian
    'konseling',
    'cara mengonsumsi',
    'cara minum',
    'efek samping',
    'efek buruk',
    'kehamilan',
    'hamil',
    'aman untuk kehamilan',
    'anak-anak',
    'anak',
    'aman untuk anak',
    'menyusui',
    'ibu menyusui',
    'aman untuk menyusui',

    // Hindi
    'परामर्श',
    'सलाह',
    'कैसे लें',
    'खुराक',
    'दुष्प्रभाव',
    'साइड इफेक्ट',
    'प्रभाव',
    'गर्भावस्था',
    'गर्भवती',
    'गर्भावस्था के लिए सुरक्षित',
    'बच्चे',
    'बच्चों',
    'बच्चों के लिए सुरक्षित',
    'स्तनपान',
    'दूध पिलाना',
    'स्तनपान के लिए सुरक्षित',
  ];

  // Check if user query contains valid keywords
  const messageLower = message.toLowerCase();
  const hasValidKeyword = validKeywords.some((keyword) =>
    messageLower.includes(keyword.toLowerCase())
  );

  const medicationContext = medications
    .map((medication) => medication.trim())
    .filter(Boolean)
    .join(' ');
  const hasMedicationContext = medicationContext.length > 0;

  // Search for relevant drugs in the database. Follow-up questions may omit
  // the drug name, so include the scanned/manual medication context.
  const searchQuery = medicationContext || message;
  const drugs = await searchDrugsInDatabase(searchQuery);

  console.log('[Gemini Chat] Database search returned', drugs.length, 'drugs');

  // If no drugs found
  if (drugs.length === 0) {
    return "I don't have information about that medication in my database. Please consult your pharmacist or healthcare provider for accurate information.";
  }

  const requestedInfoType = detectRequestedInfoType(message);
  if (requestedInfoType) {
    return formatDirectDatabaseAnswer(drugs[0], requestedInfoType);
  }

  // For initial queries, only show indications
  if (isInitialQuery) {
    const genAI = getGeminiAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const drugData = formatDrugData(drugs, 'indications');

    // Define keyword list for different languages
    const keywordListForPrompt: Record<string, string> = {
      English:
        "how to take it, side effects, if it's safe for pregnancy, for children, or for breastfeeding individuals",
      Chinese:
        '如何服用、副作用、怀孕期间是否安全、儿童是否安全或哺乳期间是否安全',
      Korean:
        '복용 방법, 부작용, 임신 중 안전성, 어린이 안전성 또는 수유 중 안전성',
      Spanish:
        'cómo tomarlo, efectos secundarios, si es seguro durante el embarazo, para niños o para personas en lactancia',
      Italian:
        'come assumerlo, effetti collaterali, se è sicuro in gravidanza, per bambini o per persone che allattano',
      Indonesian:
        'cara mengonsumsinya, efek samping, apakah aman untuk kehamilan, untuk anak-anak, atau untuk ibu menyusui',
      Hindi:
        'इसे कैसे लें, दुष्प्रभाव, क्या यह गर्भावस्था के लिए सुरक्षित है, बच्चों के लिए, या स्तनपान कराने वालों के लिए',
    };

    const keywordList =
      keywordListForPrompt[language] || keywordListForPrompt['English'];

    const prompt = `You are MedGuide Assistant. Provide a brief, clear explanation of what this medication is used for based STRICTLY on the INDICATIONS information below.

LANGUAGE: Respond in ${language}

DATABASE INFORMATION:
${drugData}

USER QUESTION: ${message}

CRITICAL RULES:
1. Use ONLY the information provided in the INDICATIONS field above
2. If INDICATIONS shows "Not available", respond: "The indication information is not available in our database. Please consult your pharmacist for information about what this medication is used for."
3. Do NOT add any medical advice, suggestions, or information not explicitly stated in the database
4. Explain what the medication is used for in a friendly, conversational way
5. Keep it concise (2-3 sentences)
6. Add this at the end: "If you'd like more information, you can ask about: ${keywordList}."`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  // For follow-up queries without scanned medication context, ask for a
  // medication-specific question. With context, allow Gemini to interpret the
  // question against the database row below.
  if (!hasValidKeyword && !hasMedicationContext) {
    // Return multilingual error message based on language
    const keywordMessages: Record<string, string> = {
      English:
        "I can only provide specific information about medications in the database when you ask about:\n\n• What the medication is used for\n• How to take the medication\n• Side effects\n• Safety for pregnancy\n• Safety for children\n• Safety for breastfeeding\n\nFor example, you can ask: 'What are the side effects?' or 'Is it safe during pregnancy?'",

      Chinese:
        "当您询问以下内容时，我只能提供数据库中药物的具体信息：\n\n• 如何服用药物\n• 副作用\n• 怀孕期间的安全性\n• 儿童的安全性\n• 哺乳期间的安全性\n\n例如，您可以问：'[药物名称]的副作用是什么？'或'[药物名称]在怀孕期间安全吗？'",

      Korean:
        "다음에 대해 질문할 때만 데이터베이스의 약물에 대한 구체적인 정보를 제공할 수 있습니다:\n\n• 약물 복용 방법\n• 부작용\n• 임신 중 안전성\n• 어린이 안전성\n• 수유 중 안전성\n\n예: '[약물명]의 부작용은 무엇인가요?' 또는 '[약물명]은 임신 중 안전한가요?'",

      Spanish:
        "Solo puedo proporcionar información específica sobre medicamentos en la base de datos cuando pregunta sobre:\n\n• Cómo tomar el medicamento\n• Efectos secundarios\n• Seguridad durante el embarazo\n• Seguridad para niños\n• Seguridad durante la lactancia\n\nPor ejemplo: '¿Cuáles son los efectos secundarios de [nombre del medicamento]?' o '¿Es seguro [nombre del medicamento] durante el embarazo?'",

      Italian:
        "Posso fornire informazioni specifiche sui farmaci nel database solo quando chiedi di:\n\n• Come assumere il farmaco\n• Effetti collaterali\n• Sicurezza in gravidanza\n• Sicurezza per bambini\n• Sicurezza durante l'allattamento\n\nAd esempio: 'Quali sono gli effetti collaterali di [nome del farmaco]?' o '[nome del farmaco] è sicuro in gravidanza?'",

      Indonesian:
        "Saya hanya dapat memberikan informasi spesifik tentang obat dalam database ketika Anda bertanya tentang:\n\n• Cara mengonsumsi obat\n• Efek samping\n• Keamanan untuk kehamilan\n• Keamanan untuk anak-anak\n• Keamanan untuk menyusui\n\nContoh: 'Apa efek samping dari [nama obat]?' atau 'Apakah [nama obat] aman selama kehamilan?'",

      Hindi:
        "मैं केवल डेटाबेस में दवाओं के बारे में विशिष्ट जानकारी प्रदान कर सकता हूं जब आप निम्नलिखित के बारे में पूछें:\n\n• दवा कैसे लें\n• दुष्प्रभाव\n• गर्भावस्था के लिए सुरक्षा\n• बच्चों के लिए सुरक्षा\n• स्तनपान के लिए सुरक्षा\n\nउदाहरण: '[दवा का नाम] के दुष्प्रभाव क्या हैं?' या 'क्या [दवा का नाम] गर्भावस्था के दौरान सुरक्षित है?'",
    };

    return keywordMessages[language] || keywordMessages['English'];
  }

  // For keyword-based queries, provide full information
  const drugData = formatDrugData(drugs, 'full');

  const prompt = `You are MedGuide Assistant. Answer the user's question using ONLY the information from the database below.

CRITICAL RULES:
1. ONLY provide information that is explicitly stated in the DATABASE INFORMATION section below
2. If any requested field shows "Not available", you MUST state: "This information is not available in our database. Please consult your pharmacist for details."
3. Do NOT make up, infer, or add ANY information that is not explicitly written in the database
4. Do NOT provide medical advice, suggestions, or recommendations beyond what is in the database
5. Focus on the specific aspect the user asked about (indications, counseling, adverse effects, pregnancy precautions, children precautions, or breastfeeding precautions)
6. Be concise and clear
7. Always end with: "This information is from our database and is for informational purposes only. Please consult your pharmacist or healthcare provider for personalized medical advice."

LANGUAGE: Respond in ${language}

DATABASE INFORMATION:
${drugData}

USER QUESTION: ${message}

Remember: If the specific information requested is "Not available" in the database, you must tell the user to consult their pharmacist instead of trying to provide general information.`;

  const genAI = getGeminiAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  console.log('[Gemini Chat] Response generated, length:', text.length);

  return text;
};
