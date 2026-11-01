/**
 * Runs a real PostgreSQL server from npm-provided binaries (embedded-postgres) for machines without
 * Docker or a local install. Data persists in `.pgdata/`; connection details come from DATABASE_URL.
 *
 *   npm run db:local        initialise (first run) and start the server in the background
 *   npm run db:local:stop   stop it
 *
 * The server is started through `pg_ctl` rather than embedded-postgres' own start(): postgres.exe
 * refuses to run from an elevated Windows shell, and pg_ctl drops to a restricted token for it.
 */
import { execFile, spawn } from "child_process";
import EmbeddedPostgres from "embedded-postgres";
import fs from "fs";
import os from "os";
import path from "path";
import pg from "pg";
import { promisify } from "util";
import { env } from "../config/env.js";
import logger, { EMOJIS } from "../utils/logger.js";

const run = promisify(execFile);

const url = new URL(env.databaseUrl);
const databaseName = url.pathname.slice(1);
const port = Number(url.port || 5432);
const user = decodeURIComponent(url.username) || "postgres";
const password = decodeURIComponent(url.password) || "postgres";
const dataDir = path.join(process.cwd(), ".pgdata");
const serverLog = path.join(dataDir, "server.log");

async function pgCtlPath(): Promise<string> {
  const platform = os.platform() === "win32" ? "windows" : os.platform();
  const binaries = (await import(`@embedded-postgres/${platform}-${os.arch()}`)) as { pg_ctl: string };
  return binaries.pg_ctl;
}

async function isRunning(pgCtl: string): Promise<boolean> {
  try {
    await run(pgCtl, ["status", "-D", dataDir]);
    return true;
  } catch {
    return false;
  }
}

async function ensureDatabase(): Promise<void> {
  const client = new pg.Client({ host: "127.0.0.1", port, user, password, database: "postgres" });
  await client.connect();
  try {
    const exists = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [databaseName]);
    // Name is validated in start(); CREATE DATABASE cannot take a bind parameter.
    if (exists.rowCount === 0) await client.query(`CREATE DATABASE ${databaseName}`);
  } finally {
    await client.end();
  }
}

async function start(): Promise<void> {
  if (!/^[a-z0-9_]+$/.test(databaseName)) {
    throw new Error(`Database name must match [a-z0-9_]+ for local setup, got "${databaseName}"`);
  }
  const pgCtl = await pgCtlPath();

  if (!fs.existsSync(path.join(dataDir, "PG_VERSION"))) {
    logger.infoWithEmoji(EMOJIS.DATABASE, "Initialising local PostgreSQL data directory", "DATABASE", { dataDir });
    await new EmbeddedPostgres({ databaseDir: dataDir, user, password, port, persistent: true, onLog: () => undefined }).initialise();
  }

  if (!(await isRunning(pgCtl))) {
    // The server inherits pg_ctl's stdio, so wait for pg_ctl's exit rather than for its pipes to close.
    const code = await new Promise<number | null>((resolve, reject) => {
      const child = spawn(pgCtl, ["start", "-w", "-D", dataDir, "-l", serverLog, "-o", `-p ${port}`], {
        stdio: "ignore",
        windowsHide: true
      });
      child.on("error", reject);
      child.on("exit", resolve);
    });
    if (code !== 0) throw new Error(`pg_ctl start exited with code ${code}; see ${serverLog}`);
  }
  await ensureDatabase();

  logger.successWithEmoji(EMOJIS.DATABASE, "Local PostgreSQL is running", "DATABASE", {
    port,
    database: databaseName,
    log: serverLog,
    stop: "npm run db:local:stop"
  });
}

async function stop(): Promise<void> {
  const pgCtl = await pgCtlPath();
  if (await isRunning(pgCtl)) await run(pgCtl, ["stop", "-w", "-m", "fast", "-D", dataDir]);
  logger.server.shutdown("local PostgreSQL stopped");
}

const command = process.argv[2] ?? "start";

(command === "stop" ? stop() : start()).catch((error: unknown) => {
  const details = error as { message?: string; stderr?: string };
  logger.errorWithEmoji(EMOJIS.ERROR, `Local PostgreSQL ${command} failed`, "DATABASE", {
    error: details.stderr?.trim() || details.message || String(error),
    log: serverLog
  });
  process.exitCode = 1;
});
