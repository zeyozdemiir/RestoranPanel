// HANDSOFF_FORCE_SAFE_START
try {
  localStorage.setItem("handsoff_last_requested_page", "Yönetim Özeti");
} catch (error) {
  console.warn("Safe start uygulanamadi", error);
}
// HANDSOFF_FORCE_SAFE_START_END
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import HandsOffFloatingMenu from "./HandsOffFloatingMenu.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <HandsOffFloatingMenu />
  </React.StrictMode>
);
