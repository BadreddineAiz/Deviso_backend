import { Router } from "express";
import { devisToFacture, deleteFacture, getFacture, getFactures, exportFacture } from "../controller/factureController.js";

import { protect } from "../controller/authController.js";
import featuresCheck from "../middlewares/featuresCheck.js";
import { FACTURE_CREATE, FACTURE_DELETE, FACTURE_READ } from "../data/FeaturesList.js";

const router = Router();

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

export default router;
