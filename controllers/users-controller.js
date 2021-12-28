const validateRequestInputs = require("../utils/inputValidator");
const HttpError = require("../utils/http-error");
const logger = require("../utils/logger");

const User = require("../models/user");

const getAllUsers = (req, res, next) => {
  return res.json({ message: "Fetching all users..." });
};

const getUserById = (req, res, next) => {
  const id = req.params.userId;
  return res.json({ message: `Fetching user ${id}...` });
};

/**
 * Creates a new user and enters their info into the database.
 *
 * @param {String} req.body.username The username of the user.
 * @param {String} req.body.email The user's email address.
 * @param {String} req.body.password The user's password.
 *
 * @returns On success, returns a JSON-formatted HTTP response.
 */
const createUser = async (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }

  const { username, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ $or: [{ email }, { username }] });
  } catch (err) {
    const error = new HttpError("Registration failed.", 500);
    return next(error);
  }

  if (existingUser) {
    let error;
    if (existingUser.email === email) {
      error = new HttpError(
        "Email already in use. Please log in instead.",
        422,
      );
    } else if (existingUser.username === username) {
      error = new HttpError(
        "Username already in use. Please log in instead.",
        422,
      );
    }
    return next(error);
  }

  const createdUser = new User({
    username,
    email,
    password,
    joinDate: Date.now(),
    avatar: "avatar",
    posts: [],
    threads: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "Failed to create user. Please try again.",
      500,
    );
    return next(error);
  }

  logger.info(`Created new user ${username}.`);
  return res.status(201).json({ message: `Created new user ${username}` });
};

const updateUser = (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }
  return res.json({ message: "Updating user..." });
};

const deleteUser = (req, res, next) => {
  const id = req.params.userId;
  return res.json({ message: `Deleting user ${id}...` });
};

exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
