import "./menuCostStandalone.jsx";
import "./offlineApiFallback.js";
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
