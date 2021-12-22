const { validationResult } = require("express-validator");
const logger = require("./logger");
const HttpError = require("./http-error");

/**
 * Helper function that checks for request validation errors.
 *
 * @param {Object} req The request object.
 *
 * @returns An HttpError object.
 */
const validateRequestInputs = (req) => {
  const result = validationResult(req);
  let err;

  if (!result.isEmpty()) {
    logger.error(
      `Invalid inputs passed for ${req.method} request at ${req.originalUrl}`,
    );
    err = new HttpError(result.errors[0].msg, 422);
  }

  return err;
};

module.exports = validateRequestInputs;
