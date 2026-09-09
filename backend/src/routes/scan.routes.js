const express = require("express");
const protect = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {scanSchema} = require("../validations/scan.validation");
const {verifyAndRecordScan, listScans} = require("../controllers/scan.controller");

const router = express.Router();
router.use(protect);
router.get("/", listScans);
router.post("/verify", validate(scanSchema), verifyAndRecordScan);

module.exports = router;
