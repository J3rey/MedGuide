import { Router, Request, Response } from 'express';
import { chat } from '../services/gemini';
import { validate } from '../middleware/validation';
import { chatMessageSchema } from '../validators/schemas';
import { chatLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * POST /chat
 * Database-constrained chatbot that only provides information from the medications database
 */
router.post('/chat', chatLimiter, validate(chatMessageSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, language = 'en' } = req.body;
    
    const response = await chat(message, language);
    
    res.json({ 
      response,
      language,
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
