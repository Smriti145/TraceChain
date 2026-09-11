const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("journey form keeps a stable form reference across the API await", () => {
  const script = fs.readFileSync(
    path.join(__dirname, "..", "public", "app.js"),
    "utf8",
  );
  const handler = script.slice(
    script.indexOf('$("#trace-form").addEventListener'),
    script.indexOf('$("#customer-verify-form").addEventListener'),
  );

  assert.match(handler, /const form = event\.currentTarget;/);
  assert.match(handler, /form\.reset\(\);/);
  assert.doesNotMatch(handler, /event\.currentTarget\.reset\(\);/);
});
