import Category from "../models/Category.js";

// GET /api/categories
export const listCategories = async (req, res, next) => {
  try {
    const includeInactive = req.query.all === "true";
    const filter = includeInactive ? {} : { isActive: true };
    const categories = await Category.find(filter).sort({ name: 1 });
    return res.status(200).json({ success: true, data: { categories } });
  } catch (err) {
    next(err);
  }
};

// GET /api/categories/:slug
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    return res.status(200).json({ success: true, data: { category } });
  } catch (err) {
    next(err);
  }
};

// POST /api/categories  (admin)
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, isActive } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Category name must be at least 2 characters",
      });
    }
    const category = await Category.create({
      name: name.trim(),
      description,
      image,
      isActive: isActive !== undefined ? isActive : true,
    });
    return res.status(201).json({ success: true, data: { category } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/categories/:id  (admin)
export const updateCategory = async (req, res, next) => {
  try {
    const { name, description, image, isActive } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    if (name !== undefined) category.name = name.trim();
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;
    await category.save();
    return res.status(200).json({ success: true, data: { category } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/categories/:id  (admin)
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    await category.deleteOne();
    return res.status(200).json({ success: true, message: "Category deleted" });
  } catch (err) {
    next(err);
  }
};
