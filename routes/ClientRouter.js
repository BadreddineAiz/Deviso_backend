import { Router } from "express";
import { createClient, deleteClient, getClient, getClients, updateClient } from "../controller/clientController.js";

import { protect } from "../controller/authController.js";
import featuresCheck from "../middlewares/featuresCheck.js";
import { CLIENT_CREATE, CLIENT_DELETE, CLIENT_READ, CLIENT_UPDATE } from "../data/FeaturesList.js";

const router = Router();

router.use(protect);

router
  .route("/")
  .get(featuresCheck(CLIENT_READ), getClients)
  .post(featuresCheck(CLIENT_CREATE), createClient);

router
  .route("/:documentID")
  .get(featuresCheck(CLIENT_READ), getClient)
  .patch(featuresCheck(CLIENT_UPDATE), updateClient)
  .delete(featuresCheck(CLIENT_DELETE), deleteClient);

export default router;
