// ============================================================
// NOTIFICATION ROUTES — API Route Definitions
// ============================================================

import { Router } from "express";
import {
  getAllNotifications,
  getPriorityNotifications,
} from "../controllers/notification.controller.js";
import { backend as log } from "../../../logging_middleware/index.js";

const router = Router();

// ── Route Logging ─────────────────────────────────────────────
router.use((req, res, next) => {
  log.debug("route", `Matched route: ${req.method} ${req.baseUrl}${req.path}`);
  next();
});

// ── Notification Endpoints ────────────────────────────────────

// GET /api/notifications — List all notifications with filtering & pagination
router.get("/notifications", getAllNotifications);

// GET /api/notifications/priority — Get top N priority notifications
router.get("/notifications/priority", getPriorityNotifications);

export default router;
