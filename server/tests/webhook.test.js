import { describe, test, expect, jest } from '@jest/globals';
import crypto from 'crypto';

describe('Razorpay Webhook Signature & Idempotency Tests', () => {
  const webhookSecret = 'rzp_webhook_secret_secure_99';

  function verifyWebhookSignature(rawBody, signature, secret) {
    if (!signature || !secret || !rawBody) return false;
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    const expectedBuf = Buffer.from(expected, 'utf8');
    const receivedBuf = Buffer.from(signature, 'utf8');
    if (expectedBuf.length !== receivedBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, receivedBuf);
  }

  // Pure idempotency processing logic
  async function processWebhookEvent(eventPayload, { findOrder, saveOrder, decrementStock, restoreStock, sendEmail }) {
    const event = eventPayload.event;

    if (event === 'payment.captured') {
      const rzpPayment = eventPayload.payload.payment.entity;
      const order = await findOrder({ 'payment.razorpayOrderId': rzpPayment.order_id });

      if (!order) return { processed: false, reason: 'order_not_found' };

      // IDEMPOTENCY GUARD: If already paid, do NOT decrement stock again or resend email!
      if (order.payment.status === 'paid') {
        return { processed: false, reason: 'already_paid_idempotent' };
      }

      order.payment.status = 'paid';
      order.payment.razorpayPaymentId = rzpPayment.id;
      order.orderStatus = 'confirmed';
      order.statusHistory.push({
        status: 'confirmed',
        note: `Payment captured via webhook (ID: ${rzpPayment.id})`,
      });

      await saveOrder(order);
      await decrementStock(order.items);
      await sendEmail(order);

      return { processed: true, status: 'confirmed' };
    }

    if (event === 'payment.failed') {
      const rzpPayment = eventPayload.payload.payment.entity;
      const order = await findOrder({ 'payment.razorpayOrderId': rzpPayment.order_id });

      if (order && order.payment.status === 'pending') {
        order.payment.status = 'failed';
        order.statusHistory.push({
          status: 'pending_payment',
          note: `Payment failed: ${rzpPayment.error_description || 'Declined'}`,
        });
        await saveOrder(order);
        return { processed: true, status: 'failed' };
      }
      return { processed: false };
    }

    if (event === 'refund.processed') {
      const rzpRefund = eventPayload.payload.refund.entity;
      const order = await findOrder({ 'payment.razorpayPaymentId': rzpRefund.payment_id });

      if (order && order.orderStatus !== 'refunded') {
        order.orderStatus = 'refunded';
        order.payment.status = 'refunded';
        order.statusHistory.push({
          status: 'refunded',
          note: `Refund processed (ID: ${rzpRefund.id})`,
        });
        await saveOrder(order);
        await restoreStock(order.items);
        return { processed: true, status: 'refunded' };
      }
      return { processed: false, reason: 'already_refunded' };
    }

    return { processed: false, reason: 'unhandled_event' };
  }

  test('Valid raw body webhook signature passes HMAC verification', () => {
    const rawBody = JSON.stringify({ event: 'payment.captured', id: 'evt_12345' });
    const signature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

    expect(verifyWebhookSignature(rawBody, signature, webhookSecret)).toBe(true);
  });

  test('Tampered webhook payload fails HMAC verification', () => {
    const rawBody = JSON.stringify({ event: 'payment.captured', id: 'evt_12345' });
    const signature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

    const tamperedBody = JSON.stringify({ event: 'payment.captured', id: 'evt_99999' });
    expect(verifyWebhookSignature(tamperedBody, signature, webhookSecret)).toBe(false);
  });

  test('Idempotency: duplicate payment.captured event does NOT re-decrement stock or re-send email', async () => {
    const mockOrder = {
      orderNumber: 'KK-20261013-1001',
      payment: { status: 'pending', razorpayOrderId: 'order_test_99' },
      orderStatus: 'pending_payment',
      items: [{ productId: 'p1', quantity: 1 }],
      statusHistory: [],
    };

    const decrementStockMock = jest.fn();
    const sendEmailMock = jest.fn();
    const saveOrderMock = jest.fn();

    const webhookPayload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_test_abc',
            order_id: 'order_test_99',
          },
        },
      },
    };

    // 1st Webhook delivery -> Should process, decrement stock, and send email
    const firstDelivery = await processWebhookEvent(webhookPayload, {
      findOrder: async () => mockOrder,
      saveOrder: saveOrderMock,
      decrementStock: decrementStockMock,
      restoreStock: jest.fn(),
      sendEmail: sendEmailMock,
    });

    expect(firstDelivery.processed).toBe(true);
    expect(mockOrder.payment.status).toBe('paid');
    expect(mockOrder.orderStatus).toBe('confirmed');
    expect(decrementStockMock).toHaveBeenCalledTimes(1);
    expect(sendEmailMock).toHaveBeenCalledTimes(1);

    // 2nd Webhook delivery (Razorpay webhook retry) -> MUST BE IDEMPOTENT
    const secondDelivery = await processWebhookEvent(webhookPayload, {
      findOrder: async () => mockOrder,
      saveOrder: saveOrderMock,
      decrementStock: decrementStockMock,
      restoreStock: jest.fn(),
      sendEmail: sendEmailMock,
    });

    expect(secondDelivery.processed).toBe(false);
    expect(secondDelivery.reason).toBe('already_paid_idempotent');
    // Ensure stock was NOT decremented a second time and email was NOT resent
    expect(decrementStockMock).toHaveBeenCalledTimes(1);
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
  });

  test('Refund event marks order refunded and restores stock back to inventory', async () => {
    const paidOrder = {
      orderNumber: 'KK-20261013-1002',
      payment: { status: 'paid', razorpayPaymentId: 'pay_test_xyz' },
      orderStatus: 'confirmed',
      items: [{ productId: 'p1', quantity: 2 }],
      statusHistory: [],
    };

    const restoreStockMock = jest.fn();
    const saveOrderMock = jest.fn();

    const refundPayload = {
      event: 'refund.processed',
      payload: {
        refund: {
          entity: {
            id: 'rfnd_test_987',
            payment_id: 'pay_test_xyz',
          },
        },
      },
    };

    const result = await processWebhookEvent(refundPayload, {
      findOrder: async () => paidOrder,
      saveOrder: saveOrderMock,
      decrementStock: jest.fn(),
      restoreStock: restoreStockMock,
      sendEmail: jest.fn(),
    });

    expect(result.processed).toBe(true);
    expect(paidOrder.orderStatus).toBe('refunded');
    expect(paidOrder.payment.status).toBe('refunded');
    expect(restoreStockMock).toHaveBeenCalledTimes(1);
  });
});

