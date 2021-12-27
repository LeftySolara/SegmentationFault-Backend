const validateRequestInputs = require("../utils/inputValidator");

const getAllUsers = (req, res, next) => {
  return res.json({ message: "Fetching all users..." });
};

const getUserById = (req, res, next) => {
  const id = req.params.userId;
  return res.json({ message: `Fetching user ${id}...` });
};

const createUser = (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }
  return res.json({ message: "Creating user..." });
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
