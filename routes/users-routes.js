const express = require("express");

const router = express.Router();

router.get("/", (req, res, next) => {
  return res.json({ message: "Fetching all users..." });
});

router.get("/:userId", (req, res, next) => {
  const id = req.params.userId;
  return res.json({ message: `Fetching user ${id}...` });
});

router.post("/", (req, res, next) => {
  return res.json({ message: "Creating user..." });
});

router.patch("/:userId", (req, res, next) => {
  return res.json({ message: "Updating user..." });
});

router.delete("/:userId", (req, res, next) => {
  const id = req.params.userId;
  return res.json({ message: `Deleting user ${id}...` });
});

module.exports = router;
