const express = require("express");
const router = express.Router();


const AuthController = require("../controllers/authController");

router.post("/signup", AuthController.signup);

router.post("/login", AuthController.login);

router.delete("/:userID", AuthController.delete)

router.get("/all-users", AuthController.get_all_users);

router.post("/forgot-password", AuthController.forgot_password);

router.get("/reset-password", AuthController.reset_password);

module.exports = router;