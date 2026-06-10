import axios from "axios";

const LOG_API_URL = "http://4.224.186.213/evaluation-service/logs";

const VALID_STACKS = ["backend", "frontend"];
const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"];
const BACKEND_PACKAGES = ["cache", "controller", "cron_job", "db", "domain", "handler", "repository", "route", "service"];
const FRONTEND_PACKAGES = ["api", "component", "hook", "page", "state", "style"];
const SHARED_PACKAGES = ["auth", "config", "middleware", "utils"];

let _authToken = null;
let _authConfig = null;

// call this once at startup with your auth credentials
export function initLogger(config) {
  _authConfig = config;
  _authToken = null;
}

// use this if you already have a token from somewhere else
export function setToken(token) {
  _authToken = token;
}

async function refreshToken() {
  if (!_authConfig) return null;
  try {
    const response = await axios.post("http://4.224.186.213/evaluation-service/auth", {
      email: _authConfig.email,
      name: _authConfig.name,
      rollNo: _authConfig.rollNo,
      accessCode: _authConfig.accessCode,
      clientID: _authConfig.clientID,
      clientSecret: _authConfig.clientSecret,
    });
    _authToken = response.data.access_token;
    return _authToken;
  } catch (err) {
    return null;
  }
}

async function getToken() {
  if (_authToken) return _authToken;
  return await refreshToken();
}

function isValidPackage(stack, pkg) {
  const allowed = stack === "backend"
    ? [...BACKEND_PACKAGES, ...SHARED_PACKAGES]
    : [...FRONTEND_PACKAGES, ...SHARED_PACKAGES];
  return allowed.includes(pkg);
}

// main log function — sends to remote evaluation service
export async function Log(stack, level, pkg, message) {
  if (!VALID_STACKS.includes(stack)) return null;
  if (!VALID_LEVELS.includes(level)) return null;
  if (!isValidPackage(stack, pkg)) return null;

  const token = await getToken();
  if (!token) return null;

  try {
    const response = await axios.post(
      LOG_API_URL,
      { stack, level, package: pkg, message: String(message) },
      {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        timeout: 5000,
      }
    );
    return response.data;
  } catch (err) {
    // if token expired, refresh and retry once
    if (err.response && err.response.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        try {
          const retryResponse = await axios.post(
            LOG_API_URL,
            { stack, level, package: pkg, message: String(message) },
            {
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${newToken}` },
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

// express middleware — logs every request + response automatically
export function requestLogger() {
  return async (req, res, next) => {
    const startTime = Date.now();
    Log("backend", "info", "middleware", `Incoming ${req.method} ${req.originalUrl}`);

    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
      Log("backend", level, "middleware", `${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
    });

    next();
  };
}

// shortcuts so i don't have to type the stack every time
export const backend = {
  debug: (pkg, msg) => Log("backend", "debug", pkg, msg),
  info: (pkg, msg) => Log("backend", "info", pkg, msg),
  warn: (pkg, msg) => Log("backend", "warn", pkg, msg),
  error: (pkg, msg) => Log("backend", "error", pkg, msg),
  fatal: (pkg, msg) => Log("backend", "fatal", pkg, msg),
};

export const frontend = {
  debug: (pkg, msg) => Log("frontend", "debug", pkg, msg),
  info: (pkg, msg) => Log("frontend", "info", pkg, msg),
  warn: (pkg, msg) => Log("frontend", "warn", pkg, msg),
  error: (pkg, msg) => Log("frontend", "error", pkg, msg),
  fatal: (pkg, msg) => Log("frontend", "fatal", pkg, msg),
};

export default { Log, initLogger, setToken, requestLogger, backend, frontend };
