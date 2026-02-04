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
    res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
