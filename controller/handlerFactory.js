import asyncHandler from "express-async-handler";
import ApiFeatures from "../utils/apiFeatures.js";
import AppError from "../utils/appError.js";
import { filterObj } from "../utils/helpers.js";

// Handler to get multiple documents with filtering, sorting, and pagination
export function getDocuments(Model, createViewFilter) {
  return asyncHandler(async (req, res) => {
    let filter = {};
    if (createViewFilter) {
      filter = createViewFilter(req);
    }
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
export function getDocument(Model, createViewFilter) {
  return asyncHandler(async (req, res, next) => {
    let filter = {};
    if (createViewFilter) {
      filter = createViewFilter(req);
    }
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
export function createDocument(
  Model,
  createAdditionalData,
  allowedFields,
  notAllowedFileds,
  fieldValuesVerify
) {
  return asyncHandler(async (req, res, next) => {
    if (!req.body) {
      return next(new AppError("Please enter Document Data", 400));
    }
    const AdditionalData = createAdditionalData
      ? createAdditionalData(req)
      : {};

    if (notAllowedFileds?.length) {
      for (const [key] of Object.entries(req.body)) {
        if (notAllowedFileds.includes(key)) {
          delete req.body[key];
        }
      }
    }
    let newValues = req.body;
    if (allowedFields?.length) {
      newValues = filterObj(req.body, ...allowedFields);
    }

    const modelData = { ...newValues, ...AdditionalData };

    if (fieldValuesVerify) {
      const error = await fieldValuesVerify(modelData);

      if (error) {
        return next(error);
      }
    }

    const document = await Model.create(modelData);
    res.status(201).json({
      status: "success",
      data: document,
    });
  });
}

// Handler to delete a document by ID (soft delete)
export function deleteDocument(Model, createViewFilter) {
  return asyncHandler(async (req, res, next) => {
    let filter = {};
    if (createViewFilter) {
      filter = createViewFilter(req);
    }
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
export function updateDocument(
  Model,
  createViewFilter,
  allowedFields,
  notAllowedFileds,
  fieldValuesVerify,
  createAdditionalData
) {
  return asyncHandler(async (req, res, next) => {
    let filter = {};
    if (createViewFilter) {
      filter = createViewFilter(req);
    }
    const AdditionalData = createAdditionalData
      ? createAdditionalData(req)
      : {};
    if (notAllowedFileds?.length) {
      for (const [key] of Object.entries(req.body)) {
        if (notAllowedFileds.includes(key)) {
          delete req.body[key];
        }
      }
    }
    let newValues = req.body;
    if (allowedFields?.length) {
      newValues = filterObj(req.body, ...allowedFields);
    }
    const modelData = { ...newValues, ...AdditionalData };

    // Not allowing changing user
    delete newValues.user;

    const document = await Model.findOne({
      _id: req.params.documentID,
      ...filter,
    });

    if (!document) {
      return next(new AppError("Document Not Found", 404));
    }

    // Update the document with the new values
    Object.assign(document, modelData);

    if (fieldValuesVerify) {
      const error = await fieldValuesVerify(document);

      if (error) {
        return next(error);
      }
    }

    // Save the document
    await document.save({ validateBeforeSave: true });

    res.status(200).json({
      status: "success",
      data: document,
    });
  });
}
