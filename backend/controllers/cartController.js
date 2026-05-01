import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const populateCart = (cart) =>
  cart.populate({
    path: "items.product",
    select: "name slug price discountPrice images stock isActive category",
  });

const findOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

const computeTotals = (cart) => {
  let count = 0;
  let subtotal = 0;
  for (const item of cart.items) {
    const p = item.product;
    if (!p) continue;
    const unit =
      p.discountPrice && p.discountPrice < p.price ? p.discountPrice : p.price;
    count += item.qty;
    subtotal += unit * item.qty;
  }
  return { count, subtotal };
};

// GET /api/cart
export const getCart = async (req, res, next) => {
  try {
    const cart = await findOrCreateCart(req.user._id);
    await populateCart(cart);
    const totals = computeTotals(cart);
    return res.status(200).json({ success: true, data: { cart, ...totals } });
  } catch (err) {
    next(err);
  }
};

// POST /api/cart  { productId, qty }
export const addToCart = async (req, res, next) => {
  try {
    const { productId, qty = 1 } = req.body;
    const quantity = Math.max(1, parseInt(qty));

    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} left in stock`,
      });
    }

    const cart = await findOrCreateCart(req.user._id);
    const existing = cart.items.find(
      (i) => i.product.toString() === productId
    );

    const unitPrice =
      product.discountPrice && product.discountPrice < product.price
        ? product.discountPrice
        : product.price;

    if (existing) {
      const newQty = existing.qty + quantity;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more — only ${product.stock} in stock`,
        });
      }
      existing.qty = newQty;
      existing.priceAtAdd = unitPrice;
    } else {
      cart.items.push({ product: productId, qty: quantity, priceAtAdd: unitPrice });
    }

    await cart.save();
    await populateCart(cart);
    const totals = computeTotals(cart);
    return res.status(200).json({ success: true, data: { cart, ...totals } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/cart/:productId  { qty }
export const updateCartItem = async (req, res, next) => {
  try {
    const { qty } = req.body;
    const quantity = parseInt(qty);
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "qty must be at least 1",
      });
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} in stock`,
      });
    }

    const cart = await findOrCreateCart(req.user._id);
    const item = cart.items.find(
      (i) => i.product.toString() === req.params.productId
    );
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not in cart" });
    }
    item.qty = quantity;
    await cart.save();
    await populateCart(cart);
    const totals = computeTotals(cart);
    return res.status(200).json({ success: true, data: { cart, ...totals } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/:productId
export const removeCartItem = async (req, res, next) => {
  try {
    const cart = await findOrCreateCart(req.user._id);
    cart.items = cart.items.filter(
      (i) => i.product.toString() !== req.params.productId
    );
    await cart.save();
    await populateCart(cart);
    const totals = computeTotals(cart);
    return res.status(200).json({ success: true, data: { cart, ...totals } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart
export const clearCart = async (req, res, next) => {
  try {
    const cart = await findOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    return res.status(200).json({
      success: true,
      data: { cart, count: 0, subtotal: 0 },
    });
  } catch (err) {
    next(err);
  }
};
