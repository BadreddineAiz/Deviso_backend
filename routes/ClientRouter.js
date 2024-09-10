const express = require("express");
const {
  createClient,
  deleteClient,
  getClient,
  getClients,
  updateClient,
} = require("../controller/clientController.js");

const { protect } = require("../controller/authController.js");
const featuresCheck = require("../middlewares/featuresCheck.js");
const {
  CLIENT_CREATE,
  CLIENT_DELETE,
  CLIENT_READ,
  CLIENT_UPDATE,
} = require("../data/FeaturesList.js");

const router = express.Router();

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

module.exports = router;
