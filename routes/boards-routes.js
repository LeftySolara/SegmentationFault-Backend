const express = require("express");
const { check } = require("express-validator");

const boardsController = require("../controllers/boards-controller");

const router = express.Router();

router.get("/", boardsController.getAllBoards);

router.get("/:boardId", boardsController.getBoardById);

router.post(
  "/",
  [
    check("topic").not().isEmpty(),
    check("description").not().isEmpty(),
    check("categoryId").not().isEmpty().isAlphanumeric(),
  ],
  boardsController.createBoard,
);

router.patch(
  "/:boardId",
  [check("topic").not().isEmpty(), check("description").not().isEmpty()],
  boardsController.updateBoard,
);

router.delete("/:boardId", boardsController.deleteBoard);

module.exports = router;
