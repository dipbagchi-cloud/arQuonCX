import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ENV } from './config/env';
import apiRouter from './routes/api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json());

// Request logger in development
if (ENV.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      console.log(`[API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${Date.now() - start}ms)`);
    });
    next();
  });
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'arQuonCX Enterprise CS & Growth Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount API v1
app.use('/api/v1', apiRouter);

// Serve static frontend assets in production / container
const distPath = path.resolve(__dirname, '../../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Catch-all SPA fallback for client-side routing in Express 5
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.originalUrl.startsWith('/api') && !req.originalUrl.startsWith('/health')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

app.listen(ENV.PORT, () => {
  console.log(`🚀 arQuonCX Backend API Server running at http://localhost:${ENV.PORT}`);
  console.log(`📊 Health check: http://localhost:${ENV.PORT}/health`);
  console.log(`🛡️  RBAC Protected endpoints: http://localhost:${ENV.PORT}/api/v1`);
});
