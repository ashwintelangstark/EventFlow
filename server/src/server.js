import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import registrationRoutes from './routes/registrations.js';
import announcementRoutes from './routes/announcements.js';
import eventflowRoutes from './routes/eventflow.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticLandingPath = path.join(__dirname, '../../static');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve Static Landing Page
app.use('/landing', express.static(staticLandingPath));
app.use('/static', express.static(staticLandingPath));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'EventFlow API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/eventflow', eventflowRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 EventFlow Server running on http://localhost:${PORT}`);
  console.log(`🔌 API Health: http://localhost:${PORT}/api/health`);
});
