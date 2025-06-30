const express = require("express");
const {
  getMyProfile,
  updateMyProfile,
  updateLocalizationSettings,
  updateCompanyProfile,
} = require("./profile.controller");
const { authorize, protect } = require("../../../middleware/auth.middleware");
const router = express.Router();

// This route will be protected by the tenantResolver and an auth guard middleware later
router.use(protect);

router.route("/").get(getMyProfile).put(authorize("settings:profile:manage"), updateMyProfile);

// New route for localization settings specifically
router.put("/localization", authorize("settings:access"), updateLocalizationSettings);

router.route("/me").put(updateMyProfile); // Any user can update their own profile

router.route("/company").put(authorize("settings:company:manage"), updateCompanyProfile); // Only admins can update the company profile

module.exports = router;
