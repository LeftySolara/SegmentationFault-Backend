const mongoose = require("mongoose");

const validateRequestInputs = require("../utils/inputValidator");
const HttpError = require("../utils/http-error");

const Thread = require("../models/thread");
const Board = require("../models/board");
const User = require("../models/user");

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

/**
 * Creates a new thread and saves it to the database.
 *
 * @param {String} req.body.topic The thread topic. This will be used as the name of the thread.
 *
 * @returns On success, returns a JSON-formatted HTTP response. On failure, returns an HttpError object.
 */
const createThread = async (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }

  const { authorId, boardId, topic } = req.body;

  /* Check whether the board exists. */
  let existingBoard;
  try {
    existingBoard = await Board.findById(boardId);
  } catch (err) {
    const error = new HttpError("Creating thread failed.");
    return next(error);
  }
  if (!existingBoard) {
    const error = new HttpError("Could not find board to assign thread.", 422);
    return next(error);
  }

  /* Check whether the author exists. */
  let existingUser;
  try {
    existingUser = await User.findById(authorId);
  } catch (err) {
    const error = new HttpError("Creating thread failed.");
    return next(error);
  }
  if (!existingUser) {
    const error = new HttpError("Could not find user to assign thread.", 422);
    return next(error);
  }

  const createdThread = new Thread({
    author: authorId,
    board: boardId,
    topic,
    dateCreated: Date.now(),
    posts: [],
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await createdThread.save({ session: sess });
    const threadId = createdThread.toObject({ getters: true }).id;

    existingBoard.threads.push(threadId);
    await existingBoard.save({ session: sess, validateModifiedOnly: true });

    existingUser.threads.push(threadId);
    await existingUser.save({ session: sess, validateModifiedOnly: true });

    sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Failed to create thread. Please try again.",
      500,
    );
    return next(error);
  }

  return res.status(201).json({ message: `Created new thread ${topic}` });
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
