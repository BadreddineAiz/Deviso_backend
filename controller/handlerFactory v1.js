import asyncHandler from "express-async-handler";
import ApiFeatures from "../utils/apiFeatures.js";
import AppError from "../utils/appError.js";

// Handler to get multiple documents with filtering, sorting, and pagination
export function getDocuments(Model) {
  return asyncHandler(async (req, res) => {
    const filter = { user: req.user.id, active: true };
    const features = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // Execution
    const documents = await features.query;
    const totalItems = await Model.countDocuments(filter);
    res.status(200).json({
      status: "success",
      totalItems,
      results: documents.length,
      data: documents,
    });
  });
}

// Handler to get a single document by ID
export function getDocument(Model) {
  return asyncHandler(async (req, res, next) => {
    const filter = { user: req.user.id };
    const document = await Model.findOne({
      _id: req.params.documentID,
      ...filter,
    });
    if (!document) {
      return next(new AppError("Document Not Found", 404));
    }
    res.status(200).json({
      status: "success",
      data: document,
    });
  });
}

// Handler to create a new document
export function createDocument(Model) {
  return asyncHandler(async (req, res, next) => {
    if (!req.body) {
      return next(new AppError("Please enter Document Data", 400));
    }
    const document = await Model.create({ ...req.body, user: req.user.id });
    res.status(201).json({
      status: "success",
      data: document,
    });
  });
}

// Handler to delete a document by ID (soft delete)
export function deleteDocument(Model) {
  return asyncHandler(async (req, res, next) => {
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
      return next(new AppError("Document Not Found", 404));
    }
    res.status(200).json({
      status: "success",
      data: null,
    });
  });
}

// Handler to update a document by ID
export function updateDocument(Model) {
  return asyncHandler(async (req, res, next) => {
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
      return next(new AppError("Document Not Found", 404));
    }
    res.status(200).json({
      status: "success",
      data: document,
    });
  });
}
