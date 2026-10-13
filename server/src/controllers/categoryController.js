import { Category } from '../models/Category.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    res.status(200).json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

