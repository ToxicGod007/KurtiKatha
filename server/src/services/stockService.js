import { Product } from '../models/Product.js';

export async function decrementStock(items) {
  for (const item of items) {
    const size = item.variant?.size;
    const qty = item.quantity;
    const productId = item.product?._id || item.product;

    const result = await Product.updateOne(
      {
        _id: productId,
        'variants.size': size,
        'variants.stock': { $gte: qty },
      },
      {
        $inc: { 'variants.$.stock': -qty },
      }
    );

    if (result.matchedCount === 0 || result.modifiedCount === 0) {
      console.warn(`[Stock Warning] Failed to atomically decrement stock for product ${productId}, size ${size}`);
    }
  }
}

export async function restoreStock(items) {
  for (const item of items) {
    const size = item.variant?.size;
    const qty = item.quantity;
    const productId = item.product?._id || item.product;

    await Product.updateOne(
      {
        _id: productId,
        'variants.size': size,
      },
      {
        $inc: { 'variants.$.stock': qty },
      }
    );
  }
}
