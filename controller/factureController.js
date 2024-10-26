import asyncHandler from "express-async-handler";
import { launch } from "puppeteer";
import { promises as fs } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { getDocument } from "./handlerFactory.js";
import Facture from "../model/factureModel.js";
import {
  FactureDevisFooterTemplate,
  FactureDevisTemplate,
} from "../templates/Templates.js";
import { format } from "date-fns";
import { fetchImageAsBase64, filterObj } from "../utils/helpers.js";
import multer from "multer";
import AppError from "../utils/appError.js";
import ApiFeatures from "../utils/apiFeatures.js";
import Devis from "../model/devisModel.js";

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/rapports");
  },
  filename: (req, file, cb) => {
    cb(null, `rapport-${req.user.id}-${Date.now()}.pdf`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[1] == "pdf") {
    cb(null, true);
  } else {
    cb(new AppError("Not a PDF File! Please upload only PDF", 500), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadRapport = upload.single("rapport");

export const getFacture = getDocument(Facture);
export const getFactures = asyncHandler(async (req, res) => {
  const filter = { user: req.user.id, active: true };
  req.query.sort = "-createdAt";
  const features = new ApiFeatures(
    Facture.find(filter).populate("client"),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  // Execution
  const documents = await features.query;
  const totalItems = await Facture.countDocuments(filter);
  res.status(200).json({
    status: "success",
    totalItems,
    results: documents.length,
    data: documents,
  });
});

export const updateFacture = asyncHandler(async (req, res) => {
  const filter = { user: req.user.id };
  const filtredBody = filterObj(req.body, "payer");
  if (req.file) filtredBody.rapport = req.file.filename;

  const facture = await Facture.findOneAndUpdate(
    {
      _id: req.params.documentID,
      ...filter,
    },
    filtredBody,
    { new: true, runValidators: true }
  );

  if (!facture) {
    return res.status(404).json({
      status: "fail",
      message: "Facture Not Found",
    });
  }

  res.status(200).json({
    status: "success",
    data: facture,
  });
});

export const devisToFacture = asyncHandler(async (req, res) => {
  if (!req.body.devis) {
    return res.status(400).json({
      status: "fail",
      message: "Please enter Devis",
    });
  }

  const devis = await Devis.findOne({ user: req.user.id, _id: req.body.devis });

  if (!devis) {
    return res.status(404).json({
      status: "fail",
      message: `This Devis ${req.body.devis} doesn't exist`,
    });
  }

  if (devis.facture) {
    return res.status(400).json({
      status: "fail",
      message: `This Devis ${req.body.devis} has already been transformed to a facture`,
    });
  }

  const totalAmount = devis.articles.reduce(
    (prev, curr) =>
      prev + (curr.prixHT + curr.prixHT * curr.tva) * curr.quantity,
    0
  );

  const facture = await Facture.create({
    client: devis.client,
    devis: devis._id,
    user: req.user.id,
    articles: devis.articles,
    bonCommand: devis.bonCommand,
    numeroBonCommand: devis.numeroBonCommand,
    object: devis.object,
    totalAmount,
  });

  devis.facture = facture._id;
  await devis.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    data: facture,
  });
});

export const toFactureAvoir = asyncHandler(async (req, res) => {
  if (!req.body.facture) {
    return res.status(400).json({
      status: "fail",
      message: "Please enter Facture",
    });
  }

  const facture = await Facture.findOne({
    user: req.user.id,
    _id: req.body.facture,
  });

  if (!facture) {
    return res.status(404).json({
      status: "fail",
      message: `This Facture ${req.body.facture} doesn't exist`,
    });
  }

  if (facture.refFacture.id) {
    return res.status(400).json({
      status: "fail",
      message: `Cette Facture a été deja transformé en facture avoir`,
    });
  }

  if (!facture.payer) {
    return res.status(400).json({
      status: "fail",
      message: `Cette Facture n'est pas payer`,
    });
  }

  const { articlesToRefund } = req.body;

  // 2. Calculate the total amount of the avoir (credit note)
  let totalAvoirAmount = 0;

  const avoirArticles = facture.articles
    .map((article) => {
      const refundArticle = articlesToRefund.find(
        (a) => a.designation === article.designation
      );

      if (refundArticle) {
        // Calculate the refund amount based on the quantity to refund
        const refundQuantity = Math.min(
          refundArticle.quantity,
          article.quantity
        ); // Ensure we don't refund more than originally bought
        const refundAmount =
          refundQuantity * (article.prixHT + article.prixHT * article.tva);

        totalAvoirAmount += refundAmount;

        return {
          designation: article.designation,
          quantity: -refundQuantity, // Negative quantity for avoir
          prixHT: article.prixHT,
          tva: article.tva,
        };
      }

      return null;
    })
    .filter(Boolean); // Remove null values for articles that are not being refunded

  const factureAvoir = await Facture.create({
    client: facture.client,
    devis: facture.devis,
    refFacture: { id: facture._id, numero: facture.numero },
    user: req.user.id,
    articles: avoirArticles,
    bonCommand: facture.bonCommand,
    numeroBonCommand: facture.numeroBonCommand,
    object: facture.object,
    isAvoir: true,
    totalAmount: -totalAvoirAmount, // The total amount is negative for a credit note
  });

  res.status(200).json({
    status: "success",
    data: factureAvoir,
  });
});

export const exportFacture = asyncHandler(async (req, res) => {
  const facture = await Facture.findOne({
    user: req.user.id,
    _id: req.params.documentID,
  })
    .populate("user")
    .populate("client");

  if (!facture) {
    return res.status(404).json({
      status: "fail",
      message: "Facture Not Found",
    });
  }

  const user = facture.user;
  const client = facture.client;

  const mainColor = user.mainColor ?? "#161D6F";
  const secondColor = user.secondColor ?? "#98DED9";
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
  const date = format(facture.createdAt, "dd/MM/yyyy");
  const articles = facture.articles;
  const userICE = user.ice;
  const userIF = user.if;
  const userPatente = user.patente;
  const userRC = user.rc;
  const userCNSS = user.cnss;
  const userRib = user.rib;
  const userTel = user.tel;
  const userAddress = user.address;
  const { numeroBonCommand } = facture;
  const object = facture.object;
  const { isAvoir } = facture;
  const docType = isAvoir ? "Facture Avoir" : "Facture";
  const docNumber = `${
    isAvoir ? "AVR" : "FCT"
  }-${facture.createdAt.getFullYear()}-${facture.numero}`;

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
    numeroBonCommand,
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
    `../temp/facture_${user._id}_${docNumber}.pdf`
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

export const deleteFacture = asyncHandler(async (req, res) => {
  const facture = await Facture.findOneAndUpdate(
    {
      user: req.user.id,
      _id: req.params.documentID,
    },
    { active: false },
    { new: true }
  );

  if (!facture) {
    return res.status(404).json({
      status: "fail",
      message: "Facture Not Found",
    });
  }

  const devis = await Devis.findById(facture.devis);
  if (devis) {
    devis.facture = undefined;
    await devis.save({ validateBeforeSave: false });
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});

export const exportBonLivraison = asyncHandler(async (req, res) => {
  const facture = await Facture.findOne({
    user: req.user.id,
    _id: req.params.documentID,
  })
    .populate("user")
    .populate("client");

  if (!facture) {
    return res.status(404).json({
      status: "fail",
      message: "Facture Not Found",
    });
  }

  const user = facture.user;
  const client = facture.client;

  const docType = "Bon de Livraison";
  const mainColor = user.mainColor ?? "#161D6F";
  const secondColor = user.secondColor ?? "#98DED9";
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
  const date = format(facture.createdAt, "dd/MM/yyyy");
  const docNumber = `BL-${facture.createdAt.getFullYear()}-${facture.numero}`;
  const articles = facture.articles;
  const userICE = user.ice;
  const userIF = user.if;
  const userPatente = user.patente;
  const userRC = user.rc;
  const userCNSS = user.cnss;
  const userRib = user.rib;
  const userTel = user.tel;
  const userAddress = user.address;
  const { numeroBonCommand } = facture;
  const object = facture.object;

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
    numeroBonCommand,
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
    `../temp/bonLivraison_${user._id}_${docNumber}.pdf`
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
