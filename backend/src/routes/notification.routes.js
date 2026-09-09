const express = require("express");
const protect = require("../middleware/auth.middleware");
const {
    listNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} = require("../controllers/notification.controller");

const router = express.Router();

router.use(protect);
router.get("/", listNotifications);
router.patch("/read-all", markAllNotificationsRead);
router.patch("/:id/read", markNotificationRead);

module.exports = router;
