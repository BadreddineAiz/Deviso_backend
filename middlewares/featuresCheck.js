import AppError from "../utils/appError.js";

const featuresCheck = (requiredFeature) => {
  return (req, _, next) => {
    const user = req.user;
    const userFeatures = user.features;

    if (!userFeatures.includes(requiredFeature)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

export default featuresCheck;
