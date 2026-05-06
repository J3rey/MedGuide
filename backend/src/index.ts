import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import chatRoutes from './routes/chat';
import alarmRoutes from './routes/alarms';
import drugRoutes from './routes/drugs';
import ocrRoutes from './routes/ocr';
import profileRoutes from './routes/profiles';
import caregiverRoutes from './routes/caregivers';
import emergencyRoutes from './routes/emergency';
import medicationRoutes from './routes/medications';
import { apiLimiter } from './middleware/rateLimiter';

const app: Application = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

console.log('🔧 Starting MedGuide API...');
console.log(`📊 PORT from env: ${process.env.PORT}, using: ${PORT}`);

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
app.use('/api', profileRoutes);
app.use('/api', caregiverRoutes);
app.use('/api', emergencyRoutes);
app.use('/api', medicationRoutes);

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
