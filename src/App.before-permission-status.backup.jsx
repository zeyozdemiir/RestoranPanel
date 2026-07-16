import { useEffect, useState } from "react";
import DailyReportPage from "./DailyReportPage";
import ReportUploadPage from "./ReportUploadPage";
import ExpenseManagementPage from "./ExpenseManagementPage";
import ProfitLossPage from "./ProfitLossPage";
import SuppliersPage from "./SuppliersPage";
import PurchaseOrdersPage from "./PurchaseOrdersPage";
import InventoryPage from "./InventoryPage";
import StockCountPage from "./StockCountPage";
import WastePage from "./WastePage";
import SupplierStatementPage from "./SupplierStatementPage";
import CashFlowPage from "./CashFlowPage";
import DailySalesPage from "./DailySalesPage";
import ExecutiveDashboardPage from "./ExecutiveDashboardPage";
import BackupExportPage from "./BackupExportPage";
import SystemHealthPage from "./SystemHealthPage";
import UserRolesPage from "./UserRolesPage";
import DailyClosingReportPage from "./DailyClosingReportPage";
import MonthlyManagementReportPage from "./MonthlyManagementReportPage";
import ReportCenterPage from "./ReportCenterPage";
import DailyChecklistPage from "./DailyChecklistPage";
import ActionPlanPage from "./ActionPlanPage";
import { API_BASE_URL } from "./apiConfig";

function isActionPlanPage(activePage) {
  const page = String(activePage || "").toLocaleLowerCase("tr-TR");

  return (
    page.includes("aksiyon") ||
    page.includes("görev takip") ||
    page.includes("gorev takip") ||
    page.includes("yönetim görev") ||
    page.includes("yonetim gorev") ||
    page.includes("action plan")
  );
}


function isDailyChecklistPage(activePage) {
  const page = String(activePage || "").toLocaleLowerCase("tr-TR");

  return (
    page.includes("günlük kontrol listesi") ||
    page.includes("gunluk kontrol listesi") ||
    page.includes("kontrol listesi") ||
    page.includes("checklist")
  );
}


function isReportCenterPage(activePage) {
  const page = String(activePage || "").toLocaleLowerCase("tr-TR");

  return (
    page.includes("rapor merkezi") ||
    page.includes("yönetim raporları") ||
    page.includes("yonetim raporlari") ||
    page.includes("report center")
  );
}


function isMonthlyManagementReportPage(activePage) {
  const page = String(activePage || "").toLocaleLowerCase("tr-TR");

  return (
    page.includes("aylık") ||
    page.includes("aylik") ||
    page.includes("ay raporu") ||
    page.includes("aylık yönetim") ||
    page.includes("aylik yonetim") ||
    page.includes("monthly")
  );
}


function isDailyClosingReportPage(activePage) {
  const page = String(activePage || "").toLocaleLowerCase("tr-TR");

  return (
    page.includes("gün sonu") ||
    page.includes("gun sonu") ||
    page.includes("kapanış") ||
    page.includes("kapanis") ||
    page.includes("closing")
  );
}


function isUserRolesPage(activePage) {
  const page = String(activePage || "").toLocaleLowerCase("tr-TR");

  return (
    page.includes("kullanıcı rol") ||
    page.includes("kullanici rol") ||
    page.includes("yetki") ||
    page.includes("yetkilendirme") ||
    page.includes("roller") ||
    page.includes("roles") ||
    page.includes("permission")
  );
}


function isSystemHealthPage(activePage) {
  const page = String(activePage || "").toLocaleLowerCase("tr-TR");

  return (
    page.includes("sağlık") ||
    page.includes("saglik") ||
    page.includes("sistem kontrol") ||
    page.includes("kontrol") ||
    page.includes("test") ||
    page.includes("health") ||
    page.includes("diagnostic") ||
    page.includes("diagnostics")
  );
}


function isBackupExportPage(activePage) {
  const page = String(activePage || "").toLocaleLowerCase("tr-TR");

  return (
    page.includes("yedek") ||
    page.includes("backup") ||
    page.includes("dışa aktar") ||
    page.includes("disa aktar") ||
    page.includes("veri dışa") ||
    page.includes("veri disa") ||
    page.includes("export")
  );
}


function isExecutiveDashboardPage(activePage) {
  const page = String(activePage || "").toLocaleLowerCase("tr-TR");

  return (
    page.includes("dashboard") ||
    page.includes("yönetim özeti") ||
    page.includes("yonetim ozeti") ||
    page.includes("özet") ||
    page.includes("ozet") ||
    page.includes("ana sayfa") ||
    page.includes("home")
  );
}


function isDailySalesPage(activePage) {
  const page = String(activePage || "").toLocaleLowerCase("tr-TR");

  return (
    page.includes("ciro") ||
    page.includes("gelir girişi") ||
    page.includes("gelir girisi") ||
    page.includes("günlük gelir") ||
    page.includes("gunluk gelir") ||
    page.includes("günlük satış") ||
    page.includes("gunluk satis") ||
    page.includes("daily sales") ||
    page.includes("revenue")
  );
}


function isCashFlowPage(activePage) {
  const page = String(activePage || "").toLocaleLowerCase("tr-TR");

  return (
    page.includes("nakit") ||
    page.includes("kasa") ||
    page.includes("banka") ||
    page.includes("cash") ||
    page.includes("cash flow")
  );
}


function isSupplierStatementPage(activePage) {
  const page = String(activePage || "").toLocaleLowerCase("tr-TR");

  return (
    page.includes("cari") ||
    page.includes("borç") ||
    page.includes("borc") ||
    page.includes("tedarikçi ödeme") ||
    page.includes("tedarikci odeme") ||
    page.includes("supplier statement") ||
    page.includes("supplier payment")
  );
}


function isWastePage(activePage) {
  const page = String(activePage || "").toLocaleLowerCase("tr-TR");

  return (
    page.includes("zayi") ||
    page.includes("kırılma") ||
    page.includes("kirilma") ||
    page.includes("fire") ||
    page.includes("waste") ||
    page.includes("breakage")
  );
}


function isStockCountPage(activePage) {
  const page = String(activePage || "").toLocaleLowerCase("tr-TR");

  return (
    page.includes("stok say") ||
    page.includes("stok sayım") ||
    page.includes("stok sayim") ||
    page.includes("sayım") ||
    page.includes("sayim") ||
    page.includes("stock count")
  );
}


function isInventoryPage(activePage) {
  const page = String(activePage || "").toLocaleLowerCase("tr-TR");

  return (
    (page.includes("stok") ||
      page.includes("envanter") ||
      page.includes("inventory")) &&
    !page.includes("satın") &&
    !page.includes("satin") &&
    !page.includes("purchase")
  );
}


function isPurchaseOrdersPage(activePage) {
  const page = String(activePage || "").toLocaleLowerCase("tr-TR");

  return (
    page.includes("satın") ||
    page.includes("satin") ||
    page.includes("purchase") ||
    page.includes("satinalma") ||
    page.includes("stok faturası") ||
    page.includes("stok faturasi") ||
    page.includes("stok / satın") ||
    page.includes("stok / satin")
  );
}


const menuGroups = [
  {
    title: "Her Gün",
    items: [
      "Dashboard",
      "Günlük Operasyon",
      "Rezervasyonlar",
      "Masa Yönetimi",
      "Adisyo Rapor Yükle",
      "Kasa Sayımı",
      "Görev Listesi",
      "Günlük Çeklistler",
      "AI Asistan",
    ],
  },
  {
    title: "Para & Muhasebe",
    items: [
      "Para Paneli",
      "Gelir Takibi",
      "Gider Yönetimi",
      "Kasa & Ödeme",
      "Nakit Akışı",
      "Fatura Yükle / Alım",
      "Tedarikçiler",
      "Ticari Borçlar",
      "Banka Hesapları",
      "Vergi Takvimi",
      "Mali Tablolar",
    ],
  },
  {
    title: "Menü & Satış",
    items: [
      "Menü & Maliyet",
      "Menü Mühendisliği",
      "Müşteri Menüsü",
      "Kampanya & İndirim",
      "Rakip Fiyatları",
      "Masa QR Kartları",
      "Özel Gün Menüleri",
    ],
  },
  {
    title: "Mutfak, Bar & Stok",
    items: [
      "Hammadde Deposu",
      "Stok Sayım & Fire",
      "Satın Alma Talepleri",
      "Stoksuzluk",
      "Stok Optimizasyonu",
      "Kırılma & Zayi",
      "Şarap Envanteri",
      "İçki & Bar Envanteri",
      "Şarap Pairing",
    ],
  },
  {
    title: "Ekip & Müşteri",
    items: [
      "Ekip Merkezi",
      "Personel & Vardiya",
      "Bordro",
      "Yıllık İzin",
      "Bahşiş Yönetimi",
      "Müşteri CRM",
      "Geri Bildirim",
      "Pazarlama Merkezi",
    ],
  },
  {
    title: "Strateji & Rapor",
    items: [
      "Raporlar Merkezi",
      "Hedef & KPI",
      "Karar Destek",
      "Operasyon Paneli",
      "İleri Analiz",
      "Raporlar & Export",
      "Etkinlik Takvimi",
    ],
  },
];

const revenueBars = [
  { label: "Pzt", value: "78K", height: "48%" },
  { label: "Sal", value: "92K", height: "58%" },
  { label: "Çar", value: "110K", height: "72%" },
  { label: "Per", value: "96K", height: "62%" },
  { label: "Cum", value: "138K", height: "84%" },
  { label: "Cmt", value: "164K", height: "100%" },
  { label: "Paz", value: "128K", height: "78%" },
];

function Styles() {
  return (
    <style>{`
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: #f3eee6;
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      button,
      input {
        font-family: inherit;
      }

      button {
        cursor: pointer;
      }

      button:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      @keyframes gridMove {
        from { background-position: 0 0; }
        to { background-position: 140px 140px; }
      }

      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(28px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes glow {
        0% { opacity: 0.35; transform: scale(1); }
        50% { opacity: 0.9; transform: scale(1.08); }
        100% { opacity: 0.35; transform: scale(1); }
      }

      @keyframes progress {
        from { width: 0%; }
        to { width: 100%; }
      }

      @keyframes floatLogo {
        0% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-16px) rotate(1.5deg); }
        100% { transform: translateY(0px) rotate(0deg); }
      }

      @keyframes orbit {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .grid-bg {
        background-image:
          linear-gradient(rgba(212, 168, 87, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(212, 168, 87, 0.08) 1px, transparent 1px);
        background-size: 46px 46px;
        animation: gridMove 22s linear infinite;
      }

      .fade-up {
        animation: fadeUp 0.75s ease-out both;
      }

      .glow {
        animation: glow 4s ease-in-out infinite;
      }

      .float-logo {
        animation: floatLogo 5s ease-in-out infinite;
      }

      .splash,
      .login-page {
        position: relative;
        min-height: 100vh;
        overflow: hidden;
        background: radial-gradient(circle at top, #18140d 0%, #08090d 50%, #050608 100%);
        color: white;
      }

      .splash {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }

      .bg-layer {
        position: absolute;
        inset: 0;
        opacity: 0.65;
      }

      .orb {
        position: absolute;
        border-radius: 999px;
        filter: blur(95px);
      }

      .orb-1 {
        width: 440px;
        height: 440px;
        left: -130px;
        top: -130px;
        background: rgba(212, 168, 87, 0.24);
      }

      .orb-2 {
        width: 520px;
        height: 520px;
        right: -160px;
        bottom: -160px;
        background: rgba(124, 58, 237, 0.18);
      }

      .splash-card {
        position: relative;
        z-index: 2;
        width: 100%;
        max-width: 620px;
        text-align: center;
        padding: 44px;
        border-radius: 42px;
        border: 1px solid rgba(212, 168, 87, 0.18);
        background: rgba(14, 15, 20, 0.72);
        box-shadow: 0 40px 140px rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(24px);
      }

      .logo-orbit {
        position: relative;
        width: 176px;
        height: 176px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .logo-orbit::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 44px;
        border: 1px solid rgba(212, 168, 87, 0.25);
        border-top-color: rgba(230, 197, 122, 0.85);
        animation: orbit 6s linear infinite;
      }

      .logo-card {
        width: 138px;
        height: 138px;
        border-radius: 34px;
        border: 1px solid rgba(212, 168, 87, 0.22);
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 18px;
        box-shadow: 0 30px 90px rgba(0, 0, 0, 0.42);
      }

      .logo-card svg {
        width: 98px;
        height: 98px;
      }

      .splash-eyebrow {
        margin-top: 28px;
        color: #d4a857;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.35em;
        text-transform: uppercase;
      }

      .splash h1 {
        margin: 16px 0 0;
        font-size: 44px;
        line-height: 1.05;
        font-weight: 780;
        color: white;
        letter-spacing: -0.05em;
      }

      .splash p {
        margin: 14px auto 0;
        max-width: 440px;
        color: #b9ad9d;
        font-size: 14px;
        line-height: 25px;
      }

      .progress-bar {
        width: 100%;
        max-width: 410px;
        height: 9px;
        margin: 36px auto 0;
        border-radius: 999px;
        background: rgba(255,255,255,0.10);
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, #8a6b2f, #e6c57a, #d4a857, #fff0b8);
        animation: progress 2.35s ease-in-out forwards;
      }

      .splash-steps {
        margin-top: 26px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }

      .splash-step {
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.05);
        border-radius: 18px;
        padding: 13px;
        text-align: left;
      }

      .splash-step span {
        display: block;
        color: #8d7b5c;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
      }

      .splash-step strong {
        display: block;
        margin-top: 5px;
        color: #e6c57a;
        font-size: 13px;
      }

      .login-page {
        padding: 40px 24px;
      }

      .login-shell {
        position: relative;
        z-index: 2;
        min-height: calc(100vh - 80px);
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .login-card {
        width: 100%;
        display: grid;
        grid-template-columns: 1.04fr 0.96fr;
        border-radius: 44px;
        overflow: hidden;
        border: 1px solid rgba(212, 168, 87, 0.24);
        background: rgba(17, 19, 27, 0.90);
        box-shadow: 0 45px 140px rgba(0, 0, 0, 0.50);
      }

      .login-left {
        min-height: 720px;
        padding: 44px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .brand-pill {
        display: inline-flex;
        align-items: center;
        gap: 16px;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.06);
        border-radius: 999px;
        padding: 12px 18px;
        width: fit-content;
      }

      .brand-pill-logo {
        width: 58px;
        height: 58px;
        border-radius: 19px;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
      }

      .brand-pill-logo svg {
        width: 42px;
        height: 42px;
      }

      .brand-name {
        margin: 0;
        color: white;
        font-size: 15px;
        font-weight: 820;
      }

      .brand-sub {
        margin: 4px 0 0;
        color: #d4a857;
        font-size: 11px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .login-eyebrow {
        margin: 52px 0 0;
        color: #d4a857;
        font-size: 11px;
        font-weight: 820;
        letter-spacing: 0.32em;
        text-transform: uppercase;
      }

      .login-title {
        margin: 20px 0 0;
        max-width: 590px;
        color: white;
        font-size: 52px;
        line-height: 1.05;
        font-weight: 780;
        letter-spacing: -0.055em;
      }

      .login-desc {
        max-width: 560px;
        margin: 22px 0 0;
        color: #b9ad9d;
        font-size: 14px;
        line-height: 28px;
      }

      .feature-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }

      .feature-box {
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.06);
        border-radius: 26px;
        padding: 20px;
      }

      .feature-box p {
        margin: 0;
        color: #b9ad9d;
        font-size: 12px;
      }

      .feature-box h3 {
        margin: 8px 0 0;
        color: #e6c57a;
        font-size: 21px;
      }

      .login-right {
        background: linear-gradient(135deg, #ffffff, #f3eee6, #eadcc8);
        padding: 44px;
        display: flex;
        align-items: center;
      }

      .form-card {
        width: 100%;
        border-radius: 36px;
        border: 1px solid #d8c7ad;
        background: rgba(255,255,255,0.94);
        padding: 36px;
        box-shadow: 0 32px 90px rgba(68, 49, 29, 0.19);
      }

      .form-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;
        margin-bottom: 30px;
      }

      .form-head-logo {
        width: 70px;
        height: 70px;
        border-radius: 23px;
        border: 1px solid #d8c7ad;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 9px;
      }

      .form-head-logo svg {
        width: 50px;
        height: 50px;
      }

      .form-eyebrow {
        margin: 0;
        color: #9c7439;
        font-size: 11px;
        font-weight: 820;
        letter-spacing: 0.28em;
        text-transform: uppercase;
      }

      .form-title {
        margin: 12px 0 0;
        color: #211914;
        font-size: 35px;
        letter-spacing: -0.045em;
      }

      .form-desc {
        margin: 8px 0 0;
        color: #7d6b5a;
        font-size: 14px;
        line-height: 24px;
      }

      .field {
        margin-bottom: 20px;
      }

      .field label {
        display: block;
        color: #211914;
        font-size: 14px;
        font-weight: 680;
        margin-bottom: 8px;
      }

      .field input {
        width: 100%;
        border: 1px solid #dfd0b8;
        background: #fbf8f3;
        border-radius: 18px;
        padding: 15px 16px;
        color: #211914;
        outline: none;
        font-size: 14px;
      }

      .field input:focus {
        border-color: #c9a45c;
        background: white;
        box-shadow: 0 0 0 4px rgba(201,164,92,0.12);
      }

      .error-box {
        border: 1px solid #fecaca;
        background: #fef2f2;
        color: #b91c1c;
        border-radius: 18px;
        padding: 12px 14px;
        font-size: 14px;
        margin-bottom: 18px;
      }

      .login-button {
        width: 100%;
        border: 0;
        border-radius: 999px;
        background: #211914;
        color: #e6c57a;
        padding: 16px 20px;
        font-size: 14px;
        font-weight: 780;
      }

      .demo-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-top: 22px;
      }

      .demo-button {
        border: 1px solid #dfd0b8;
        background: #fbf8f3;
        border-radius: 18px;
        padding: 14px;
        text-align: left;
        color: #7d6b5a;
        font-size: 12px;
        transition: 0.2s;
      }

      .demo-button:hover {
        border-color: #c9a45c;
        background: white;
        transform: translateY(-1px);
      }

      .demo-button strong {
        display: block;
        color: #211914;
        margin-bottom: 4px;
      }

      .app {
        display: flex;
        min-height: 100vh;
        background: #f3eee6;
      }

      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        width: 304px;
        height: 100vh;
        overflow-y: auto;
        background: linear-gradient(180deg, #0d0f15 0%, #111015 52%, #08090d 100%);
        color: white;
        padding: 24px 20px;
        border-right: 1px solid rgba(212, 168, 87, 0.13);
      }

      .sidebar-brand-card {
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.05);
        border-radius: 26px;
        padding: 16px;
        margin-bottom: 24px;
      }

      .logo-small {
        color: #d4a857;
        font-size: 11px;
        font-weight: 820;
        letter-spacing: 0.3em;
        text-transform: uppercase;
      }

      .sidebar-title {
        margin: 14px 0 4px;
        font-size: 23px;
        color: white;
        letter-spacing: -0.04em;
      }

      .sidebar-desc {
        color: #8d7b5c;
        font-size: 12px;
        line-height: 20px;
        margin-bottom: 28px;
      }

      .group {
        margin-bottom: 28px;
      }

      .group-title {
        color: #8d7b5c;
        font-size: 11px;
        font-weight: 820;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        margin-bottom: 10px;
      }

      .menu-button {
        width: 100%;
        display: block;
        border: 0;
        background: transparent;
        color: #d9d0c2;
        padding: 12px 14px;
        border-radius: 16px;
        text-align: left;
        font-size: 14px;
        transition: 0.2s;
      }

      .menu-button:hover {
        background: rgba(255,255,255,0.08);
        color: white;
        transform: translateX(2px);
      }

      .menu-button.active {
        background: linear-gradient(135deg, #d4a857, #f1d589);
        color: #111;
        font-weight: 780;
        box-shadow: 0 12px 28px rgba(212, 168, 87, 0.18);
      }

      .main {
        margin-left: 304px;
        width: calc(100% - 304px);
        min-height: 100vh;
        padding: 30px;
      }

      .topbar {
        min-height: 74px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
        gap: 20px;
      }

      .topbar-left p {
        margin: 0;
        color: #9c7439;
        font-size: 11px;
        font-weight: 820;
        letter-spacing: 0.22em;
        text-transform: uppercase;
      }

      .topbar-left h2 {
        margin: 6px 0 0;
        color: #211914;
        font-size: 24px;
        letter-spacing: -0.04em;
      }

      .topbar-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .search-box {
        width: 290px;
        border: 1px solid #dfd0b8;
        background: rgba(255,255,255,0.8);
        color: #211914;
        border-radius: 999px;
        padding: 13px 18px;
        outline: none;
      }

      .session-pill {
        display: flex;
        align-items: center;
        gap: 12px;
        border: 1px solid #d8c7ad;
        background: rgba(255,255,255,0.88);
        padding: 9px 10px 9px 16px;
        border-radius: 999px;
      }

      .session-pill p {
        margin: 0;
        text-align: right;
      }

      .session-restaurant {
        color: #211914;
        font-size: 12px;
        font-weight: 820;
      }

      .session-role {
        color: #8a7560;
        font-size: 11px;
      }

      .logout-button {
        border: 0;
        background: #211914;
        color: #e6c57a;
        border-radius: 999px;
        padding: 10px 15px;
        font-size: 12px;
        font-weight: 720;
      }

      .page {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .hero {
        background: linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,250,241,0.9));
        border: 1px solid #d8c7ad;
        border-radius: 34px;
        padding: 34px;
        box-shadow: 0 20px 65px rgba(72, 52, 27, 0.08);
      }

      .hero-content {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 24px;
      }

      .eyebrow {
        margin: 0;
        color: #9c7439;
        font-size: 11px;
        font-weight: 820;
        letter-spacing: 0.28em;
        text-transform: uppercase;
      }

      .hero h1 {
        margin: 14px 0 0;
        color: #211914;
        font-size: 40px;
        letter-spacing: -0.055em;
      }

      .hero p {
        max-width: 760px;
        margin: 10px 0 0;
        color: #7d6b5a;
        font-size: 14px;
        line-height: 25px;
      }

      .hero-button {
        border: 0;
        background: #211914;
        color: #e6c57a;
        border-radius: 999px;
        padding: 14px 20px;
        font-size: 13px;
        font-weight: 750;
      }

      .cards {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 18px;
      }

      .card {
        background: rgba(255,255,255,0.92);
        border: 1px solid #e3d6c4;
        border-radius: 30px;
        padding: 24px;
        box-shadow: 0 14px 45px rgba(72, 52, 27, 0.06);
      }

      .card p {
        margin: 0;
        color: #8a7560;
        font-size: 14px;
      }

      .card h3 {
        margin: 12px 0 0;
        color: #211914;
        font-size: 30px;
        letter-spacing: -0.04em;
      }

      .card span {
        display: block;
        margin-top: 8px;
        color: #8a7560;
        font-size: 12px;
      }

      .panel-grid {
        display: grid;
        grid-template-columns: 1.25fr 0.75fr;
        gap: 24px;
      }

      .panel {
        background: rgba(255,255,255,0.94);
        border: 1px solid #e3d6c4;
        border-radius: 30px;
        padding: 24px;
        box-shadow: 0 14px 45px rgba(72, 52, 27, 0.06);
      }

      .panel-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 20px;
      }

      .panel h2 {
        margin: 0;
        color: #211914;
        font-size: 21px;
        letter-spacing: -0.035em;
      }

      .panel-sub {
        margin: 5px 0 0;
        color: #8a7560;
        font-size: 13px;
      }

      .mini-pill {
        border: 1px solid rgba(201,164,92,0.32);
        background: #fff7e7;
        color: #9c7439;
        border-radius: 999px;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 750;
      }

      .bar-chart {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 12px;
        align-items: end;
        height: 220px;
        padding-top: 14px;
      }

      .bar-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        height: 100%;
        gap: 9px;
      }

      .bar-track {
        position: relative;
        width: 100%;
        max-width: 38px;
        height: 160px;
        border-radius: 999px;
        background: #f0e6d7;
        overflow: hidden;
      }

      .bar-fill {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        border-radius: 999px;
        background: linear-gradient(180deg, #e6c57a, #9c7439);
      }

      .bar-value {
        color: #211914;
        font-size: 12px;
        font-weight: 760;
      }

      .bar-label {
        color: #8a7560;
        font-size: 12px;
      }

      .list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .list-item {
        background: #fbf8f3;
        border: 1px solid rgba(227, 214, 196, 0.7);
        border-radius: 22px;
        padding: 16px;
      }

      .list-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
      }

      .list-title {
        margin: 0;
        color: #211914;
        font-size: 14px;
        font-weight: 760;
      }

      .list-desc {
        margin: 6px 0 0;
        color: #8a7560;
        font-size: 12px;
        line-height: 20px;
      }

      .badge {
        white-space: nowrap;
        border: 1px solid rgba(201,164,92,0.35);
        background: #fff7e7;
        color: #9c7439;
        border-radius: 999px;
        padding: 6px 10px;
        font-size: 12px;
        font-weight: 730;
      }

      .module-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }

      .module-table th {
        background: #f5efe6;
        color: #8a7560;
        font-size: 11px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        text-align: left;
        padding: 14px;
      }

      .module-table td {
        border-top: 1px solid #efe5d6;
        color: #211914;
        font-size: 14px;
        padding: 14px;
      }

      @media (max-width: 1180px) {
        .login-card,
        .feature-grid,
        .cards,
        .panel-grid {
          grid-template-columns: 1fr;
        }

        .sidebar {
          width: 260px;
        }

        .main {
          margin-left: 260px;
          width: calc(100% - 260px);
        }

        .topbar {
          height: auto;
          align-items: flex-start;
          flex-direction: column;
        }
      }
    `}</style>
  );
}

function HandsOffLogo() {
  return (
    <svg viewBox="0 0 512 512" fill="none">
      <rect width="512" height="512" rx="118" fill="#0D0F15" />
      <circle cx="256" cy="210" r="118" fill="#4C2D96" />

      <path
        d="M154 302C181 267 211 249 244 249C284 249 299 279 328 279C348 279 363 267 378 246"
        stroke="#E6C57A"
        strokeWidth="26"
        strokeLinecap="round"
      />

      <path
        d="M135 335C169 304 203 289 238 289C281 289 300 322 337 322C359 322 379 312 397 293"
        stroke="#D4A857"
        strokeWidth="22"
        strokeLinecap="round"
      />

      <text
        x="256"
        y="408"
        textAnchor="middle"
        fill="#F6E3B2"
        fontSize="54"
        fontWeight="800"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        HandsOff
      </text>
    </svg>
  );
}

function LogoBox({ small = false }) {
  return (
    <div className={small ? "brand-pill-logo" : "logo-card"}>
      <HandsOffLogo />
    </div>
  );
}

function SplashScreen({ title, subtitle }) {
  return (
    <div className="splash">
      <div className="bg-layer grid-bg" />
      <div className="orb orb-1 glow" />
      <div className="orb orb-2 glow" />

      <div className="splash-card fade-up">
        <div className="logo-orbit">
          <div className="float-logo">
            <LogoBox />
          </div>
        </div>

        <div className="splash-eyebrow">HandsOff</div>

        <h1>{title}</h1>

        <p>{subtitle}</p>

        <div className="progress-bar">
          <div className="progress-fill" />
        </div>

        <div className="splash-steps">
          <div className="splash-step">
            <span>01</span>
            <strong>Kimlik kontrolü</strong>
          </div>

          <div className="splash-step">
            <span>02</span>
            <strong>Restoran verisi</strong>
          </div>

          <div className="splash-step">
            <span>03</span>
            <strong>Panel hazırlanıyor</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [form, setForm] = useState({
    email: "admin@handsoff.com",
    password: "123456",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  }

  function fillDemo(email, password) {
    setForm({ email, password });
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(API_BASE_URL + "/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Giriş başarısız.");
        return;
      }

      onLogin({
        token: data.token,
        user: data.user,
      });
    } catch {
      setError("Backend bağlantısı kurulamadı. Backend çalışıyor mu kontrol et.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="bg-layer grid-bg" />
      <div className="orb orb-1 glow" />
      <div className="orb orb-2 glow" />

      <div className="login-shell">
        <div className="login-card fade-up">
          <div className="login-left">
            <div>
              <div className="brand-pill">
                <LogoBox small />

                <div>
                  <p className="brand-name">HandsOff</p>
                  <p className="brand-sub">Restaurant OS</p>
                </div>
              </div>

              <p className="login-eyebrow">Multi-tenant Restaurant Platform</p>

              <h1 className="login-title">
                Her restoran için ayrı, güvenli ve şık yönetim paneli.
              </h1>

              <p className="login-desc">
                HandsOff; restoranların kasa, rezervasyon, stok, ekip, menü,
                satış ve rapor süreçlerini tek sistemde toplar. Her işletme
                sadece kendi hesabına ve kendi verilerine erişir.
              </p>
            </div>

            <div className="feature-grid">
              <div className="feature-box">
                <p>Model</p>
                <h3>SaaS</h3>
              </div>

              <div className="feature-box">
                <p>Veri</p>
                <h3>Ayrı</h3>
              </div>

              <div className="feature-box">
                <p>Giriş</p>
                <h3>Güvenli</h3>
              </div>
            </div>
          </div>

          <div className="login-right">
            <div className="form-card">
              <div className="form-head">
                <div>
                  <p className="form-eyebrow">HandsOff</p>

                  <h2 className="form-title">Panele Giriş</h2>

                  <p className="form-desc">
                    Restoran hesabına giriş yaparak yönetim paneline eriş.
                  </p>
                </div>

                <div className="form-head-logo">
                  <HandsOffLogo />
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>Mail adresi</label>

                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="admin@handsoff.com"
                    required
                  />
                </div>

                <div className="field">
                  <label>Şifre</label>

                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Şifre"
                    required
                  />
                </div>

                {error && <div className="error-box">{error}</div>}

                <button className="login-button" disabled={isSubmitting}>
                  {isSubmitting ? "Kontrol ediliyor..." : "Giriş Yap"}
                </button>
              </form>

              <div className="demo-grid">
                <button
                  type="button"
                  className="demo-button"
                  onClick={() => fillDemo("admin@handsoff.com", "123456")}
                >
                  <strong>HandsOff Admin</strong>
                  admin@handsoff.com
                </button>

                <button
                  type="button"
                  className="demo-button"
                  onClick={() => fillDemo("demo@restaurant.com", "123456")}
                >
                  <strong>Demo Restoran</strong>
                  demo@restaurant.com
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Topbar({ activePage, user, onLogout }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <p>HandsOff Restaurant OS</p>
        <h2>{activePage}</h2>
      </div>

      <div className="topbar-actions">
        <input className="search-box" placeholder="Modül, rapor veya işlem ara" />

        <div className="session-pill">
          <div>
            <p className="session-restaurant">{user.restaurantName}</p>

            <p className="session-role">
              {user.role} / {user.plan || "Demo"}
            </p>
          </div>

          <button onClick={onLogout} className="logout-button">
            Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, note }) {
  return (
    <div className="card">
      <p>{title}</p>
      <h3>{value}</h3>
      <span>{note}</span>
    </div>
  );
}

function ListItem({ title, description, status }) {
  return (
    <div className="list-item">
      <div className="list-row">
        <div>
          <p className="list-title">{title}</p>
          <p className="list-desc">{description}</p>
        </div>

        <span className="badge">{status}</span>
      </div>
    </div>
  );
}

function Dashboard({ user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem("handsoff_token");

        if (!token) {
          setDashboardError("Token bulunamadı. Çıkış yapıp tekrar giriş yap.");
          setDashboardLoading(false);
          return;
        }

        const response = await fetch(API_BASE_URL + "/api/dashboard/summary", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setDashboardError(data.message || "Dashboard verisi alınamadı.");
          setDashboardLoading(false);
          return;
        }

        setDashboardData(data);
      } catch {
        setDashboardError("Backend bağlantısı kurulamadı.");
      } finally {
        setDashboardLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (dashboardLoading) {
    return (
      <div className="page">
        <div className="hero">
          <div className="hero-content">
            <div>
              <p className="eyebrow">HandsOff / {user.restaurantName}</p>

              <h1>Dashboard yükleniyor</h1>

              <p>Restoran verileri backend üzerinden hazırlanıyor.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="page">
        <div className="hero">
          <div className="hero-content">
            <div>
              <p className="eyebrow">HandsOff / {user.restaurantName}</p>

              <h1>Dashboard verisi alınamadı</h1>

              <p>{dashboardError}</p>
            </div>

            <button
              className="hero-button"
              onClick={() => window.location.reload()}
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {dashboardData.restaurantName}</p>

            <h1>Operasyon merkezi</h1>

            <p>
              Günlük satış, kasa, rezervasyon, stok ve ekip akışını tek
              merkezden takip et. Bu ekrandaki veriler artık backend üzerinden
              restoran hesabına göre geliyor.
            </p>
          </div>

          <button className="hero-button">Günlük Raporu Aç</button>
        </div>
      </div>

      <div className="cards">
        {dashboardData.stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            note={stat.note}
          />
        ))}
      </div>

      <div className="panel-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Haftalık gelir görünümü</h2>

              <p className="panel-sub">
                Backend üzerinden restoran bazlı gelen haftalık özet.
              </p>
            </div>

            <span className="mini-pill">Backend</span>
          </div>

          <div className="bar-chart">
            {dashboardData.revenueBars.map((bar) => (
              <div className="bar-item" key={bar.label}>
                <div className="bar-value">{bar.value}</div>

                <div className="bar-track">
                  <div className="bar-fill" style={{ height: bar.height }} />
                </div>

                <div className="bar-label">{bar.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Kritik aksiyonlar</h2>

              <p className="panel-sub">Bugün kontrol edilmesi gereken işler.</p>
            </div>

            <span className="mini-pill">Canlı</span>
          </div>

          <div className="list">
            {dashboardData.actions.map((action) => (
              <ListItem
                key={action.title}
                title={action.title}
                description={action.description}
                status={action.status}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModulePage({ title }) {
  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff Module</p>

            <h1>{title}</h1>

            <p>
              {title} modülü için güvenli demo ekranı. Bu alan gerçek formlar,
              tablolar, filtreler, raporlar ve backend bağlantılarıyla
              geliştirilecek.
            </p>
          </div>

          <button className="hero-button">Modül Raporu</button>
        </div>
      </div>

      <div className="cards">
        <StatCard title="Durum" value="Hazır" note="Frontend demo ekran" />

        <StatCard title="Veri Kaynağı" value="Demo" note="Backend sonra" />

        <StatCard title="Yetki" value="Restoran Bazlı" note="SaaS yapı" />

        <StatCard title="Bağlantı" value="Planlandı" note="API sonra" />
      </div>

      <div className="panel-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>{title} akış özeti</h2>

              <p className="panel-sub">
                Modülün üretim sürümünde sahip olacağı ana alanlar.
              </p>
            </div>

            <span className="mini-pill">Roadmap</span>
          </div>

          <table className="module-table">
            <thead>
              <tr>
                <th>Alan</th>
                <th>Durum</th>
                <th>Not</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Form</td>
                <td>Planlandı</td>
                <td>Veri girişi yapılacak</td>
              </tr>

              <tr>
                <td>Tablo</td>
                <td>Planlandı</td>
                <td>Kayıt listesi gösterilecek</td>
              </tr>

              <tr>
                <td>Rapor</td>
                <td>Planlandı</td>
                <td>Filtre ve export eklenecek</td>
              </tr>

              <tr>
                <td>Backend</td>
                <td>Sonra</td>
                <td>Restoran bazlı API bağlanacak</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Modül notu</h2>

              <p className="panel-sub">Bu ekranın satış/demo mantığı.</p>
            </div>

            <span className="mini-pill">Demo</span>
          </div>

          <div className="list">
            <ListItem
              title="Güvenli demo ekranı"
              description="Bu ekran dış modül import etmeden çalışır."
              status="Aktif"
            />

            <ListItem
              title="Restoran ayrımı"
              description="Backend tarafında her veri restaurantId ile ayrılacak."
              status="Planlı"
            />

            <ListItem
              title="Sonraki adım"
              description="Bu demo ekrandan gerçek modüle tek tek geçilecek."
              status="Devam"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({ user, onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");

  // HANDSOFF_FORCE_NAVIGATION_LISTENER
  useEffect(() => {
    function handleHandsOffNavigation(event) {
      if (event && event.detail) {
        setActivePage(event.detail);
      }
    }

    window.addEventListener("handsoff:navigate", handleHandsOffNavigation);

    const lastRequestedPage = localStorage.getItem("handsoff_last_requested_page");

    if (lastRequestedPage) {
      setActivePage(lastRequestedPage);
    }

    return () => {
      window.removeEventListener("handsoff:navigate", handleHandsOffNavigation);
    };
  }, []);

  

  useEffect(() => {
    function handleNavigate(event) {
      if (!event.detail) {
        return;
      }

      setActivePage(event.detail);
    }

    window.addEventListener("handsoff:navigate", handleNavigate);

    return () => {
      window.removeEventListener("handsoff:navigate", handleNavigate);
    };
  }, []);
return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand-card">
          <div className="brand-pill">
            <LogoBox small />

            <div>
              <p className="brand-name">HandsOff</p>
              <p className="brand-sub">Restaurant OS</p>
            </div>
          </div>
        </div>

        <p className="logo-small">{user.restaurantName}</p>

        <h2 className="sidebar-title">Yönetim Paneli</h2>

        <p className="sidebar-desc">
          Operasyon, satış, stok, ekip ve finans kontrol ekranı.
        </p>

        {menuGroups.map((group) => (
          <div key={group.title} className="group">
            <p className="group-title">{group.title}</p>

            {group.items.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActivePage(item)}
                className={
                  activePage === item ? "menu-button active" : "menu-button"
                }
              >
                {item}
              </button>
            ))}
          </div>
        ))}
      </aside>

      <main className="main">
        <Topbar activePage={activePage} user={user} onLogout={onLogout} />

        {activePage === "Dashboard" ? (
          <Dashboard user={user} />
        ) : (
          activePage === "\u0047\u00fcnl\u00fck Operasyon" ? (
          <DailyReportPage user={user} />
        ) : activePage === "Adisyo Rapor Y\u00fckle" ? (
          <ReportUploadPage user={user} />
        ) : activePage === "Gider Y\u00f6netimi" ? (
          <ExpenseManagementPage user={user} />
        ) : (
          activePage === "Kar Zarar" || activePage === "Kâr Zarar" ? (
          <ProfitLossPage user={user} />
        ) : (
          activePage === "Tedarikçiler" ||
        activePage === "Tedarikçi Yönetimi" ||
        activePage === "Tedarikci Yönetimi" ||
        activePage === "Tedarikci Yonetimi" ? (
          <SuppliersPage user={user} />
        ) : (
          isPurchaseOrdersPage(activePage) ? (
          <PurchaseOrdersPage user={user} />
        ) : (
          isSystemHealthPage(activePage) ? (
          <SystemHealthPage user={user} />
        ) : isBackupExportPage(activePage) ? (
          <BackupExportPage user={user} />
        ) : isActionPlanPage(activePage) ? (
          <ActionPlanPage user={user} />
        ) : isDailyChecklistPage(activePage) ? (
          <DailyChecklistPage user={user} />
        ) : isReportCenterPage(activePage) ? (
          <ReportCenterPage user={user} />
        ) : isMonthlyManagementReportPage(activePage) ? (
          <MonthlyManagementReportPage user={user} />
        ) : isDailyClosingReportPage(activePage) ? (
          <DailyClosingReportPage user={user} />
        ) : isExecutiveDashboardPage(activePage) ? (
          <ExecutiveDashboardPage user={user} />
        ) : isDailySalesPage(activePage) ? (
          <DailySalesPage user={user} />
        ) : isCashFlowPage(activePage) ? (
          <CashFlowPage user={user} />
        ) : isSupplierStatementPage(activePage) ? (
          <SupplierStatementPage user={user} />
        ) : isWastePage(activePage) ? (
          <WastePage user={user} />
        ) : isStockCountPage(activePage) ? (
          <StockCountPage user={user} />
        ) : isInventoryPage(activePage) ? (
          <InventoryPage user={user} />
        ) : (
          isUserRolesPage(activePage) ? (
          <UserRolesPage user={user} />
        ) : (
          <ModulePage title={activePage} />
        )
        )
        )
        )
        )
        )
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [bootLoading, setBootLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  const [session, setSession] = useState(() => {
    const savedSession = localStorage.getItem("handsoff_session");

    if (!savedSession) return null;

    try {
      return JSON.parse(savedSession);
    } catch {
      localStorage.removeItem("handsoff_session");
      localStorage.removeItem("handsoff_token");
      return null;
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setBootLoading(false);
    }, 2300);

    return () => clearTimeout(timer);
  }, []);

  function handleLogin(authData) {
    setLoginLoading(true);

    setTimeout(() => {
      const user = authData?.user ? authData.user : authData;

      if (authData?.token) {
        localStorage.setItem("handsoff_token", authData.token);
      }

      localStorage.setItem("handsoff_session", JSON.stringify(user));
      setSession(user);
      setLoginLoading(false);
    }, 900);
  }

  function handleLogout() {
    localStorage.removeItem("handsoff_token");
    localStorage.removeItem("handsoff_session");
    setSession(null);
    setLoginLoading(false);
  }

  let screen;

  if (bootLoading) {
    screen = (
      <SplashScreen
        title="HandsOff açılıyor"
        subtitle="Restoran yönetim paneli, güvenli oturum ve işletme alanı hazırlanıyor."
      />
    );
  } else if (loginLoading) {
    screen = (
      <SplashScreen
        title="Panel hazırlanıyor"
        subtitle="Restoran hesabı yükleniyor ve operasyon ekranları açılıyor."
      />
    );
  } else if (!session) {
    screen = <LoginScreen onLogin={handleLogin} />;
  } else {
    screen = <Panel user={session} onLogout={handleLogout} />;
  }

  return (
    <>
      <Styles />
      {screen}
    </>
  );
}