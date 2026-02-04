# MedGuide Database-Constrained Chatbot

## Overview

The MedGuide chatbot is a Gemini-powered AI assistant that **ONLY** provides medication information from the database. It will not use external knowledge or make up information.

## How It Works

### 1. **Database Search**
When a user asks a question, the system:
- Searches the `drugs` table for relevant medications
- Looks for matches in: drug name, counseling, indications, and adverse effects
- Returns up to 10 matching drugs

### 2. **Context-Constrained Prompt**
The chatbot receives:
- The user's question
- ONLY the drug information found in the database
- Strict instructions to not use external knowledge

### 3. **Safety Rules**
The AI is instructed to:
- ✅ Only answer based on database information
- ✅ Clearly state when information is not available
- ✅ Direct users to healthcare professionals for missing information
- ✅ Include disclaimers about consulting healthcare providers
- ❌ Never provide information from general knowledge
- ❌ Never make up or infer information

## API Endpoint

### POST /api/chat

**Request:**
```json
{
  "message": "What is aspirin used for?",
  "language": "en"
}
```

**Supported Languages:**
- `en` - English
- `es` - Spanish
- `zh` - Chinese
- `ko` - Korean
- `it` - Italian

**Response:**
```json
{
  "response": "Based on our database, I don't have information about aspirin. Please consult a healthcare professional for accurate medication information.",
  "language": "en",
  "timestamp": "2026-02-04T10:30:00.000Z"
}
```

## Example Interactions

### Example 1: Drug in Database
**User:** "What are the side effects of [Drug Name]?"

**Bot Response:** "According to our database, [Drug Name] has the following adverse effects: [lists from database]. Remember, this is for informational purposes only. Please consult your healthcare provider for personalized advice."

### Example 2: Drug NOT in Database
**User:** "Can I take ibuprofen with aspirin?"

**Bot Response:** "I don't have information about those medications in my database. Please consult a healthcare professional or pharmacist for advice about drug interactions."

### Example 3: General Medical Question
**User:** "What should I do if I have a headache?"

**Bot Response:** "I can only provide information about specific medications in our database. For general medical advice, please consult a healthcare professional."

## Database Schema

The chatbot accesses the following drug information:

```sql
drugs (
  id,
  drug_name,
  counseling,
  adverse_effects,
  indications,
  precautions_pregnancy,
  precautions_children,
  precautions_breastfeeding
)
```

## Testing the Chatbot

### Using curl:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me about acetaminophen",
    "language": "en"
  }'
```

### Using Postman or Insomnia:
1. Method: POST
2. URL: `http://localhost:3000/api/chat`
3. Headers: `Content-Type: application/json`
4. Body:
```json
{
  "message": "What medications are in the database?",
  "language": "en"
}
```

## Key Features

### ✅ Database-Only Responses
The chatbot will NEVER provide information that isn't in your database. This ensures:
- Accuracy and reliability
- Compliance with medical information regulations
- No hallucinations or made-up information

### ✅ Multi-Language Support
Responses are provided in the user's preferred language while still pulling from the English database.

### ✅ Smart Search
The search algorithm looks for matches across multiple fields:
- Drug names
- Counseling information
- Indications
- Adverse effects

### ✅ Safety First
Every response includes appropriate disclaimers and directs users to healthcare professionals when needed.

## Future Enhancements

1. **Semantic Search**: Use vector embeddings for better drug matching
2. **Conversation History**: Maintain context across multiple messages
3. **Drug Interactions**: Check for interactions between multiple drugs
4. **Personalized Responses**: Consider user's profile (age, pregnancy status, etc.)
5. **Citation**: Reference specific database entries in responses

## Troubleshooting

### Issue: Chatbot provides information not in database
**Solution**: Check the prompt constraints in `backend/src/services/gemini.ts`. The AI should be strictly instructed to only use provided data.

### Issue: No drugs found for common medications
**Solution**: Your database may need more entries. Add medications using the drugs API or import from a medication database.

### Issue: Responses are too generic
**Solution**: Ensure your database has detailed information in the counseling, adverse_effects, and indications fields.

## Security Considerations

1. **API Key Protection**: Never commit your `GEMINI_API_KEY` to version control
2. **Rate Limiting**: Consider adding rate limiting to prevent API abuse
3. **Input Validation**: The system validates all user inputs
4. **No PII Storage**: The current implementation doesn't store user queries (consider adding this for analytics)

## Compliance

This chatbot is designed to:
- Provide informational content only
- Always recommend consulting healthcare professionals
- Not provide personalized medical advice
- Only share information already in your controlled database

**Important**: This is an educational/informational tool and should not replace professional medical advice.
