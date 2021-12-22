const validateRequestInputs = require("../utils/inputValidator");

const checkIsAuthenticated = (req, res, next) => {
  return res.json({ message: "Checking if user is authenticated..." });
};

const checkIsAdmin = (req, res, next) => {
  return res.json({ message: "Checking if user is admin..." });
};

const logout = (req, res, next) => {
  return res.json({ message: "Logging out..." });
};

const registerUser = (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }
  res.json({ message: "Regestering User" });
};

const login = (req, res, next) => {
  return res.json({ message: "Logging in..." });
};

exports.checkIsAuthenticated = checkIsAuthenticated;
exports.checkIsAdmin = checkIsAdmin;
exports.logout = logout;
exports.registerUser = registerUser;
exports.login = login;
