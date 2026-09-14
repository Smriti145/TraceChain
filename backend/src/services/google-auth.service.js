const {OAuth2Client} = require("google-auth-library");

const client = new OAuth2Client();

async function verifyGoogleToken(idToken, clientId = process.env.GOOGLE_WEB_CLIENT_ID, verifier = client) {
    if (!clientId) {
        const error = new Error("Google sign-in is not configured");
        error.status = 503;
        throw error;
    }
    const ticket = await verifier.verifyIdToken({idToken, audience: clientId});
    const payload = ticket.getPayload();
    if (!payload?.sub || payload.email_verified !== true || !payload.email) {
        throw new Error("Google account has no verified email");
    }
    return {
        googleSub: payload.sub,
        email: payload.email.trim().toLowerCase(),
        name: (payload.name || payload.email.split("@")[0]).trim().slice(0, 100),
    };
}

async function findOrCreateGoogleCustomer(prisma, identity) {
    const existing = await prisma.user.findUnique({where: {googleSub: identity.googleSub}});
    if (existing) return existing;
    const emailOwner = await prisma.user.findUnique({where: {email: identity.email}});
    if (emailOwner) {
        const error = new Error("This email already has an account. Sign in with your password, then link Google from your account.");
        error.status = 409;
        throw error;
    }
    return prisma.user.create({data: {
        name: identity.name,
        email: identity.email,
        googleSub: identity.googleSub,
        password: null,
        role: "CUSTOMER",
    }});
}

module.exports = {verifyGoogleToken, findOrCreateGoogleCustomer};
