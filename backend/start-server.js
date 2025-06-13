const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('🚀 Starting MindCareAI Backend Server...');
console.log('📍 Current directory:', process.cwd());
console.log('🔑 OpenAI API Key present:', !!process.env.OPENAI_API_KEY);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('✅ Health check requested');
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('🧪 Test endpoint called');
  res.json({
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    openaiKey: process.env.OPENAI_API_KEY ? 'Present' : 'Missing'
  });
});

// Start server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎉 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
    server.listen(PORT + 1, '0.0.0.0');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});