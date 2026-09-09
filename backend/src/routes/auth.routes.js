const express = require("express");

const router = express.Router();

const {

    register,

    login,

    me,

} = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const { registerSchema, loginSchema } = require("../validations/auth.validation");
const protect = require("../middleware/auth.middleware");

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.get("/me", protect, me);

module.exports = router;
