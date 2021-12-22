const validateRequestInputs = require("../utils/inputValidator");

const getAllCategories = (req, res, next) => {
  return res.json({ message: "Fetching all board categories..." });
};

const getCategoryById = (req, res, next) => {
  const id = req.params.boardCategoryId;
  return res.json({ message: `Fetching board category ${id}...` });
};

const createCategory = (req, res, next) => {
  const validationErrpr = validateRequestInputs(req);
  if (validationErrpr) {
    return next(validationErrpr);
  }
  return res.json({ message: "Creating board category..." });
};

const updateCategory = (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }
  const id = req.params.boardCategoryId;
  return res.json({ message: `Updating board category ${id}...` });
};

const deleteCategory = (req, res, next) => {
  const id = req.params.boardCategoryId;
  return res.json({ message: `Deleting board category ${id}...` });
};

exports.getAllCategories = getAllCategories;
exports.getCategoryById = getCategoryById;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
