import { Product } from '../models/Product.js';
import { sendTelegramLowStockAlert } from './telegramService.js';

export async function decrementStock(items) {
  for (const item of items) {
    const size = item.variant?.size;
    const qty = item.quantity;
    const productId = item.product?._id || item.product;

    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: productId,
        'variants.size': size,
        'variants.stock': { $gte: qty },
      },
      {
        $inc: { 'variants.$.stock': -qty },
      },
      { new: true }
    );

    if (!updatedProduct) {
      console.warn(`[Stock Warning] Failed to atomically decrement stock for product ${productId}, size ${size}`);
    } else {
      const variant = updatedProduct.variants?.find((v) => v.size === size);
      if (variant && variant.stock <= 5) {
        sendTelegramLowStockAlert(updatedProduct.title, size, variant.stock);
      }
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

