const express = require("express");
// const {
//   getProducts,
//   createProduct,
//   getProduct,
//   updateProduct,
//   deleteProduct,
// } = require("../controllers/product.controller");

const router = express.Router();

// Here we would add the protectTenantRoute and authorize middleware
// For now, the routes are open for testing purposes.
// Example: router.route('/').get(protectTenantRoute, getProducts)
// Example: router.route('/').post(protectTenantRoute, authorize(['admin']), createProduct)

// router.route("/").get(getProducts).post(createProduct);

// router.route("/:id").get(getProduct).put(updateProduct).delete(deleteProduct);

module.exports = router;
