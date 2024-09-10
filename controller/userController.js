const User = require("../model/userModel.js");
const asyncHandler = require("express-async-handler");
const { getDocument, getDocuments } = require("./handlerFactory.js");
const { filterObj } = require("../utils/helpers.js");

// Handler to get all users
exports.getUsers = getDocuments(User);

// Handler to get a single user by ID
exports.getUser = getDocument(User);

// Handler to get the current user's information
exports.getMe = asyncHandler(async (req, res) => {
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

// Handler to update the current user's information
exports.updateMe = asyncHandler(async (req, res) => {
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

// Handler to delete the current user (deactivate)
exports.deleteMe = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
