import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import chatRoutes from './routes/chat';
import alarmRoutes from './routes/alarms';
import drugRoutes from './routes/drugs';
import ocrRoutes from './routes/ocr';
import { apiLimiter } from './middleware/rateLimiter';

const app: Application = express();

console.log('🔧 Initializing MedGuide API...');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(apiLimiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.send('MedGuide API is running!');
});

// API Routes
app.use('/api', chatRoutes);
app.use('/api', alarmRoutes);
app.use('/api', drugRoutes);
app.use('/api', ocrRoutes);

export default app;
