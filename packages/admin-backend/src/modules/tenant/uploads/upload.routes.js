const express = require("express");
const { getCloudinarySignature } = require("./upload.controller");
const { protect } = require("../../../middleware/auth.middleware");

const router = express.Router();

// This route only needs to be protected to ensure a valid user is making the request.
router.post("/signature", protect, getCloudinarySignature);

module.exports = router;
