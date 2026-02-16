import express, { Application, Request, Response } from 'express';

const app: Application = express();
const PORT = parseInt(process.env.PORT || '10000', 10);

console.log('🔧 Creating ultra-minimal Express app...');
console.log(`📊 PORT from env: ${process.env.PORT}, using: ${PORT}`);

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

// Start server with detailed logging
console.log('🚀 Starting server...');
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server successfully started!`);
  console.log(`📍 Running on port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`📦 Process PID: ${process.pid}`);
});

// Handle server errors with detailed logging
server.on('error', (error: any) => {
  console.error('❌ Server error occurred:', error);
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);
});

server.on('close', () => {
  console.log('🔒 Server closed');
});

// Detailed process signal handling
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM signal received');
  console.log('📊 Server status:', server.listening ? 'listening' : 'not listening');
  console.log('🔄 Attempting graceful shutdown...');
  
  server.close((err) => {
    if (err) {
      console.error('❌ Error during shutdown:', err);
      process.exit(1);
    }
    console.log('✅ Graceful shutdown complete');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT signal received - manual interruption');
  process.exit(0);
});

// Catch any uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
