import { Router, Request, Response } from 'express';
import { chat } from '../services/gemini';

const router = Router();

/**
 * POST /chat
 * Database-constrained chatbot that only provides information from the medications database
 */
router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, language = 'en' } = req.body;
    
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    if (typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Message must be a non-empty string' });
      return;
    }

    // Validate language parameter
    const supportedLanguages = ['en', 'es', 'zh', 'ko', 'it'];
    const lang = supportedLanguages.includes(language) ? language : 'en';
    
    console.log(`Chat request: "${message.substring(0, 50)}..." in ${lang}`);
    
    const response = await chat(message, lang);
    
    res.json({ 
      response,
      language: lang,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat error:', error instanceof Error ? error.message : error);
    
    // Check for quota exceeded error
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage.includes('quota') || errorMessage.includes('429')) {
      res.status(429).json({ 
        response: "I'm currently experiencing high demand. The AI service has reached its daily limit. Please try again in a few hours, or consult your healthcare provider for immediate medication information.",
        error: 'quota_exceeded',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    res.status(500).json({ 
      error: 'Failed to process chat message',
      details: errorMessage || 'Unknown error'
    });
  }
});

export default router;
