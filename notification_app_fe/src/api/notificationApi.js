import apiClient from "./apiClient";

export async function getNotifications(params = {}) {
  const response = await apiClient.get("/notifications", { params });
  return response.data;
}

export async function getPriorityNotifications(n = 10, notification_type = null) {
  const params = { n };
  if (notification_type) params.notification_type = notification_type;
  const response = await apiClient.get("/notifications/priority", { params });
  return response.data;
}

export default { getNotifications, getPriorityNotifications };
