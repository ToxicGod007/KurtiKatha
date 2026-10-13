import { describe, test, expect } from '@jest/globals';

// Test pure pricing rules that govern checkout calculation
describe('Zero-Trust Pricing & Shipping Calculation Tests', () => {
  const DEFAULT_SETTINGS = {
    shippingFee: 69,
    freeShippingThreshold: 999,
  };

  function computePricingEngine({ items, coupon, settings = DEFAULT_SETTINGS }) {
    if (!items || !items.length) {
      throw new Error('Order must contain at least one item.');
    }

    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      if (!item.dbProduct) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      
      const variant = item.dbProduct.variants.find((v) => v.size === item.size);
      if (!variant) {
        throw new Error(`Selected size not found for product "${item.dbProduct.title}"`);
      }

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      if (variant.stock < qty) {
        throw new Error(`Insufficient stock for "${item.dbProduct.title}" (${variant.size}). Available: ${variant.stock}`);
      }

      // Strictly use DB price, NEVER trust client price
      const price = item.dbProduct.price;
      const itemSubtotal = price * qty;
      subtotal += itemSubtotal;

      verifiedItems.push({
        title: item.dbProduct.title,
        price,
        quantity: qty,
        subtotal: itemSubtotal,
      });
    }

    // Coupon logic
    let discountAmount = 0;
    let appliedCoupon = null;

    if (coupon && coupon.isActive) {
      if (subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else if (coupon.discountType === 'flat') {
          discountAmount = Math.min(coupon.discountValue, subtotal);
        }
        appliedCoupon = { code: coupon.code, discountAmount };
      }
    }

    const amountAfterDiscount = Math.max(0, subtotal - discountAmount);
    const shippingFee = amountAfterDiscount >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
    const grandTotal = amountAfterDiscount + shippingFee;

    return {
      subtotal,
      discount: discountAmount,
      shippingFee,
      total: grandTotal,
      appliedCoupon,
    };
  }

  const sampleKurti = {
    _id: 'prod-001',
    title: 'Kolkata Kantha Floral Pure Cotton Kurti',
    price: 649, // Authentic DB price
    mrp: 1299,
    variants: [
      { size: 'M', stock: 10 },
      { size: 'L', stock: 2 },
      { size: 'XL', stock: 0 },
    ],
  };

  const sampleNightie = {
    _id: 'prod-002',
    title: 'Crimson Paisley Jaipuri Alpine Nighty',
    price: 519,
    mrp: 949,
    variants: [
      { size: 'Free Size (L/XL)', stock: 25 },
    ],
  };

  test('Zero-trust recomputation: ignores client tampered price and enforces database price', () => {
    const clientPayload = [
      {
        productId: 'prod-001',
        size: 'M',
        quantity: 1,
        clientForgedPrice: 10, // Tampered client price of ₹10
        dbProduct: sampleKurti,
      },
    ];

    const result = computePricingEngine({ items: clientPayload });
    expect(result.subtotal).toBe(649); // Enforces real DB price
    expect(result.shippingFee).toBe(69); // Below ₹999 threshold -> ₹69 fee
    expect(result.total).toBe(649 + 69);
  });

  test('Free shipping threshold applies when order subtotal >= ₹999', () => {
    const items = [
      {
        productId: 'prod-001',
        size: 'M',
        quantity: 1, // ₹649
        dbProduct: sampleKurti,
      },
      {
        productId: 'prod-002',
        size: 'Free Size (L/XL)',
        quantity: 1, // ₹519
        dbProduct: sampleNightie,
      },
    ];

    const result = computePricingEngine({ items });
    expect(result.subtotal).toBe(1168); // 649 + 519
    expect(result.shippingFee).toBe(0); // ₹0 because ₹1168 >= ₹999
    expect(result.total).toBe(1168);
  });

  test('Percentage coupon FESTIVE10 (10% off) reduces amount correctly', () => {
    const items = [
      {
        productId: 'prod-001',
        size: 'M',
        quantity: 2, // 649 * 2 = 1298
        dbProduct: sampleKurti,
      },
    ];

    const coupon = {
      code: 'FESTIVE10',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 999,
      maxDiscount: 300,
      isActive: true,
    };

    const result = computePricingEngine({ items, coupon });
    expect(result.subtotal).toBe(1298);
    expect(result.discount).toBe(130); // 10% of 1298 = 129.8 -> 130
    expect(result.shippingFee).toBe(0); // 1298 - 130 = 1168 >= 999
    expect(result.total).toBe(1298 - 130);
    expect(result.appliedCoupon.code).toBe('FESTIVE10');
  });

  test('Coupon minOrderValue requirement is strictly enforced', () => {
    const items = [
      {
        productId: 'prod-002',
        size: 'Free Size (L/XL)',
        quantity: 1, // ₹519
        dbProduct: sampleNightie,
      },
    ];

    const coupon = {
      code: 'WELCOME100',
      discountType: 'flat',
      discountValue: 100,
      minOrderValue: 799, // Requires at least ₹799
      isActive: true,
    };

    const result = computePricingEngine({ items, coupon });
    expect(result.subtotal).toBe(519);
    expect(result.discount).toBe(0); // Not applied because 519 < 799
    expect(result.shippingFee).toBe(69);
    expect(result.total).toBe(519 + 69);
    expect(result.appliedCoupon).toBeNull();
  });

  test('Throws error when requesting quantity exceeding available stock', () => {
    const items = [
      {
        productId: 'prod-001',
        size: 'L',
        quantity: 5, // Only 2 in stock
        dbProduct: sampleKurti,
      },
    ];

    expect(() => computePricingEngine({ items })).toThrow(/Insufficient stock/);
  });

  test('Throws error when requesting out-of-stock variant (stock = 0)', () => {
    const items = [
      {
        productId: 'prod-001',
        size: 'XL', // 0 in stock
        quantity: 1,
        dbProduct: sampleKurti,
      },
    ];

    expect(() => computePricingEngine({ items })).toThrow(/Insufficient stock/);
  });

  test('Throws error when order items array is empty', () => {
    expect(() => computePricingEngine({ items: [] })).toThrow(/at least one item/);
  });
});

