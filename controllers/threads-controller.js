const mongoose = require("mongoose");

const validateRequestInputs = require("../utils/inputValidator");
const HttpError = require("../utils/http-error");
const logger = require("../utils/logger");

const Thread = require("../models/thread");
const Board = require("../models/board");
const User = require("../models/user");

/**
 * Fetches all threads in the database.
 */
const getAllThreads = async (req, res, next) => {
  let threads;

  try {
    threads = await Thread.find({});
  } catch (err) {
    logger.error("Failed to fetch threads for GET request at /threads.");
    const error = new HttpError("Fetching threads failed.", 500);
    return next(error);
  }

  return res.status(200).json({
    threads: threads.map((thread) => thread.toObject({ getters: true })),
  });
};

/**
 * Fetches a thread based on its ID.
 */
const getThreadById = async (req, res, next) => {
  const { threadId } = req.params;

  let thread;
  try {
    thread = await Thread.findById(threadId);
  } catch (err) {
    const error = new HttpError(
      `Could not find thread with ID ${threadId}.`,
      404,
    );
    return next(error);
  }

  return res.status(200).json({ thread: thread.toObject({ getters: true }) });
};

/**
 * Fetches a list of all threads created by a specific user.
 *
 * @param {String} req.params.authorId The ID of the user to find threads for.
 */
const getThreadsByUser = async (req, res, next) => {
  const { authorId } = req.params;

  let threads;
  try {
    threads = await Thread.find({ author: authorId });
  } catch (err) {
    const error = new HttpError("Error fetching threads from user.", 500);
    return next(error);
  }

  return res.status(200).json({
    threads: threads.map((thread) => thread.toObject({ getters: true })),
  });
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
