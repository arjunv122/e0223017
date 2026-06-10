// ============================================================
// NAVBAR — Top Navigation Bar with page links
// ============================================================

import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import InboxIcon from "@mui/icons-material/Inbox";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar
      position="sticky"
      sx={{
        background: "rgba(18, 24, 41, 0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(124, 77, 255, 0.2)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <NotificationsActiveIcon sx={{ color: "#7c4dff", fontSize: 28 }} />
          {!isMobile && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #7c4dff, #00e5ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              NotifyHub
            </Typography>
          )}
        </Box>

        {/* Navigation Links */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {isMobile ? (
            <>
              <IconButton
                onClick={() => navigate("/")}
                sx={{
                  color: isActive("/") ? "#7c4dff" : "#9fa8da",
                  bgcolor: isActive("/") ? "rgba(124, 77, 255, 0.15)" : "transparent",
                }}
              >
                <InboxIcon />
              </IconButton>
              <IconButton
                onClick={() => navigate("/priority")}
                sx={{
                  color: isActive("/priority") ? "#7c4dff" : "#9fa8da",
                  bgcolor: isActive("/priority")
                    ? "rgba(124, 77, 255, 0.15)"
                    : "transparent",
                }}
              >
                <PriorityHighIcon />
              </IconButton>
            </>
          ) : (
            <>
              <Button
                startIcon={<InboxIcon />}
                onClick={() => navigate("/")}
                sx={{
                  color: isActive("/") ? "#fff" : "#9fa8da",
                  bgcolor: isActive("/") ? "rgba(124, 77, 255, 0.2)" : "transparent",
                  "&:hover": { bgcolor: "rgba(124, 77, 255, 0.15)" },
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2,
                }}
              >
                All Notifications
              </Button>
              <Button
                startIcon={<PriorityHighIcon />}
                onClick={() => navigate("/priority")}
                sx={{
                  color: isActive("/priority") ? "#fff" : "#9fa8da",
                  bgcolor: isActive("/priority")
                    ? "rgba(124, 77, 255, 0.2)"
                    : "transparent",
                  "&:hover": { bgcolor: "rgba(124, 77, 255, 0.15)" },
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2,
                }}
              >
                Priority Inbox
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
