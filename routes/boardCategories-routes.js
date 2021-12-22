const express = require("express");
const { check } = require("express-validator");

const router = express.Router();

router.get("/", (req, res, next) => {
  return res.json({ message: "Fetching all board categories..." });
});

router.get("/:boardCategoryId", (req, res, next) => {
  const id = req.params.boardCategoryId;
  return res.json({ message: `Fetching board category ${id}...` });
});

router.post("/", [check("topic").not().isEmpty()], (req, res, next) => {
  return res.json({ message: "Creating board category..." });
});

router.patch(
  "/:boardCategoryId",
  [check("topic").not().isEmpty()],
  (req, res, next) => {
    const id = req.params.boardCategoryId;
    return res.json({ message: `Updating board category ${id}...` });
  },
);

router.delete("/:boardCategoryId", (req, res, next) => {
  const id = req.params.boardCategoryId;
  return res.json({ message: `Deleting board category ${id}...` });
});

module.exports = router;
