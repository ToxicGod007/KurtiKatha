import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { autoExpirePendingOrders } from './controllers/paymentController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers
app.use(helmet());

// CORS Configuration (Allow frontend & handle credentials for httpOnly cookies)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Cookie Parser
app.use(cookieParser());

// Raw Body parser for Razorpay Webhook signature verification (MUST be before express.json)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Standard JSON & URL-Encoded parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Sanitize
app.use(mongoSanitize());

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', generalLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Health Check Endpoint (Render requirement)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'KurtiKatha API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('[API Error]:', err.message || err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start Server if not imported by tests
if (process.env.NODE_ENV !== 'test') {
  connectDB();
  app.listen(PORT, () => {
    console.log(`[KurtiKatha Server] Running on http://localhost:${PORT}`);
  });

  // Background job to clean up stale pending orders every 10 minutes
  setInterval(autoExpirePendingOrders, 10 * 60 * 1000);
}

export default app;
