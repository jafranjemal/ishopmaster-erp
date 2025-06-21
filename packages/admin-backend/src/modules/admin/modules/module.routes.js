const express = require("express");
const {
  createModule,
  getAllModules,
  getModuleById,
  updateModule,
  deleteModule,
  updateModuleModules,
} = require("./module.controller");

const router = express.Router();

// We chain the methods for the same route for cleaner code
router
  .route("/")
  .get(getAllModules) // Will be implemented
  .post(createModule); // Will be implemented

router
  .route("/:id")
  .get(getModuleById) // Will be implemented
  .put(updateModule) // Will be implemented
  .delete(deleteModule); // Will be implemented

module.exports = router;
