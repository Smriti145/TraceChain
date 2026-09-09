const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {traceSchema} = require("../validations/trace.validation");

const {
  addTrace,
  getTimeline
} = require("../controllers/trace.controller");

router.post("/", protect, validate(traceSchema), addTrace);

router.get("/:id", protect, getTimeline);

module.exports = router;
