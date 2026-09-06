 # TraceChain production architecture

TraceChain should evolve as a modular monolith before it is split into services. This keeps transactions and delivery simple while the domain and traffic patterns are still changing.

## Target topology

```text
Mobile app / Web portal / Public QR page
                  |
          HTTPS load balancer
                  |
       Stateless Express API replicas
          |                  |
  Managed PostgreSQL     Redis / queue
          |
  Backups + read replicas
```

Product creation and trace events remain transactional in PostgreSQL. Generated QR images should move to object storage instead of database rows. Redis is introduced only when distributed rate limiting, caching, or background jobs are required.

The product catalog is intentionally category-extensible rather than crop-specific. Food, Ayurveda, pharmaceuticals, cosmetics, textiles, electronics, automotive parts, and future categories share a common provenance core while category-specific facts live in validated `attributes` metadata.

## Delivery phases

### Phase 1 — production foundation

- Validated environment configuration and secret requirements
- Restricted browser CORS policy and security headers
- Structured request logs with correlation IDs
- Liveness and database-readiness endpoints
- Graceful shutdown for containers and deployments
- Automated backend and mobile checks

### Phase 2 — data integrity and API contracts

- Prisma migrations instead of production `db push`
- Transactions for product and trace creation
- Collision-resistant public batch identifiers
- Zod validation for every write endpoint
- Pagination, filtering, stable response envelopes, and API versioning
- Ownership/tenant authorization for update and delete operations
- Immutable audit events instead of destructive trace edits
- Controlled staff onboarding; public registration creates customer accounts only

### Phase 3 — resilient mobile operation

- SQLite-backed offline store with schema migrations
- Outbox queue, idempotency keys, retry/backoff, and conflict policy
- Connectivity status and explicit sync state
- Secure token storage and refresh-token rotation
- Remote configuration for development, staging, and production APIs

### Phase 4 — deployment and operations

- Containerized API with managed PostgreSQL
- HTTPS, secret manager, automated migrations, and rolling releases
- CI pipeline for lint, tests, builds, dependency scanning, and migration checks
- Metrics, traces, alerting, centralized logs, uptime checks, and database backups
- Load tests and documented recovery objectives

## Environment policy

- Local demo builds may use HTTP only on a trusted LAN.
- Staging and production must use HTTPS.
- Production credentials must never be committed to Git.
- `CORS_ORIGINS` must list only deployed web origins.
- `TRUST_PROXY=true` is valid only behind a trusted load balancer or reverse proxy.

## Scale milestones

Start measuring before splitting services. Consider separating verification reads, ingestion, and reporting only when observed traffic, deployment ownership, or reliability requirements justify the operational cost.
