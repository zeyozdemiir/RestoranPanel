// HANDSOFF_SAFE_BOOT
try {
  localStorage.removeItem("handsoff_last_requested_page");
  localStorage.setItem("handsoff_last_requested_page", "Yönetim Özeti");
} catch (error) {
  console.warn("HandsOff safe boot uygulanamadi", error);
}
// HANDSOFF_SAFE_BOOT_END
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
