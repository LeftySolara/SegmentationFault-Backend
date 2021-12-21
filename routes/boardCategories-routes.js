const express = require("express");

const router = express.Router();

router.get("/", (req, res, next) => {
  return res.json({ message: "Fetching all board categories..." });
});

router.get("/:boardCategoryId", (req, res, next) => {
  const id = req.params.boardCategoryId;
  return res.json({ message: `Fetching board category ${id}...` });
});

router.post("/", (req, res, next) => {
  return res.json({ message: "Creating board category..." });
});

router.patch("/:boardCategoryId", (req, res, next) => {
  const id = req.params.boardCategoryId;
  return res.json({ message: `Updating board category ${id}...` });
});

router.delete("/:boardCategoryId", (req, res, next) => {
  const id = req.params.boardCategoryId;
  return res.json({ message: `Deleting board category ${id}...` });
});

module.exports = router;
