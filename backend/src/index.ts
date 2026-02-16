import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat';
import alarmRoutes from './routes/alarms';
import drugRoutes from './routes/drugs';
import ocrRoutes from './routes/ocr';
import { apiLimiter } from './middleware/rateLimiter';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'MedGuide API is running' });
});

// API Routes
app.use('/api', chatRoutes);
app.use('/api', alarmRoutes);
app.use('/api', drugRoutes);
app.use('/api', ocrRoutes);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Accessible at: http://0.0.0.0:${PORT}`);
});
