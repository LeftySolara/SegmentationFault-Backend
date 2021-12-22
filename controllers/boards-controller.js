const validateRequestInputs = require("../utils/inputValidator");

const getAllBoards = (req, res, next) => {
  return res.json({ message: "Fetching all boards..." });
};

const getBoardById = (req, res, next) => {
  const id = req.params.boardId;
  return res.json({ message: `Fetching board ${id}...` });
};

const createBoard = (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }
  return res.json({ message: "Creating board..." });
};

const updateBoard = (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }
  const id = req.params.boardId;
  return res.json({ message: `Updating board ${id}...` });
};

const deleteBoard = (req, res, next) => {
  const id = req.params.boardId;
  return res.json(`Deleting board ${id}...`);
};

exports.getAllBoards = getAllBoards;
exports.getBoardById = getBoardById;
exports.createBoard = createBoard;
exports.updateBoard = updateBoard;
exports.deleteBoard = deleteBoard;
