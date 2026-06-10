import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { initLogger, setToken, requestLogger, backend as log } from "../../logging_middleware/index.js";
import { getAuthToken } from "./config/auth.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// setup logger with auth creds
initLogger({
  email: process.env.AUTH_EMAIL,
  name: process.env.AUTH_NAME,
  rollNo: process.env.AUTH_ROLLNO,
  accessCode: process.env.AUTH_ACCESSCODE,
  clientID: process.env.AUTH_CLIENTID,
  clientSecret: process.env.AUTH_CLIENTSECRET,
});

app.use(cors());
app.use(express.json());
app.use(requestLogger());

app.use("/api", notificationRoutes);

app.get("/", (req, res) => {
  log.info("route", "Health check");
  res.json({ success: true, message: "Notification Platform Backend is running" });
});

app.use((err, req, res, next) => {
  log.error("handler", `Unhandled: ${err.message}`);
  res.status(500).json({ success: false, message: "Internal server error" });
});

async function startServer() {
  try {
    const token = await getAuthToken();
    if (token) {
      setToken(token);
      log.info("config", "Auth token acquired");
    }

    app.listen(PORT, () => {
      log.info("config", `Server running on port ${PORT}`);
    });
  } catch (err) {
    log.fatal("config", `Startup failed: ${err.message}`);
    process.exit(1);
  }
}

startServer();
