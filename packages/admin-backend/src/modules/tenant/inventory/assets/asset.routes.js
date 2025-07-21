const express = require("express");
const { authorize, protect } = require("../../../../middleware/auth.middleware");
const ctrl = require("./asset.controller");

const router = express.Router();
router.use(protect, authorize("inventory:asset:manage"));
router.route("/").get(ctrl.getAllAssets).post(ctrl.createAsset);
router.route("/:id").get(ctrl.getAssetById).put(ctrl.updateAsset).delete(ctrl.deleteAsset);
module.exports = router;
