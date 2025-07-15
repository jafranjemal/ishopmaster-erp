const express = require("express");
const customerAuthTokenSchema = require("./customerAuthToken.schema");
const customerAuthRoutes = require("./customerAuth.routes");

/**
 * This is the manifest file for the new, public-facing Customer Portal module.
 * It exports its schemas and router to be discovered and registered
 * by the dynamic module loader in server.js.
 */

const mainRouter = express.Router();

// Mount the routes for this module.
// The dynamic loader will mount this mainRouter under `/portal`.
mainRouter.use("/auth", customerAuthRoutes);

module.exports = {
  // --- THE DEFINITIVE FIX: EXPORTING THE SCHEMA FOR THE LOADER ---
  // The dynamic loader will find this object and register the schema.
  schemas: {
    CustomerAuthToken: customerAuthTokenSchema,
  },
  // --- END OF FIX ---
  // We add a flag to tell the loader that these are public routes
  isPublic: true,
  // The dynamic loader will find this router and mount it.
  router: mainRouter,
};
