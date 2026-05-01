import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const recomputeProductRating = async (productId) => {
  const agg = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);
  const stats = agg[0] || { avg: 0, count: 0 };
  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(stats.avg * 10) / 10,
    numReviews: stats.count,
  });
};

const hasDeliveredOrder = async (userId, productId) => {
  const order = await Order.findOne({
    user: userId,
    status: "delivered",
    "items.product": productId,
  }).select("_id");
  return Boolean(order);
};

// GET /api/products/:id/reviews
export const listProductReviews = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).select("_id");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    const reviews = await Review.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: { reviews, total: reviews.length },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id/reviews/eligibility  (auth)
export const checkEligibility = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const [existing, eligible] = await Promise.all([
      Review.findOne({ user: req.user._id, product: productId }),
      hasDeliveredOrder(req.user._id, productId),
    ]);
    return res.status(200).json({
      success: true,
      data: {
        canReview: eligible && !existing,
        hasReviewed: Boolean(existing),
        myReview: existing || null,
        reason: !eligible
          ? "You can only review products from your delivered orders"
          : existing
          ? "You have already reviewed this product"
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/products/:id/reviews  (auth)
export const createReview = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { rating, title = "", comment } = req.body;

    const r = parseInt(rating);
    if (!r || r < 1 || r > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment is required",
      });
    }

    const product = await Product.findById(productId).select("_id");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const eligible = await hasDeliveredOrder(req.user._id, productId);
    if (!eligible) {
      return res.status(403).json({
        success: false,
        message: "You can only review products from your delivered orders",
      });
    }

    const existing = await Review.findOne({
      user: req.user._id,
      product: productId,
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating: r,
      title: title.trim(),
      comment: comment.trim(),
    });

    await recomputeProductRating(product._id);
    await review.populate("user", "name");

    return res.status(201).json({ success: true, data: { review } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }
    next(err);
  }
};

// DELETE /api/reviews/:id  (auth — owner OR admin)
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const productId = review.product;
    await review.deleteOne();
    await recomputeProductRating(productId);
    return res.status(200).json({ success: true, message: "Review deleted" });
  } catch (err) {
    next(err);
  }
};
