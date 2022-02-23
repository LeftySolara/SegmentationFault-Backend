const express = require("express");
const { check } = require("express-validator");

const checkAuth = require("../middleware/check-auth");

const threadsController = require("../controllers/threads-controller");

const router = express.Router();

router.get("/", threadsController.getAllThreads);

router.get("/:threadId", threadsController.getThreadById);

router.get("/user/:authorId", threadsController.getThreadsByUser);

router.get("/board/:boardId", threadsController.getThreadsByBoard);

router.use(checkAuth);

router.post(
  "/",
  [
    check("authorId").not().isEmpty().isAlphanumeric(),
    check("boardId").not().isEmpty().isAlphanumeric(),
    check("topic").not().isEmpty(),
  ],
  threadsController.createThread,
);

router.patch(
  "/:threadId",
  [check("topic").not().isEmpty()],
  threadsController.updateThread,
);

router.delete("/:threadId", threadsController.deleteThread);

module.exports = router;
