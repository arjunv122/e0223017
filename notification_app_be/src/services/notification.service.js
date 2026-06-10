import axios from "axios";
import { getAuthToken } from "../config/auth.js";
import { backend as log } from "../../../logging_middleware/index.js";

export async function fetchNotifications(params = {}) {
  try {
    const NOTIFICATIONS_URL = `${process.env.EVALUATION_BASE_URL}/notifications`;
    log.info("service", `Fetching from ${NOTIFICATIONS_URL}`);

    const token = await getAuthToken();
    if (!token) {
      log.error("service", "No auth token available");
      return [];
    }

    const queryParams = {};
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;
    if (params.notification_type) queryParams.notification_type = params.notification_type;

    const response = await axios.get(NOTIFICATIONS_URL, {
      headers: { Authorization: `Bearer ${token}` },
      params: queryParams,
      timeout: 10000,
    });

    const notifications = response.data.notifications || [];
    log.info("service", `Got ${notifications.length} notifications`);
    return notifications;
  } catch (err) {
    log.error("service", `Fetch failed: ${err.message}`);
    return [];
  }
}

export default { fetchNotifications };
