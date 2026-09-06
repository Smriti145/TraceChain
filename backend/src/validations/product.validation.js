const {z} = require("zod");

const optionalText = max => z.string().trim().max(max).optional();
const optionalDate = z.union([z.string().date(), z.literal("")]).optional();
const optionalNumber = z.union([z.coerce.number().finite(), z.literal("")]).optional();

const createProductSchema = z.object({
    productName: z.string().trim().min(2).max(160),
    category: z.string().trim().min(2).max(80).default("GENERAL"),
    brand: optionalText(100),
    variant: optionalText(100),
    productCode: optionalText(100),
    barcode: optionalText(100),
    description: optionalText(2000),
    netQuantity: optionalNumber,
    unitOfMeasure: optionalText(30),
    countryOfOrigin: optionalText(100),
    expiryDate: optionalDate,
    rawMaterialSource: optionalText(250),
    supplier: optionalText(200),
    processingPlant: optionalText(250),
    processingDate: optionalDate,
    qualityCheck: optionalText(500),
    packagingUnit: optionalText(250),
    packagingDate: optionalDate,
    warehouse: optionalText(250),
    distributor: optionalText(250),
    retailer: optionalText(250),
    location: optionalText(250),
    dispatchDate: optionalDate,
    deliveryDate: optionalDate,
    temperature: optionalNumber,
    attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
}).strict();

module.exports = {createProductSchema};
