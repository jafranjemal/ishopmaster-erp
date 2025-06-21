const express = require("express");

const router = express.Router();

router.post("/login", () => {
  // This route is for tenant users to log in
  // It will use the tenant's specific User model
  console.log("login route hit");
});

module.exports = router;
