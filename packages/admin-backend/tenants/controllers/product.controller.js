// const asyncHandler = require("../../middleware/asyncHandler");

// // @desc    Get all products for a tenant
// // @route   GET /api/v1/tenant/products
// // @access  Private (to be implemented)
// exports.getProducts = asyncHandler(async (req, res, next) => {
//   const { Product } = req.models;
//   const products = await Product.find({});
//   res
//     .status(200)
//     .json({ success: true, count: products.length, data: products });
// });

// // @desc    Create a new product for a tenant
// // @route   POST /api/v1/tenant/products
// // @access  Private (Admin role)
// exports.createProduct = asyncHandler(async (req, res, next) => {
//   const { Product } = req.models;
//   // In a real app, req.user.id would be attached by the auth middleware
//   // req.body.createdBy = req.user.id;
//   const product = await Product.create(req.body);
//   res.status(201).json({ success: true, data: product });
// });

// // @desc    Get a single product by ID
// // @route   GET /api/v1/tenant/products/:id
// // @access  Private
// exports.getProduct = asyncHandler(async (req, res, next) => {
//   const { Product } = req.models;
//   const product = await Product.findById(req.params.id);
//   if (!product) {
//     return res.status(404).json({ success: false, error: "Product not found" });
//   }
//   res.status(200).json({ success: true, data: product });
// });

// // @desc    Update a product
// // @route   PUT /api/v1/tenant/products/:id
// // @access  Private (Admin role)
// exports.updateProduct = asyncHandler(async (req, res, next) => {
//   const { Product } = req.models;
//   let product = await Product.findById(req.params.id);
//   if (!product) {
//     return res.status(404).json({ success: false, error: "Product not found" });
//   }
//   product = await Product.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   res.status(200).json({ success: true, data: product });
// });

// // @desc    Delete a product
// // @route   DELETE /api/v1/tenant/products/:id
// // @access  Private (Admin role)
// exports.deleteProduct = asyncHandler(async (req, res, next) => {
//   const { Product } = req.models;
//   const product = await Product.findById(req.params.id);
//   if (!product) {
//     return res.status(404).json({ success: false, error: "Product not found" });
//   }
//   await product.deleteOne();
//   res.status(200).json({ success: true, data: {} });
// });
