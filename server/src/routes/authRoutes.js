import express from 'express';
import { 
  register, 
  login, 
  logout, 
  getMe, 
  addOrUpdateAddress, 
  toggleWishlist,
  sendPhoneOtp,
  verifyPhoneOtp,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Phone OTP Authentication (Primary Customer Signup & Login)
router.post('/send-otp', sendPhoneOtp);
router.post('/verify-otp', verifyPhoneOtp);

// Standard Email/Password routes (Admin & legacy credentials)
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected Customer Profile & Address routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/address', protect, addOrUpdateAddress);
router.post('/wishlist/:productId', protect, toggleWishlist);

export default router;

