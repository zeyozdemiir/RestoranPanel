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


// HANDSOFF_DASHBOARD_CLICK_GUARD
(function () {
  if (window.__HANDSOFF_DASHBOARD_CLICK_GUARD__) return;
  window.__HANDSOFF_DASHBOARD_CLICK_GUARD__ = true;

  function cleanPageMemory() {
    try {
      const protectedWords = /(token|auth|user|role|permission|restaurant)/i;
      const pageWords = /(page|route|dashboard|analytics|overview|screen|menu)/i;

      Object.keys(localStorage).forEach((key) => {
        if (pageWords.test(key) && !protectedWords.test(key)) {
          localStorage.removeItem(key);
        }
      });

      Object.keys(sessionStorage).forEach((key) => {
        if (pageWords.test(key) && !protectedWords.test(key)) {
          sessionStorage.removeItem(key);
        }
      });

      localStorage.removeItem("handsoff_last_requested_page");
      localStorage.removeItem("lastRequestedPage");
      localStorage.removeItem("activePage");
      localStorage.removeItem("currentPage");
      localStorage.removeItem("selectedPage");
    } catch (error) {
      console.warn("Dashboard page memory temizlenemedi", error);
    }
  }

  function isDashboardControl(element) {
    if (!element) return false;

    const control = element.closest(
      "button,a,[role='button'],[data-page],[data-id],[data-route],[data-target],li"
    );

    if (!control) return false;

    const text = (control.innerText || control.textContent || "")
      .toLocaleLowerCase("tr-TR")
      .trim();

    const href = (control.getAttribute("href") || "").toLocaleLowerCase("tr-TR");
    const dataPage = (
      control.getAttribute("data-page") ||
      control.getAttribute("data-id") ||
      control.getAttribute("data-route") ||
      control.getAttribute("data-target") ||
      ""
    ).toLocaleLowerCase("tr-TR");

    return (
      text.includes("dashboard") ||
      text.includes("yönetim özeti") ||
      text.includes("yonetim ozeti") ||
      text.includes("ana ekran") ||
      href.includes("dashboard") ||
      href.includes("analytics") ||
      href.includes("executive") ||
      dataPage.includes("dashboard") ||
      dataPage.includes("analytics") ||
      dataPage.includes("executive")
    );
  }

  document.addEventListener(
    "click",
    function (event) {
      if (!isDashboardControl(event.target)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      cleanPageMemory();

      window.history.replaceState(null, "", "/");
      window.location.assign("/");
    },
    true
  );
})();
