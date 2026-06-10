import { useState, useEffect, useCallback } from "react";
import { Box, Typography, CircularProgress, Alert, Container } from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationCard from "../components/NotificationCard";
import FilterBar from "../components/FilterBar";
import { getNotifications } from "../api/notificationApi";

const VIEWED_KEY = "notifyhub_viewed_ids";

function getViewedIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(VIEWED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function markAsViewed(ids) {
  const existing = getViewedIds();
  ids.forEach((id) => existing.add(id));
  localStorage.setItem(VIEWED_KEY, JSON.stringify([...existing]));
}

function AllNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewedIds, setViewedIds] = useState(getViewedIds());
  const [notificationType, setNotificationType] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (notificationType) params.notification_type = notificationType;

      const data = await getNotifications(params);
      const items = data.notifications || [];
      setNotifications(items);

      // mark as viewed after 2s so user sees the "new" badge briefly
      setTimeout(() => {
        markAsViewed(items.map((n) => n.ID));
        setViewedIds(getViewedIds());
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, [page, limit, notificationType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <NotificationsActiveIcon sx={{ color: "#7c4dff", fontSize: 32 }} />
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(135deg, #7c4dff, #00e5ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          All Notifications
        </Typography>
      </Box>

      <FilterBar
        notificationType={notificationType} setNotificationType={setNotificationType}
        limit={limit} setLimit={setLimit}
        page={page} setPage={setPage}
        totalCount={notifications.length}
      />

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: "#7c4dff" }} />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && notifications.length === 0 && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h6" sx={{ color: "#9fa8da" }}>No notifications found</Typography>
        </Box>
      )}

      {!loading && notifications.map((notification) => (
        <NotificationCard
          key={notification.ID}
          notification={notification}
          isNew={!viewedIds.has(notification.ID)}
        />
      ))}
    </Container>
  );
}

export default AllNotifications;
