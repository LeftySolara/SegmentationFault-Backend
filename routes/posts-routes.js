const express = require("express");
const { check } = require("express-validator");

const checkAuth = require("../middleware/check-auth");

const postController = require("../controllers/posts-controller");

const router = express.Router();

router.get("/", postController.getAllPosts);

router.get("/:postId", postController.getPostById);

router.get("/user/:userId", postController.getPostsByUser);

router.get("/thread/:threadId", postController.getPostsByThread);

router.use(checkAuth);

router.post(
  "/",
  [
    check("authorId").not().isEmpty().isAlphanumeric(),
    check("threadId").not().isEmpty().isAlphanumeric(),
    check("content").not().isEmpty(),
  ],
  postController.createPost,
);

router.patch(
  "/:postId",
  [check("content").not().isEmpty()],
  postController.updatePost,
);

router.delete("/:postId", postController.deletePost);

module.exports = router;
