import express from 'express';
import { getMyOrders, getOrderById } from '../controllers/orderController.js';
import { createCheckoutOrder } from '../controllers/paymentController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/checkout', optionalAuth, createCheckoutOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', optionalAuth, getOrderById);

export default router;
