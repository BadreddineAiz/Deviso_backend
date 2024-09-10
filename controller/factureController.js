const asyncHandler = require("express-async-handler");
const puppeteer = require("puppeteer");
const path = require("path");
const { promises: fs } = require("fs");

const { getDocuments, getDocument } = require("./handlerFactory.js");
const Facture = require("../model/factureModel.js");
const Devis = require("../model/devisModel.js");
const {
  FactureDevisFooterTemplate,
  FactureDevisTemplate,
} = require("../templates/Templates.js");
const { format } = require("date-fns");

exports.getFacture = getDocument(Facture);
exports.getFactures = getDocuments(Facture);

exports.devisToFacture = asyncHandler(async (req, res) => {
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

  const hasAFacture = await Facture.findOne({
    user: req.user.id,
    devis: devis._id,
  });

  if (hasAFacture) {
    return res.status(400).json({
      status: "fail",
      message: `This Devis ${req.body.devis} has already been transformed to a facture`,
    });
  }

  const facture = await Facture.create({
    client: devis.client,
    devis: devis._id,
    user: req.user.id,
  });

  devis.facture = facture._id;
  await devis.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    data: facture,
  });
});

exports.exportFacture = asyncHandler(async (req, res) => {
  const facture = await Facture.findOne({
    user: req.user.id,
    _id: req.params.documentID,
  })
    .populate("user")
    .populate("devis")
    .populate("client");

  if (!facture) {
    return res.status(404).json({
      status: "fail",
      message: "Facture Not Found",
    });
  }

  const user = facture.user;
  const devis = facture.devis;
  const client = facture.client;

  const docType = "Facture";
  const mainColor = user.mainColor ?? "#161D6F";
  const secondColor = user.secondColor ?? "#98DED9";
  const PORT = process.env.PORT || 5000;
  const logo = `${req.protocol}://${req.hostname}:${PORT}/images/users/${user.logo}`;
  const clientName = client.name;
  const clientTel = client.tel;
  const clientICE = client.ice;
  const clientAddress = client.address;
  const userName = user.name;
  const userEmail = user.email;
  const date = format(facture.createdAt, "dd/MM/yyyy");
  const docNumber = `FCT-${facture.createdAt.getFullYear()}-${devis.numero}`;
  const articles = devis.articles;
  const userICE = user.ice;
  const userIF = user.if;
  const userPatente = user.patente;
  const userRC = user.rc;
  const userCNSS = user.cnss;
  const userRib = user.rib;
  const userTel = user.tel;
  const userAddress = user.address;
  const { numeroBonCommand } = devis;
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
    numeroBonCommand,
  });

  // Launch Puppeteer and generate PDF
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent);

  // Path where the PDF will be saved
  const tempFilePath = path.join(
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

exports.deleteFacture = asyncHandler(async (req, res) => {
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
