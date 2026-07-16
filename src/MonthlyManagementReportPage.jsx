import { API_BASE_URL } from "./apiConfig";
﻿import { useEffect, useMemo, useState } from "react";

function money(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function monthInputValue() {
  return new Date().toISOString().slice(0, 7);
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("tr-TR");
}

function getMonthStart(monthValue) {
  return monthValue + "-01";
}

function getMonthEnd(monthValue) {
  const [year, month] = monthValue.split("-").map(Number);
  const lastDay = new Date(year, month, 0);
  return lastDay.toISOString().slice(0, 10);
}

function isActive(record) {
  const status = String(record?.status || "").toUpperCase();
  return status !== "CANCELLED" && status !== "IPTAL";
}

function inRange(value, startValue, endValue) {
  if (!value) return false;

  const date = new Date(value);
  const start = new Date(startValue + "T00:00:00");
  const end = new Date(endValue + "T23:59:59");

  return date >= start && date <= end;
}

function amountOf(record, keys) {
  for (const key of keys) {
    if (record?.[key] !== undefined && record?.[key] !== null && record?.[key] !== "") {
      return Number(record[key] || 0);
    }
  }

  return 0;
}

function sumFields(record, keys) {
  return keys.reduce((total, key) => {
    return total + Number(record?.[key] || 0);
  }, 0);
}

function goTo(page) {
  localStorage.setItem("handsoff_last_requested_page", page);

  window.dispatchEvent(
    new CustomEvent("handsoff:navigate", {
      detail: page,
    })
  );
}

function groupByTotal(items, getKey, getAmount) {
  const map = new Map();

  items.forEach((item) => {
    const key = getKey(item) || "Diğer";
    const current = map.get(key) || 0;
    map.set(key, current + getAmount(item));
  });

  return Array.from(map.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
}

function getDaysBetween(startValue, endValue) {
  const days = [];
  const start = new Date(startValue + "T00:00:00");
  const end = new Date(endValue + "T00:00:00");

  const current = new Date(start);

  while (current <= end) {
    days.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export default function MonthlyManagementReportPage({ user }) {
  const [selectedMonth, setSelectedMonth] = useState(monthInputValue());
  const [dailySales, setDailySales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [wasteRecords, setWasteRecords] = useState([]);
  const [cashMovements, setCashMovements] = useState([]);
  const [supplierStatements, setSupplierStatements] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const monthStart = getMonthStart(selectedMonth);
  const monthEnd = getMonthEnd(selectedMonth);

  useEffect(() => {
    fetchReport();
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

  async function fetchReport() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [
        saleList,
        expenseList,
        wasteList,
        cashList,
        statementData,
        purchaseList,
        inventoryList,
      ] = await Promise.all([
        safeFetch(API_BASE_URL + "/api/daily-sales", "dailySales"),
        safeFetch(API_BASE_URL + "/api/expenses", "expenses"),
        safeFetch(API_BASE_URL + "/api/waste-records", "wasteRecords"),
        safeFetch(API_BASE_URL + "/api/cash-movements", "cashMovements"),
        safeFetch(API_BASE_URL + "/api/supplier-statements", null),
        safeFetch(API_BASE_URL + "/api/purchase-orders", "purchaseOrders"),
        safeFetch(API_BASE_URL + "/api/inventory-items", "inventoryItems"),
      ]);

      setDailySales(saleList || []);
      setExpenses(expenseList || []);
      setWasteRecords(wasteList || []);
      setCashMovements(cashList || []);
      setSupplierStatements(statementData?.supplierStatements || []);
      setPurchaseOrders(purchaseList || []);
      setInventoryItems(inventoryList || []);

      setMessage("Aylık yönetim raporu güncellendi.");
    } catch {
      setError("Aylık rapor verileri alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  const report = useMemo(() => {
    const monthSales = dailySales
      .filter(isActive)
      .filter((item) =>
        inRange(item.saleDate || item.date || item.createdAt, monthStart, monthEnd)
      );

    const monthExpenses = expenses
      .filter(isActive)
      .filter((item) =>
        inRange(
          item.expenseDate || item.date || item.createdAt || item.updatedAt,
          monthStart,
          monthEnd
        )
      );

    const monthWaste = wasteRecords
      .filter(isActive)
      .filter((item) =>
        inRange(
          item.recordDate || item.date || item.createdAt || item.updatedAt,
          monthStart,
          monthEnd
        )
      );

    const monthCash = cashMovements
      .filter(isActive)
      .filter((item) =>
        inRange(
          item.movementDate || item.date || item.createdAt || item.updatedAt,
          monthStart,
          monthEnd
        )
      );

    const revenue = monthSales.reduce((sum, item) => {
      return sum + amountOf(item, ["totalAmount", "totalRevenue", "totalSales", "revenue", "amount"]);
    }, 0);

    const cashRevenue = monthSales.reduce((sum, item) => {
      return sum + Number(item.cashAmount || 0);
    }, 0);

    const cardRevenue = monthSales.reduce((sum, item) => {
      return sum + Number(item.cardAmount || 0);
    }, 0);

    const onlineRevenue = monthSales.reduce((sum, item) => {
      return (
        sum +
        sumFields(item, [
          "onlineAmount",
          "yemeksepetiAmount",
          "getirAmount",
          "trendyolAmount",
          "otherAmount",
        ])
      );
    }, 0);

    const expenseTotal = monthExpenses.reduce((sum, item) => {
      return sum + amountOf(item, ["totalAmount", "amount", "price", "cost", "paidAmount"]);
    }, 0);

    const wasteTotal = monthWaste.reduce((sum, item) => {
      return sum + amountOf(item, ["estimatedCost", "totalAmount", "amount", "cost"]);
    }, 0);

    const manualCashIn = monthCash
      .filter((item) => item.direction === "IN")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const manualCashOut = monthCash
      .filter((item) => item.direction === "OUT")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const netResult = revenue + manualCashIn - expenseTotal - wasteTotal - manualCashOut;

    const supplierDebt = supplierStatements.reduce((sum, item) => {
      const debt = Number(item.remainingDebt || 0);
      return debt > 0 ? sum + debt : sum;
    }, 0);

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

    const expenseCategories = groupByTotal(
      monthExpenses,
      (item) => item.category || item.expenseCategory || "Diğer",
      (item) => amountOf(item, ["totalAmount", "amount", "price", "cost", "paidAmount"])
    );

    const wasteCategories = groupByTotal(
      monthWaste,
      (item) => item.type || item.category || "Fire",
      (item) => amountOf(item, ["estimatedCost", "totalAmount", "amount", "cost"])
    );

    const supplierDebtRows = supplierStatements
      .filter((item) => Number(item.remainingDebt || 0) > 0)
      .sort((a, b) => Number(b.remainingDebt || 0) - Number(a.remainingDebt || 0))
      .slice(0, 8);

    const days = getDaysBetween(monthStart, monthEnd);

    const dailyRows = days.map((day) => {
      const daySales = monthSales.filter((item) =>
        inRange(item.saleDate || item.date || item.createdAt, day, day)
      );

      const dayExpenses = monthExpenses.filter((item) =>
        inRange(
          item.expenseDate || item.date || item.createdAt || item.updatedAt,
          day,
          day
        )
      );

      const dayWaste = monthWaste.filter((item) =>
        inRange(
          item.recordDate || item.date || item.createdAt || item.updatedAt,
          day,
          day
        )
      );

      const dayRevenue = daySales.reduce((sum, item) => {
        return sum + amountOf(item, ["totalAmount", "totalRevenue", "totalSales", "revenue", "amount"]);
      }, 0);

      const dayExpense = dayExpenses.reduce((sum, item) => {
        return sum + amountOf(item, ["totalAmount", "amount", "price", "cost", "paidAmount"]);
      }, 0);

      const dayWasteTotal = dayWaste.reduce((sum, item) => {
        return sum + amountOf(item, ["estimatedCost", "totalAmount", "amount", "cost"]);
      }, 0);

      return {
        date: day,
        revenue: dayRevenue,
        expense: dayExpense,
        waste: dayWasteTotal,
        net: dayRevenue - dayExpense - dayWasteTotal,
      };
    });

    const bestDay = dailyRows.slice().sort((a, b) => b.revenue - a.revenue)[0] || null;
    const worstDay = dailyRows.slice().sort((a, b) => a.revenue - b.revenue)[0] || null;

    return {
      monthSales,
      monthExpenses,
      monthWaste,
      monthCash,
      revenue,
      cashRevenue,
      cardRevenue,
      onlineRevenue,
      expenseTotal,
      wasteTotal,
      manualCashIn,
      manualCashOut,
      netResult,
      supplierDebt,
      lowStock,
      pendingOrders,
      expenseCategories,
      wasteCategories,
      supplierDebtRows,
      dailyRows,
      bestDay,
      worstDay,
      averageDailyRevenue: days.length > 0 ? revenue / days.length : 0,
    };
  }, [
    dailySales,
    expenses,
    wasteRecords,
    cashMovements,
    supplierStatements,
    purchaseOrders,
    inventoryItems,
    monthStart,
    monthEnd,
  ]);

  const notes = [];

  if (report.revenue === 0) {
    notes.push("Bu ay için ciro girişi bulunmuyor.");
  }

  if (report.netResult < 0) {
    notes.push(`Aylık net sonuç negatif: ${money(report.netResult)}.`);
  }

  if (report.lowStock.length > 0) {
    notes.push(`${report.lowStock.length} ürün minimum stok seviyesinde veya altında.`);
  }

  if (report.pendingOrders.length > 0) {
    notes.push(`${report.pendingOrders.length} satın alma talebi aktarım bekliyor.`);
  }

  if (report.supplierDebt > 0) {
    notes.push(`Açık tedarikçi borcu: ${money(report.supplierDebt)}.`);
  }

  if (notes.length === 0) {
    notes.push("Aylık raporda kritik uyarı görünmüyor.");
  }

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {user.restaurantName}</p>

            <h1>Aylık Yönetim Raporu</h1>

            <p>
              Seçilen ayın ciro, gider, fire, net sonuç, cari borç, stok uyarısı
              ve kategori dağılımlarını tek ekranda gösterir.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "12px 14px",
                fontWeight: 700,
              }}
            />

            <button className="hero-button" type="button" onClick={fetchReport}>
              {loading ? "Yükleniyor..." : "Yenile"}
            </button>

            <button
              className="hero-button"
              type="button"
              onClick={() => goTo("Haftalık Yönetim Raporu")}
              style={{ background: "#166534" }}
            >
              Haftalık Rapor
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

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Rapor Aralığı</h2>
            <p className="panel-sub">
              {formatDate(monthStart)} - {formatDate(monthEnd)}
            </p>
          </div>

          <span className="mini-pill">Aylık rapor</span>
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
          <p>Aylık Ciro</p>
          <h3>{money(report.revenue)}</h3>
          <span>{report.monthSales.length} ciro kaydı</span>
        </div>

        <div className="stat-card">
          <p>Aylık Gider</p>
          <h3>{money(report.expenseTotal)}</h3>
          <span>{report.monthExpenses.length} gider kaydı</span>
        </div>

        <div className="stat-card">
          <p>Fire Maliyeti</p>
          <h3>{money(report.wasteTotal)}</h3>
          <span>{report.monthWaste.length} zayi/fire kaydı</span>
        </div>

        <div className="stat-card">
          <p>Net Sonuç</p>
          <h3>{money(report.netResult)}</h3>
          <span>Gelir - gider - fire - çıkış</span>
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
          <p>Nakit Ciro</p>
          <h3>{money(report.cashRevenue)}</h3>
          <span>Ay içi nakit satış</span>
        </div>

        <div className="stat-card">
          <p>Kart Ciro</p>
          <h3>{money(report.cardRevenue)}</h3>
          <span>Ay içi kart satış</span>
        </div>

        <div className="stat-card">
          <p>Online / Paket</p>
          <h3>{money(report.onlineRevenue)}</h3>
          <span>Platform ve diğer gelirler</span>
        </div>

        <div className="stat-card">
          <p>Günlük Ortalama</p>
          <h3>{money(report.averageDailyRevenue)}</h3>
          <span>Ay günlerine bölünmüş ortalama</span>
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
          <p>En İyi Gün</p>
          <h3>{report.bestDay ? money(report.bestDay.revenue) : money(0)}</h3>
          <span>{report.bestDay ? formatDate(report.bestDay.date) : "-"}</span>
        </div>

        <div className="stat-card">
          <p>En Düşük Gün</p>
          <h3>{report.worstDay ? money(report.worstDay.revenue) : money(0)}</h3>
          <span>{report.worstDay ? formatDate(report.worstDay.date) : "-"}</span>
        </div>

        <div className="stat-card">
          <p>Açık Tedarikçi Borcu</p>
          <h3>{money(report.supplierDebt)}</h3>
          <span>Cari borç toplamı</span>
        </div>

        <div className="stat-card">
          <p>Düşük Stok</p>
          <h3>{report.lowStock.length}</h3>
          <span>Minimum altındaki ürün</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Aylık Yönetim Notları</h2>
            <p className="panel-sub">Ay kapanışı öncesi kontrol edilecek başlıklar.</p>
          </div>
        </div>

        <table className="module-table">
          <tbody>
            {notes.map((note) => (
              <tr key={note}>
                <td>{note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Gün Gün Performans</h2>
            <p className="panel-sub">Ayın her günü için ciro, gider, fire ve net sonuç.</p>
          </div>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>Gün</th>
              <th>Ciro</th>
              <th>Gider</th>
              <th>Fire</th>
              <th>Net</th>
            </tr>
          </thead>

          <tbody>
            {report.dailyRows.map((row) => (
              <tr key={row.date}>
                <td>{formatDate(row.date)}</td>
                <td>{money(row.revenue)}</td>
                <td>{money(row.expense)}</td>
                <td>{money(row.waste)}</td>
                <td>{money(row.net)}</td>
              </tr>
            ))}
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
              <h2>En Yüksek Gider Kategorileri</h2>
              <p className="panel-sub">Ay içi gider dağılımı.</p>
            </div>
          </div>

          <table className="module-table">
            <thead>
              <tr>
                <th>Kategori</th>
                <th>Tutar</th>
              </tr>
            </thead>

            <tbody>
              {report.expenseCategories.length === 0 ? (
                <tr>
                  <td colSpan="2">Bu ay gider kaydı yok.</td>
                </tr>
              ) : (
                report.expenseCategories.slice(0, 8).map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{money(item.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Fire / Zayi Dağılımı</h2>
              <p className="panel-sub">Ay içi fire maliyeti dağılımı.</p>
            </div>
          </div>

          <table className="module-table">
            <thead>
              <tr>
                <th>Tip</th>
                <th>Maliyet</th>
              </tr>
            </thead>

            <tbody>
              {report.wasteCategories.length === 0 ? (
                <tr>
                  <td colSpan="2">Bu ay fire/zayi kaydı yok.</td>
                </tr>
              ) : (
                report.wasteCategories.slice(0, 8).map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{money(item.total)}</td>
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
            <h2>Aylık Aksiyonlar</h2>
            <p className="panel-sub">Eksik işlemleri ilgili ekrandan tamamla.</p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          <button type="button" onClick={() => goTo("Günlük Ciro / Gelir Girişi")}>
            Ciro Gir
          </button>

          <button type="button" onClick={() => goTo("Gider Yönetimi")}>
            Gider Ekle
          </button>

          <button type="button" onClick={() => goTo("Zayi / Kırılma")}>
            Fire Ekle
          </button>

          <button type="button" onClick={() => goTo("Tedarikçi Cari / Borç Takibi")}>
            Cari Aç
          </button>

          <button type="button" onClick={() => goTo("Veri Yedekleme / Dışa Aktarma")}>
            Yedek Al
          </button>
        </div>
      </div>
    </div>
  );
}
