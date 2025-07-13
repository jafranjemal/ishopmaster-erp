const express = require("express");
// const multer = require('multer'); // No longer needed
const ctrl = require("./reconciliation.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");

const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() }); // No longer needed

router.use(protect, authorize("accounting:reconciliation:manage"));

// The route no longer uses multer middleware. It accepts a JSON body.
router.post("/upload", ctrl.uploadStatement);
router.get("/suggest/:statementId", ctrl.getSuggestions);
router.post("/confirm-match", ctrl.confirmMatch);
module.exports = router;
