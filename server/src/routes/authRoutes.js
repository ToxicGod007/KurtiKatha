import express from 'express';
import { register, login, logout, getMe, addOrUpdateAddress, toggleWishlist } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/address', protect, addOrUpdateAddress);
router.post('/wishlist/:productId', protect, toggleWishlist);

export default router;

