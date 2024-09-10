const express = require("express");
const {
  devisToFacture,
  deleteFacture,
  getFacture,
  getFactures,
  exportFacture,
} = require("../controller/factureController.js");

const { protect } = require("../controller/authController.js");
const featuresCheck = require("../middlewares/featuresCheck.js");
const {
  FACTURE_CREATE,
  FACTURE_DELETE,
  FACTURE_READ,
} = require("../data/FeaturesList.js");

const router = express.Router();

router.use(protect);

router.get("/", featuresCheck(FACTURE_READ), getFactures);

router.get(
  "/:documentID/exportFacture",
  featuresCheck(FACTURE_READ),
  exportFacture
);

router.post("/devisToFacture", featuresCheck(FACTURE_CREATE), devisToFacture);

router
  .route("/:documentID")
  .get(featuresCheck(FACTURE_READ), getFacture)
  .delete(featuresCheck(FACTURE_DELETE), deleteFacture);

module.exports = router;
