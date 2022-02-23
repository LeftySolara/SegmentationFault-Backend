const jwt = require("jsonwebtoken");

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

  let token;
  try {
    token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" },
    );
  } catch (err) {
    const error = new HttpError(
      "Logging in failed. Please try again later.",
      500,
    );
    return next(error);
  }

  return res.status(200).json({
    userId: user.id,
    email: user.email,
    token,
  });
};

exports.checkIsAuthenticated = checkIsAuthenticated;
exports.checkIsAdmin = checkIsAdmin;
exports.logout = logout;
exports.login = login;
