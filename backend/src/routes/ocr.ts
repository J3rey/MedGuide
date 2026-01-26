import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';

const router = Router();

// Configure multer for file uploads (in-memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.post('/ocr', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Server configuration error: Missing API key' });
    }

    console.log('[OCR] Processing image:', req.file.originalname, req.file.size, 'bytes');

    // Convert buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';

    // Use gemini-2.5-flash model for vision
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Extract ONLY medication/drug names from this image. Look for drug names on medicine labels, packages, boxes, or prescriptions. 
Return each drug name on a new line, nothing else. Examples: Paracetamol, Ibuprofen, Aspirin, Amoxicillin. 
Do NOT include: dosages (500mg), forms (tablet), instructions, brand names mixed with other text. 
If you see 'Panadol 500mg tablets', return only 'Panadol'. 
If handwritten, do your best to read medication names only.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    console.log('[OCR] Extracted text:', text);

    res.json({ 
      success: true, 
      text: text.trim() 
    });

  } catch (error: any) {
    console.error('[OCR] Error:', error);
    res.status(500).json({ 
      error: 'OCR processing failed', 
      message: error.message 
    });
  }
});

export default router;
