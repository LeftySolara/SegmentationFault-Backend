const express = require("express");
const { check } = require("express-validator");

const threadsController = require("../controllers/threads-controller");

const router = express.Router();

router.get("/", threadsController.getAllThreads);

router.get("/:threadId", threadsController.getThreadById);

router.get("/user/:userId", threadsController.getThreadsByUser);

router.post(
  "/",
  [
    check("author").not().isEmpty().isAlphanumeric(),
    check("topic").not().isEmpty(),
  ],
  threadsController.createThread,
);

router.patch(
  "/:threadId",
  [check("posts").not().isEmpty()],
  threadsController.updateThread,
);

router.delete("/:threadId", threadsController.deleteThread);

module.exports = router;
