const express = require("express");
const {
  createDevis,
  deleteDevis,
  exportDevis,
  getDevis,
  getDeviss,
  updateDevis,
} = require("../controller/devisController.js");

const { protect } = require("../controller/authController.js");
const featuresCheck = require("../middlewares/featuresCheck.js");
const {
  DEVIS_CREATE,
  DEVIS_DELETE,
  DEVIS_READ,
  DEVIS_UPDATE,
} = require("../data/FeaturesList.js");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(featuresCheck(DEVIS_READ), getDeviss)
  .post(featuresCheck(DEVIS_CREATE), createDevis);

router.get("/:documentID/exportDevis", featuresCheck(DEVIS_READ), exportDevis);

router
  .route("/:documentID")
  .get(featuresCheck(DEVIS_READ), getDevis)
  .patch(featuresCheck(DEVIS_UPDATE), updateDevis)
  .delete(featuresCheck(DEVIS_DELETE), deleteDevis);

module.exports = router;
