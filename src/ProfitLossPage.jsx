import { API_BASE_URL } from "./apiConfig";
﻿import { useEffect, useMemo, useState } from "react";

function formatMoney(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("tr-TR");
}

function getNumericValue(item, keys) {
  for (const key of keys) {
    if (item && item[key] !== undefined && item[key] !== null && item[key] !== "") {
      return Number(item[key] || 0);
    }
  }

  return 0;
}

function getMonthKey(value) {
  if (!value) return "Tarihsiz";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tarihsiz";
  }

  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
  });
}

function getRecordDate(item) {
  return (
    item.date ||
    item.expenseDate ||
    item.recordDate ||
    item.createdAt ||
    item.updatedAt ||
    null
  );
}

const wasteTypeLabels = {
  WASTE: "Zayi",
  BREAKAGE: "Kırılma",
  SPILL: "Dökülme",
  STAFF_MEAL: "Personel Yemeği",
};

export default function ProfitLossPage({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [wasteRecords, setWasteRecords] = useState([]);
  const [salesRecords, setSalesRecords] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfitLossData();
  }, []);

  async function safeFetchArray(url, rootKey) {
    try {
      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(url, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return [];
      }

      if (Array.isArray(data)) {
        return data;
      }

      if (Array.isArray(data[rootKey])) {
        return data[rootKey];
      }

      return [];
    } catch {
      return [];
    }
  }

  async function fetchProfitLossData() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [expenseList, wasteList, salesList, reportList] = await Promise.all([
        safeFetchArray(API_BASE_URL + "/api/expenses", "expenses"),
        safeFetchArray(API_BASE_URL + "/api/waste-records", "wasteRecords"),
        safeFetchArray(API_BASE_URL + "/api/sales", "sales"),
        safeFetchArray(API_BASE_URL + "/api/daily-reports", "dailyReports"),
      ]);

      setExpenses(expenseList);
      setWasteRecords(wasteList);
      setSalesRecords(salesList);
      setDailyReports(reportList);

      setMessage("Kâr zarar verileri güncellendi.");
    } catch {
      setError("Kâr zarar verileri alınırken backend bağlantısı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }

  const monthOptions = useMemo(() => {
    const monthSet = new Set();

    expenses.forEach((expense) => monthSet.add(getMonthKey(getRecordDate(expense))));
    wasteRecords.forEach((record) => monthSet.add(getMonthKey(getRecordDate(record))));
    salesRecords.forEach((sale) => monthSet.add(getMonthKey(getRecordDate(sale))));
    dailyReports.forEach((report) => monthSet.add(getMonthKey(getRecordDate(report))));

    return Array.from(monthSet)
      .filter((month) => month && month !== "Tarihsiz")
      .sort((a, b) => a.localeCompare(b, "tr-TR"));
  }, [expenses, wasteRecords, salesRecords, dailyReports]);

  function filterByMonth(records) {
    if (selectedMonth === "ALL") {
      return records;
    }

    return records.filter((record) => getMonthKey(getRecordDate(record)) === selectedMonth);
  }

  const filteredExpenses = useMemo(() => {
    return filterByMonth(expenses).filter((expense) => {
      const status = String(expense.status || "").toUpperCase();
      return status !== "CANCELLED" && status !== "IPTAL";
    });
  }, [expenses, selectedMonth]);

  const filteredWasteRecords = useMemo(() => {
    return filterByMonth(wasteRecords).filter((record) => {
      const status = String(record.status || "").toUpperCase();
      return status !== "CANCELLED" && status !== "IPTAL";
    });
  }, [wasteRecords, selectedMonth]);

  const filteredSalesRecords = useMemo(() => {
    return filterByMonth(salesRecords);
  }, [salesRecords, selectedMonth]);

  const filteredDailyReports = useMemo(() => {
    return filterByMonth(dailyReports);
  }, [dailyReports, selectedMonth]);

  const report = useMemo(() => {
    const expenseTotal = filteredExpenses.reduce((total, expense) => {
      return (
        total +
        getNumericValue(expense, [
          "totalAmount",
          "amount",
          "price",
          "cost",
          "paidAmount",
        ])
      );
    }, 0);

    const unpaidExpenseTotal = filteredExpenses.reduce((total, expense) => {
      const paymentStatus = String(expense.paymentStatus || "").toUpperCase();

      if (paymentStatus === "PAID" || paymentStatus === "ODENDI") {
        return total;
      }

      return (
        total +
        getNumericValue(expense, [
          "totalAmount",
          "amount",
          "price",
          "cost",
          "remainingAmount",
        ])
      );
    }, 0);

    const wasteTotal = filteredWasteRecords.reduce((total, record) => {
      return (
        total +
        getNumericValue(record, [
          "estimatedCost",
          "totalAmount",
          "amount",
          "cost",
        ])
      );
    }, 0);

    const salesTotalFromSales = filteredSalesRecords.reduce((total, sale) => {
      return (
        total +
        getNumericValue(sale, [
          "totalRevenue",
          "totalSales",
          "revenue",
          "amount",
          "totalAmount",
          "cashAmount",
          "cardAmount",
          "onlineAmount",
        ])
      );
    }, 0);

    const salesTotalFromDailyReports = filteredDailyReports.reduce((total, reportItem) => {
      const explicitTotal = getNumericValue(reportItem, [
        "totalRevenue",
        "totalSales",
        "revenue",
        "amount",
        "totalAmount",
      ]);

      if (explicitTotal > 0) {
        return total + explicitTotal;
      }

      return (
        total +
        getNumericValue(reportItem, ["cashAmount", "cash"]) +
        getNumericValue(reportItem, ["cardAmount", "card"]) +
        getNumericValue(reportItem, ["onlineAmount", "online"]) +
        getNumericValue(reportItem, ["deliveryAmount", "delivery"])
      );
    }, 0);

    const revenueTotal = Math.max(salesTotalFromSales, salesTotalFromDailyReports);
    const totalCost = expenseTotal + wasteTotal;
    const grossProfit = revenueTotal - totalCost;
    const profitMargin = revenueTotal > 0 ? (grossProfit / revenueTotal) * 100 : 0;

    return {
      revenueTotal,
      expenseTotal,
      unpaidExpenseTotal,
      wasteTotal,
      totalCost,
      grossProfit,
      profitMargin,
      salesRecordCount: filteredSalesRecords.length + filteredDailyReports.length,
      expenseRecordCount: filteredExpenses.length,
      wasteRecordCount: filteredWasteRecords.length,
    };
  }, [
    filteredExpenses,
    filteredWasteRecords,
    filteredSalesRecords,
    filteredDailyReports,
  ]);

  const expenseCategorySummary = useMemo(() => {
    const summaryMap = new Map();

    filteredExpenses.forEach((expense) => {
      const category = expense.category || "Genel";
      const amount = getNumericValue(expense, [
        "totalAmount",
        "amount",
        "price",
        "cost",
        "paidAmount",
      ]);

      const current = summaryMap.get(category) || {
        category,
        amount: 0,
        count: 0,
      };

      current.amount += amount;
      current.count += 1;

      summaryMap.set(category, current);
    });

    return Array.from(summaryMap.values()).sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses]);

  const wasteTypeSummary = useMemo(() => {
    const summaryMap = new Map();

    filteredWasteRecords.forEach((record) => {
      const type = record.type || "WASTE";
      const amount = getNumericValue(record, [
        "estimatedCost",
        "totalAmount",
        "amount",
        "cost",
      ]);

      const current = summaryMap.get(type) || {
        type,
        label: wasteTypeLabels[type] || type,
        amount: 0,
        count: 0,
        quantity: 0,
      };

      current.amount += amount;
      current.count += 1;
      current.quantity += Number(record.quantity || 0);

      summaryMap.set(type, current);
    });

    return Array.from(summaryMap.values()).sort((a, b) => b.amount - a.amount);
  }, [filteredWasteRecords]);

  const combinedCostRows = useMemo(() => {
    const expenseRows = filteredExpenses.map((expense) => ({
      id: "expense-" + expense.id,
      date: getRecordDate(expense),
      type: "Gider",
      name: expense.title || expense.description || expense.supplierName || "Gider kaydı",
      category: expense.category || "Genel",
      amount: getNumericValue(expense, [
        "totalAmount",
        "amount",
        "price",
        "cost",
        "paidAmount",
      ]),
      status: expense.paymentStatus || expense.status || "-",
    }));

    const wasteRows = filteredWasteRecords.map((record) => ({
      id: "waste-" + record.id,
      date: getRecordDate(record),
      type: "Fire",
      name: record.itemName || record.inventoryItem?.name || "Zayi / kırılma",
      category: wasteTypeLabels[record.type] || record.type || "Zayi",
      amount: getNumericValue(record, [
        "estimatedCost",
        "totalAmount",
        "amount",
        "cost",
      ]),
      status: record.stockDeducted ? "Stoktan düşüldü" : "Sadece kayıt",
    }));

    return [...expenseRows, ...wasteRows].sort((a, b) => {
      return new Date(b.date || 0) - new Date(a.date || 0);
    });
  }, [filteredExpenses, filteredWasteRecords]);

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {user.restaurantName}</p>

            <h1>Kâr Zarar</h1>

            <p>
              Gelir, gider ve zayi/kırılma maliyetlerini birlikte takip eder.
              Fire maliyeti artık toplam maliyete dahil edilir.
            </p>
          </div>

          <button className="hero-button" type="button" onClick={fetchProfitLossData}>
            Yenile
          </button>
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
            <h2>Rapor Filtresi</h2>

            <p className="panel-sub">
              Tüm dönemleri veya belirli bir ayı seçebilirsin.
            </p>
          </div>

          <select
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              minWidth: 220,
            }}
          >
            <option value="ALL">Tüm dönemler</option>

            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
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
          <p>Gelir</p>
          <h3>{formatMoney(report.revenueTotal)}</h3>
          <span>{report.salesRecordCount} gelir kaydı</span>
        </div>

        <div className="stat-card">
          <p>Gider</p>
          <h3>{formatMoney(report.expenseTotal)}</h3>
          <span>{report.expenseRecordCount} gider kaydı</span>
        </div>

        <div className="stat-card">
          <p>Fire Maliyeti</p>
          <h3>{formatMoney(report.wasteTotal)}</h3>
          <span>{report.wasteRecordCount} zayi / kırılma kaydı</span>
        </div>

        <div className="stat-card">
          <p>Net Sonuç</p>
          <h3>{formatMoney(report.grossProfit)}</h3>
          <span>Kâr marjı: %{report.profitMargin.toFixed(1)}</span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 18,
        }}
      >
        <div className="stat-card">
          <p>Toplam Maliyet</p>
          <h3>{formatMoney(report.totalCost)}</h3>
          <span>Gider + fire maliyeti</span>
        </div>

        <div className="stat-card">
          <p>Ödenmemiş Gider</p>
          <h3>{formatMoney(report.unpaidExpenseTotal)}</h3>
          <span>Nakit akışı için takip</span>
        </div>

        <div className="stat-card">
          <p>Durum</p>
          <h3>{report.grossProfit >= 0 ? "Kâr" : "Zarar"}</h3>
          <span>
            {report.revenueTotal === 0
              ? "Gelir verisi yoksa sonuç maliyet bazlı görünür"
              : "Gelire göre hesaplandı"}
          </span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Gider Kategori Özeti</h2>

            <p className="panel-sub">
              Gider Yönetimi’nden gelen kayıtların kategori dağılımı.
            </p>
          </div>

          <span className="mini-pill">{expenseCategorySummary.length} kategori</span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>Kategori</th>
              <th>Kayıt Sayısı</th>
              <th>Toplam</th>
            </tr>
          </thead>

          <tbody>
            {expenseCategorySummary.length === 0 ? (
              <tr>
                <td colSpan="3">Henüz gider özeti yok.</td>
              </tr>
            ) : (
              expenseCategorySummary.map((item) => (
                <tr key={item.category}>
                  <td>{item.category}</td>
                  <td>{item.count}</td>
                  <td>{formatMoney(item.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Fire Maliyeti Özeti</h2>

            <p className="panel-sub">
              Zayi / kırılma ekranından gelen maliyetler. İptal kayıtlar hariçtir.
            </p>
          </div>

          <span className="mini-pill">{wasteTypeSummary.length} tip</span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>Tip</th>
              <th>Kayıt Sayısı</th>
              <th>Miktar</th>
              <th>Maliyet</th>
            </tr>
          </thead>

          <tbody>
            {wasteTypeSummary.length === 0 ? (
              <tr>
                <td colSpan="4">Henüz fire maliyeti yok.</td>
              </tr>
            ) : (
              wasteTypeSummary.map((item) => (
                <tr key={item.type}>
                  <td>{item.label}</td>
                  <td>{item.count}</td>
                  <td>{item.quantity}</td>
                  <td>{formatMoney(item.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Maliyet Hareketleri</h2>

            <p className="panel-sub">
              Gider ve fire kayıtları aynı tabloda görünür.
            </p>
          </div>

          <span className="mini-pill">{combinedCostRows.length} hareket</span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Tip</th>
              <th>Açıklama</th>
              <th>Kategori</th>
              <th>Tutar</th>
              <th>Durum</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">Kâr zarar verileri yükleniyor...</td>
              </tr>
            ) : combinedCostRows.length === 0 ? (
              <tr>
                <td colSpan="6">Henüz maliyet hareketi yok.</td>
              </tr>
            ) : (
              combinedCostRows.map((row) => (
                <tr key={row.id}>
                  <td>{formatDate(row.date)}</td>
                  <td>{row.type}</td>
                  <td>{row.name}</td>
                  <td>{row.category}</td>
                  <td>{formatMoney(row.amount)}</td>
                  <td>{row.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
