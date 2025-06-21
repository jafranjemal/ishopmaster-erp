const express = require("express");
const {
  getMyProfile,
  updateMyProfile,
  updateLocalizationSettings,
} = require("./profile.controller");
const { authorize, protect } = require("../../../middleware/auth.middleware");
const router = express.Router();

// This route will be protected by the tenantResolver and an auth guard middleware later
router.use(protect);

router
  .route("/")
  .get(getMyProfile)
  .put(authorize("settings:profile:manage"), updateMyProfile);

// New route for localization settings specifically
router.put(
  "/localization",
  authorize("settings:access"),
  updateLocalizationSettings
);

module.exports = router;
