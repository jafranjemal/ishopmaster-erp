const express = require("express")
const {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  updateTenantModules,
  restoreMasterData,
} = require("./tenant.controller")

const router = express.Router()

// We chain the methods for the same route for cleaner code
router
  .route("/")
  .get(getAllTenants) // Will be implemented
  .post(createTenant) // Will be implemented

router
  .route("/:id")
  .get(getTenantById) // Will be implemented
  .put(updateTenant) // Will be implemented
  .delete(deleteTenant) // Will be implemented

// New, dedicated route for module management
router.route("/:id/modules").put(updateTenantModules)
router.route("/:id/master-data/restore").post(restoreMasterData)

module.exports = router
