import { Router, Request, Response } from 'express';
import { chat } from '../services/gemini';

const router = Router();

router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, language = 'en' } = req.body;
    
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }
    
    const response = await chat(message, language);
    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

export default router;
