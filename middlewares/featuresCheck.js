const featuresCheck = (requiredFeature) => {
  return (req, _, next) => {
    const user = req.user;
    const userFeatures = user.features;

    if (!userFeatures.includes(requiredFeature)) {
      return next(
        new Error("You do not have permission to perform this action")
      );
    }
    next();
  };
};

module.exports = featuresCheck;
