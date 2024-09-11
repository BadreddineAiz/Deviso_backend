import asyncHandler from "express-async-handler";
import { launch } from "puppeteer";
import { promises as fs } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { getDocuments, getDocument, deleteDocument } from "./handlerFactory.js";
import Devis from "../model/devisModel.js";
import {
  FactureDevisFooterTemplate,
  FactureDevisTemplate,
} from "../templates/Templates.js";
import { format } from "date-fns";
import { fetchImageAsBase64, filterObj } from "../utils/helpers.js";
import Client from "../model/clientModel.js";
import multer from "multer";

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/bonCommands");
  },
  filename: (req, file, cb) => {
    cb(null, `bonCommand-${req.user.id}-${Date.now()}.pdf`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[1] == "pdf") {
    cb(null, true);
  } else {
    cb(new Error("Not a PDF File! Please upload only PDF"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadBonCommand = upload.single("bonCommand");

export const getDevis = getDocument(Devis);
export const getDeviss = getDocuments(Devis);

export const createDevis = asyncHandler(async (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      status: "fail",
      message: "Please enter Devis Data",
    });
  }

  const client = await Client.findOne({
    user: req.user.id,
    _id: req.body.client,
  });

  if (!client) {
    return res.status(404).json({
      status: "fail",
      message: "Client Not Found",
    });
  }

  if (req.file) req.body.bonCommand = req.file.filename;

  const devis = await Devis.create({ ...req.body, user: req.user.id });

  res.status(200).json({
    status: "success",
    data: devis,
  });
});

export const updateDevis = asyncHandler(async (req, res) => {
  const filter = { user: req.user.id };
  const filtredBody = filterObj(req.body, "articles", "numeroBonCommand");

  if (req.file) filtredBody.bonCommand = req.file.filename;

  const devis = await Devis.findOneAndUpdate(
    {
      _id: req.params.documentID,
      ...filter,
    },
    filtredBody,
    { new: true, runValidators: true }
  );

  if (!devis) {
    return res.status(404).json({
      status: "fail",
      message: "Devis Not Found",
    });
  }

  res.status(200).json({
    status: "success",
    data: devis,
  });
});

export const deleteDevis = deleteDocument(Devis);

export const exportDevis = asyncHandler(async (req, res) => {
  const devis = await Devis.findOne({
    user: req.user.id,
    _id: req.params.documentID,
  })
    .populate("user")
    .populate("client");

  if (!devis) {
    return res.status(404).json({
      status: "fail",
      message: "Devis Not Found",
    });
  }

  const user = devis.user;
  const client = devis.client;

  const docType = "Devis";
  const mainColor = user.mainColor;
  const secondColor = user.secondColor;
  const PORT = process.env.PORT || 5000;
  const logo = await fetchImageAsBase64(
    `${req.protocol}://${req.hostname}:${PORT}/images/users/${user.logo}`
  );
  const clientName = client.name;
  const clientTel = client.tel;
  const clientICE = client.ice;
  const clientAddress = client.address;
  const userName = user.name;
  const userEmail = user.email;
  const date = format(devis.createdAt, "dd/MM/yyyy");
  const docNumber = `DEV-${devis.createdAt.getFullYear()}-${devis.numero}`;
  const articles = devis.articles;
  const userICE = user.ice;
  const userIF = user.if;
  const userPatente = user.patente;
  const userRC = user.rc;
  const userCNSS = user.cnss;
  const userRib = user.rib;
  const userTel = user.tel;
  const userAddress = user.address;
  const object = devis.object;

  const htmlContent = FactureDevisTemplate({
    docType,
    object,
    mainColor,
    secondColor,
    logo,
    date,
    clientName,
    clientTel,
    clientICE,
    clientAddress,
    userName,
    userEmail,
    docNumber,
    articles,
    userICE,
    userIF,
    userPatente,
    userRC,
    userCNSS,
    userRib,
    userTel,
    userAddress,
  });

  // Launch Puppeteer and generate PDF
  const browser = await launch({
    headless: true, // Ensure headless mode is enabled
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // Add these flags
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent);

  // Path where the PDF will be saved
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const tempFilePath = join(
    __dirname,
    `../temp/devis_${user._id}_${docNumber}.pdf`
  );

  // Generate the PDF
  await page.pdf({
    path: tempFilePath,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    footerTemplate: FactureDevisFooterTemplate(docType, docNumber),
  });

  await browser.close();

  // Send the PDF as a response
  res.contentType("application/pdf");
  res.sendFile(tempFilePath, async (err) => {
    if (err) {
      return res.status(500).json({
        status: "fail",
        message: "Error sending file",
      });
    }
    await fs.unlink(tempFilePath); // Cleanup the temporary file
  });
});
