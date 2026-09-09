const test = require("node:test");
const assert = require("node:assert/strict");
const {traceSchema} = require("../src/validations/trace.validation");
const {roleStages} = require("../src/controllers/trace.controller");

test("each operational role exposes only its permitted journey stages", () => {
  assert.deepEqual(roleStages.SUPPLIER, ["SOURCED", "SUPPLIED"]);
  assert.ok(roleStages.WAREHOUSE.includes("WAREHOUSE"));
  assert.ok(roleStages.DISTRIBUTOR.includes("DISTRIBUTED"));
  assert.ok(roleStages.RETAILER.includes("SOLD"));
  assert.deepEqual(roleStages.CUSTOMER, []);
});

test("trace updates require a valid product, stage and location", () => {
  assert.equal(traceSchema.safeParse({productId: "p1", stage: "SUPPLIED", location: "Pune Hub"}).success, true);
  assert.equal(traceSchema.safeParse({productId: "p1", stage: "HACKED", location: "Pune Hub"}).success, false);
});
