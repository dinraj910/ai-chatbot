const express = require('express');
const cors = require('cors');
require('dotenv').config();

// DB — connect and initialize schema on startup
const { getDb } = require('./db/astraClient');
const { initSchema } = require('./db/schema');

// Import routes
const chatRoutes    = require('./routes/chatRoutes');
const sessionRoutes = require('./routes/sessionRoutes');

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
  const dbConnected = !!getDb();
  res.json({
    status: 'ok',
    message: 'Backend is running...✅✨',
    database: dbConnected ? '✅ Astra DB connected' : '⚠️  DB offline (add credentials to .env)',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', chatRoutes);
app.use('/api', sessionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  // Initialize Astra DB schema (non-blocking — app starts even if DB is offline)
  await initSchema();

  app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📍 API Base:           http://localhost:${PORT}/api`);
    console.log(`💬 Chat endpoint:      POST http://localhost:${PORT}/api/chat`);
    console.log(`📂 Sessions endpoint:  GET  http://localhost:${PORT}/api/sessions\n`);
  });
};

start().catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});