const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  addTrace,
  getTimeline
} = require("../controllers/trace.controller");

router.post("/", protect, addTrace);

router.get("/:id", protect, getTimeline);

module.exports = router;