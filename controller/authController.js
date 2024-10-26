import User from "../model/userModel.js";
import jsonwebtoken from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { promisify } from "util";
import sendEmail from "../utils/email.js";
import { createHash } from "crypto";
import AppError from "../utils/appError.js";

const signToken = (id) => {
  return jsonwebtoken.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, res) => {
  const token = signToken(user.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    httpOnly: true,
  };

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(200).json({ status: "success", token, user });
};

export const signUp = asyncHandler(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    ice: req.body.ice,
    if: req.body.if,
    patente: req.body.patente,
    rc: req.body.rc,
    cnss: req.body.cnss,
    rib: req.body.rib,
    tel: req.body.tel,
    address: req.body.address,
  });

  createAndSendToken(newUser, res);
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(
      new AppError("Please provide us with your email and password", 401)
    );
  }

  // Verify email and password existence in DB
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  if (user.licenseExpire < new Date()) {
    return next(
      new AppError(
        "Your license has expired. Please renew your subscription or contact support for assistance.",
        401
      )
    );
  }

  createAndSendToken(user, res);
});

export const logout = (req, res) => {
  res.clearCookie("jwt");
  res.sendStatus(200);
};

export const refreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies.jwt; // Retrieve token from cookies

  if (!token) {
    return next(new AppError("Not authenticated", 401));
  }

  try {
    const decoded = await promisify(jsonwebtoken.verify)(
      token,
      process.env.JWT_SECRET
    );

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError("User no longer exists", 401));
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "User recently changed password! Please log in again.",
          401
        )
      );
    }

    if (currentUser.licenseExpire < new Date()) {
      return next(
        new AppError(
          "Your license has expired. Please renew your subscription or contact support for assistance.",
          401
        )
      );
    }

    // If token is valid, send user data back to the frontend
    res.status(200).json({ status: "success", user: currentUser });
  } catch (err) {
    return next(new AppError("Invalid token", 401));
  }
});

export const protect = asyncHandler(async (req, _res, next) => {
  // Verify if the token exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (req.cookies) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // Verify the token
  let decoded = await promisify(jsonwebtoken.verify)(
    token,
    process.env.JWT_SECRET
  );

  // Check if the user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        "The User belonging to this token does no longer exist.",
        401
      )
    );
  }

  // Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  if (currentUser.licenseExpire < new Date()) {
    return next(
      new AppError(
        "Your license has expired. Please renew your subscription or contact support for assistance.",
        401
      )
    );
  }

  req.user = currentUser;
  if (currentUser.adminUser) {
    req.adminUser = await User.findById(currentUser.adminUser);
    console.log(req.adminUser);
  }
  // Grant access to protected Route
  next();
});

export function restrictTo(...roles) {
  return (req, _, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
}

export const forgotPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.email) {
    return next(new AppError("Please provide us with your email address", 401));
  }

  // 1) Get the user by email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with this email address", 401));
  }

  // 2) Generate the forgot password token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send the token to the user's email
  // const resetURL = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/user/resetpassword/${resetToken}`;

  // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;

  const message = `Deviso code de réinitialisation de mot de passe: ${resetToken}\nSi vous n'avez pas oublié votre mot de passe, veuillez ignorer cet e-mail.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message: message,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }

  res.status(200).json({
    status: "success",
    message: "Token sent to email!",
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on the Token
  const hashedToken = createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Log this user in
  createAndSendToken(user, res);
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  // 1) Get the user from the collection
  const user = await User.findById(req.user.id).select("+password");

  // 2) Compare the current password
  const currentPassword = req.body.currentPassword;
  if (!currentPassword) {
    return next(new AppError("Please enter current password", 401));
  }
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError("Incorrect Password, please try again!", 401));
  }

  // 3) Change the password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;

  await user.save();

  // 4) Log this user in
  createAndSendToken(user, res);
});
