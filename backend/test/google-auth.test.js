const test = require("node:test");
const assert = require("node:assert/strict");
const {findOrCreateGoogleCustomer, verifyGoogleToken} = require("../src/services/google-auth.service");

test("Google sign-in refuses to run without an OAuth client ID", async () => {
  await assert.rejects(verifyGoogleToken("not-a-token", ""), {status: 503});
});

test("Google ID token verification enforces audience and verified email", async () => {
  const verifier = {verifyIdToken: async ({idToken, audience}) => {
    assert.equal(idToken, "test-token");
    assert.equal(audience, "123-example.apps.googleusercontent.com");
    return {getPayload: () => ({sub: "stable-id", email: " PERSON@GMAIL.COM ", email_verified: true, name: "Person"})};
  }};
  assert.deepEqual(await verifyGoogleToken("test-token", "123-example.apps.googleusercontent.com", verifier), {
    googleSub: "stable-id", email: "person@gmail.com", name: "Person",
  });
  await assert.rejects(verifyGoogleToken("test-token", "123-example.apps.googleusercontent.com", {
    verifyIdToken: async () => ({getPayload: () => ({sub: "stable-id", email: "person@gmail.com", email_verified: false})}),
  }), /verified email/);
});

test("a new verified Google identity receives customer access only", async () => {
  let created;
  const prisma = {
    user: {
      findUnique: async () => null,
      create: async ({data}) => {created = data; return {id: "u1", ...data};},
    },
  };
  const user = await findOrCreateGoogleCustomer(prisma, {
    googleSub: "google-sub-123", email: "person@gmail.com", name: "Person",
  });
  assert.equal(user.role, "CUSTOMER");
  assert.equal(user.password, null);
  assert.equal(created.googleSub, "google-sub-123");
});

test("an existing Google subject retains its assigned role", async () => {
  const existing = {id: "u2", role: "SUPPLIER", googleSub: "google-sub-456"};
  const prisma = {user: {findUnique: async ({where}) => where.googleSub ? existing : null}};
  assert.equal(await findOrCreateGoogleCustomer(prisma, {googleSub: "google-sub-456", email: "new@gmail.com"}), existing);
});

test("email collision cannot take over an existing password account", async () => {
  const prisma = {user: {findUnique: async ({where}) => where.email ? {id: "staff", role: "MANUFACTURER"} : null}};
  await assert.rejects(
    findOrCreateGoogleCustomer(prisma, {googleSub: "attacker", email: "staff@example.com", name: "Person"}),
    {status: 409},
  );
});
