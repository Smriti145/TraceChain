const express = require("express");

const router = express.Router();

const {

    register,

    login,

} = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const { registerSchema, loginSchema } = require("../validations/auth.validation");

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

module.exports = router;
