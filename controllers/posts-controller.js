const validateRequestInputs = require("../utils/inputValidator");

const getAllPosts = (req, res, next) => {
  return res.json({ message: "Fetching all posts..." });
};

const getPostById = (req, res, next) => {
  const id = req.params.postId;
  return res.json({ message: `Fetching post ${id}...` });
};

const getPostsByUser = (req, res, next) => {
  const id = req.params.userId;
  return res.json({ message: `Fetching posts by user ${id}` });
};

const createPost = (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }
  return res.json({ message: "Creating post..." });
};

const updatePost = (req, res, next) => {
  const validationError = validateRequestInputs(req);
  if (validationError) {
    return next(validationError);
  }
  const id = req.params.postId;
  return res.json({ message: `Updating post ${id}...` });
};

const deletePost = (req, res, next) => {
  const id = req.params.postId;
  return res.json({ message: `Deleting post ${id}...` });
};

exports.getAllPosts = getAllPosts;
exports.getPostById = getPostById;
exports.getPostsByUser = getPostsByUser;
exports.createPost = createPost;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
