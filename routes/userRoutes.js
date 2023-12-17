const express = require("express");
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require("../middlewares/authentication");

const { register, login, logout } = require("../controllers/userController");

router
  .route("/")
  .get(authenticateUser, authorizePermissions("admin"), getAllUsers)
  .post("/", register);
router
  .route("/:id")
  .get(authenticateUser, getSingleUser)
  .put(authenticateUser, updateUser)
  .patch(authenticateUser, updateStatus)
  .delete(authenticateUser, deleteCurrentUser);
router.post("/login", login);
router.delete("/logout", authenticateUser, logout);

module.exports = router;
