const {z} = require("zod");

const traceSchema = z.object({
    productId: z.string().trim().min(1).max(100),
    stage: z.enum(["SOURCED", "SUPPLIED", "MANUFACTURED", "QUALITY_CHECK", "PACKAGED", "WAREHOUSE", "IN_TRANSIT", "DISTRIBUTED", "RETAIL", "SOLD"]),
    location: z.string().trim().min(2).max(250),
    latitude: z.number().finite().min(-90).max(90).optional(),
    longitude: z.number().finite().min(-180).max(180).optional(),
    temperature: z.number().finite().min(-100).max(200).optional(),
    remarks: z.string().trim().max(1000).optional(),
}).strict();

module.exports = {traceSchema};
