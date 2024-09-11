import User from "../model/userModel.js";
import asyncHandler from "express-async-handler";
import { getDocument, getDocuments } from "./handlerFactory.js";
import { filterObj } from "../utils/helpers.js";

export const getUsers = getDocuments(User);

export const getUser = getDocument(User);

export const getMe = asyncHandler(async (req, res) => {
  const document = await User.findById(req.user.id);
  if (!document) {
    return res.status(404).json({
      status: "fail",
      message: "Document Not Found",
    });
  }
  res.status(200).json({
    status: "success",
    data: document,
  });
});

export const updateMe = asyncHandler(async (req, res) => {
  if (req.body.password || req.body.passwordConfirm) {
    return res.status(400).json({
      status: "fail",
      message:
        "This route is not for password updates. Please use /updateMyPassword",
    });
  }

  const filteredBody = filterObj(req.body, "name", "email");
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    return res.status(404).json({
      status: "fail",
      message: "User Not Found",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

export const deleteMe = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
