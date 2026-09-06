const crypto = require("crypto");

const requestContext = (req, res, next) => {
    const requestId = req.get("x-request-id") || crypto.randomUUID();
    const startedAt = process.hrtime.bigint();
    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);

    res.on("finish", () => {
        const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
        console.log(JSON.stringify({
            level: "info",
            type: "http_request",
            requestId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Number(durationMs.toFixed(2)),
        }));
    });

    next();
};

const securityHeaders = (req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    if (process.env.NODE_ENV === "production") {
        res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
};

module.exports = {requestContext, securityHeaders};
