import { fetchNotifications } from "../services/notification.service.js";
import { getTopNPriority } from "../services/priority.service.js";
import { backend as log } from "../../../logging_middleware/index.js";

export async function getAllNotifications(req, res) {
  try {
    const { page, limit, notification_type } = req.query;
    log.info("controller", `getAllNotifications — page=${page}, limit=${limit}, type=${notification_type}`);

    const params = {};
    if (page) params.page = Number(page);
    if (limit) params.limit = Number(limit);
    if (notification_type) params.notification_type = notification_type;

    const notifications = await fetchNotifications(params);

    log.info("controller", `Returning ${notifications.length} notifications`);
    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (err) {
    log.error("controller", `getAllNotifications error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
}

export async function getPriorityNotifications(req, res) {
  try {
    const n = Number(req.query.n) || 10;
    const { notification_type } = req.query;
    log.info("controller", `getPriorityNotifications — n=${n}, type=${notification_type}`);

    const params = {};
    if (notification_type) params.notification_type = notification_type;

    const notifications = await fetchNotifications(params);

    if (notifications.length === 0) {
      log.warn("controller", "No notifications for priority calc");
      return res.status(200).json({ success: true, count: 0, priorityNotifications: [] });
    }

    const priorityNotifications = getTopNPriority(notifications, n);

    log.info("controller", `Returning top ${priorityNotifications.length} priority`);
    return res.status(200).json({
      success: true,
      count: priorityNotifications.length,
      totalAvailable: notifications.length,
      priorityNotifications,
    });
  } catch (err) {
    log.error("controller", `getPriorityNotifications error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Failed to compute priority notifications" });
  }
}

export default { getAllNotifications, getPriorityNotifications };
