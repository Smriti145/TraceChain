const RAPID_SCAN_WINDOW_MS = 5 * 60 * 1000;
const RAPID_SCAN_LIMIT = 5;
const IMPOSSIBLE_TRAVEL_WINDOW_MS = 30 * 60 * 1000;
const IMPOSSIBLE_TRAVEL_DISTANCE_KM = 500;

const toRadians = degrees => degrees * Math.PI / 180;

const haversineKm = (from, to) => {
    const earthRadiusKm = 6371;
    const latitudeDelta = toRadians(to.latitude - from.latitude);
    const longitudeDelta = toRadians(to.longitude - from.longitude);
    const a = Math.sin(latitudeDelta / 2) ** 2
        + Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude))
        * Math.sin(longitudeDelta / 2) ** 2;
    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const assessScanRisk = ({productFound, recentScanCount = 0, previousScan, latitude, longitude, scannedAt}) => {
    const reasons = [];
    if (!productFound) reasons.push("INVALID_CODE");
    if (productFound && recentScanCount >= RAPID_SCAN_LIMIT) reasons.push("RAPID_REPEAT_SCANS");

    if (previousScan && latitude !== undefined && longitude !== undefined
        && previousScan.latitude !== null && previousScan.longitude !== null) {
        const elapsed = new Date(scannedAt).getTime() - new Date(previousScan.scannedAt).getTime();
        const distance = haversineKm(
            {latitude: previousScan.latitude, longitude: previousScan.longitude},
            {latitude, longitude},
        );
        if (elapsed >= 0 && elapsed <= IMPOSSIBLE_TRAVEL_WINDOW_MS && distance > IMPOSSIBLE_TRAVEL_DISTANCE_KM) {
            reasons.push("IMPOSSIBLE_TRAVEL");
        }
    }

    return {isSuspicious: reasons.length > 0, suspiciousReason: reasons.join(",") || null};
};

module.exports = {assessScanRisk, haversineKm, RAPID_SCAN_WINDOW_MS, RAPID_SCAN_LIMIT};
