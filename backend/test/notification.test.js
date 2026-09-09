const test = require("node:test");
const assert = require("node:assert/strict");
const {parseLimit} = require("../src/controllers/notification.controller");

test("notification limit applies safe defaults and bounds", () => {
    assert.equal(parseLimit(undefined), 50);
    assert.equal(parseLimit("invalid"), 50);
    assert.equal(parseLimit("0"), 1);
    assert.equal(parseLimit("20"), 20);
    assert.equal(parseLimit("500"), 100);
});
