const User = require("../models/user");
const HttpError = require("../utils/http-error");

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

/**
 * Logs the user into the application.
 *
 * @param {String} req.body.email The user's email address
 * @param {String} req.body.password The user's password.
 *
 * @returns On success, returns a 200 status code and a user object.
 */
const login = async (req, res, next) => {
  const { email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email });
  } catch (err) {
    const error = new HttpError("Login failed. Please try again later.", 500);
    return next(error);
  }

  if (!user || !(await user.comparePassword(password))) {
    const error = new HttpError("Invalid credentials.", 401);
    return next(error);
  }

  const userObj = user.toObject({ getters: true });
  delete userObj.password;

  return res.status(200).json({
    message: "Login successful.",
    user: userObj,
  });
};

exports.checkIsAuthenticated = checkIsAuthenticated;
exports.checkIsAdmin = checkIsAdmin;
exports.logout = logout;
exports.registerUser = registerUser;
exports.login = login;
