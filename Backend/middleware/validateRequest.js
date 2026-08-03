const AppError = require("../utils/AppError");

const validateRequest = (validator) => (req, res, next) => {
  const errors = validator(req);
  if (errors.length > 0) {
    return next(new AppError(errors[0], 400));
  }
  return next();
};

module.exports = validateRequest;
