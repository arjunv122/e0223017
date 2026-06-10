// ============================================================
// SERVER ENTRY POINT — Campus Notification Platform Backend
// ============================================================

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { initLogger, setToken, requestLogger, backend as log } from "../../logging_middleware/index.js";
import { getAuthToken } from "./config/auth.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ── Initialize Logger with Auth Credentials ───────────────────
initLogger({
  email: process.env.AUTH_EMAIL,
  name: process.env.AUTH_NAME,
  rollNo: process.env.AUTH_ROLLNO,
  accessCode: process.env.AUTH_ACCESSCODE,
  clientID: process.env.AUTH_CLIENTID,
  clientSecret: process.env.AUTH_CLIENTSECRET,
});

// ── Middleware ─────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(requestLogger());

// ── Routes ────────────────────────────────────────────────────
app.use("/api", notificationRoutes);

// ── Health Check ──────────────────────────────────────────────
app.get("/", (req, res) => {
  log.info("route", "Health check endpoint hit");
  res.json({ success: true, message: "Notification Platform Backend is running" });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  log.error("handler", `Unhandled error: ${err.message}`);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ── Start Server ──────────────────────────────────────────────
async function startServer() {
  try {
    // A — Fetch initial auth token for the logging middleware and API calls
    const token = await getAuthToken();
    if (token) {
      setToken(token);
      log.info("config", "Auth token acquired successfully");
    }

    // B — Start Express
    app.listen(PORT, () => {
      log.info("config", `Server started successfully on port ${PORT}`);
    });
  } catch (err) {
    log.fatal("config", `Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

startServer();
