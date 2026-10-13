import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  pincode: { type: String, required: true, match: [/^\d{6}$/, 'Must be a 6-digit Indian PIN code'] },
  addressLine: { type: String, required: true },
  locality: { type: String, default: '' },
  city: { type: String, required: true },
  state: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer', index: true },
    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

// Method to verify password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.passwordHash);
};

// Static helper to hash password
userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const User = mongoose.model('User', userSchema);

