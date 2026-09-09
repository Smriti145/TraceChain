const crypto = require("node:crypto");
const prisma = require("../config/prisma");
const {assessScanRisk, RAPID_SCAN_WINDOW_MS} = require("../services/scan-risk.service");

const parseLimit = value => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 100) : 50;
};

const productInclude = {
    manufacturer: {select: {id: true, name: true, email: true, role: true}},
    traces: {orderBy: {eventDate: "asc"}},
};

const normalizeScanValue = value => {
    const trimmed = value.trim();
    const match = trimmed.match(/\/verify\/([^/?#]+)/i);
    return match ? decodeURIComponent(match[1]) : trimmed;
};

const hashScanValue = value => crypto.createHash("sha256").update(value).digest("hex");

const findProduct = value => prisma.product.findFirst({
    where: {OR: [{qrCode: value}, {barcode: value}, {productCode: value}, {batchNumber: value}]},
    include: productInclude,
});

const createSuspiciousNotification = async (tx, {userId, product, reason}) => {
    const recipients = new Set([userId]);
    if (product?.manufacturerId) recipients.add(product.manufacturerId);
    const target = product ? `${product.productName} (${product.batchNumber})` : "an unknown product code";
    await tx.notification.createMany({
        data: [...recipients].map(recipientId => ({
            type: "SUSPICIOUS_SCAN",
            severity: "WARNING",
            title: "Suspicious scan detected",
            message: `${target} triggered: ${reason.replaceAll("_", " ").toLowerCase()}.`,
            metadata: {reason},
            userId: recipientId,
            productId: product?.id || null,
        })),
    });
};

const recordScan = async ({userId, input}) => {
    if (input.clientEventId) {
        const existing = await prisma.scanEvent.findUnique({
            where: {clientEventId: input.clientEventId},
            include: {product: {include: productInclude}},
        });
        if (existing && existing.userId === userId) {
            return {scanEvent: existing, product: existing.product, duplicate: true};
        }
    }

    const normalizedValue = normalizeScanValue(input.value);
    const product = await findProduct(normalizedValue);
    const recentSince = new Date(input.scannedAt.getTime() - RAPID_SCAN_WINDOW_MS);
    const [recentScanCount, previousScan] = await Promise.all([
        product ? prisma.scanEvent.count({
            where: {userId, productId: product.id, result: "VERIFIED", scannedAt: {gte: recentSince, lte: input.scannedAt}},
        }) : 0,
        prisma.scanEvent.findFirst({
            where: {userId, result: "VERIFIED", latitude: {not: null}, longitude: {not: null}, scannedAt: {lte: input.scannedAt}},
            orderBy: {scannedAt: "desc"},
        }),
    ]);

    const risk = assessScanRisk({
        productFound: Boolean(product), recentScanCount, previousScan,
        latitude: input.latitude, longitude: input.longitude, scannedAt: input.scannedAt,
    });
    const result = product ? "VERIFIED" : "NOT_FOUND";

    const scanEvent = await prisma.$transaction(async tx => {
        const event = await tx.scanEvent.create({
            data: {
                clientEventId: input.clientEventId,
                scannedValueHash: hashScanValue(normalizedValue),
                result,
                ...risk,
                latitude: input.latitude,
                longitude: input.longitude,
                deviceId: input.deviceId,
                networkStatus: input.networkStatus,
                scannedAt: input.scannedAt,
                userId,
                productId: product?.id,
            },
        });
        if (risk.isSuspicious) {
            await createSuspiciousNotification(tx, {userId, product, reason: risk.suspiciousReason});
        }
        return event;
    });

    return {scanEvent, product, duplicate: false};
};

const verifyAndRecordScan = async (req, res) => {
    try {
        const result = await recordScan({userId: req.user.id, input: req.body});
        if (!result.product) {
            return res.status(404).json({success: false, message: "Product not found. Scan recorded for security review.", ...result});
        }
        res.json({success: true, ...result});
    } catch (error) {
        if (error.code === "P2002" && req.body.clientEventId) {
            const existing = await prisma.scanEvent.findUnique({where: {clientEventId: req.body.clientEventId}});
            if (existing?.userId === req.user.id) return res.json({success: existing.result === "VERIFIED", scanEvent: existing, duplicate: true});
        }
        console.error("Scan audit error:", error);
        res.status(500).json({success: false, message: "Failed to verify and record scan"});
    }
};

const listScans = async (req, res) => {
    try {
        const [scanEvents, suspiciousCount] = await prisma.$transaction([
            prisma.scanEvent.findMany({
                where: {userId: req.user.id},
                take: parseLimit(req.query.limit),
                orderBy: {scannedAt: "desc"},
                include: {product: {include: productInclude}},
            }),
            prisma.scanEvent.count({where: {userId: req.user.id, isSuspicious: true}}),
        ]);
        res.json({success: true, suspiciousCount, scanEvents});
    } catch (error) {
        console.error("Scan history error:", error);
        res.status(500).json({success: false, message: "Failed to load scan history"});
    }
};

module.exports = {verifyAndRecordScan, listScans, recordScan, normalizeScanValue, hashScanValue, parseLimit};
