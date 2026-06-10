// ============================================================
// LOGGING MIDDLEWARE — Centralized Remote Logger
// Campus Notification Platform — Evaluation Service Integration
// ============================================================

import axios from "axios";

// ── Configuration ──────────────────────────────────────────────
const LOG_API_URL = "http://4.224.186.213/evaluation-service/logs";

// Valid values as defined by the evaluation service constraints
const VALID_STACKS = ["backend", "frontend"];
const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"];
const BACKEND_PACKAGES = [
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service",
];
const FRONTEND_PACKAGES = [
  "api",
  "component",
  "hook",
  "page",
  "state",
  "style",
];
const SHARED_PACKAGES = ["auth", "config", "middleware", "utils"];

// ── Token Management ──────────────────────────────────────────
let _authToken = null;
let _authConfig = null;

/**
 * Initialize the logger with authentication credentials.
 * Must be called once at application startup before any log calls.
 *
 * @param {Object} config - Auth configuration
 * @param {string} config.email - Registered email
 * @param {string} config.name - Registered name
 * @param {string} config.rollNo - Roll number
 * @param {string} config.accessCode - Access code
 * @param {string} config.clientID - Client ID from registration
 * @param {string} config.clientSecret - Client secret from registration
 */
export function initLogger(config) {
  _authConfig = config;
  _authToken = null;
}

/**
 * Set the Bearer token directly (skips auto-fetch).
 * Use this when you already have a valid token.
 *
 * @param {string} token - Bearer access token
 */
export function setToken(token) {
  _authToken = token;
}

/**
 * Fetch a fresh Bearer token from the evaluation-service auth endpoint.
 * Called automatically if no token is set and authConfig is available.
 */
async function refreshToken() {
  if (!_authConfig) {
    return null;
  }
  try {
    const response = await axios.post(
      "http://4.224.186.213/evaluation-service/auth",
      {
        email: _authConfig.email,
        name: _authConfig.name,
        rollNo: _authConfig.rollNo,
        accessCode: _authConfig.accessCode,
        clientID: _authConfig.clientID,
        clientSecret: _authConfig.clientSecret,
      }
    );
    _authToken = response.data.access_token;
    return _authToken;
  } catch (err) {
    return null;
  }
}

/**
 * Get the current Bearer token, refreshing if necessary.
 */
async function getToken() {
  if (_authToken) return _authToken;
  return await refreshToken();
}

// ── Validation Helpers ────────────────────────────────────────

/**
 * Validate that the provided package name is allowed for the given stack.
 */
function isValidPackage(stack, pkg) {
  const allowed =
    stack === "backend"
      ? [...BACKEND_PACKAGES, ...SHARED_PACKAGES]
      : [...FRONTEND_PACKAGES, ...SHARED_PACKAGES];
  return allowed.includes(pkg);
}

// ── Core Log Function ─────────────────────────────────────────

/**
 * Send a log entry to the remote evaluation service.
 *
 * @param {string} stack - "backend" or "frontend"
 * @param {string} level - "debug" | "info" | "warn" | "error" | "fatal"
 * @param {string} pkg - Package name (e.g., "controller", "component")
 * @param {string} message - Log message string
 * @returns {Promise<Object|null>} - Response data or null on failure
 */
export async function Log(stack, level, pkg, message) {
  // A — Validate inputs
  if (!VALID_STACKS.includes(stack)) {
    return null;
  }
  if (!VALID_LEVELS.includes(level)) {
    return null;
  }
  if (!isValidPackage(stack, pkg)) {
    return null;
  }

  // B — Get authorization token
  const token = await getToken();
  if (!token) {
    return null;
  }

  // C — Send log to remote service
  try {
    const response = await axios.post(
      LOG_API_URL,
      {
        stack,
        level,
        package: pkg,
        message: String(message),
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000,
      }
    );
    return response.data;
  } catch (err) {
    // If 401, try refreshing token and retry once
    if (err.response && err.response.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        try {
          const retryResponse = await axios.post(
            LOG_API_URL,
            {
              stack,
              level,
              package: pkg,
              message: String(message),
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${newToken}`,
              },
              timeout: 5000,
            }
          );
          return retryResponse.data;
        } catch {
          return null;
        }
      }
    }
    return null;
  }
}

// ── Express Middleware ─────────────────────────────────────────

/**
 * Express middleware that logs every incoming HTTP request and
 * outgoing response to the remote evaluation service.
 *
 * Usage: app.use(requestLogger());
 */
export function requestLogger() {
  return async (req, res, next) => {
    const startTime = Date.now();

    // Log the incoming request
    Log(
      "backend",
      "info",
      "middleware",
      `Incoming ${req.method} ${req.originalUrl}`
    );

    // Capture the response finish event
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

      Log(
        "backend",
        level,
        "middleware",
        `${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
      );
    });

    next();
  };
}

// ── Convenience Shortcuts ─────────────────────────────────────

/** Backend logging shortcuts */
export const backend = {
  debug: (pkg, msg) => Log("backend", "debug", pkg, msg),
  info: (pkg, msg) => Log("backend", "info", pkg, msg),
  warn: (pkg, msg) => Log("backend", "warn", pkg, msg),
  error: (pkg, msg) => Log("backend", "error", pkg, msg),
  fatal: (pkg, msg) => Log("backend", "fatal", pkg, msg),
};

/** Frontend logging shortcuts */
export const frontend = {
  debug: (pkg, msg) => Log("frontend", "debug", pkg, msg),
  info: (pkg, msg) => Log("frontend", "info", pkg, msg),
  warn: (pkg, msg) => Log("frontend", "warn", pkg, msg),
  error: (pkg, msg) => Log("frontend", "error", pkg, msg),
  fatal: (pkg, msg) => Log("frontend", "fatal", pkg, msg),
};

// Default export for convenience
export default { Log, initLogger, setToken, requestLogger, backend, frontend };
