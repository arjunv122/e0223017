// ============================================================
// NOTIFICATION API — Functions to call our backend endpoints
// ============================================================

import apiClient from "./apiClient";

/**
 * Fetch all notifications with optional filters and pagination.
 *
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number
 * @param {number} [params.limit] - Items per page
 * @param {string} [params.notification_type] - Filter by type
 * @returns {Promise<Object>} Response with notifications array
 */
export async function getNotifications(params = {}) {
  const response = await apiClient.get("/notifications", { params });
  return response.data;
}

/**
 * Fetch top N priority notifications.
 *
 * @param {number} n - Number of priority notifications to fetch
 * @param {string} [notification_type] - Optional type filter
 * @returns {Promise<Object>} Response with priorityNotifications array
 */
export async function getPriorityNotifications(n = 10, notification_type = null) {
  const params = { n };
  if (notification_type) params.notification_type = notification_type;
  const response = await apiClient.get("/notifications/priority", { params });
  return response.data;
}

export default { getNotifications, getPriorityNotifications };
