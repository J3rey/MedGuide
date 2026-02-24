import rateLimit from 'express-rate-limit';

// General API rate limiter: 500 requests per 15 minutes (increased for OCR scanning workflows)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { error: 'Rate limit exceeded', message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for OCR endpoints (they need rapid requests for scanning workflows)
    return req.path.includes('/ocr');
  },
});

// Chat endpoint rate limiter: 20 requests per minute (matching Gemini quota)
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: 'Rate limit exceeded', message: 'Too many chat requests, please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for alarms: 30 requests per minute
export const alarmsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { error: 'Rate limit exceeded', message: 'Too many alarm operations, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
