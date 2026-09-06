# TraceChain

TraceChain is a product provenance system with a manufacturer web portal, an Express/Prisma API, and a React Native Android/iOS app. Manufacturers create products and generate unique QR codes in the portal. Scanning those codes in the app verifies the product and displays its complete supply-chain journey.

## Features

- Manufacturer login and QR generation portal
- Unique product/batch identifiers
- QR verification from the React Native camera or any phone camera/browser
- Responsive public HTML provenance report for every newly generated QR
- Product authenticity details and journey timeline
- Role-based API access with JWT authentication
- PostgreSQL storage through Prisma
- Multi-category demo dataset covering food, wellness, pharmaceuticals, textiles, electronics, and cosmetics

## Run locally

### Backend and web portal

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Open `http://localhost:5001`. On a fresh seeded database, sign in with:

- Email: `manufacturer@tracechain.demo`
- Password: `TraceChain@123`

### Mobile app

```bash
cd mobile
npm install
npm start
```

In another terminal:

```bash
cd mobile
npm run android
```

Android emulators use `http://10.0.2.2:5001/api` by default. For a physical device, open **Connection settings** on the login screen and enter either a deployed API URL or the laptop's LAN URL, such as `http://192.168.1.10:5001/api`. The phone and laptop must be on the same network when using a LAN address.

## Demo flow

1. Start the API and open the web portal.
2. Sign in as the demo manufacturer.
3. Enter the product, origin, processing, packaging, logistics, and date details; then generate its QR.
4. Open the mobile app and configure the server address if using a physical phone.
5. Tap **Scan**, scan the generated QR, and view the verified product and journey. Scanning the same QR with a normal phone camera opens the HTML traceability report.

## Validation

```bash
cd mobile
npm run lint
npx tsc --noEmit
npm test -- --runInBand
```

> The included release APK is demo-signed. Create and securely store a private release keystore before publishing to an app store.

## Production direction

The current codebase follows a modular-monolith path: keep the API and transactional domain together while usage patterns are still evolving, then separate services only when measured scale requires it. The first production foundation includes validated environment configuration, restricted browser CORS, security headers, structured request logs, liveness/readiness checks, graceful shutdown, atomic product creation, and collision-resistant batch identifiers.

See [Production architecture](docs/PRODUCTION_ARCHITECTURE.md) for the target topology, phased roadmap, security policy, and scale milestones.

Production deployments must use Prisma migrations rather than `prisma db push`:

```bash
cd backend
npx prisma migrate deploy
npm run check
npm start
```

Health endpoints:

- `/api/health` — process liveness
- `/api/ready` — database readiness
