import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Tables from "./pages/Tables";
import Reservations from "./pages/Reservations";

import Ingredients from "./pages/Ingredients";
import Suppliers from "./pages/Suppliers";
import Payables from "./pages/Payables";
import PurchaseRequests from "./pages/PurchaseRequests";
import StockCount from "./pages/StockCount";
import Breakage from "./pages/Breakage";
import Shortfalls from "./pages/Shortfalls";
import StockOptimization from "./pages/StockOptimization";
import WineInventory from "./pages/WineInventory";
import BeverageInventory from "./pages/BeverageInventory";
import WinePairing from "./pages/WinePairing";

import MenuCost from "./pages/MenuCost";
import MenuEngineering from "./pages/MenuEngineering";
import PrintMenu from "./pages/PrintMenu";
import Campaigns from "./pages/Campaigns";
import CompetitorPrices from "./pages/CompetitorPrices";
import TableQR from "./pages/TableQR";
import EventMenu from "./pages/EventMenu";

import TeamCenter from "./pages/TeamCenter";
import Staff from "./pages/Staff";
import Payroll from "./pages/Payroll";
import LeaveManagement from "./pages/LeaveManagement";
import Tips from "./pages/Tips";
import Customers from "./pages/Customers";
import Feedback from "./pages/Feedback";
import MarketingCenter from "./pages/MarketingCenter";

import ReportsHub from "./pages/ReportsHub";
import Kpis from "./pages/Kpis";
import DecisionCenter from "./pages/DecisionCenter";
import CompareReports from "./pages/CompareReports";
import OperationsCenter from "./pages/OperationsCenter";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import UnifiedCalendar from "./pages/UnifiedCalendar";
import Events from "./pages/Events";
import FlowGuide from "./pages/FlowGuide";

import PlaceholderPage from "./pages/PlaceholderPage";

const placeholderRoutes = [
  { path: "/daily", title: "Günlük Operasyon" },
  { path: "/adisyo-import", title: "Adisyo Rapor Yükle" },
  { path: "/cash-count", title: "Kasa Sayımı" },
  { path: "/todos", title: "Görev Listesi" },
  { path: "/daily-checklists", title: "Günlük Çeklistler" },
  { path: "/ai-assistant", title: "AI Asistan" },

  { path: "/profit-center", title: "Para Paneli" },
  { path: "/revenue", title: "Gelir Takibi" },
  { path: "/expenses", title: "Gider Yönetimi" },
  { path: "/cashflow", title: "Kasa & Ödeme" },
  { path: "/cashflow-dashboard", title: "Nakit Akışı" },
  { path: "/invoice-import", title: "Fatura Yükle / Alım" },
  { path: "/house-accounts", title: "Ödenmezler" },
  { path: "/banks", title: "Banka Hesapları" },
  { path: "/credit-cards", title: "Kredi Kartları" },
  { path: "/tax-calendar", title: "Vergi Takvimi" },
  { path: "/legal-params", title: "Yasal Parametreler" },
  { path: "/financial-reports", title: "Mali Tablolar" },
  { path: "/accountant-package", title: "Mali Müşavir Paketi" },

  { path: "/quality", title: "Kalite & HACCP" },
  { path: "/checklist-templates", title: "Çeklist Şablonları" },
  { path: "/pest-control", title: "Pest Control" },
  { path: "/legal-permits", title: "Yasal İzinler" },
  { path: "/kvkk", title: "KVKK" },
  { path: "/fixed-assets", title: "Sabit Kıymetler" },
  { path: "/insurance", title: "Sigortalar" },
  { path: "/pos-commission", title: "POS Komisyon" },
  { path: "/service-directory", title: "Servis Rehberi" },
  { path: "/ai-audit", title: "AI Denetim" },
  { path: "/data-health", title: "Veri Sağlığı" },
  { path: "/audit", title: "Denetim & Yedek" },
  { path: "/help", title: "Yardım" },
  { path: "/settings", title: "Ayarlar" },
];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />

          <Route path="/tables" element={<Tables />} />
          <Route path="/reservations" element={<Reservations />} />

          <Route path="/ingredients" element={<Ingredients />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/payables" element={<Payables />} />
          <Route path="/purchase-requests" element={<PurchaseRequests />} />
          <Route path="/stock-count" element={<StockCount />} />
          <Route path="/breakage" element={<Breakage />} />
          <Route path="/shortfalls" element={<Shortfalls />} />
          <Route path="/stock-optimization" element={<StockOptimization />} />
          <Route path="/wine-inventory" element={<WineInventory />} />
          <Route path="/beverage-inventory" element={<BeverageInventory />} />
          <Route path="/wine-pairing" element={<WinePairing />} />

          <Route path="/menu" element={<MenuCost />} />
          <Route path="/engineering" element={<MenuEngineering />} />
          <Route path="/print-menu" element={<PrintMenu />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/competitor-prices" element={<CompetitorPrices />} />
          <Route path="/table-qr" element={<TableQR />} />
          <Route path="/event-menu" element={<EventMenu />} />

          <Route path="/team-center" element={<TeamCenter />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/leave-management" element={<LeaveManagement />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/marketing-center" element={<MarketingCenter />} />

          <Route path="/reports-hub" element={<ReportsHub />} />
          <Route path="/kpis" element={<Kpis />} />
          <Route path="/decision-center" element={<DecisionCenter />} />
          <Route path="/compare-reports" element={<CompareReports />} />
          <Route path="/operations-center" element={<OperationsCenter />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/unified-calendar" element={<UnifiedCalendar />} />
          <Route path="/events" element={<Events />} />
          <Route path="/flow-guide" element={<FlowGuide />} />

          {placeholderRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <PlaceholderPage
                  title={route.title}
                  description={`${route.title} modülü şimdilik güvenli geçici ekranda açılıyor. Toplantıdan sonra bu modülü tekrar gerçek ekrana bağlayacağız.`}
                />
              }
            />
          ))}

          <Route
            path="*"
            element={
              <PlaceholderPage
                title="Sayfa Bulunamadı"
                description="Aradığın sayfa henüz tanımlanmamış olabilir. Sidebar üzerinden mevcut modüllere dönebilirsin."
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;