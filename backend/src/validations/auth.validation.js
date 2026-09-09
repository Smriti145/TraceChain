const { z } = require("zod");

const registerSchema = z.object({
    name: z.string().trim().min(3).max(100),
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(12).max(128),
    accountType: z.enum(["CUSTOMER", "BUSINESS"]).default("CUSTOMER"),
}).strict();

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(1).max(128),
}).strict();

module.exports = {
    registerSchema,
    loginSchema,
};
