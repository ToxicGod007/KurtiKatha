import crypto from 'crypto';

describe('Razorpay Signature Verification Security Tests', () => {
  const secret = 'rzp_test_secret_key_12345';
  const orderId = 'order_DA291039AA89';
  const paymentId = 'pay_928374829102';

  function verifyRazorpaySignature(orderId, paymentId, signature, secretKey) {
    if (!orderId || !paymentId || !signature || !secretKey) {
      return false;
    }

    const payload = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(payload)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const receivedBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  }

  test('Valid HMAC-SHA256 signature passes verification', () => {
    const payload = `${orderId}|${paymentId}`;
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const isValid = verifyRazorpaySignature(orderId, paymentId, validSignature, secret);
    expect(isValid).toBe(true);
  });

  test('Tampered signature with single character alteration fails verification', () => {
    const payload = `${orderId}|${paymentId}`;
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Flip last character
    const tampered = validSignature.slice(0, -1) + (validSignature.slice(-1) === 'a' ? 'b' : 'a');
    const isValid = verifyRazorpaySignature(orderId, paymentId, tampered, secret);
    expect(isValid).toBe(false);
  });

  test('Signature generated with wrong secret key fails verification', () => {
    const payload = `${orderId}|${paymentId}`;
    const wrongSignature = crypto
      .createHmac('sha256', 'completely_wrong_secret')
      .update(payload)
      .digest('hex');

    const isValid = verifyRazorpaySignature(orderId, paymentId, wrongSignature, secret);
    expect(isValid).toBe(false);
  });

  test('Signature with truncated length fails safely without crashing timingSafeEqual', () => {
    const truncatedSignature = 'abcdef123456';
    const isValid = verifyRazorpaySignature(orderId, paymentId, truncatedSignature, secret);
    expect(isValid).toBe(false);
  });

  test('Missing or null parameters fail verification safely', () => {
    expect(verifyRazorpaySignature(null, paymentId, 'sig', secret)).toBe(false);
    expect(verifyRazorpaySignature(orderId, null, 'sig', secret)).toBe(false);
    expect(verifyRazorpaySignature(orderId, paymentId, null, secret)).toBe(false);
    expect(verifyRazorpaySignature(orderId, paymentId, '', secret)).toBe(false);
  });
});
