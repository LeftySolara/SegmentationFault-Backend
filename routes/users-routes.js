const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controller");

const router = express.Router();

router.get("/", usersController.getAllUsers);

router.get("/:userId", usersController.getUserById);

router.post(
  "/",
  [
    check("username").not().isEmpty().isAlphanumeric(),
    check("email").isEmail(),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Your password must be at least 8 characters.")
      .matches(/\d/)
      .withMessage("Your password should contain at least one number.")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage(
        "Your password must contain at least one special character.",
      ),
    check("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Confirm password does not match.");
      }
      return true;
    }),
  ],
  usersController.createUser,
);

router.patch(
  "/:userId",
  [
    check("email").isEmail(),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Your password must be at least 8 characters.")
      .matches(/\d/)
      .withMessage("Your password should contain at least one number.")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage(
        "Your password must contain at least one special character.",
      ),
    check("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Confirm password does not match.");
      }
      return true;
    }),
  ],
  usersController.updateUser,
);

router.delete("/:userId", usersController.deleteUser);

module.exports = router;
