import { Router } from "express";
import {
  devisToFacture,
  deleteFacture,
  getFacture,
  getFactures,
  exportFacture,
  exportBonLivraison,
  uploadRapport,
  updateFacture,
} from "../controller/factureController.js";

import { protect } from "../controller/authController.js";
import featuresCheck from "../middlewares/featuresCheck.js";
import {
  BONLIVRAISON_READ,
  FACTURE_CREATE,
  FACTURE_DELETE,
  FACTURE_READ,
  FACTURE_UPDATE,
} from "../data/FeaturesList.js";

const router = Router();

router.use(protect);

router.get("/", featuresCheck(FACTURE_READ), getFactures);

router.get(
  "/:documentID/exportFacture",
  featuresCheck(FACTURE_READ),
  exportFacture
);

router.get(
  "/:documentID/exportBonLivraison",
  featuresCheck(BONLIVRAISON_READ),
  exportBonLivraison
);

router.post("/devisToFacture", featuresCheck(FACTURE_CREATE), devisToFacture);

router
  .route("/:documentID")
  .get(featuresCheck(FACTURE_READ), getFacture)
  .patch(featuresCheck(FACTURE_UPDATE), uploadRapport, updateFacture)
  .delete(featuresCheck(FACTURE_DELETE), deleteFacture);

export default router;
