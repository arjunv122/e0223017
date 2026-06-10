import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import App from "./App";
import "./index.css";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#7c4dff", light: "#b47cff", dark: "#3f1dcb" },
    secondary: { main: "#00e5ff", light: "#6effff", dark: "#00b2cc" },
    background: { default: "#0a0e1a", paper: "#121829" },
    text: { primary: "#e8eaf6", secondary: "#9fa8da" },
    success: { main: "#69f0ae" },
    warning: { main: "#ffd740" },
    error: { main: "#ff5252" },
    info: { main: "#40c4ff" },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(124, 77, 255, 0.15)",
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
