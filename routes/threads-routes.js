const express = require("express");

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

router.post("/", (req, res, next) => {
  return res.json({ message: "Creating thread..." });
});

router.patch("/:threadId", (req, res, next) => {
  const id = req.params.threadId;
  return res.json({ message: `Updating thread ${id}...` });
});

router.delete("/:threadId", (req, res, next) => {
  const id = req.params.threadId;
  return res.json({ message: `Deleting thread ${id}...` });
});

module.exports = router;
