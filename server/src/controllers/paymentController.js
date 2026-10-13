import crypto from 'crypto';
import { Order } from '../models/Order.js';
import { Settings } from '../models/Settings.js';
import { getRazorpayClient } from '../config/razorpay.js';
import { calculateOrderPricing } from '../services/pricingService.js';
import { decrementStock, restoreStock } from '../services/stockService.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';

export const createCheckoutOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, guestInfo, couponCode, paymentMethod = 'razorpay' } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Please add items to your cart before checkout.' });
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.pincode || !shippingAddress.addressLine) {
      return res.status(400).json({ success: false, message: 'Please complete all required shipping address fields.' });
    }

    // 1. Recompute all prices from DB (Never trust client prices) & validate stock
    const { verifiedItems, amounts, coupon } = await calculateOrderPricing({ items, couponCode });

    // 2. Fetch store settings
    const settings = (await Settings.findOne()) || { codEnabled: true };

    if (paymentMethod === 'cod' && !settings.codEnabled) {
      return res.status(400).json({ success: false, message: 'Cash on Delivery is currently disabled by store admin.' });
    }

    // 3. Generate unique human-readable order number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `KK-${dateStr}-${randomDigits}`;

    const orderData = {
      orderNumber,
      user: req.user ? req.user._id : null,
      guestInfo: req.user ? undefined : guestInfo,
      items: verifiedItems,
      shippingAddress,
      amounts,
      coupon,
      payment: {
        method: paymentMethod,
        status: 'pending',
      },
      orderStatus: paymentMethod === 'cod' ? 'placed' : 'pending_payment',
      statusHistory: [
        {
          status: paymentMethod === 'cod' ? 'placed' : 'pending_payment',
          note: paymentMethod === 'cod' ? 'Order placed via Cash on Delivery' : 'Order created, awaiting Razorpay payment',
          updatedBy: req.user?.email || guestInfo?.email || 'customer',
        },
      ],
    };

    // 4. Handle COD
    if (paymentMethod === 'cod') {
      const order = await Order.create(orderData);
      // Atomically decrement stock
      await decrementStock(verifiedItems);
      // Send confirmation email
      sendOrderConfirmationEmail(order);

      return res.status(201).json({
        success: true,
        orderId: order._id,
        orderNumber: order.orderNumber,
        method: 'cod',
        amounts: order.amounts,
        message: 'Order placed successfully with Cash on Delivery!',
      });
    }

    // 5. Handle Razorpay Payment
    const razorpay = getRazorpayClient();
    const amountInPaise = Math.round(amounts.total * 100);

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        orderNumber,
        customerPhone: shippingAddress.phone,
      },
    });

    orderData.payment.razorpayOrderId = rzpOrder.id;
    const order = await Order.create(orderData);

    res.status(201).json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount, // in paise
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      customer: {
        name: shippingAddress.name,
        email: req.user?.email || guestInfo?.email || '',
        phone: shippingAddress.phone,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing Razorpay verification parameters' });
    }

    // 1. Verify HMAC-SHA256 signature using timing-safe comparison
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'mock_secret')
      .update(body)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(razorpay_signature);

    if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature. Verification failed.' });
    }

    // 2. Locate order by razorpayOrderId
    const order = await Order.findOne({ 'payment.razorpayOrderId': razorpay_order_id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order associated with payment not found.' });
    }

    // 3. Idempotency Check: if already processed, return success immediately
    if (order.payment.status === 'paid') {
      return res.status(200).json({
        success: true,
        orderNumber: order.orderNumber,
        orderId: order._id,
        message: 'Payment already verified and confirmed.',
      });
    }

    // 4. Mark Order Paid & Atomically decrement stock
    order.payment.status = 'paid';
    order.payment.razorpayPaymentId = razorpay_payment_id;
    order.payment.razorpaySignature = razorpay_signature;
    order.orderStatus = 'confirmed';
    order.statusHistory.push({
      status: 'confirmed',
      note: `Payment captured successfully via Razorpay (ID: ${razorpay_payment_id})`,
      updatedBy: 'razorpay_verify',
    });

    await order.save();
    await decrementStock(order.items);
    sendOrderConfirmationEmail(order);

    res.status(200).json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order._id,
      message: 'Payment verified and order confirmed successfully!',
    });
  } catch (err) {
    next(err);
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Validate signature if webhookSecret is configured
    if (webhookSecret && webhookSecret !== 'placeholder_webhook_secret' && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(req.body) // Raw buffer from express.raw()
        .digest('hex');

      const expectedBuffer = Buffer.from(expectedSignature);
      const receivedBuffer = Buffer.from(signature);

      if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
        console.warn('[Webhook] Invalid Razorpay webhook signature');
        return res.status(400).json({ status: 'invalid_signature' });
      }
    }

    // Parse payload from raw buffer
    const payload = JSON.parse(req.body.toString());
    const event = payload.event;
    console.log(`[Razorpay Webhook] Received event: ${event}`);

    if (event === 'payment.captured') {
      const rzpPayment = payload.payload.payment.entity;
      const rzpOrderId = rzpPayment.order_id;
      const rzpPaymentId = rzpPayment.id;

      const order = await Order.findOne({ 'payment.razorpayOrderId': rzpOrderId });
      if (order && order.payment.status !== 'paid') {
        order.payment.status = 'paid';
        order.payment.razorpayPaymentId = rzpPaymentId;
        order.orderStatus = 'confirmed';
        order.statusHistory.push({
          status: 'confirmed',
          note: `Payment captured via webhook (ID: ${rzpPaymentId})`,
          updatedBy: 'razorpay_webhook',
        });
        await order.save();
        await decrementStock(order.items);
        sendOrderConfirmationEmail(order);
      }
    } else if (event === 'payment.failed') {
      const rzpPayment = payload.payload.payment.entity;
      const rzpOrderId = rzpPayment.order_id;

      const order = await Order.findOne({ 'payment.razorpayOrderId': rzpOrderId });
      if (order && order.payment.status === 'pending') {
        order.payment.status = 'failed';
        order.statusHistory.push({
          status: 'pending_payment',
          note: `Payment attempt failed: ${rzpPayment.error_description || 'Unknown reason'}`,
          updatedBy: 'razorpay_webhook',
        });
        await order.save();
      }
    } else if (event === 'refund.processed') {
      const rzpRefund = payload.payload.refund.entity;
      const rzpPaymentId = rzpRefund.payment_id;

      const order = await Order.findOne({ 'payment.razorpayPaymentId': rzpPaymentId });
      if (order && order.orderStatus !== 'refunded') {
        order.orderStatus = 'refunded';
        order.payment.status = 'refunded';
        order.statusHistory.push({
          status: 'refunded',
          note: `Refund processed via Razorpay (Refund ID: ${rzpRefund.id})`,
          updatedBy: 'razorpay_webhook',
        });
        await order.save();
        await restoreStock(order.items);
      }
    }

    // Always respond 200 OK to webhook events
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('[Webhook Error]:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const issueRefund = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.payment.status !== 'paid' || !order.payment.razorpayPaymentId) {
      return res.status(400).json({ success: false, message: 'Order cannot be refunded as it was not paid via online gateway.' });
    }

    if (order.orderStatus === 'refunded') {
      return res.status(400).json({ success: false, message: 'Order is already marked refunded.' });
    }

    const razorpay = getRazorpayClient();
    const refund = await razorpay.payments.refund(order.payment.razorpayPaymentId, {
      amount: Math.round(order.amounts.total * 100),
      notes: { orderNumber: order.orderNumber, reason: 'Admin customer return' },
    });

    order.orderStatus = 'refunded';
    order.payment.status = 'refunded';
    order.statusHistory.push({
      status: 'refunded',
      note: `Refund initiated by admin (Razorpay Refund ID: ${refund.id})`,
      updatedBy: req.user?.email || 'admin',
    });

    await order.save();
    await restoreStock(order.items);

    res.status(200).json({ success: true, message: 'Refund issued successfully', refundId: refund.id });
  } catch (err) {
    next(err);
  }
};

export const autoExpirePendingOrders = async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const staleOrders = await Order.find({
      orderStatus: 'pending_payment',
      createdAt: { $lt: thirtyMinutesAgo },
    });

    for (const order of staleOrders) {
      order.orderStatus = 'cancelled';
      order.statusHistory.push({
        status: 'cancelled',
        note: 'Order auto-expired after 30 minutes of payment inactivity',
        updatedBy: 'system_cleanup_job',
      });
      await order.save();
    }

    if (staleOrders.length > 0) {
      console.log(`[Order Cleanup] Auto-expired ${staleOrders.length} stale pending orders.`);
    }
  } catch (err) {
    console.error('[Order Cleanup Error]:', err.message);
  }
};
