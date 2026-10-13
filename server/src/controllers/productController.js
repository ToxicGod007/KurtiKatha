import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';

export const getProducts = async (req, res, next) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      size, 
      fabric, 
      search, 
      sort = 'popularity', 
      page = 1, 
      limit = 12,
      featured,
      bestseller,
      newArrival 
    } = req.query;

    const query = { isActive: true };

    // 1. Category Filter
    if (category && category !== 'all') {
      const categoryDoc = await Category.findOne({ slug: category.toLowerCase() });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        return res.status(200).json({ success: true, products: [], total: 0, totalPages: 0, page: 1 });
      }
    }

    // 2. Price Filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 3. Size Filter
    if (size) {
      query['variants.size'] = size;
    }

    // 4. Fabric Filter
    if (fabric) {
      query.fabric = new RegExp(fabric, 'i');
    }

    // 5. Flags
    if (featured === 'true') query.isFeatured = true;
    if (bestseller === 'true') query.bestseller = true;
    if (newArrival === 'true') query.isNewArrival = true;

    // 6. Search keyword
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { fabric: { $regex: search, $options: 'i' } },
      ];
    }

    // 7. Sort Options
    let sortOptions = {};
    if (sort === 'price-low') {
      sortOptions = { price: 1 };
    } else if (sort === 'price-high') {
      sortOptions = { price: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    } else {
      // Default: popularity / bestsellers first, then newest
      sortOptions = { bestseller: -1, 'rating.average': -1, createdAt: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      products,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
};

export const getProductBySlugOrId = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    let query = { isActive: true };
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: identifier, isActive: true };
    } else {
      query = { slug: identifier.toLowerCase(), isActive: true };
    }

    const product = await Product.findOne(query).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Fetch up to 4 related products from same category
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isActive: true,
    })
      .limit(4)
      .select('title slug price mrp images rating bestseller');

    res.status(200).json({
      success: true,
      product,
      relatedProducts,
    });
  } catch (err) {
    next(err);
  }
};

export const getFeaturedCollections = async (req, res, next) => {
  try {
    const [bestsellers, newArrivals] = await Promise.all([
      Product.find({ isActive: true, bestseller: true })
        .populate('category', 'name slug')
        .limit(8),
      Product.find({ isActive: true })
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .limit(8),
    ]);

    res.status(200).json({
      success: true,
      bestsellers,
      newArrivals,
    });
  } catch (err) {
    next(err);
  }
};
