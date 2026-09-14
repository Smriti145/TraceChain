const express = require("express");

const router = express.Router();

const {

    register,

    login,

    me,
    googleConfig,
    googleLogin,
    linkGoogle,

} = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const { registerSchema, loginSchema, googleTokenSchema } = require("../validations/auth.validation");
const protect = require("../middleware/auth.middleware");

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.get("/google/config", googleConfig);
router.post("/google", validate(googleTokenSchema), googleLogin);
router.post("/google/link", protect, validate(googleTokenSchema), linkGoogle);

router.get("/me", protect, me);

module.exports = router;
