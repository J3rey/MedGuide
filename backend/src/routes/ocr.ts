import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';

const router = Router();

// Note: Using global API limiter only (no OCR-specific limiter)

// Configure multer for file uploads (in-memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Helper to get Gemini AI instance
function getGeminiAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// OCR endpoint for JSON-based requests (from mobile app)
router.post('/ocr/extract', async (req: Request, res: Response) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res
        .status(500)
        .json({ error: 'Server configuration error: Missing API key' });
    }

    console.log('[OCR Extract] Processing base64 image, length:', image.length);

    // Use gemini-1.5-flash model for vision
    const genAI = getGeminiAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Extract ONLY medication/drug names from this image. Look for drug names on medicine labels, packages, boxes, or prescriptions. 
Return each drug name on a new line, nothing else. 
Do NOT include: dosages (500mg), forms (tablet, capsule), instructions, or other text. 
Extract only the primary drug or brand name. For example, if you see 'Drug Name 500mg tablets', return only 'Drug Name'. 
If handwritten, do your best to read medication names only.`;

    console.log('[OCR Extract] Calling Gemini API...');
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: image,
        },
      },
    ]);

    console.log('[OCR Extract] Got response from Gemini');
    const response = await result.response;
    const text = response.text();

    console.log('[OCR Extract] Extracted text:', text);

    res.json({
      success: true,
      text: text.trim(),
    });
  } catch (error) {
    console.error('[OCR Extract] Error:', error);
    const errorObj = error as { response?: unknown; status?: unknown; message?: string };

    // Log full error for debugging
    if (errorObj.response) {
      console.error('[OCR Extract] Gemini API Response:', errorObj.response);
    }
    if (errorObj.status) {
      console.error('[OCR Extract] Error status:', errorObj.status);
    }

    // Check for Gemini API rate limit errors
    const errorMessage = error instanceof Error ? error.message : '';
    const errorString = JSON.stringify(errorObj);

    if (
      errorMessage.includes('quota') ||
      errorMessage.includes('429') ||
      errorMessage.includes('Resource has been exhausted') ||
      errorString.includes('RESOURCE_EXHAUSTED') ||
      errorObj.status === 429
    ) {
      console.error('[OCR Extract] Gemini API quota exceeded');
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message:
          'The AI vision service has reached its limit. Please try again in a few moments.',
      });
    }

    // Check for invalid API key
    if (
      errorMessage.includes('API key') ||
      errorMessage.includes('invalid') ||
      errorObj.status === 400
    ) {
      console.error('[OCR Extract] API key issue');
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Server configuration issue. Please contact support.',
      });
    }

    res.status(500).json({
      error: 'OCR processing failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post(
  '/ocr/upload',
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res
          .status(500)
          .json({ error: 'Server configuration error: Missing API key' });
      }

      const fileData = req.file;

      if (!fileData) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      console.log(
        '[OCR] Processing image:',
        fileData.originalname,
        fileData.size,
        'bytes'
      );

      // Convert buffer to base64
      const base64Image = fileData.buffer.toString('base64');
      const mimeType = fileData.mimetype || 'image/jpeg';

      // Use gemini-1.5-flash model for vision
      const genAI = getGeminiAI();
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Extract ONLY medication/drug names from this image. Look for drug names on medicine labels, packages, boxes, or prescriptions. 
Return each drug name on a new line, nothing else. 
Do NOT include: dosages (500mg), forms (tablet, capsule), instructions, or other text. 
Extract only the primary drug or brand name. For example, if you see 'Drug Name 500mg tablets', return only 'Drug Name'. 
If handwritten, do your best to read medication names only.`;

      console.log('[OCR Upload] Calling Gemini API...');
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType,
            data: base64Image,
          },
        },
      ]);

      console.log('[OCR Upload] Got response from Gemini');
      const response = await result.response;
      const text = response.text();

      console.log('[OCR] Extracted text:', text);

      res.json({
        success: true,
        text: text.trim(),
      });
    } catch (error) {
      console.error('[OCR Upload] Error:', error);
      const errorObj = error as { response?: unknown; status?: unknown; message?: string };

      // Log full error for debugging
      if (errorObj.response) {
        console.error('[OCR Upload] Gemini API Response:', errorObj.response);
      }
      if (errorObj.status) {
        console.error('[OCR Upload] Error status:', errorObj.status);
      }

      // Check for Gemini API rate limit errors
      const errorMessage = error instanceof Error ? error.message : '';
      const errorString = JSON.stringify(errorObj);

      if (
        errorMessage.includes('quota') ||
        errorMessage.includes('429') ||
        errorMessage.includes('Resource has been exhausted') ||
        errorString.includes('RESOURCE_EXHAUSTED') ||
        errorObj.status === 429
      ) {
        console.error('[OCR Upload] Gemini API quota exceeded');
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message:
            'The AI vision service has reached its limit. Please try again in a few moments.',
        });
      }

      // Check for invalid API key
      if (
        errorMessage.includes('API key') ||
        errorMessage.includes('invalid') ||
        errorObj.status === 400
      ) {
        console.error('[OCR Upload] API key issue');
        return res.status(500).json({
          error: 'Configuration error',
          message: 'Server configuration issue. Please contact support.',
        });
      }

      res.status(500).json({
        error: 'OCR processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
