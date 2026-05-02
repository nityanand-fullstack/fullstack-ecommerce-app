import crypto from "crypto";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import razorpay from "../config/razorpay.js";
import { invalidateStatsCache } from "./adminController.js";

const requiredAddressFields = [
  "fullName",
  "phone",
  "street",
  "city",
  "state",
  "postalCode",
  "country",
];

const computePrices = (items) => {
  const itemsPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shippingPrice = itemsPrice >= 999 ? 0 : 99;
  const taxPrice = Math.round(itemsPrice * 0.05);
  const totalPrice = itemsPrice + shippingPrice + taxPrice;
  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};

// POST /api/orders
export const placeOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod = "COD" } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "shippingAddress is required",
      });
    }
    const missing = requiredAddressFields.filter(
      (f) => !shippingAddress[f] || !String(shippingAddress[f]).trim()
    );
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing shipping fields: ${missing.join(", ")}`,
      });
    }

    if (!["COD", "Card", "UPI", "Razorpay"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.product",
      select: "name images price discountPrice stock isActive",
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    // Validate stock and build snapshot
    const snapshot = [];
    for (const item of cart.items) {
      const p = item.product;
      if (!p || !p.isActive) {
        return res.status(400).json({
          success: false,
          message: "One or more items in your cart are unavailable",
        });
      }
      if (p.stock < item.qty) {
        return res.status(400).json({
          success: false,
          message: `Only ${p.stock} of "${p.name}" in stock`,
        });
      }
      const unit =
        p.discountPrice && p.discountPrice < p.price ? p.discountPrice : p.price;
      snapshot.push({
        product: p._id,
        name: p.name,
        image: p.images?.[0] || "",
        price: unit,
        qty: item.qty,
      });
    }

    const prices = computePrices(snapshot);

    // Decrement stock
    for (const item of snapshot) {
      const result = await Product.updateOne(
        { _id: item.product, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } }
      );
      if (result.modifiedCount === 0) {
        return res.status(400).json({
          success: false,
          message: `Stock changed while placing order. Please review your cart.`,
        });
      }
    }

    const order = await Order.create({
      user: req.user._id,
      items: snapshot,
      shippingAddress,
      paymentMethod,
      ...prices,
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    invalidateStatsCache();

    return res.status(201).json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/me
export const myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: { orders, total: orders.length },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id  (owner OR admin)
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    return res.status(200).json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
};

const buildSnapshotFromCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    select: "name images price discountPrice stock isActive",
  });
  if (!cart || cart.items.length === 0) {
    const err = new Error("Your cart is empty");
    err.status = 400;
    throw err;
  }
  const snapshot = [];
  for (const item of cart.items) {
    const p = item.product;
    if (!p || !p.isActive) {
      const err = new Error("One or more items in your cart are unavailable");
      err.status = 400;
      throw err;
    }
    if (p.stock < item.qty) {
      const err = new Error(`Only ${p.stock} of "${p.name}" in stock`);
      err.status = 400;
      throw err;
    }
    const unit =
      p.discountPrice && p.discountPrice < p.price ? p.discountPrice : p.price;
    snapshot.push({
      product: p._id,
      name: p.name,
      image: p.images?.[0] || "",
      price: unit,
      qty: item.qty,
    });
  }
  return { cart, snapshot };
};

// POST /api/orders/razorpay/init
// Validates the cart and creates a Razorpay order. Does NOT create a DB Order yet.
// If the user dismisses the Razorpay modal, no Order is ever persisted.
export const initRazorpay = async (req, res, next) => {
  try {
    const { snapshot } = await buildSnapshotFromCart(req.user._id);
    const prices = computePrices(snapshot);

    const rpOrder = await razorpay.orders.create({
      amount: Math.round(prices.totalPrice * 100), // paise
      currency: "INR",
      receipt: `${req.user._id}_${Date.now()}`.slice(0, 40),
      notes: { userId: String(req.user._id) },
    });

    return res.status(200).json({
      success: true,
      data: {
        razorpayOrderId: rpOrder.id,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// POST /api/orders/razorpay/verify
// Verifies the HMAC signature, then creates the DB Order, decrements stock, clears cart.
export const verifyRazorpay = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment fields",
      });
    }
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "shippingAddress is required",
      });
    }
    const missing = requiredAddressFields.filter(
      (f) => !shippingAddress[f] || !String(shippingAddress[f]).trim()
    );
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing shipping fields: ${missing.join(", ")}`,
      });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    if (expected !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const { cart, snapshot } = await buildSnapshotFromCart(req.user._id);
    const prices = computePrices(snapshot);

    for (const item of snapshot) {
      const result = await Product.updateOne(
        { _id: item.product, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } }
      );
      if (result.modifiedCount === 0) {
        return res.status(400).json({
          success: false,
          message: "Stock changed while placing order. Please review your cart.",
        });
      }
    }

    const order = await Order.create({
      user: req.user._id,
      items: snapshot,
      shippingAddress,
      paymentMethod: "Razorpay",
      ...prices,
      isPaid: true,
      paidAt: new Date(),
      status: "processing",
      paymentResult: {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
      },
    });

    cart.items = [];
    await cart.save();

    invalidateStatsCache();

    return res.status(201).json({ success: true, data: { order } });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// PUT /api/orders/:id/pay  (mock payment)
export const payOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    if (order.isPaid) {
      return res.status(400).json({ success: false, message: "Order already paid" });
    }
    order.isPaid = true;
    order.paidAt = new Date();
    if (order.status === "pending") order.status = "processing";
    await order.save();
    invalidateStatsCache();
    return res.status(200).json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
};
