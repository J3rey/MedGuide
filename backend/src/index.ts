import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import chatRoutes from './routes/chat';
// import alarmRoutes from './routes/alarms';
// import drugRoutes from './routes/drugs';
// import ocrRoutes from './routes/ocr';
// import { apiLimiter } from './middleware/rateLimiter';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Temporarily removed rate limiting for debugging
// app.use('/api', apiLimiter);

// Health check endpoint - must be simple and fast
app.get('/health', (req: Request, res: Response) => {
  console.log('🔍 Health check requested from:', req.ip);
  res.status(200).send('OK');
});

// Simple test endpoint 
app.get('/', (req: Request, res: Response) => {
  console.log('🏠 Root endpoint requested');
  res.send('MedGuide API is running!');
});

// API Routes - temporarily commented out for debugging
// app.use('/api', chatRoutes);
// app.use('/api', alarmRoutes);
// app.use('/api', drugRoutes);
// app.use('/api', ocrRoutes);

// Test endpoint for debugging
app.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Test endpoint working' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Accessible at: http://0.0.0.0:${PORT}`);
  console.log(`🏥 Health check at: http://0.0.0.0:${PORT}/health`);
});

// Handle server errors
server.on('error', (error: any) => {
  console.error('❌ Server error:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
