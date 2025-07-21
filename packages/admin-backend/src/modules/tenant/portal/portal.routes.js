const express = require("express");
const ctrl = require("./portal.controller");

const router = express.Router();

router.get("/tenant-profile", ctrl.getPublicTenantProfile);

module.exports = router;
