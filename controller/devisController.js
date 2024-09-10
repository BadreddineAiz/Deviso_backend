const asyncHandler = require("express-async-handler");
const puppeteer = require("puppeteer");
const path = require("path");
const { promises: fs } = require("fs");

const {
  getDocuments,
  getDocument,
  deleteDocument,
} = require("./handlerFactory.js");
const Devis = require("../model/devisModel.js");
const {
  FactureDevisFooterTemplate,
  FactureDevisTemplate,
} = require("../templates/Templates.js");
const { format } = require("date-fns");
const { filterObj } = require("../utils/helpers.js");
const Client = require("../model/clientModel.js");

exports.getDevis = getDocument(Devis);
exports.getDeviss = getDocuments(Devis);

exports.createDevis = asyncHandler(async (req, res) => {
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

  const devis = await Devis.create({ ...req.body, user: req.user.id });

  res.status(200).json({
    status: "success",
    data: devis,
  });
});

exports.updateDevis = asyncHandler(async (req, res) => {
  const filter = { user: req.user.id };
  const filtredBody = filterObj(req.body, "articles", "numeroBonCommand");

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

exports.deleteDevis = deleteDocument(Devis);

exports.exportDevis = asyncHandler(async (req, res) => {
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
  const logo = `${req.protocol}://${req.hostname}:${PORT}/images/users/${user.logo}`;
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
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent);

  // Path where the PDF will be saved
  const tempFilePath = path.join(
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
