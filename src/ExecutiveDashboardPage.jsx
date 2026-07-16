import { API_BASE_URL } from "./apiConfig";
﻿import { useEffect, useMemo, useState } from "react";

function money(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function dateText(value) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("tr-TR");
}

function isActive(record) {
  const status = String(record?.status || "").toUpperCase();

  return status !== "CANCELLED" && status !== "IPTAL";
}

function amountOf(record, keys) {
  for (const key of keys) {
    if (record?.[key] !== undefined && record?.[key] !== null && record?.[key] !== "") {
      return Number(record[key] || 0);
    }
  }

  return 0;
}

function sameDay(value) {
  if (!value) return false;

  const date = new Date(value);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function goTo(page) {
  localStorage.setItem("handsoff_last_requested_page", page);

  window.dispatchEvent(
    new CustomEvent("handsoff:navigate", {
      detail: page,
    })
  );
}

const moduleCards = [
  {
    title: "Günlük Ciro",
    text: "Nakit, kart ve online gelir girişini yap.",
    page: "Günlük Ciro / Gelir Girişi",
  },
  {
    title: "Nakit Akışı",
    text: "Kasa, banka, ödeme ve manuel hareketleri izle.",
    page: "Nakit Akışı / Kasa Banka",
  },
  {
    title: "Kâr Zarar",
    text: "Gelir, gider ve fire sonrası sonucu gör.",
    page: "Kâr Zarar",
  },
  {
    title: "Tedarikçi Cari",
    text: "Açık borç, ödeme ve kalan bakiyeyi takip et.",
    page: "Tedarikçi Cari / Borç Takibi",
  },
  {
    title: "Stok Yönetimi",
    text: "Minimum stok ve stok kartlarını kontrol et.",
    page: "Stok Yönetimi",
  },
  {
    title: "Yedekleme",
    text: "Tüm panel verisini JSON olarak dışa aktar.",
    page: "Veri Yedekleme / Dışa Aktarma",
  },
];

export default function ExecutiveDashboardPage({ user }) {
  const [dailySales, setDailySales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [supplierStatements, setSupplierStatements] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [wasteRecords, setWasteRecords] = useState([]);
  const [cashMovements, setCashMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function safeFetch(url, rootKey) {
    try {
      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(url, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rootKey ? [] : null;
      }

      if (!rootKey) {
        return data;
      }

      if (Array.isArray(data)) {
        return data;
      }

      if (Array.isArray(data[rootKey])) {
        return data[rootKey];
      }

      return [];
    } catch {
      return rootKey ? [] : null;
    }
  }

  async function fetchDashboard() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [
        saleList,
        expenseList,
        statementData,
        inventoryList,
        purchaseOrderList,
        wasteList,
        cashList,
      ] = await Promise.all([
        safeFetch(API_BASE_URL + "/api/daily-sales", "dailySales"),
        safeFetch(API_BASE_URL + "/api/expenses", "expenses"),
        safeFetch(API_BASE_URL + "/api/supplier-statements", null),
        safeFetch(API_BASE_URL + "/api/inventory-items", "inventoryItems"),
        safeFetch(API_BASE_URL + "/api/purchase-orders", "purchaseOrders"),
        safeFetch(API_BASE_URL + "/api/waste-records", "wasteRecords"),
        safeFetch(API_BASE_URL + "/api/cash-movements", "cashMovements"),
      ]);

      setDailySales(saleList || []);
      setExpenses(expenseList || []);
      setSupplierStatements(statementData?.supplierStatements || []);
      setInventoryItems(inventoryList || []);
      setPurchaseOrders(purchaseOrderList || []);
      setWasteRecords(wasteList || []);
      setCashMovements(cashList || []);

      setMessage("Yönetim özeti güncellendi.");
    } catch {
      setError("Dashboard verileri alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  const report = useMemo(() => {
    const activeSales = dailySales.filter(isActive);
    const activeExpenses = expenses.filter(isActive);
    const activeWaste = wasteRecords.filter(isActive);
    const activeCash = cashMovements.filter(isActive);

    const todayRevenue = activeSales
      .filter((item) => sameDay(item.saleDate || item.date || item.createdAt))
      .reduce((sum, item) => {
        return sum + amountOf(item, ["totalAmount", "totalRevenue", "totalSales", "revenue", "amount"]);
      }, 0);

    const totalRevenue = activeSales.reduce((sum, item) => {
      return sum + amountOf(item, ["totalAmount", "totalRevenue", "totalSales", "revenue", "amount"]);
    }, 0);

    const totalExpense = activeExpenses.reduce((sum, item) => {
      return sum + amountOf(item, ["totalAmount", "amount", "price", "cost", "paidAmount"]);
    }, 0);

    const wasteCost = activeWaste.reduce((sum, item) => {
      return sum + amountOf(item, ["estimatedCost", "totalAmount", "amount", "cost"]);
    }, 0);

    const supplierDebt = supplierStatements.reduce((sum, item) => {
      const debt = Number(item.remainingDebt || 0);

      return debt > 0 ? sum + debt : sum;
    }, 0);

    const manualCashIn = activeCash
      .filter((item) => item.direction === "IN")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const manualCashOut = activeCash
      .filter((item) => item.direction === "OUT")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const netCash = totalRevenue + manualCashIn - manualCashOut - totalExpense - wasteCost;
    const netResult = totalRevenue - totalExpense - wasteCost;

    const lowStock = inventoryItems.filter((item) => {
      return Number(item.minStock || 0) > 0 &&
        Number(item.currentStock || 0) <= Number(item.minStock || 0);
    });

    const pendingOrders = purchaseOrders.filter((item) => {
      const status = String(item.status || "").toUpperCase();

      return (
        status !== "CANCELLED" &&
        status !== "APPROVED" &&
        (!item.expenseCreated || !item.stockMovementCreated)
      );
    });

    return {
      todayRevenue,
      totalRevenue,
      totalExpense,
      wasteCost,
      supplierDebt,
      netCash,
      netResult,
      lowStock,
      pendingOrders,
    };
  }, [
    dailySales,
    expenses,
    supplierStatements,
    inventoryItems,
    purchaseOrders,
    wasteRecords,
    cashMovements,
  ]);

  const alerts = useMemo(() => {
    const list = [];

    if (report.todayRevenue === 0) {
      list.push({
        title: "Bugünkü ciro girilmemiş olabilir",
        text: "Günlük Ciro ekranından bugünün satışını ekle.",
        page: "Günlük Ciro / Gelir Girişi",
      });
    }

    if (report.lowStock.length > 0) {
      list.push({
        title: "Düşük stok uyarısı",
        text: `${report.lowStock.length} ürün minimum stok seviyesinde veya altında.`,
        page: "Stok Yönetimi",
      });
    }

    if (report.pendingOrders.length > 0) {
      list.push({
        title: "Bekleyen satın alma talebi",
        text: `${report.pendingOrders.length} talep gider veya stok aktarımı bekliyor.`,
        page: "Satın Alma Talepleri",
      });
    }

    if (report.supplierDebt > 0) {
      list.push({
        title: "Açık tedarikçi borcu",
        text: `Toplam açık bakiye: ${money(report.supplierDebt)}.`,
        page: "Tedarikçi Cari / Borç Takibi",
      });
    }

    if (report.netResult < 0) {
      list.push({
        title: "Kâr zarar sonucu negatif",
        text: `Net sonuç: ${money(report.netResult)}.`,
        page: "Kâr Zarar",
      });
    }

    return list;
  }, [report]);

  const topDebts = supplierStatements
    .filter((item) => Number(item.remainingDebt || 0) > 0)
    .sort((a, b) => Number(b.remainingDebt || 0) - Number(a.remainingDebt || 0))
    .slice(0, 5);

  const lowStockRows = report.lowStock
    .slice()
    .sort((a, b) => Number(a.currentStock || 0) - Number(b.currentStock || 0))
    .slice(0, 6);

  return (
    <div className="page">
      <div
        style={{
          background: "linear-gradient(135deg, #111827 0%, #312e81 50%, #111827 100%)",
          color: "#ffffff",
          borderRadius: 28,
          padding: 28,
          boxShadow: "0 24px 70px rgba(15,23,42,0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 24,
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                opacity: 0.75,
                fontWeight: 800,
                letterSpacing: 1,
                textTransform: "uppercase",
                fontSize: 12,
              }}
            >
              HandsOff / {user.restaurantName}
            </p>

            <h1 style={{ margin: "10px 0 8px", fontSize: 34 }}>
              Yönetim Özeti
            </h1>

            <p style={{ margin: 0, opacity: 0.82, maxWidth: 760 }}>
              Bugünkü ciro, net nakit, kâr-zarar, tedarikçi borçları, stok
              uyarıları ve bekleyen satın alma taleplerini tek ekrandan takip et.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button className="hero-button" type="button" onClick={fetchDashboard}>
              {loading ? "Yükleniyor..." : "Yenile"}
            </button>

            <button
              className="hero-button"
              type="button"
              onClick={() => goTo("Ayarlar / Restoran Bilgileri")}
              style={{ background: "#ffffff", color: "#111827" }}
            >
              Ayarlar
            </button>

            <button
              className="hero-button"
              type="button"
              onClick={() => goTo("Veri Yedekleme / Dışa Aktarma")}
              style={{ background: "#16a34a" }}
            >
              Yedek Al
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div
          className="error-box"
          style={{
            color: "#166534",
            background: "#f0fdf4",
            borderColor: "#bbf7d0",
          }}
        >
          {message}
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 18,
        }}
      >
        <div className="stat-card">
          <p>Bugünkü Ciro</p>
          <h3>{money(report.todayRevenue)}</h3>
          <span>Günlük satış girişi</span>
        </div>

        <div className="stat-card">
          <p>Net Nakit</p>
          <h3>{money(report.netCash)}</h3>
          <span>Gelir - çıkışlar</span>
        </div>

        <div className="stat-card">
          <p>Kâr / Zarar</p>
          <h3>{money(report.netResult)}</h3>
          <span>Gelir - gider - fire</span>
        </div>

        <div className="stat-card">
          <p>Açık Tedarikçi Borcu</p>
          <h3>{money(report.supplierDebt)}</h3>
          <span>Cari bakiye</span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 18,
        }}
      >
        <div className="stat-card">
          <p>Toplam Gelir</p>
          <h3>{money(report.totalRevenue)}</h3>
          <span>Tüm aktif ciro kayıtları</span>
        </div>

        <div className="stat-card">
          <p>Toplam Gider</p>
          <h3>{money(report.totalExpense)}</h3>
          <span>İptal kayıtlar hariç</span>
        </div>

        <div className="stat-card">
          <p>Fire Maliyeti</p>
          <h3>{money(report.wasteCost)}</h3>
          <span>Zayi / kırılma toplamı</span>
        </div>

        <div className="stat-card">
          <p>Düşük Stok</p>
          <h3>{report.lowStock.length}</h3>
          <span>Minimum seviyedeki ürünler</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Hızlı İşlemler</h2>
            <p className="panel-sub">En sık kullanılacak yönetim ekranları.</p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          {moduleCards.map((card) => (
            <button
              key={card.page}
              type="button"
              onClick={() => goTo(card.page)}
              style={{
                textAlign: "left",
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                borderRadius: 18,
                padding: 18,
                cursor: "pointer",
                boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
              }}
            >
              <strong
                style={{
                  display: "block",
                  color: "#111827",
                  fontSize: 15,
                  marginBottom: 8,
                }}
              >
                {card.title}
              </strong>

              <span
                style={{
                  display: "block",
                  color: "#6b7280",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {card.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Yönetim Uyarıları</h2>
            <p className="panel-sub">
              Öncelikli bakılması gereken finans ve operasyon başlıkları.
            </p>
          </div>

          <span className="mini-pill">{alerts.length} uyarı</span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>Başlık</th>
              <th>Açıklama</th>
              <th>Aksiyon</th>
            </tr>
          </thead>

          <tbody>
            {alerts.length === 0 ? (
              <tr>
                <td colSpan="3">Şu an kritik uyarı yok.</td>
              </tr>
            ) : (
              alerts.map((alert) => (
                <tr key={alert.title}>
                  <td>{alert.title}</td>
                  <td>{alert.text}</td>
                  <td>
                    <button type="button" onClick={() => goTo(alert.page)}>
                      Aç
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 18,
        }}
      >
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Düşük Stoklar</h2>
              <p className="panel-sub">Minimum stok seviyesine gelen ürünler.</p>
            </div>

            <span className="mini-pill">{lowStockRows.length} ürün</span>
          </div>

          <table className="module-table">
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Mevcut</th>
                <th>Minimum</th>
              </tr>
            </thead>

            <tbody>
              {lowStockRows.length === 0 ? (
                <tr>
                  <td colSpan="3">Düşük stok yok.</td>
                </tr>
              ) : (
                lowStockRows.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>
                      {item.currentStock} {item.unit}
                    </td>
                    <td>
                      {item.minStock} {item.unit}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Öncelikli Tedarikçi Borçları</h2>
              <p className="panel-sub">Açık caride en yüksek bakiyeler.</p>
            </div>

            <span className="mini-pill">{topDebts.length} tedarikçi</span>
          </div>

          <table className="module-table">
            <thead>
              <tr>
                <th>Tedarikçi</th>
                <th>Kalan Borç</th>
              </tr>
            </thead>

            <tbody>
              {topDebts.length === 0 ? (
                <tr>
                  <td colSpan="2">Açık tedarikçi borcu yok.</td>
                </tr>
              ) : (
                topDebts.map((item) => (
                  <tr key={item.key || item.supplierName}>
                    <td>{item.supplierName}</td>
                    <td>{money(item.remainingDebt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Bekleyen Satın Alma Talepleri</h2>
            <p className="panel-sub">
              Gider veya stok aktarımı tamamlanmamış talepler.
            </p>
          </div>

          <span className="mini-pill">{report.pendingOrders.length} talep</span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Tedarikçi</th>
              <th>Ürün</th>
              <th>Tutar</th>
            </tr>
          </thead>

          <tbody>
            {report.pendingOrders.length === 0 ? (
              <tr>
                <td colSpan="4">Bekleyen talep yok.</td>
              </tr>
            ) : (
              report.pendingOrders.slice(0, 8).map((item) => (
                <tr key={item.id}>
                  <td>{dateText(item.orderDate || item.createdAt)}</td>
                  <td>{item.supplierName || "-"}</td>
                  <td>{item.itemName || "-"}</td>
                  <td>{money(item.totalAmount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
