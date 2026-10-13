import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  colorHex: { type: String, default: '#000000' },
  sku: { type: String, required: true },
  stock: { type: Number, required: true, default: 0, min: 0 },
});

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, default: '' },
  alt: { type: String, default: '' },
  isPrimary: { type: Boolean, default: false },
});

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    fabric: { type: String, required: true, index: true },
    careInstructions: { type: String, default: 'Gentle hand wash or machine wash with like colors. Dry in shade.' },
    pattern: { type: String, default: '' },
    length: { type: String, default: '' },
    sleeve: { type: String, default: '' },
    images: [imageSchema],
    mrp: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0, index: true },
    variants: [variantSchema],
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    bestseller: { type: Boolean, default: false, index: true },
    rating: {
      average: { type: Number, default: 4.8 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Virtual for calculating discount %
productSchema.virtual('discountPercent').get(function () {
  if (!this.mrp || this.mrp <= this.price) return 0;
  return Math.round(((this.mrp - this.price) / this.mrp) * 100);
});

// Virtual for total available stock across variants
productSchema.virtual('totalStock').get(function () {
  return this.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export const Product = mongoose.model('Product', productSchema);
