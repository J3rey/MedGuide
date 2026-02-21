import 'dotenv/config';
import app from './app';

const PORT = parseInt(process.env.PORT || '10000', 10);

console.log('🔧 Starting MedGuide API...');
console.log(`📊 PORT from env: ${process.env.PORT}, using: ${PORT}`);

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
