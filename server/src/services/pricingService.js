import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { Settings } from '../models/Settings.js';

export async function calculateOrderPricing({ items, couponCode }) {
  if (!items || !items.length) {
    throw new Error('Order must contain at least one item.');
  }

  // 1. Fetch site settings for shipping fees and thresholds
  const settings = (await Settings.findOne()) || {
    shippingFee: 69,
    freeShippingThreshold: 999,
  };

  // 2. Fetch products from DB (NEVER trust client prices)
  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  let subtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error(`Product not found or unavailable: ${item.productId}`);
    }

    // Check variant stock
    const variant = product.variants.find(
      (v) => (item.variantId && v._id.toString() === item.variantId) || v.size === item.size
    );

    if (!variant) {
      throw new Error(`Selected size/variant not found for product "${product.title}"`);
    }

    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    if (variant.stock < qty) {
      throw new Error(`Insufficient stock for "${product.title}" (${variant.size}). Available: ${variant.stock}`);
    }

    const itemPrice = product.price;
    const itemMrp = product.mrp;
    const itemSubtotal = itemPrice * qty;
    subtotal += itemSubtotal;

    verifiedItems.push({
      product: product._id,
      title: product.title,
      slug: product.slug,
      image: product.images[0]?.url || '',
      variant: {
        size: variant.size,
        color: variant.color,
        sku: variant.sku,
      },
      quantity: qty,
      price: itemPrice,
      mrp: itemMrp,
      subtotal: itemSubtotal,
    });
  }

  // 3. Coupon calculation
  let discountAmount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase().trim(),
      isActive: true,
      validUntil: { $gte: new Date() },
    });

    if (coupon && subtotal >= coupon.minOrderValue) {
      if (coupon.discountType === 'percentage') {
        discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else if (coupon.discountType === 'flat') {
        discountAmount = Math.min(coupon.discountValue, subtotal);
      }

      appliedCoupon = {
        code: coupon.code,
        discountAmount,
      };
    }
  }

  // 4. Shipping fee calculation
  const amountAfterDiscount = Math.max(0, subtotal - discountAmount);
  const shippingFee = amountAfterDiscount >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
  const grandTotal = amountAfterDiscount + shippingFee;

  return {
    verifiedItems,
    amounts: {
      subtotal,
      discount: discountAmount,
      shippingFee,
      total: grandTotal,
    },
    coupon: appliedCoupon,
    freeShippingThreshold: settings.freeShippingThreshold,
  };
}

