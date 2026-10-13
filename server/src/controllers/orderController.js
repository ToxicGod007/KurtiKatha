import { Order } from '../models/Order.js';

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderNumber: id }],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Security check: Customer can only view their own orders unless Admin
    if (req.user?.role !== 'admin' && order.user && order.user.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

