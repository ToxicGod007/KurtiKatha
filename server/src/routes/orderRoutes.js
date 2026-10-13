import express from 'express';
import { getMyOrders, getOrderById } from '../controllers/orderController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-orders', protect, getMyOrders);
router.get('/:id', optionalAuth, getOrderById);

export default router;
