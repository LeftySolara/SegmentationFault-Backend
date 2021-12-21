const express = require("express");

const router = express.Router();

router.get("/", (req, res, next) => {
  return res.json({ message: "Fetching all posts..." });
});

router.get("/:postId", (req, res, next) => {
  const id = req.params.postId;
  return res.json({ message: `Fetching post ${id}...` });
});

router.get("/user/:userId", (req, res, next) => {
  const id = req.params.userId;
  return res.json({ message: `Fetching posts by user ${id}` });
});

router.post("/", (req, res, next) => {
  return res.json({ message: "Creating post..." });
});

router.patch("/:postId", (req, res, next) => {
  const id = req.params.postId;
  return res.json({ message: `Updating post ${id}...` });
});

router.delete("/:postId", (req, res, next) => {
  const id = req.params.postId;
  return res.json({ message: `Deleting post ${id}...` });
});

module.exports = router;
