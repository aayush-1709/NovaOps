export const DEMO_LOGS = {
  databaseFailure: `
[2026-03-14T10:02:04Z] ERROR payments-db: connection pool exhausted (active=120, max=120)
[2026-03-14T10:02:06Z] ERROR payment-service: transaction rollback failed due to DB timeout
[2026-03-14T10:02:10Z] WARN checkout-service: retry queue backlog size=742
[2026-03-14T10:02:16Z] ERROR payment-service: failed to acquire DB connection in 30000ms
[2026-03-14T10:02:22Z] WARN api-gateway: 503 spike from checkout endpoints
`.trim(),
  memoryLeak: `
[2026-03-14T12:22:01Z] WARN inventory-service: heap usage 88%
[2026-03-14T12:23:11Z] WARN inventory-service: heap usage 92%
[2026-03-14T12:24:18Z] ERROR inventory-service: GC overhead limit exceeded
[2026-03-14T12:24:19Z] ERROR inventory-service: process out of memory, restarting container
[2026-03-14T12:24:29Z] WARN service-discovery: stale endpoint retained for 90s
`.trim(),
  apiTimeout: `
[2026-03-14T14:09:51Z] WARN api-gateway: upstream latency crossed 6000ms
[2026-03-14T14:09:54Z] ERROR orders-api: request timed out to auth-service after 5000ms
[2026-03-14T14:10:01Z] ERROR auth-service: dependency timeout to token-db
[2026-03-14T14:10:13Z] WARN client-monitor: timeout rate above 35%
[2026-03-14T14:10:21Z] ERROR api-gateway: returning 504 for /v1/orders
`.trim(),
};
