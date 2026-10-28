import fs from "fs";
import path from "path";
import winston from "winston";
import { env } from "../config/env.js";

export const EMOJIS = {
  ERROR: "❌",
  WARN: "⚠️",
  INFO: "ℹ️",
  SUCCESS: "✅",
  DEBUG: "🔍",
  HTTP: "🌐",
  REQUEST: "📥",
  RESPONSE: "📤",
  CONNECTED: "🔗",
  DISCONNECTED: "🔌",
  DATABASE: "🗄️",
  QUERY: "🔎",
  TRANSACTION: "💾",
  MIGRATION: "🔄",
  AUTH: "🔐",
  LOCK: "🔒",
  UNLOCK: "🔓",
  TOKEN: "🎫",
  LOGIN: "🚪",
  LOGOUT: "🚶",
  USER: "👤",
  FOOD: "🥗",
  SERVER: "🚀",
  HEALTH: "💚",
  CREATE: "➕",
  UPDATE: "✏️",
  DELETE: "🗑️",
  READ: "👁️",
  SEARCH: "🔍",
  STARTUP: "🎬",
  SHUTDOWN: "🛑",
  ALERT: "🚨",
  NOTIFICATION: "🔔",
  SWAGGER: "📚"
} as const;

type LogMeta = Record<string, unknown>;
type Emoji = typeof EMOJIS[keyof typeof EMOJIS];
type LogLevel = "error" | "warn" | "info" | "success" | "http" | "verbose" | "debug" | "silly";

export type EnhancedLogger = winston.Logger & {
  success: winston.LeveledLogMethod;
  errorWithEmoji: (emoji: Emoji, message: string, context: string, meta?: LogMeta) => void;
  warnWithEmoji: (emoji: Emoji, message: string, context: string, meta?: LogMeta) => void;
  infoWithEmoji: (emoji: Emoji, message: string, context: string, meta?: LogMeta) => void;
  successWithEmoji: (emoji: Emoji, message: string, context: string, meta?: LogMeta) => void;
  debugWithEmoji: (emoji: Emoji, message: string, context: string, meta?: LogMeta) => void;
  verboseWithEmoji: (emoji: Emoji, message: string, context: string, meta?: LogMeta) => void;
  httpWithEmoji: (emoji: Emoji, message: string, context: string, meta?: LogMeta) => void;
  db: {
    connect: (message: string, meta?: LogMeta) => void;
    query: (message: string, meta?: LogMeta) => void;
    error: (message: string, meta?: LogMeta) => void;
    transaction: (message: string, meta?: LogMeta) => void;
    migration: (message: string, meta?: LogMeta) => void;
    success: (message: string, meta?: LogMeta) => void;
  };
  api: {
    request: (method: string, path: string, meta?: LogMeta) => void;
    response: (method: string, path: string, statusCode: number, meta?: LogMeta) => void;
    error: (method: string, path: string, message: string, meta?: LogMeta) => void;
    success: (method: string, path: string, message: string, meta?: LogMeta) => void;
  };
  auth: {
    login: (email: string, success: boolean, meta?: LogMeta) => void;
    signup: (email: string, success: boolean, meta?: LogMeta) => void;
    token: (action: string, meta?: LogMeta) => void;
    unauthorized: (message: string, meta?: LogMeta) => void;
    logout: (email: string, meta?: LogMeta) => void;
  };
  user: {
    create: (userId: unknown, email?: string, meta?: LogMeta) => void;
    update: (userId: unknown, email?: string, meta?: LogMeta) => void;
    profile: (userId: unknown, action: string, meta?: LogMeta) => void;
  };
  food: {
    import: (source: string, count: number, meta?: LogMeta) => void;
    optimize: (success: boolean, meta?: LogMeta) => void;
  };
  server: {
    start: (port: number, nodeEnv: string, meta?: LogMeta) => void;
    shutdown: (signal: string, meta?: LogMeta) => void;
    health: (status: string, meta?: LogMeta) => void;
  };
};

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  success: 3,
  http: 4,
  verbose: 5,
  debug: 6,
  silly: 7
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "blue",
  success: "green",
  http: "magenta",
  verbose: "cyan",
  debug: "white",
  silly: "grey"
};

winston.addColors(colors);

const startTime = new Date().toTimeString().slice(0, 8).replace(/:/g, "-");
const dateFolder = new Date().toISOString().slice(0, 10);
const logDir = path.join(process.cwd(), "logs", dateFolder);
fs.mkdirSync(logDir, { recursive: true });

const fileFormat = winston.format.printf(({ level, message, timestamp, context, emoji: _emoji, ...meta }) => {
  const ctx = context ? `[${String(context).toUpperCase()}] ` : "";
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `${timestamp} [${level.toUpperCase()}] ${ctx}${message}${metaStr}`;
});

const consoleFormat = winston.format.printf(({ level, message, timestamp, context, emoji, ...meta }) => {
  const time = String(timestamp).split(" ")[1]?.slice(0, 8) || "";
  const ctx = context ? `[${String(context).toUpperCase()}] ` : "";
  const metaStr = Object.keys(meta).length ? `\n  ${JSON.stringify(meta, null, 2)}` : "";
  return `${emoji || ""} ${time} ${level} ${ctx}${message}${metaStr}`;
});

function exactLevel(level: LogLevel) {
  return winston.format((info) => (info.level === level ? info : false))();
}

function createFileTransport(level: LogLevel) {
  return new winston.transports.File({
    filename: path.join(logDir, `${startTime}-${level}.log`),
    level,
    format: winston.format.combine(exactLevel(level), fileFormat)
  });
}

const baseLogger = winston.createLogger({
  levels,
  level: env.nodeEnv === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    winston.format.errors({ stack: true }),
    fileFormat
  ),
  transports: [
    createFileTransport("error"),
    createFileTransport("warn"),
    createFileTransport("success"),
    new winston.transports.File({
      filename: path.join(logDir, `${startTime}-combined.log`)
    })
  ]
}) as EnhancedLogger;

if (env.nodeEnv === "production") {
  baseLogger.add(new winston.transports.Console({ format: winston.format.json() }));
} else {
  baseLogger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
        winston.format.colorize(),
        consoleFormat
      )
    })
  );
}

function logWithEmoji(level: LogLevel, emoji: Emoji, message: string, context: string, meta: LogMeta = {}) {
  baseLogger.log(level, message, { emoji, context: context.toUpperCase(), ...meta });
}

baseLogger.errorWithEmoji = (emoji, message, context, meta) => logWithEmoji("error", emoji, message, context, meta);
baseLogger.warnWithEmoji = (emoji, message, context, meta) => logWithEmoji("warn", emoji, message, context, meta);
baseLogger.infoWithEmoji = (emoji, message, context, meta) => logWithEmoji("info", emoji, message, context, meta);
baseLogger.successWithEmoji = (emoji, message, context, meta) => logWithEmoji("success", emoji, message, context, meta);
baseLogger.debugWithEmoji = (emoji, message, context, meta) => logWithEmoji("debug", emoji, message, context, meta);
baseLogger.verboseWithEmoji = (emoji, message, context, meta) => logWithEmoji("verbose", emoji, message, context, meta);
baseLogger.httpWithEmoji = (emoji, message, context, meta) => logWithEmoji("http", emoji, message, context, meta);

baseLogger.db = {
  connect: (message, meta) => baseLogger.successWithEmoji(EMOJIS.DATABASE, message, "DATABASE", meta),
  query: (message, meta) => baseLogger.debugWithEmoji(EMOJIS.QUERY, message, "DATABASE", meta),
  error: (message, meta) => baseLogger.errorWithEmoji(EMOJIS.ERROR, message, "DATABASE", meta),
  transaction: (message, meta) => baseLogger.infoWithEmoji(EMOJIS.TRANSACTION, message, "DATABASE", meta),
  migration: (message, meta) => baseLogger.infoWithEmoji(EMOJIS.MIGRATION, message, "MIGRATION", meta),
  success: (message, meta) => baseLogger.successWithEmoji(EMOJIS.SUCCESS, message, "DATABASE", meta)
};

baseLogger.api = {
  request: (method, requestPath, meta) =>
    baseLogger.infoWithEmoji(EMOJIS.REQUEST, `${method} ${requestPath}`, "API", meta),
  response: (method, requestPath, statusCode, meta) => {
    const level = statusCode >= 400 ? "error" : statusCode >= 300 ? "warn" : "success";
    logWithEmoji(level, EMOJIS.RESPONSE, `${method} ${requestPath} - ${statusCode}`, "API", meta);
  },
  error: (method, requestPath, message, meta) =>
    baseLogger.errorWithEmoji(EMOJIS.ERROR, `${method} ${requestPath} - ${message}`, "API", meta),
  success: (method, requestPath, message, meta) =>
    baseLogger.successWithEmoji(EMOJIS.SUCCESS, `${method} ${requestPath} - ${message}`, "API", meta)
};

baseLogger.auth = {
  login: (email, success, meta) =>
    logWithEmoji(success ? "success" : "warn", success ? EMOJIS.LOGIN : EMOJIS.LOCK, `Login ${success ? "succeeded" : "failed"}`, "AUTH", { email, ...meta }),
  signup: (email, success, meta) =>
    logWithEmoji(success ? "success" : "warn", success ? EMOJIS.CREATE : EMOJIS.WARN, `Signup ${success ? "succeeded" : "failed"}`, "AUTH", { email, ...meta }),
  token: (action, meta) => baseLogger.infoWithEmoji(EMOJIS.TOKEN, `Token ${action}`, "AUTH", meta),
  unauthorized: (message, meta) => baseLogger.warnWithEmoji(EMOJIS.LOCK, message, "AUTH", meta),
  logout: (email, meta) => baseLogger.infoWithEmoji(EMOJIS.LOGOUT, "Logout", "AUTH", { email, ...meta })
};

baseLogger.user = {
  create: (userId, email, meta) => baseLogger.successWithEmoji(EMOJIS.USER, "User created", "USER", { userId, email, ...meta }),
  update: (userId, email, meta) => baseLogger.successWithEmoji(EMOJIS.UPDATE, "User updated", "USER", { userId, email, ...meta }),
  profile: (userId, action, meta) => baseLogger.infoWithEmoji(EMOJIS.USER, `User profile ${action}`, "USER", { userId, ...meta })
};

baseLogger.food = {
  import: (source, count, meta) => baseLogger.successWithEmoji(EMOJIS.FOOD, "Food import completed", "FOOD", { source, count, ...meta }),
  optimize: (success, meta) =>
    logWithEmoji(success ? "success" : "warn", success ? EMOJIS.SUCCESS : EMOJIS.WARN, `Diet optimization ${success ? "succeeded" : "failed"}`, "FOOD", meta)
};

baseLogger.server = {
  start: (port, nodeEnv, meta) => baseLogger.successWithEmoji(EMOJIS.STARTUP, `Server started on port ${port}`, "SERVER", { nodeEnv, ...meta }),
  shutdown: (signal, meta) => baseLogger.warnWithEmoji(EMOJIS.SHUTDOWN, `Server shutdown requested: ${signal}`, "SERVER", meta),
  health: (status, meta) =>
    logWithEmoji(status === "ok" ? "success" : "warn", EMOJIS.HEALTH, `Health check ${status}`, "HEALTH", meta)
};

export default baseLogger;
