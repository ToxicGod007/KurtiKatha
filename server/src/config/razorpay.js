import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

export const getRazorpayClient = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret || key_id === 'rzp_test_placeholder_key') {
    console.warn('[Razorpay] Valid RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not found in env.');
  }

  return new Razorpay({
    key_id: key_id || 'rzp_test_mock',
    key_secret: key_secret || 'mock_secret',
  });
};
