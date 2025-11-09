import { Router, Request, Response } from 'express';
import { chat } from '../services/gemini';

const router = Router();

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, language = 'en' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const response = await chat(message, language);
    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

export default router;
