const { default: mongoose } = require("mongoose");
const asyncHandler = require("../../../../middleware/asyncHandler");

// @desc    Get all categories
// @desc    Get all categories as a nested tree
// @route   GET /api/v1/tenant/inventory/categories

exports.getAllCategories = asyncHandler(async (req, res, next) => {
  const { Category } = req.models;
  const allCategories = await Category.find({}).lean(); // Use .lean() for plain JS objects

  const categoryTree = buildCategoryTree(allCategories);

  res.status(200).json({ success: true, data: categoryTree });
});

// @desc    Get a single category by ID
// @route   GET /api/v1/tenant/inventory/categories/:id
exports.getCategoryById = asyncHandler(async (req, res, next) => {
  const { Category } = req.models;
  const category = await Category.findById(req.params.id).populate("parent", "name");
  if (!category) return res.status(404).json({ success: false, error: "Category not found" });
  res.status(200).json({ success: true, data: category });
});

// @desc    Create a new category
// @route   POST /api/v1/tenant/inventory/categories
exports.createCategory = asyncHandler(async (req, res, next) => {
  const { Category } = req.models;
  // The request body can now include an optional `parent` ID
  const newCategory = await Category.create({
    ...req.body,
    linkedBrands: req.body.linkedBrands || [],
    linkedDevices: req.body.linkedDevices || [],
  });
  res.status(201).json({ success: true, data: newCategory });
});

// @desc    Update a category
// @route   PUT /api/v1/tenant/inventory/categories/:id
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const { Category } = req.models;
  const updatedData = {
    ...req.body,
    linkedBrands: req.body.linkedBrands || [],
    linkedDevices: req.body.linkedDevices || [],
  };
  const updatedCategory = await Category.findByIdAndUpdate(req.params.id, updatedData, {
    new: true,
    runValidators: true,
  });
  if (!updatedCategory)
    return res.status(404).json({ success: false, error: "Category not found" });
  res.status(200).json({ success: true, data: updatedCategory });
});

// @desc    Delete a category
// @route   DELETE /api/v1/tenant/inventory/categories/:id
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const { Category, ProductTemplates } = req.models;
  const categoryId = req.params.id;

  // Integrity Check 1: Prevent deleting if it's a parent to other categories
  const childCount = await Category.countDocuments({ parent: categoryId });
  if (childCount > 0) {
    return res.status(400).json({
      success: false,
      error: `Cannot delete. This category has ${childCount} sub-categories.`,
    });
  }

  // Integrity Check 2: Prevent deleting if products are assigned to it
  const productCount = await ProductTemplates.countDocuments({ categoryId: categoryId });
  if (productCount > 0) {
    return res.status(400).json({
      success: false,
      error: `Cannot delete. This category is assigned to ${productCount} product(s).`,
    });
  }

  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) return res.status(404).json({ success: false, error: "Category not found" });

  res.status(200).json({ success: true, data: {} });
});

/**
 * A recursive helper function to build a nested tree from a flat list of categories.
 * @param {Array} categories - The flat list of all categories from the database.
 * @param {mongoose.Types.ObjectId | null} parentId - The ID of the parent to find children for.
 * @returns {Array} A nested array of category objects.
 */
const buildCategoryTree = (categories, parentId = null) => {
  const tree = [];
  const children = categories.filter((category) => {
    // Compare ObjectId with null or another ObjectId
    if (parentId === null) {
      return category.parent === null;
    }
    return category.parent?.toString() === parentId.toString();
  });

  for (const child of children) {
    const grandchildren = buildCategoryTree(categories, child._id);
    const childNode = { ...child, children: grandchildren };
    tree.push(childNode);
  }
  return tree;
};

// @desc    Get brands linked to a category through products
// @route   GET /api/v1/tenant/inventory/categories/:id/brands
exports.getLinkedBrands = asyncHandler(async (req, res, next) => {
  const { ProductTemplates } = req.models;
  const categoryId = req.params.id;

  console.log("getLinkedBrands-> categoryId  ", categoryId);
  // Get distinct brands with products in this category
  const brands = await ProductTemplates.aggregate([
    {
      $match: {
        categoryId: new mongoose.Types.ObjectId(categoryId),
        isActive: true,
      },
    },
    {
      $group: {
        _id: "$brandId",
      },
    },
    {
      $lookup: {
        from: "brands",
        localField: "_id",
        foreignField: "_id",
        as: "brand",
      },
    },
    {
      $unwind: "$brand",
    },
    {
      $replaceRoot: { newRoot: "$brand" },
    },
  ]);

  console.log("all brands for this categroy ", brands);
  res.status(200).json({
    success: true,
    data: brands,
  });
});

// @desc    Get devices linked to a category through products
// @route   GET /api/v1/tenant/inventory/categories/:id/devices
exports.getLinkedDevices = asyncHandler(async (req, res, next) => {
  const { ProductTemplates } = req.models;
  const categoryId = req.params.id;

  // Get distinct devices with products in this category
  const devices = await ProductTemplates.aggregate([
    {
      $match: {
        categoryId: new mongoose.Types.ObjectId(categoryId),
        deviceId: { $ne: null },
        isActive: true,
      },
    },
    {
      $group: {
        _id: "$deviceId",
      },
    },
    {
      $lookup: {
        from: "devices",
        localField: "_id",
        foreignField: "_id",
        as: "device",
      },
    },
    {
      $unwind: "$device",
    },
    {
      $replaceRoot: { newRoot: "$device" },
    },
  ]);

  res.status(200).json({
    success: true,
    data: devices,
  });
});

// @desc    Get direct children of a category
// @route   GET /api/v1/tenant/inventory/categories/children/:parentId
exports.getChildren = asyncHandler(async (req, res, next) => {
  const { Category } = req.models;
  const { parentId } = req.params;
  console.log("parent id ", parentId);
  // Handle root categories
  if (parentId === "root") {
    const rootCategories = await Category.find({
      parent: null,
    }).lean();

    console.log("rootCategories ", rootCategories);
    return res.status(200).json({
      success: true,
      data: rootCategories,
    });
  }

  // Validate parent category exists
  const parentCategory = await Category.findById(parentId);
  if (!parentCategory) {
    return res.status(404).json({
      success: false,
      error: "ERP_CATEGORY_NOT_FOUND: Parent category not found",
    });
  }

  // Get direct children
  const children = await Category.find({
    parent: parentId,
  }).lean();

  res.status(200).json({
    success: true,
    data: children,
  });
});
