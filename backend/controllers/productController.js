import Product from "../models/Product.js";
import Category from "../models/Category.js";

// GET /api/products
// Query: category (slug or id), search, minPrice, maxPrice, sort, page, limit, all
export const listProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort = "-createdAt",
      page = 1,
      limit = 12,
      all,
    } = req.query;

    const filter = {};
    if (all !== "true") filter.isActive = true;

    if (category) {
      const cat = await Category.findOne({
        $or: [{ slug: category }, ...(category.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: category }] : [])],
      });
      if (!cat) {
        return res.status(200).json({
          success: true,
          data: { products: [], page: 1, pages: 0, total: 0 },
        });
      }
      filter.category = cat._id;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      newest: "-createdAt",
      "price-asc": "price",
      "price-desc": "-price",
      "rating-desc": "-rating",
    };
    const sortBy = sortMap[sort] || sort;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(60, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort(sortBy)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        products,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id  (id OR slug)
export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { slug: id };
    const product = await Product.findOne(query).populate("category", "name slug");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
};

// POST /api/products  (admin)
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, discountPrice, category, brand, stock, images, isActive } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "name, price and category are required",
      });
    }

    const cat = await Category.findById(category);
    if (!cat) {
      return res.status(400).json({ success: false, message: "Invalid category" });
    }

    const product = await Product.create({
      name: name.trim(),
      description,
      price,
      discountPrice,
      category,
      brand,
      stock: stock ?? 0,
      images: Array.isArray(images) ? images : [],
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id,
    });

    await product.populate("category", "name slug");
    return res.status(201).json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id  (admin)
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const fields = ["name", "description", "price", "discountPrice", "category", "brand", "stock", "images", "isActive"];
    for (const f of fields) {
      if (req.body[f] !== undefined) product[f] = req.body[f];
    }

    if (req.body.category) {
      const cat = await Category.findById(req.body.category);
      if (!cat) {
        return res.status(400).json({ success: false, message: "Invalid category" });
      }
    }

    await product.save();
    await product.populate("category", "name slug");
    return res.status(200).json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id  (admin)
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    await product.deleteOne();
    return res.status(200).json({ success: true, message: "Product deleted" });
  } catch (err) {
    next(err);
  }
};
