import express from 'express';
import { verifyPayment, handleWebhook, issueRefund } from '../controllers/paymentController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/verify', verifyPayment);
router.post('/webhook', handleWebhook);
router.post('/refund/:orderId', protect, requireAdmin, issueRefund);

export default router;
