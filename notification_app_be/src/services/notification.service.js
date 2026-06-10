// ============================================================
// NOTIFICATION SERVICE — Fetches notifications from evaluation API
// ============================================================

import axios from "axios";
import { getAuthToken } from "../config/auth.js";
import { Log, backend as log } from "../../../logging_middleware/index.js";

/**
 * Fetch notifications from the evaluation service API.
 * Supports optional query parameters: page, limit, notification_type
 *
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number
 * @param {number} [params.limit] - Items per page
 * @param {string} [params.notification_type] - "Event", "Result", or "Placement"
 * @returns {Promise<Array>} Array of notification objects
 */
export async function fetchNotifications(params = {}) {
  try {
    // A — Build URL at call time (after dotenv loaded)
    const NOTIFICATIONS_URL = `${process.env.EVALUATION_BASE_URL}/notifications`;

    log.info("service", `Fetching notifications from ${NOTIFICATIONS_URL}`);

    // B — Get auth token
    const token = await getAuthToken();
    if (!token) {
      log.error("service", "Cannot fetch notifications: no auth token available");
      return [];
    }

    // C — Build query parameters
    const queryParams = {};
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;
    if (params.notification_type) queryParams.notification_type = params.notification_type;

    // D — Make the API call
    const response = await axios.get(NOTIFICATIONS_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: queryParams,
      timeout: 10000,
    });

    const notifications = response.data.notifications || [];
    log.info("service", `Fetched ${notifications.length} notifications successfully`);
    return notifications;
  } catch (err) {
    log.error("service", `Failed to fetch notifications: ${err.message}`);
    return [];
  }
}

export default { fetchNotifications };
