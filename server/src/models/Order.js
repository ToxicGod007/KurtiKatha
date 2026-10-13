import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String, required: true },
  variant: {
    size: { type: String, required: true },
    color: { type: String, default: '' },
    sku: { type: String, default: '' },
  },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
});

const shippingAddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  pincode: { type: String, required: true },
  addressLine: { type: String, required: true },
  locality: { type: String, default: '' },
  city: { type: String, required: true },
  state: { type: String, required: true },
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: '' },
  updatedBy: { type: String, default: 'system' },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    guestInfo: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    amounts: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      shippingFee: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    coupon: {
      code: { type: String },
      discountAmount: { type: Number, default: 0 },
    },
    payment: {
      method: { type: String, enum: ['razorpay', 'cod'], required: true },
      status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
      razorpayOrderId: { type: String, index: true },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
    },
    orderStatus: {
      type: String,
      enum: ['pending_payment', 'placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending_payment',
      index: true,
    },
    statusHistory: [statusHistorySchema],
    tracking: {
      courierName: { type: String, default: '' },
      trackingNumber: { type: String, default: '' },
      trackingUrl: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
