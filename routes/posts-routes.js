const express = require("express");
const { check } = require("express-validator");

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

router.post(
  "/",
  [
    check("author").not().isEmpty().isAlphanumeric(),
    check("thread").not().isEmpty().isAlphanumeric(),
    check("content").not().isEmpty(),
  ],
  (req, res, next) => {
    return res.json({ message: "Creating post..." });
  },
);

router.patch(
  "/:postId",
  [check("content").not().isEmpty()],
  (req, res, next) => {
    const id = req.params.postId;
    return res.json({ message: `Updating post ${id}...` });
  },
);

router.delete("/:postId", (req, res, next) => {
  const id = req.params.postId;
  return res.json({ message: `Deleting post ${id}...` });
});

module.exports = router;
