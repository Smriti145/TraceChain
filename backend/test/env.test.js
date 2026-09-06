const test = require("node:test");
const assert = require("node:assert/strict");
const {parseEnv} = require("../src/config/env");

const validEnv = {
    DATABASE_URL: "postgresql://user:password@localhost:5432/tracechain",
    JWT_SECRET: "a-secure-test-secret-with-32-characters",
};

test("environment config applies safe development defaults", () => {
    const env = parseEnv(validEnv);
    assert.equal(env.PORT, 5001);
    assert.equal(env.NODE_ENV, "development");
    assert.deepEqual(env.CORS_ORIGINS, ["http://localhost:5001"]);
    assert.equal(env.TRUST_PROXY, false);
});

test("environment config parses allowed origins and proxy setting", () => {
    const env = parseEnv({
        ...validEnv,
        CORS_ORIGINS: "https://portal.example.com, https://admin.example.com",
        TRUST_PROXY: "true",
    });
    assert.deepEqual(env.CORS_ORIGINS, ["https://portal.example.com", "https://admin.example.com"]);
    assert.equal(env.TRUST_PROXY, true);
});

test("environment config rejects weak secrets", () => {
    assert.throws(
        () => parseEnv({...validEnv, JWT_SECRET: "short"}),
        /JWT_SECRET must contain at least 16 characters/,
    );
});
