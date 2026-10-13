import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    contactPhone: { type: String, default: '+91 86974 49885' },
    whatsappNumber: { type: String, default: '918697449885' },
    supportEmail: { type: String, default: 'support@kurtikatha.com' },
    shippingFee: { type: Number, default: 69 },
    freeShippingThreshold: { type: Number, default: 999 },
    codEnabled: { type: Boolean, default: true },
    announcementText: { 
      type: String, 
      default: 'Festive Sale: Free Shipping on orders over ₹999 | Cash on Delivery (COD) Available' 
    },
    isStoreOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Settings = mongoose.model('Settings', settingsSchema);
