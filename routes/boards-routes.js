const express = require("express");

const router = express.Router();

router.get("/", (req, res, next) => {
  return res.json({ message: "Fetching all boards..." });
});

router.get("/:boardId", (req, res, next) => {
  const id = req.params.boardId;
  return res.json({ message: `Fetching board ${id}...` });
});

router.post("/", (req, res, next) => {
  return res.json({ message: "Creating board..." });
});

router.patch("/:boardId", (req, res, next) => {
  const id = req.params.boardId;
  return res.json({ message: `Updating board ${id}...` });
});

router.delete("/:boardId", (req, res, next) => {
  const id = req.params.boardId;
  return res.json(`Deleting board ${id}...`);
});

module.exports = router;
