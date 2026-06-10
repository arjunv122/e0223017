import {
  Box, FormControl, InputLabel, Select, MenuItem,
  Pagination as MuiPagination, Typography, Chip,
  useMediaQuery, useTheme,
} from "@mui/material";

function FilterBar({ notificationType, setNotificationType, limit, setLimit, page, setPage, totalCount }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ color: "#9fa8da" }}>Type</InputLabel>
          <Select
            value={notificationType} label="Type"
            onChange={(e) => { setNotificationType(e.target.value); setPage(1); }}
            sx={{
              color: "#e8eaf6",
              ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(124, 77, 255, 0.3)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(124, 77, 255, 0.5)" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#7c4dff" },
            }}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="Placement">
              <Chip label="Placement" size="small" sx={{ bgcolor: "rgba(105, 240, 174, 0.15)", color: "#69f0ae", mr: 1 }} />
            </MenuItem>
            <MenuItem value="Result">
              <Chip label="Result" size="small" sx={{ bgcolor: "rgba(255, 215, 64, 0.15)", color: "#ffd740", mr: 1 }} />
            </MenuItem>
            <MenuItem value="Event">
              <Chip label="Event" size="small" sx={{ bgcolor: "rgba(64, 196, 255, 0.15)", color: "#40c4ff", mr: 1 }} />
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: "#9fa8da" }}>Per Page</InputLabel>
          <Select
            value={limit} label="Per Page"
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            sx={{ color: "#e8eaf6", ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(124, 77, 255, 0.3)" } }}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="body2" sx={{ color: "#9fa8da", ml: "auto" }}>
          {totalCount} notifications
        </Typography>
      </Box>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <MuiPagination
            count={totalPages} page={page}
            onChange={(e, value) => setPage(value)}
            size={isMobile ? "small" : "medium"}
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#9fa8da", borderColor: "rgba(124, 77, 255, 0.3)",
                "&.Mui-selected": { bgcolor: "rgba(124, 77, 255, 0.3)", color: "#fff" },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}

export default FilterBar;
