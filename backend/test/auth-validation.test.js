const test = require("node:test");
const assert = require("node:assert/strict");
const {registerSchema, loginSchema} = require("../src/validations/auth.validation");

test("registration normalizes identity fields", () => {
    const result = registerSchema.parse({
        name: "  Test Customer  ",
        email: "  USER@EXAMPLE.COM ",
        password: "a-secure-password",
    });
    assert.equal(result.name, "Test Customer");
    assert.equal(result.email, "user@example.com");
});

test("public registration rejects role escalation", () => {
    const result = registerSchema.safeParse({
        name: "Test Manufacturer",
        email: "manufacturer@example.com",
        password: "a-secure-password",
        role: "MANUFACTURER",
    });
    assert.equal(result.success, false);
});

test("login accepts an existing demo-length password", () => {
    const result = loginSchema.safeParse({
        email: "manufacturer@tracechain.demo",
        password: "TraceChain@123",
    });
    assert.equal(result.success, true);
});

test("registration supports customer and business accounts without accepting privileged roles", () => {
    const business = registerSchema.parse({
        name: "Acme Traceability",
        email: "owner@acme.example",
        password: "a-secure-password",
        accountType: "BUSINESS",
    });
    assert.equal(business.accountType, "BUSINESS");
    assert.equal(registerSchema.safeParse({...business, role: "MANUFACTURER"}).success, false);
});
