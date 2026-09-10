const {z} = require("zod");

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(5001),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    JWT_SECRET: z.string().min(32, "JWT_SECRET must contain at least 32 characters"),
    PUBLIC_BASE_URL: z.string().url().optional(),
    RENDER_EXTERNAL_URL: z.string().url().optional(),
    CORS_ORIGINS: z.string().default("http://localhost:5001"),
    TRUST_PROXY: z.enum(["true", "false"]).default("false"),
});

const parseEnv = input => {
    const result = envSchema.safeParse(input);
    if (!result.success) {
        const details = result.error.issues
            .map(issue => `${issue.path.join(".")}: ${issue.message}`)
            .join("; ");
        throw new Error(`Invalid environment configuration: ${details}`);
    }

    return {
        ...result.data,
        CORS_ORIGINS: [
            ...result.data.CORS_ORIGINS.split(",").map(origin => origin.trim()),
            result.data.RENDER_EXTERNAL_URL,
        ].filter(Boolean),
        TRUST_PROXY: result.data.TRUST_PROXY === "true",
    };
};

module.exports = {parseEnv};
