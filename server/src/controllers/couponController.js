import { Coupon } from '../models/Coupon.js';

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderSubtotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code' });
    }

    const subtotal = Number(orderSubtotal) || 0;
    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    // Expiry check
    if (new Date() > new Date(coupon.validUntil)) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    // Min Order Value check
    if (subtotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum bag value of ₹${coupon.minOrderValue}`,
      });
    }

    // Usage Limit check
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit has been reached' });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === 'flat') {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    res.status(200).json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
      message: `Coupon '${coupon.code}' applied successfully! Saved ₹${discountAmount}`,
    });
  } catch (err) {
    next(err);
  }
};

