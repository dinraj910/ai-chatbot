const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running...✅✨',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', chatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

const PORT = process.env.PORT || 5000;

try {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📍 API Base: http://localhost:${PORT}/api`);
    console.log(`💬 Chat endpoint: POST http://localhost:${PORT}/api/chat\n`);
  });
} catch (error) {
  console.error('❌ Error starting server:', error);
  process.exit(1);
}