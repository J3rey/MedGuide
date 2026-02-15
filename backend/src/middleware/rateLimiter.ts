import rateLimit from 'express-rate-limit';

// General API rate limiter: 100 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Chat endpoint rate limiter: 20 requests per minute (matching Gemini quota)
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: 'Too many chat requests, please wait before trying again.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for alarms: 30 requests per minute
export const alarmsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: 'Too many alarm operations, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});
