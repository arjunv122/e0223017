// ============================================================
// NOTIFICATION CONTROLLER — Handles all notification API logic
// ============================================================

import { fetchNotifications } from "../services/notification.service.js";
import { getTopNPriority } from "../services/priority.service.js";
import { backend as log } from "../../../logging_middleware/index.js";

/**
 * GET /api/notifications
 * Fetches all notifications with optional filtering and pagination.
 * Query params: page, limit, notification_type
 */
export async function getAllNotifications(req, res) {
  try {
    // A — Extract query parameters
    const { page, limit, notification_type } = req.query;

    log.info("controller", `getAllNotifications called with page=${page}, limit=${limit}, type=${notification_type}`);

    // B — Fetch from evaluation service
    const params = {};
    if (page) params.page = Number(page);
    if (limit) params.limit = Number(limit);
    if (notification_type) params.notification_type = notification_type;

    const notifications = await fetchNotifications(params);

    // C — Return response
    log.info("controller", `Returning ${notifications.length} notifications`);
    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (err) {
    log.error("controller", `getAllNotifications error: ${err.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
}

/**
 * GET /api/notifications/priority
 * Returns the top N priority notifications based on type weight and recency.
 * Query params: n (default 10), notification_type (optional filter)
 */
export async function getPriorityNotifications(req, res) {
  try {
    // A — Extract parameters
    const n = Number(req.query.n) || 10;
    const { notification_type } = req.query;

    log.info("controller", `getPriorityNotifications called with n=${n}, type=${notification_type}`);

    // B — Fetch all notifications (no pagination to get full set for priority calculation)
    const params = {};
    if (notification_type) params.notification_type = notification_type;

    const notifications = await fetchNotifications(params);

    if (notifications.length === 0) {
      log.warn("controller", "No notifications available for priority calculation");
      return res.status(200).json({
        success: true,
        count: 0,
        priorityNotifications: [],
      });
    }

    // C — Calculate priority and get top N
    const priorityNotifications = getTopNPriority(notifications, n);

    log.info("controller", `Returning ${priorityNotifications.length} priority notifications`);
    return res.status(200).json({
      success: true,
      count: priorityNotifications.length,
      totalAvailable: notifications.length,
      priorityNotifications,
    });
  } catch (err) {
    log.error("controller", `getPriorityNotifications error: ${err.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to compute priority notifications",
    });
  }
}

export default { getAllNotifications, getPriorityNotifications };
