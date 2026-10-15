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
import adminRoutes from './routes/adminRoutes.js';
import { autoExpirePendingOrders } from './controllers/paymentController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Helper to check if an origin is a local network / private IP address (LAN, Wi-Fi, hotspot, mDNS)
const isLocalOrPrivateOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin);
    // Localhost, Loopback, mDNS
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.local')
    ) {
      return true;
    }
    // RFC 1918 Private IP Ranges & Hotspots:
    // 10.0.0.0/8, 172.16.0.0 - 172.31.255.255 (plus all 172.x subnets), 192.168.0.0/16
    if (
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^172\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};

// CORS Configuration (Allow frontend & handle credentials for httpOnly cookies)
const configuredOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((u) => u.trim())
  : [];

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...configuredOrigins,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // Allow configured origins, Vercel deployments, or local/LAN IPs for testing
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        isLocalOrPrivateOrigin(origin)
      ) {
        return callback(null, true);
      }

      console.warn(`[CORS Blocked]: Origin ${origin} not allowed`);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
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
app.use('/api/admin', adminRoutes);

// Root endpoint for status & friendly redirect
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'KurtiKatha API Server',
    message: 'API is running. Visit the storefront for shopping.',
    storefront: process.env.CLIENT_URL || 'https://kurtikatha.vercel.app',
    healthCheck: '/api/health',
  });
});

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
