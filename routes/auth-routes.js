const express = require("express");

const router = express.Router();

const checkAuth = require("../middleware/check-auth");

const authControllers = require("../controllers/auth-controllers");

// api/auth/
router.get("/", authControllers.getAllUser);

// /api/auth/register
router.post("/register", authControllers.register);

// api/auth/login
router.post("/login", authControllers.login);

module.exports = router;
