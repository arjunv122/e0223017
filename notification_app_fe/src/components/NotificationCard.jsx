// ============================================================
// NOTIFICATION CARD — Reusable card component for a notification
// Distinguishes between new and viewed notifications
// ============================================================

import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  alpha,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import WorkIcon from "@mui/icons-material/Work";
import FiberNewIcon from "@mui/icons-material/FiberNew";

// ── Type Configuration ────────────────────────────────────────
const TYPE_CONFIG = {
  Placement: {
    icon: WorkIcon,
    color: "#69f0ae",
    bgColor: "rgba(105, 240, 174, 0.1)",
    borderColor: "rgba(105, 240, 174, 0.3)",
    label: "Placement",
  },
  Result: {
    icon: EmojiEventsIcon,
    color: "#ffd740",
    bgColor: "rgba(255, 215, 64, 0.1)",
    borderColor: "rgba(255, 215, 64, 0.3)",
    label: "Result",
  },
  Event: {
    icon: EventIcon,
    color: "#40c4ff",
    bgColor: "rgba(64, 196, 255, 0.1)",
    borderColor: "rgba(64, 196, 255, 0.3)",
    label: "Event",
  },
};

function NotificationCard({ notification, isNew = false, showPriority = false }) {
  const config = TYPE_CONFIG[notification.Type] || TYPE_CONFIG.Event;
  const IconComponent = config.icon;

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card
      sx={{
        mb: 1.5,
        background: isNew
          ? `linear-gradient(135deg, ${alpha(config.color, 0.05)}, ${alpha(config.color, 0.02)})`
          : "rgba(18, 24, 41, 0.6)",
        border: `1px solid ${isNew ? config.borderColor : "rgba(255,255,255,0.06)"}`,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 8px 25px ${alpha(config.color, 0.15)}`,
          borderColor: config.borderColor,
        },
      }}
    >
      <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          {/* Type Icon */}
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: config.bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mt: 0.3,
            }}
          >
            <IconComponent sx={{ color: config.color, fontSize: 22 }} />
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 0.5,
                mb: 0.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={config.label}
                  size="small"
                  sx={{
                    bgcolor: config.bgColor,
                    color: config.color,
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    height: 22,
                  }}
                />
                {isNew && (
                  <FiberNewIcon sx={{ color: "#ff5252", fontSize: 18 }} />
                )}
                {showPriority && notification.priorityScore && (
                  <Typography variant="caption" sx={{ color: "#9fa8da", fontSize: "0.65rem" }}>
                    Score: {Math.round(notification.priorityScore / 1e10)}
                  </Typography>
                )}
              </Box>
              <Typography variant="caption" sx={{ color: "#9fa8da", fontSize: "0.7rem" }}>
                {formatTime(notification.Timestamp)}
              </Typography>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: isNew ? "#e8eaf6" : "#9fa8da",
                fontWeight: isNew ? 500 : 400,
                lineHeight: 1.5,
              }}
            >
              {notification.Message}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default NotificationCard;
