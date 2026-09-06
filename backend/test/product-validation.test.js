const test = require("node:test");
const assert = require("node:assert/strict");
const {createProductSchema} = require("../src/validations/product.validation");

test("generic product contract accepts non-food categories", () => {
    const result = createProductSchema.parse({
        productName: "Industrial Temperature Sensor",
        category: "Electronics",
        productCode: "SENSOR-100",
        barcode: "8901234500055",
        netQuantity: "1",
        unitOfMeasure: "unit",
        attributes: {accuracy: "±0.3°C", warrantyMonths: 24},
    });
    assert.equal(result.category, "Electronics");
    assert.equal(result.netQuantity, 1);
});

test("generic product contract defaults category", () => {
    const result = createProductSchema.parse({productName: "Unclassified Product"});
    assert.equal(result.category, "GENERAL");
});

test("generic product contract rejects unknown fields", () => {
    const result = createProductSchema.safeParse({
        productName: "Test Product",
        administratorOverride: true,
    });
    assert.equal(result.success, false);
});
