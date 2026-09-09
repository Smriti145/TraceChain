const prisma = require("../config/prisma");

const parseLimit = value => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 100) : 50;
};

const listNotifications = async (req, res) => {
    try {
        const unreadOnly = req.query.unreadOnly === "true";
        const where = {
            userId: req.user.id,
            ...(unreadOnly ? {readAt: null} : {}),
        };

        const [notifications, unreadCount] = await prisma.$transaction([
            prisma.notification.findMany({
                where,
                take: parseLimit(req.query.limit),
                orderBy: {createdAt: "desc"},
                include: {
                    product: {
                        select: {id: true, productName: true, batchNumber: true, category: true},
                    },
                },
            }),
            prisma.notification.count({where: {userId: req.user.id, readAt: null}}),
        ]);

        res.json({success: true, unreadCount, notifications});
    } catch (error) {
        console.error("Notification list error:", error);
        res.status(500).json({success: false, message: "Failed to load notifications"});
    }
};

const markNotificationRead = async (req, res) => {
    try {
        const result = await prisma.notification.updateMany({
            where: {id: req.params.id, userId: req.user.id, readAt: null},
            data: {readAt: new Date()},
        });

        if (!result.count) {
            const existing = await prisma.notification.findFirst({
                where: {id: req.params.id, userId: req.user.id},
            });
            if (!existing) return res.status(404).json({success: false, message: "Notification not found"});
        }

        res.json({success: true});
    } catch (error) {
        console.error("Notification read error:", error);
        res.status(500).json({success: false, message: "Failed to update notification"});
    }
};

const markAllNotificationsRead = async (req, res) => {
    try {
        const result = await prisma.notification.updateMany({
            where: {userId: req.user.id, readAt: null},
            data: {readAt: new Date()},
        });
        res.json({success: true, updatedCount: result.count});
    } catch (error) {
        console.error("Notification read-all error:", error);
        res.status(500).json({success: false, message: "Failed to update notifications"});
    }
};

module.exports = {listNotifications, markNotificationRead, markAllNotificationsRead, parseLimit};
