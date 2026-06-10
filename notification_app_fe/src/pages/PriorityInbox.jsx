import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, CircularProgress, Alert, Container,
  FormControl, InputLabel, Select, MenuItem, Chip,
  useMediaQuery, useTheme,
} from "@mui/material";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import NotificationCard from "../components/NotificationCard";
import { getPriorityNotifications } from "../api/notificationApi";

function PriorityInbox() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topN, setTopN] = useState(10);
  const [typeFilter, setTypeFilter] = useState("");
  const [totalAvailable, setTotalAvailable] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPriorityNotifications(topN, typeFilter || null);
      setNotifications(data.priorityNotifications || []);
      setTotalAvailable(data.totalAvailable || 0);
    } catch (err) {
      setError(err.message || "Failed to fetch priority notifications");
    } finally {
      setLoading(false);
    }
  }, [topN, typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <PriorityHighIcon sx={{ color: "#ff5252", fontSize: 32 }} />
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(135deg, #ff5252, #ffd740)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Priority Inbox
        </Typography>
      </Box>

      <Typography variant="body2" sx={{ color: "#9fa8da", mb: 3 }}>
        Showing the top {topN} most important notifications ranked by type
        priority (Placement &gt; Result &gt; Event) and recency.
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: "#9fa8da" }}>Top N</InputLabel>
          <Select
            value={topN} label="Top N"
            onChange={(e) => setTopN(Number(e.target.value))}
            sx={{
              color: "#e8eaf6",
              ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 82, 82, 0.3)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 82, 82, 0.5)" },
            }}
          >
            <MenuItem value={5}>Top 5</MenuItem>
            <MenuItem value={10}>Top 10</MenuItem>
            <MenuItem value={15}>Top 15</MenuItem>
            <MenuItem value={20}>Top 20</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ color: "#9fa8da" }}>Filter Type</InputLabel>
          <Select
            value={typeFilter} label="Filter Type"
            onChange={(e) => setTypeFilter(e.target.value)}
            sx={{
              color: "#e8eaf6",
              ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 82, 82, 0.3)" },
            }}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="Placement">Placement</MenuItem>
            <MenuItem value="Result">Result</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
          <Chip label={`${notifications.length} shown`} size="small" sx={{ bgcolor: "rgba(255, 82, 82, 0.15)", color: "#ff5252" }} />
          <Chip label={`${totalAvailable} total`} size="small" sx={{ bgcolor: "rgba(124, 77, 255, 0.15)", color: "#7c4dff" }} />
        </Box>
      </Box>

      {/* priority weight legend */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, p: 1.5, borderRadius: 2, bgcolor: "rgba(18, 24, 41, 0.6)", border: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap" }}>
        <Typography variant="caption" sx={{ color: "#9fa8da", fontWeight: 600 }}>Priority Weight:</Typography>
        <Chip label="Placement (3)" size="small" sx={{ bgcolor: "rgba(105, 240, 174, 0.15)", color: "#69f0ae", fontSize: "0.65rem", height: 20 }} />
        <Typography variant="caption" sx={{ color: "#9fa8da" }}>&gt;</Typography>
        <Chip label="Result (2)" size="small" sx={{ bgcolor: "rgba(255, 215, 64, 0.15)", color: "#ffd740", fontSize: "0.65rem", height: 20 }} />
        <Typography variant="caption" sx={{ color: "#9fa8da" }}>&gt;</Typography>
        <Chip label="Event (1)" size="small" sx={{ bgcolor: "rgba(64, 196, 255, 0.15)", color: "#40c4ff", fontSize: "0.65rem", height: 20 }} />
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: "#ff5252" }} />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && notifications.length === 0 && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h6" sx={{ color: "#9fa8da" }}>No priority notifications found</Typography>
        </Box>
      )}

      {!loading && notifications.map((notification, index) => (
        <Box key={notification.ID} sx={{ position: "relative" }}>
          <Box
            sx={{
              position: "absolute", top: 8, right: 8, zIndex: 1,
              width: 24, height: 24, borderRadius: "50%",
              bgcolor: index < 3 ? "rgba(255, 82, 82, 0.3)" : "rgba(124, 77, 255, 0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.65rem", color: index < 3 ? "#ff5252" : "#7c4dff" }}>
              #{index + 1}
            </Typography>
          </Box>
          <NotificationCard notification={notification} isNew={index < 3} showPriority={true} />
        </Box>
      ))}
    </Container>
  );
}

export default PriorityInbox;
