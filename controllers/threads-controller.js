const validateRequestInputs = require("../utils/inputValidator");

const getAllThreads = (req, res, next) => {
  return res.json({ message: "Fetching all threads..." });
};

const getThreadById = (req, res, next) => {
  const id = req.params.threadId;
  return res.json({ message: `Fetching thread ${id}...` });
};

const getThreadsByUser = (req, res, next) => {
  const id = req.params.userId;
  return res.json({ message: `Getting threads by user ${id}...` });
};

const createThread = (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }
  return res.json({ message: "Creating thread..." });
};

const updateThread = (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }
  const id = req.params.threadId;
  return res.json({ message: `Updating thread ${id}...` });
};

const deleteThread = (req, res, next) => {
  const id = req.params.threadId;
  return res.json({ message: `Deleting thread ${id}...` });
};

exports.getAllThreads = getAllThreads;
exports.getThreadById = getThreadById;
exports.getThreadsByUser = getThreadsByUser;
exports.createThread = createThread;
exports.updateThread = updateThread;
exports.deleteThread = deleteThread;
