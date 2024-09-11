import { Router } from "express";
import { createDevis, deleteDevis, exportDevis, getDevis, getDeviss, updateDevis } from "../controller/devisController.js";

import { protect } from "../controller/authController.js";
import featuresCheck from "../middlewares/featuresCheck.js";
import { DEVIS_CREATE, DEVIS_DELETE, DEVIS_READ, DEVIS_UPDATE } from "../data/FeaturesList.js";

const router = Router();

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

export default router;
