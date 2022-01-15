const mongoose = require("mongoose");

const validateRequestInputs = require("../utils/inputValidator");
const HttpError = require("../utils/http-error");
const logger = require("../utils/logger");

const Post = require("../models/post");
const Thread = require("../models/thread");
const User = require("../models/user");

/**
 * Fetches a list of all posts in the database.
 */
const getAllPosts = async (req, res, next) => {
  let posts;

  try {
    posts = await Post.find({});
  } catch (err) {
    logger.error("Failed to fetch posts for GET request at /posts.");
    const error = new HttpError("Fetching posts failed.", 500);
    return next(error);
  }

  return res
    .status(200)
    .json({ posts: posts.map((post) => post.toObject({ getters: true })) });
};

/**
 * Fetches a post based on its ID.
 */
const getPostById = async (req, res, next) => {
  const { postId } = req.params;

  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    const error = new HttpError(`Could not find post with ID ${postId}.`, 404);
    return next(error);
  }

  return res.status(200).json({ post: post.toObject({ getters: true }) });
};

/**
 * Fetches a list of all posts created by a specific user.
 *
 * @param {String} req.params.userId The ID of the user to find posts for.
 */
const getPostsByUser = async (req, res, next) => {
  const { userId } = req.params;

  let posts;
  try {
    posts = await Post.find({ author: userId });
  } catch (err) {
    const error = new HttpError("Error fetching posts from user.", 500);
    return next(error);
  }

  return res
    .status(200)
    .json({ posts: posts.map((post) => post.toObject({ getters: true })) });
};

/**
 * Creates a new post in the database.
 *
 * @param {String} req.body.authorId The ID of the post's author.
 * @param {String} req.body.threadId The ID of the thread the post will be attached to.
 * @param {String} req.body.content The text content of the post.
 *
 * @returns On success, returns HTTP status code 201. Otherwise, passes the relavent error to the next middleware function.
 */
const createPost = async (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }

  const { authorId, threadId, content } = req.body;

  /* Check whether the thread exists. */
  let existingThread;
  try {
    existingThread = await Thread.findById(threadId);
  } catch (err) {
    const error = new HttpError("Creating post failed.", 500);
    return next(error);
  }
  if (!existingThread) {
    const error = new HttpError("Could not find thread to assign post.", 404);
    return next(error);
  }

  /* Check whether the author exists. */
  let existingUser;
  try {
    existingUser = await User.findById(authorId);
  } catch (err) {
    const error = new HttpError("Creating post failed.", 500);
    return next(error);
  }
  if (!existingUser) {
    const error = new HttpError("Could not find user to assign post.", 404);
    return next(error);
  }

  const createdPost = new Post({
    author: authorId,
    thread: threadId,
    dateCreated: Date.now(),
    content,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await createdPost.save({ session: sess });
    const postId = createdPost.toObject({ getters: true }).id;

    /* Add post to author's list of posts. */
    existingUser.posts.push(postId);
    await existingUser.save({ session: sess, validateModifiedOnly: true });

    /* Add post to thread. */
    existingThread.posts.push(postId);
    await existingThread.save({ session: sess, validateModifiedOnly: true });

    sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Failed to create thread. Please try again.",
      500,
    );
    return next(error);
  }

  return res.status(201).json({ message: "Created new post." });
};

/**
 * Updates a post's content.
 *
 * @param {String} req.params.postId The ID of the post to update.
 * @param {String} res.body.content The new content for the post.
 *
 * @returns On success, returns an HTTP status code of 200, along with the updated post.
 */
const updatePost = async (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }

  const { postId } = req.params;
  const { content } = req.body;

  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    const error = new HttpError("Post not found.", 404);
    return next(error);
  }

  try {
    post.content = content;
    await post.save();
  } catch (err) {
    const error = new HttpError("Error updating post.", 500);
    return next(error);
  }

  return res.status(200).json({ post: post.toObject({ getters: true }) });
};

const deletePost = async (req, res, next) => {
  const { postId } = req.params;

  let post;

  try {
    post = await Post.findById(postId).populate("author").populate("thread");
  } catch (err) {
    const error = new HttpError("Error deleting post.", 500);
    return next(error);
  }

  if (!post) {
    const error = new HttpError("Could not find post to delete.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    /* Remove the post from its thread. */
    post.thread.posts.pull(post);
    await post.thread.save({ session: sess, validateModifiedOnly: true });

    /* Remove the post from the user. */
    post.author.posts.pull(post);
    await post.author.save({ session: sess, validateModifiedOnly: true });

    await Post.findByIdAndDelete(postId);

    sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Unable to delete post.", 500);
    return next(error);
  }

  return res.status(200).json({ message: "Successfully deleted post." });
};

exports.getAllPosts = getAllPosts;
exports.getPostById = getPostById;
exports.getPostsByUser = getPostsByUser;
exports.createPost = createPost;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
