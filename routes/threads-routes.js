const express = require("express");
const { check } = require("express-validator");

const router = express.Router();

router.get("/", (req, res, next) => {
  return res.json({ message: "Fetching all threads..." });
});

router.get("/:threadId", (req, res, next) => {
  const id = req.params.threadId;
  return res.json({ message: `Fetching thread ${id}...` });
});

router.get("/user/:userId", (req, res, next) => {
  const id = req.params.userId;
  return res.json({ message: `Getting threads by user ${id}...` });
});

router.post(
  "/",
  [
    check("author").not().isEmpty().isAlphanumeric(),
    check("topic").not().isEmpty(),
  ],
  (req, res, next) => {
    return res.json({ message: "Creating thread..." });
  },
);

router.patch(
  "/:threadId",
  [check("posts").not().isEmpty()],
  (req, res, next) => {
    const id = req.params.threadId;
    return res.json({ message: `Updating thread ${id}...` });
  },
);

router.delete("/:threadId", (req, res, next) => {
  const id = req.params.threadId;
  return res.json({ message: `Deleting thread ${id}...` });
});

module.exports = router;
