const asyncHandler = require("express-async-handler");
const ApiFeatures = require("../utils/apiFeatures");

// Handler to get multiple documents with filtering, sorting, and pagination
exports.getDocuments = (Model) =>
  asyncHandler(async (req, res) => {
    const filter = { user: req.user.id };
    const features = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // Execution
    const documents = await features.query;
    res.status(200).json({
      status: "success",
      results: documents.length,
      data: documents,
    });
  });

// Handler to get a single document by ID
exports.getDocument = (Model) =>
  asyncHandler(async (req, res, next) => {
    const filter = { user: req.user.id };
    const document = await Model.findOne({
      _id: req.params.documentID,
      ...filter,
    });
    if (!document) {
      return next({ status: 404, message: "Document Not Found" });
    }
    res.status(200).json({
      status: "success",
      data: document,
    });
  });

// Handler to create a new document
exports.createDocument = (Model) =>
  asyncHandler(async (req, res, next) => {
    if (!req.body) {
      return next({ status: 400, message: "Please enter Document Data" });
    }
    const document = await Model.create({ ...req.body, user: req.user.id });
    res.status(201).json({
      status: "success",
      data: document,
    });
  });

// Handler to delete a document by ID (soft delete)
exports.deleteDocument = (Model) =>
  asyncHandler(async (req, res, next) => {
    const filter = { user: req.user.id };
    const document = await Model.findOneAndUpdate(
      {
        _id: req.params.documentID,
        ...filter,
      },
      { active: false },
      { new: true } // Return the updated document
    );
    if (!document) {
      return next({ status: 404, message: "Document Not Found" });
    }
    res.status(200).json({
      status: "success",
      data: null,
    });
  });

// Handler to update a document by ID
exports.updateDocument = (Model) =>
  asyncHandler(async (req, res, next) => {
    const filter = { user: req.user.id };
    const document = await Model.findOneAndUpdate(
      {
        _id: req.params.documentID,
        ...filter,
      },
      req.body,
      { new: true, runValidators: true }
    );
    if (!document) {
      return next({ status: 404, message: "Document Not Found" });
    }
    res.status(200).json({
      status: "success",
      data: document,
    });
  });
