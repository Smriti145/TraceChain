const test = require("node:test");
const assert = require("node:assert/strict");
const {assessScanRisk, haversineKm, RAPID_SCAN_LIMIT} = require("../src/services/scan-risk.service");
const {normalizeScanValue, hashScanValue, parseLimit} = require("../src/controllers/scan.controller");

test("normalizes verification URLs without retaining the full payload", () => {
    assert.equal(normalizeScanValue("https://trace.example/verify/ABC-123?source=qr"), "ABC-123");
    assert.equal(hashScanValue("ABC-123").length, 64);
});

test("flags invalid and rapid repeated scans", () => {
    assert.deepEqual(assessScanRisk({productFound: false}), {isSuspicious: true, suspiciousReason: "INVALID_CODE"});
    assert.equal(assessScanRisk({productFound: true, recentScanCount: RAPID_SCAN_LIMIT}).suspiciousReason, "RAPID_REPEAT_SCANS");
});

test("flags impossible travel when coordinates are supplied", () => {
    const scannedAt = new Date("2026-09-09T10:20:00.000Z");
    const result = assessScanRisk({
        productFound: true,
        scannedAt,
        latitude: 28.6139,
        longitude: 77.209,
        previousScan: {latitude: 19.076, longitude: 72.8777, scannedAt: new Date("2026-09-09T10:00:00.000Z")},
    });
    assert.ok(haversineKm({latitude: 19.076, longitude: 72.8777}, {latitude: 28.6139, longitude: 77.209}) > 500);
    assert.equal(result.suspiciousReason, "IMPOSSIBLE_TRAVEL");
});

test("scan history limits are bounded", () => {
    assert.equal(parseLimit(undefined), 50);
    assert.equal(parseLimit("500"), 100);
});
