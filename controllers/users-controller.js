const jwt = require("jsonwebtoken");
const validateRequestInputs = require("../utils/inputValidator");
const HttpError = require("../utils/http-error");
const logger = require("../utils/logger");

const User = require("../models/user");

/**
 * Fetches a list of all users in the database.
 */
const getAllUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find({}, "-password");
  } catch (err) {
    logger.error("Failed to fetch users for GET request at /users");
    const error = new HttpError("Fetching users failed.", 500);
    return next(error);
  }

  return res.json({
    users: users.map((user) => user.toObject({ getters: true })),
  });
};

/**
 * Fetches a user based on their user id.
 *
 * @returns On success, returns a JSON-formatted HTTP response containing the user's information.
 */
const getUserById = async (req, res, next) => {
  const { userId } = req.params;

  let user;
  try {
    user = await User.findById(userId, "-password");
  } catch (err) {
    const error = new HttpError(`Could not find user with id ${userId}.`, 404);
    return next(error);
  }

  return res.json({ user: user.toObject({ getters: true }) });
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

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" },
    );
  } catch (err) {
    const error = new HttpError(
      "Signing up failed. Please try again later.",
      500,
    );
    return next(error);
  }

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

  return res.status(201).json({
    userId: createdUser.id,
    username: createdUser.username,
    email: createdUser.email,
    token,
  });
};

/**
 * Updates a user's information.
 *
 * @param {String} req.body.username The username of the user.
 * @param {String} req.body.email The user's email address.
 * @param {String} req.body.password The user's password.
 * @param {String} req.body.avatar The user's avatar image.
 *
 * @returns On success, returns a JSON-formatted HTTP response containing the user's updated information.
 */
const updateUser = async (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }

  const { username, email, password, avatar } = req.body;
  const { userId } = req.params;
  let user;

  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError("User not found.", 404);
    return next(error);
  }

  user.username = username;
  user.email = email;
  user.password = password;
  user.avatar = avatar;

  try {
    await user.save({ validateModifiedOnly: true });
  } catch (err) {
    const error = new HttpError("Could not update user information.", 500);
    return next(error);
  }

  /* Here we manually remove the password property from the returned user object.
   * This does not affect the password field in the document stored in the database.
   *
   * We do this because mongoose's toObject() method fetches all fields of a document regardless
   * of the projection specified in the previous find() call. So, for example, calling
   * user = User.findById(userId, "-password") will fetch the document with the correct projection,
   * but the following user.toObject() call will re-add the password property.
   */
  const returnedUser = user.toObject({ getters: true });
  delete returnedUser.password;

  return res.json({ user: returnedUser });
};

exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.createUser = createUser;
exports.updateUser = updateUser;
