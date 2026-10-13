import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Coupon } from '../models/Coupon.js';
import { Category } from '../models/Category.js';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';

export const getDashboardMetrics = async (req, res, next) => {
  try {
    const [orders, totalProducts, customers] = await Promise.all([
      Order.find().sort({ createdAt: -1 }),
      Product.find(),
      User.find({ role: 'customer' }),
    ]);

    // 1. Calculate Revenue (from paid orders or confirmed COD)
    const paidOrders = orders.filter((o) => o.payment.status === 'paid' || o.orderStatus === 'delivered');
    const totalRevenue = paidOrders.reduce((acc, o) => acc + (o.amounts.total || 0), 0);

    // 2. Orders summary
    const pendingOrdersCount = orders.filter((o) => ['placed', 'confirmed', 'packed'].includes(o.orderStatus)).length;

    // 3. Low-stock alerts (variants with stock <= 5)
    const lowStockAlerts = [];
    totalProducts.forEach((p) => {
      p.variants.forEach((v) => {
        if (v.stock <= 5) {
          lowStockAlerts.push({
            productId: p._id,
            title: p.title,
            slug: p.slug,
            size: v.size,
            color: v.color,
            sku: v.sku,
            stock: v.stock,
          });
        }
      });
    });

    res.status(200).json({
      success: true,
      metrics: {
        totalRevenue,
        totalOrders: orders.length,
        pendingOrdersCount,
        totalProducts: totalProducts.length,
        totalCustomers: customers.length,
        lowStockAlerts,
        recentOrders: orders.slice(0, 6),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate('category', 'name slug').sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      category,
      fabric,
      description,
      mrp,
      price,
      variants,
      images,
      pattern,
      length,
      sleeve,
      careInstructions,
      isActive = true,
      bestseller = false,
      isNewArrival = false,
    } = req.body;

    const autoSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const product = await Product.create({
      title,
      slug: autoSlug,
      category,
      fabric,
      description,
      mrp: Number(mrp),
      price: Number(price),
      variants: variants && variants.length ? variants : [{ size: 'Free Size', color: 'Default', sku: `KK-${Date.now()}`, stock: 10 }],
      images: images && images.length ? images : [{ url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800' }],
      pattern,
      length,
      sleeve,
      careInstructions,
      isActive,
      bestseller,
      isNewArrival,
    });

    res.status(201).json({ success: true, product, message: 'Product created successfully' });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.mrp) updateData.mrp = Number(updateData.mrp);

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, product, message: 'Product updated successfully' });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const getAdminOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note, tracking } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = status;
    if (tracking) {
      order.tracking = {
        courierName: tracking.courierName || order.tracking.courierName,
        trackingNumber: tracking.trackingNumber || order.tracking.trackingNumber,
        trackingUrl: tracking.trackingUrl || order.tracking.trackingUrl,
      };
    }

    order.statusHistory.push({
      status,
      note: note || `Order status updated to ${status} by admin`,
      updatedBy: req.user.email,
    });

    await order.save();
    res.status(200).json({ success: true, order, message: `Order status updated to ${status}` });
  } catch (err) {
    next(err);
  }
};

export const getAdminCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-passwordHash').sort({ createdAt: -1 });
    res.status(200).json({ success: true, customers });
  } catch (err) {
    next(err);
  }
};

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided. Please choose a file to upload.',
      });
    }

    if (!isCloudinaryConfigured()) {
      return res.status(400).json({
        success: false,
        message:
          'Cloudinary is not configured on the server yet. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.',
      });
    }

    // Upload buffer to Cloudinary with automatic optimization
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'kurtikatha/products',
        resource_type: 'image',
        transformation: [
          { width: 1400, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Error]:', error);
          return res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload image to Cloudinary',
          });
        }

        return res.status(200).json({
          success: true,
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (err) {
    next(err);
  }
};

