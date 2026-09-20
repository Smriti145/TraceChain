const test = require("node:test");
const assert = require("node:assert/strict");
const {createProductSchema} = require("../src/validations/product.validation");
const {PRODUCT_CATEGORIES, productScope} = require("../src/config/product-scope");
for (const category of PRODUCT_CATEGORIES) {
  test(`accepts ${category}`, () => {
    const result = createProductSchema.parse({productName: "Demo food", category, netQuantity: "1", unitOfMeasure: "kg"});
    assert.equal(result.category, category);
    assert.equal(result.netQuantity, 1);
  });
}
test("defaults to food", () => {
  assert.equal(createProductSchema.parse({productName: "Rice"}).category, "Food & Beverage");
});
for (const category of ["Electronics", "Pharmaceutical", "Ayurveda & Wellness", "Cosmetics", "Textile & Apparel", "Automotive", "Industrial Goods", "Agriculture", "GENERAL"]) {
  test(`rejects ${category} on create and update`, () => {
    assert.equal(createProductSchema.safeParse({productName: "Other", category}).success, false);
    assert.equal(createProductSchema.partial().safeParse({category}).success, false);
  });
}
test("rejects unknown fields and scopes catalog queries", () => {
  assert.equal(createProductSchema.safeParse({productName: "Rice", administratorOverride: true}).success, false);
  assert.deepEqual(productScope(), {category: {in: ["Food & Beverage", "Spices & Seasonings"]}});
});
