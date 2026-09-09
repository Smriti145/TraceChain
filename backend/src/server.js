
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const {parseEnv} = require("./config/env");
const prisma = require("./config/prisma");
const {requestContext, securityHeaders} = require("./middleware/request.middleware");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const traceRoutes = require("./routes/trace.routes");
const notificationRoutes = require("./routes/notification.routes");
const scanRoutes = require("./routes/scan.routes");


const env = parseEnv(process.env);
const app = express();

if (env.TRUST_PROXY) app.set("trust proxy", 1);

app.disable("x-powered-by");
app.use(requestContext);
app.use(securityHeaders);
app.use(cors({
    origin(origin, callback) {
        if (!origin || env.CORS_ORIGINS.includes(origin)) return callback(null, true);
        const error = new Error("Origin not allowed by CORS");
        error.status = 403;
        return callback(error);
    },
}));
app.use(express.json({limit: "256kb"}));
app.use(express.static(path.join(__dirname, "..", "public")));


app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/traces", traceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/scans", scanRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        success:true,
        message:"Fandoro API Running",
        service: "tracechain-api",
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

app.get("/api/ready", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({success: true, database: "ready"});
    } catch (error) {
        console.error(JSON.stringify({level: "error", type: "readiness", requestId: req.requestId, message: error.message}));
        res.status(503).json({success: false, database: "unavailable"});
    }
});

app.get("/verify/:qr", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "verify.html"));
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, _next) => {
    console.error(JSON.stringify({
        level: "error",
        type: "request_error",
        requestId: req.requestId,
        message: err.message,
        stack: env.NODE_ENV === "development" ? err.stack : undefined,
    }));
    res.status(err.status || 500).json({
        success: false,
        message: err.status || err.message === "Origin not allowed by CORS"
            ? err.message
            : "Internal server error",
        requestId: req.requestId,
    });
});

if (require.main === module) {
    const server = app.listen(env.PORT, "0.0.0.0", () => {
        console.log(JSON.stringify({level: "info", type: "startup", port: env.PORT, environment: env.NODE_ENV}));
    });

    const shutdown = signal => {
        console.log(JSON.stringify({level: "info", type: "shutdown", signal}));
        server.close(async () => {
            await prisma.$disconnect();
            process.exit(0);
        });
        setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
}

module.exports = app;
