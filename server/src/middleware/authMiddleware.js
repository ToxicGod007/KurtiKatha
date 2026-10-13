import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    // 1. Read token from httpOnly cookie or Authorization Bearer header
    let token = req.cookies?.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    // 2. Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kurtikatha_jwt_secret_dev_key_2026');

    // 3. Attach user to request
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User belonging to this token no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication session.' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kurtikatha_jwt_secret_dev_key_2026');
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (err) {
    // Continue as guest if token invalid
    next();
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required.' });
  }
  next();
};

