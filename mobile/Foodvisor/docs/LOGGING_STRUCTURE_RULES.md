# Logging Structure Rules

Reusable conventions for application logging in Node.js backends, extracted from the Smartify Smart-Home-Backend. Apply these rules to any new backend that should share the same observability shape.

Stack: **Winston** with custom levels + emoji-decorated console output + per-level file output rotated by server start time.

---

## 1. Goals

1. **Visual identification at a glance** — emojis + colorized levels make dev console output scannable.
2. **Structured, queryable logs** — every entry carries a `context` tag and arbitrary `meta` JSON.
3. **Per-level files** so triaging a production incident doesn't require grepping a single huge log.
4. **Clean dev/prod parity** — same logger API; format differs only in console output (emojis in dev, JSON in prod).
5. **Domain-specific helpers** so call sites read like English (`logger.auth.login(email, true)`) rather than Winston gymnastics.

---

## 2. Custom Log Levels

Override Winston's defaults with these eight levels (lower number = higher priority):

| Level    | Priority | Color   | When to use                                                       |
|----------|----------|---------|-------------------------------------------------------------------|
| `error`  | 0        | red     | Failures requiring attention — exceptions, failed DB writes, 5xx  |
| `warn`   | 1        | yellow  | Recoverable issues, 4xx responses, rate-limit approach, fallbacks |
| `info`   | 2        | blue    | Normal operational events — incoming requests, status changes     |
| `success`| 3        | green   | **Custom.** Completed user-visible operations — login, create, 2xx|
| `http`   | 4        | magenta | Raw HTTP-layer events                                             |
| `verbose`| 5        | cyan    | Detailed flow info, off in production                             |
| `debug`  | 6        | white   | Developer-only diagnostics, off in production                     |
| `silly`  | 7        | grey    | Extremely verbose — payload dumps, every iteration                |

**Why `success` is its own level:** "operation completed normally" is the most common log line in a healthy system. Splitting it from `info` lets you grep for "all the wins" separately from generic info noise. `info` becomes "something happened (no judgment)"; `success` becomes "something *worked*".

**Production threshold**: `info` and above (drops `verbose`, `debug`, `silly`).
**Development threshold**: `debug` and above.

---

## 3. Required Emoji Palette

Maintain a single `EMOJIS` constant exported from the logger module. Group by purpose; new entries are additive only. Excerpt:

```ts
const EMOJIS = {
  // Status
  ERROR: '❌', WARN: '⚠️', INFO: 'ℹ️', SUCCESS: '✅', DEBUG: '🔍',

  // Network & API
  HTTP: '🌐', REQUEST: '📥', RESPONSE: '📤', CONNECTED: '🔗', DISCONNECTED: '🔌',

  // Database
  DATABASE: '🗄️', QUERY: '🔎', TRANSACTION: '💾', MIGRATION: '🔄',

  // Security & Auth
  AUTH: '🔐', LOCK: '🔒', UNLOCK: '🔓', TOKEN: '🎫', LOGIN: '🚪', LOGOUT: '🚶',

  // Domain (customize per project)
  USER: '👤', DEVICE: '📱', SERVER: '🚀', HEALTH: '💚',

  // Actions
  CREATE: '➕', UPDATE: '✏️', DELETE: '🗑️', READ: '👁️', SEARCH: '🔍',

  // Severity / system
  STARTUP: '🎬', SHUTDOWN: '🛑', ALERT: '🚨', NOTIFICATION: '🔔',
} as const;
```

**Rule:** Don't pass raw emoji strings at call sites — always reference `EMOJIS.X` so renaming/replacement is one-edit.

---

## 4. Log Entry Format

### File output (one canonical shape)

```
TIMESTAMP [LEVEL] [CONTEXT] message {meta as compact JSON}
```

Example:
```
2026-05-08 14:30:25.123 [ERROR] [DATABASE] Query failed {"query":"SELECT *","host":"localhost"}
2026-05-08 14:30:25.456 [SUCCESS] [API] POST /api/v1/homes - 201 {"duration":"45ms","userId":123}
```

- **TIMESTAMP**: `YYYY-MM-DD HH:mm:ss.SSS` — millisecond precision in files (so adjacent events order correctly).
- **LEVEL**: uppercased.
- **CONTEXT**: uppercased tag in square brackets. Required on every structured call.
- **message**: short, human-readable. No trailing period. No PII.
- **meta**: compact JSON (no pretty-print) so each log entry stays one line.

### Console output (dev)

```
EMOJI HH:mm:ss LEVEL [CONTEXT] message
  { meta as pretty JSON }
```

Colorized; pretty-printed meta because humans read it directly.

### Console output (prod)

Standard Winston JSON — one JSON object per line, ready for log shippers.

---

## 5. Context Tags

Every structured call carries a `context` field. Context tags are:

- **Uppercase** (`DATABASE`, not `database` or `Database`).
- **Single word** where possible (`AUTH`, `MQTT`, `WEBSOCKET`).
- **Snake-case for compounds** (`USER_ACTION`, `DEVICE_DISCOVERY`).
- **Stable** — once introduced, never renamed (downstream log queries depend on them).

Common contexts: `SERVER`, `DATABASE`, `API`, `AUTH`, `USER`, `DEVICE`, `MIGRATION`, `MQTT`, `WEBSOCKET`, `SCHEDULER`, `HEALTH`.

---

## 6. File Output Structure

```
logs/
└── 2026-05-08/                       ← date folder (UTC or local, pick one and document)
    ├── 14-30-25-error.log            ← only level=error
    ├── 14-30-25-warn.log             ← only level=warn
    ├── 14-30-25-success.log          ← only level=success
    └── 14-30-25-combined.log         ← every level
```

**Rules:**
- Top-level `logs/` is gitignored.
- Inside `logs/`, one folder per day in `YYYY-MM-DD` format.
- Inside each day folder, files are prefixed with the **server start time** as `HH-MM-SS-`. This means each process restart gets its own set of files — no interleaving of restarts in one file, easy to find "the logs from this morning's deploy".
- Per-level split: at minimum `error`, `warn`, `success`, `combined`. Add more (e.g. `http`) only if you'll actually use them.
- Don't rotate by size — rotate by process lifetime. Operators correlate by deploy/restart, not by megabytes.

---

## 7. Domain Helper API

Generic logging is fine but verbose. Wrap recurring patterns in domain helpers attached to the logger:

```ts
logger.db.connect('Database connected', { host });            // success
logger.db.query('SELECT * FROM users', { duration: '5ms' });  // debug
logger.db.error('Query failed', { error });                   // error
logger.db.transaction('BEGIN', { txId });                     // info
logger.db.migration('Applied 003_add_homes', { ms: 12 });     // info

logger.api.request('GET', '/api/v1/homes', { userId: 123 });
logger.api.response('GET', '/api/v1/homes', 200, { duration: '45ms' });
logger.api.error('POST', '/api/v1/homes', 'Validation failed');
logger.api.success('POST', '/api/v1/homes', 'Home created', { homeId: 7 });

logger.auth.login(email, true, { userId });        // success on true, warn on false
logger.auth.signup(email, true);
logger.auth.token('issued', { userId });
logger.auth.unauthorized('Invalid token', { path });
logger.auth.logout(email);
logger.auth.passwordReset(email, true);

logger.user.create(userId, email);
logger.user.update(userId, email);
logger.user.profile(userId, 'avatar_uploaded');

logger.server.start(port, env);                    // success + 🎬
logger.server.shutdown('SIGTERM');                  // warn + 🛑
logger.server.health('ok');                         // success on 'ok', warn otherwise
```

Each helper:
1. Picks the appropriate level (success vs info vs warn) based on outcome.
2. Sets the correct `context` tag.
3. Sets a sensible default emoji (caller doesn't have to pick one).
4. Forwards extra metadata via `...meta`.

**Rule:** Adding a new domain (e.g. `mqtt`, `payment`, `notification`) means adding a new helper namespace, not scattering raw `logger.info(...)` calls. The bar is "this domain has more than ~3 distinct log shapes that recur".

---

## 8. Generic Helpers (Escape Hatch)

For one-off logs that don't fit a domain:

```ts
logger.errorWithEmoji(EMOJIS.ERROR, 'Unexpected condition', 'CONTEXT', { foo: 1 });
logger.warnWithEmoji(EMOJIS.WARN, 'Slow query', 'DATABASE', { ms: 8000 });
logger.infoWithEmoji(EMOJIS.INFO, 'Cache miss', 'CACHE', { key });
logger.successWithEmoji(EMOJIS.SUCCESS, 'Job completed', 'JOB', { jobId });
logger.debugWithEmoji(EMOJIS.DEBUG, 'Branch taken', 'SERVICE');
```

Signature: `(emoji, message, context, meta?)`. The `context` arg is required for these — generic logs without context are noise.

Plain Winston methods (`logger.info(...)`) still work, but use them only when you genuinely don't have a context. Prefer the `*WithEmoji` form.

---

## 9. Request Logging Middleware

Every API receives an automatic pair of log entries: one on request, one on response. Implement as Express middleware mounted before the routes:

```ts
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  logger.api.request(req.method, req.path, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
  });
  res.on('finish', () => {
    logger.api.response(req.method, req.path, res.statusCode, {
      duration: `${Date.now() - startTime}ms`,
      ip: req.ip,
      userId: req.user?.id,
    });
  });
  next();
};
```

The `api.response` helper picks the level by status:
- `2xx` → `success`
- `3xx` → `warn`
- `4xx`/`5xx` → `error`

This means an `error.log` browse already shows every 4xx/5xx that hit the API.

---

## 10. What NOT to Log

Hard rules:

- ❌ **Passwords**, password hashes, plaintext or hashed.
- ❌ **JWTs / API keys / session tokens** — log the *fact* of issuance, not the value.
- ❌ **Full request bodies** for auth/payment endpoints. Log a redacted summary.
- ❌ **PII** beyond what's needed for support — log `userId` over `email` where possible. When you log email (e.g. login attempts), accept it; don't *also* log phone, address, etc.
- ❌ **Stack traces in production console** at info level — they go to `error.log` only.
- ❌ **Massive payloads** (image data, large JSON blobs) — log size + a hash, not the content.

If a field's value would be embarrassing in a screenshot, redact at the call site before passing it as meta.

---

## 11. Best Practices

1. **Pick the right level.** A failed login is `warn` (user-attributable), not `error` (system fault). A 500 is `error`. A successful login is `success`, not `info`.
2. **Always include context.** `logger.info('Done')` is useless six weeks from now.
3. **Prefer domain helpers over generic.** `logger.auth.login(...)` is searchable; `logger.info('Login: foo@bar')` isn't.
4. **Meta is JSON, message is English.** Don't string-interpolate IDs into the message and also pass them in meta — pick one (meta wins for anything you might query).
5. **No transient debug logs in committed code.** If you needed `console.log('here 1')` to ship the feature, delete it before merging.
6. **Log once per logical event.** Don't log the same operation in service *and* controller *and* repository — pick one layer (usually service for business events, repo for slow queries, controller never).
7. **Server lifecycle gets its own helpers.** Always log `server.start`, `server.shutdown`, `server.health` — these are the first lines an operator looks at.

---

## 12. Logger Setup Skeleton

Place in `src/utils/logger.ts`. The pattern (abbreviated):

```ts
import winston from 'winston';
import path from 'path';
import fs from 'fs';

// 1. Compute date folder + start-time prefix once at module load
const startTime = new Date().toTimeString().slice(0, 8).replace(/:/g, '-');
const dateFolder = new Date().toISOString().slice(0, 10);
const logDir = path.join(process.cwd(), 'logs', dateFolder);
fs.mkdirSync(logDir, { recursive: true });

// 2. Custom levels
const levels = { error: 0, warn: 1, info: 2, success: 3, http: 4, verbose: 5, debug: 6, silly: 7 };
const colors = { error: 'red', warn: 'yellow', info: 'blue', success: 'green', http: 'magenta',
                 verbose: 'cyan', debug: 'white', silly: 'grey' };
winston.addColors(colors);

// 3. File format: TIMESTAMP [LEVEL] [CONTEXT] message {meta}
const fileFormat = winston.format.printf(({ level, message, timestamp, context, ...meta }) => {
  const ctx = context ? `[${context}] ` : '';
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level.toUpperCase()}] ${ctx}${message}${metaStr}`;
});

// 4. Build logger with per-level file transports + combined
const logger = winston.createLogger({
  levels,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    fileFormat
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, `${startTime}-error.log`),    level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, `${startTime}-warn.log`),     level: 'warn'  }),
    new winston.transports.File({ filename: path.join(logDir, `${startTime}-success.log`),  level: 'success' }),
    new winston.transports.File({ filename: path.join(logDir, `${startTime}-combined.log`)                 }),
  ],
});

// 5. Console transport: dev gets emojis + color, prod gets JSON
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), /* emoji format */),
  }));
} else {
  logger.add(new winston.transports.Console({ format: winston.format.json() }));
}

// 6. Attach domain helpers (db, api, auth, user, server, ...) — see §7
// 7. Export
export default logger as EnhancedLogger;
```

The full reference implementation lives in [`src/utils/logger.ts`](../src/utils/logger.ts) and the docs guide at [`docs/LOGGING.md`](./LOGGING.md).

---

## 13. Anti-Patterns to Reject

- ❌ `console.log` / `console.error` anywhere in `src/`
- ❌ Raw `logger.info('...')` without a `context` field
- ❌ Logging passwords, tokens, full credit cards, full request bodies
- ❌ `logger.error(...)` for user input mistakes (those are `warn`)
- ❌ Pretty-printed JSON in file output (breaks one-line-per-entry assumption)
- ❌ Inventing a new emoji at the call site instead of adding it to `EMOJIS`
- ❌ Logging the same business event from multiple layers
- ❌ Using `info` for "operation succeeded" when `success` exists
- ❌ Renaming a context tag after deploys reference it in dashboards/alerts

---

## Quick Reference

```ts
import logger, { EMOJIS } from './utils/logger';

// Lifecycle
logger.server.start(port, env.nodeEnv);
logger.server.shutdown('SIGTERM');

// API (auto-emitted by requestLogger middleware — don't double-log)
logger.api.success('POST', '/api/v1/homes', 'Home created', { homeId });

// Auth
logger.auth.login(email, true, { userId });
logger.auth.unauthorized('Invalid token', { path: req.path });

// DB
logger.db.connect('Pool ready', { host });
logger.db.error('Insert failed', { table: 'homes', error: err.message });

// Domain action
logger.user.create(userId, email);
logger.device.connection(deviceId, true, { rssi: -54 });

// Generic escape hatch
logger.warnWithEmoji(EMOJIS.WARN, 'Cache miss for hot key', 'CACHE', { key });
```
