const express = require("express");
const { createAssembly } = require("./assembly.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");

const router = express.Router();

// All routes in this file are protected and require a specific assembly permission
router.use(protect, authorize("inventory:assembly:create"));

router.route("/").post(createAssembly);

module.exports = router;
