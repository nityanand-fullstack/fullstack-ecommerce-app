import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// In-memory cache for /api/admin/stats — refreshed every 30s
const statsCache = { data: null, ts: 0 };
const STATS_TTL_MS = 30_000;

export const invalidateStatsCache = () => {
  statsCache.data = null;
  statsCache.ts = 0;
};

// GET /api/admin/stats
export const getStats = async (req, res, next) => {
  try {
    const now = Date.now();
    const fresh = statsCache.data && now - statsCache.ts < STATS_TTL_MS;
    if (fresh && req.query.refresh !== "true") {
      return res.status(200).json({
        success: true,
        cached: true,
        data: statsCache.data,
      });
    }

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueAgg,
      lowStock,
      pendingOrders,
      recentOrders,
    ] = await Promise.all([
      User.countDocuments({}),
      Product.countDocuments({}),
      Order.countDocuments({}),
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Product.countDocuments({ stock: { $lt: 15 } }),
      Order.countDocuments({ status: "pending" }),
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email")
        .lean(),
    ]);

    const data = {
      totals: {
        users: totalUsers,
        products: totalProducts,
        orders: totalOrders,
        revenue: revenueAgg[0]?.total || 0,
        lowStock,
        pendingOrders,
      },
      recentOrders,
    };

    statsCache.data = data;
    statsCache.ts = now;

    return res.status(200).json({ success: true, cached: false, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/orders
export const listAllOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;

    let query = Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    let orders = await query;

    if (search) {
      const s = search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o._id.toString().toLowerCase().includes(s) ||
          o.user?.name?.toLowerCase().includes(s) ||
          o.user?.email?.toLowerCase().includes(s)
      );
    }

    return res.status(200).json({
      success: true,
      data: { orders, total: orders.length },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/orders/:id/status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowed.join(", ")}`,
      });
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    order.status = status;
    if (status === "delivered" && !order.isPaid && order.paymentMethod === "COD") {
      order.isPaid = true;
      order.paidAt = new Date();
    }
    await order.save();
    invalidateStatsCache();
    return res.status(200).json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
export const listUsers = async (req, res, next) => {
  try {
    const { search, role } = req.query;
    const filter = {};
    if (role && ["user", "admin"].includes(role)) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const users = await User.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: { users, total: users.length },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id/role
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be 'user' or 'admin'",
      });
    }
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.role = role;
    await user.save();
    invalidateStatsCache();
    return res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    await user.deleteOne();
    invalidateStatsCache();
    return res.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    next(err);
  }
};
