import { useEffect, useMemo, useState } from "react";

function money(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function isActive(record) {
  const status = String(record?.status || "").toUpperCase();
  return status !== "CANCELLED" && status !== "IPTAL";
}

function sameDate(value, selectedDate) {
  if (!value || !selectedDate) return false;

  const date = new Date(value);
  const selected = new Date(selectedDate + "T00:00:00");

  return (
    date.getFullYear() === selected.getFullYear() &&
    date.getMonth() === selected.getMonth() &&
    date.getDate() === selected.getDate()
  );
}

function amountOf(record, keys) {
  for (const key of keys) {
    if (record?.[key] !== undefined && record?.[key] !== null && record?.[key] !== "") {
      return Number(record[key] || 0);
    }
  }

  return 0;
}

function goTo(page) {
  localStorage.setItem("handsoff_last_requested_page", page);

  window.dispatchEvent(
    new CustomEvent("handsoff:navigate", {
      detail: page,
    })
  );
}

export default function DailyClosingReportPage({ user }) {
  const [selectedDate, setSelectedDate] = useState(todayInputValue());
  const [dailySales, setDailySales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [wasteRecords, setWasteRecords] = useState([]);
  const [cashMovements, setCashMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  async function fetchReport() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [saleList, expenseList, wasteList, cashList] = await Promise.all([
        safeFetch("http://localhost:4000/api/daily-sales", "dailySales"),
        safeFetch("http://localhost:4000/api/expenses", "expenses"),
        safeFetch("http://localhost:4000/api/waste-records", "wasteRecords"),
        safeFetch("http://localhost:4000/api/cash-movements", "cashMovements"),
      ]);

      setDailySales(saleList || []);
      setExpenses(expenseList || []);
      setWasteRecords(wasteList || []);
      setCashMovements(cashList || []);

      setMessage("Gün sonu raporu güncellendi.");
    } catch {
      setError("Gün sonu raporu alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  const report = useMemo(() => {
    const daySales = dailySales
      .filter(isActive)
      .filter((item) => sameDate(item.saleDate || item.date || item.createdAt, selectedDate));

    const dayExpenses = expenses
      .filter(isActive)
      .filter((item) =>
        sameDate(
          item.expenseDate || item.date || item.createdAt || item.updatedAt,
          selectedDate
        )
      );

    const dayWaste = wasteRecords
      .filter(isActive)
      .filter((item) =>
        sameDate(
          item.recordDate || item.date || item.createdAt || item.updatedAt,
          selectedDate
        )
      );

    const dayCash = cashMovements
      .filter(isActive)
      .filter((item) =>
        sameDate(
          item.movementDate || item.date || item.createdAt || item.updatedAt,
          selectedDate
        )
      );

    const revenue = daySales.reduce((sum, item) => {
      return sum + amountOf(item, ["totalAmount", "totalRevenue", "totalSales", "revenue", "amount"]);
    }, 0);

    const cashRevenue = daySales.reduce((sum, item) => {
      return sum + amountOf(item, ["cashAmount", "cash"]);
    }, 0);

    const cardRevenue = daySales.reduce((sum, item) => {
      return sum + amountOf(item, ["cardAmount", "card"]);
    }, 0);

    const onlineRevenue = daySales.reduce((sum, item) => {
      return (
        sum +
        amountOf(item, [
          "onlineAmount",
          "yemeksepetiAmount",
          "getirAmount",
          "trendyolAmount",
          "otherAmount",
        ])
      );
    }, 0);

    const expenseTotal = dayExpenses.reduce((sum, item) => {
      return sum + amountOf(item, ["totalAmount", "amount", "price", "cost", "paidAmount"]);
    }, 0);

    const wasteTotal = dayWaste.reduce((sum, item) => {
      return sum + amountOf(item, ["estimatedCost", "totalAmount", "amount", "cost"]);
    }, 0);

    const cashIn = dayCash
      .filter((item) => item.direction === "IN")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const cashOut = dayCash
      .filter((item) => item.direction === "OUT")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const netResult = revenue + cashIn - expenseTotal - wasteTotal - cashOut;

    return {
      daySales,
      dayExpenses,
      dayWaste,
      dayCash,
      revenue,
      cashRevenue,
      cardRevenue,
      onlineRevenue,
      expenseTotal,
      wasteTotal,
      cashIn,
      cashOut,
      netResult,
    };
  }, [selectedDate, dailySales, expenses, wasteRecords, cashMovements]);

  const notes = [];

  if (report.revenue === 0) {
    notes.push("Bu tarih için günlük ciro girişi yapılmamış olabilir.");
  }

  if (report.expenseTotal > 0) {
    notes.push(`Bu güne ait gider toplamı: ${money(report.expenseTotal)}.`);
  }

  if (report.wasteTotal > 0) {
    notes.push(`Bu güne ait fire/zayi maliyeti: ${money(report.wasteTotal)}.`);
  }

  if (report.netResult < 0) {
    notes.push(`Gün sonu sonucu negatif: ${money(report.netResult)}.`);
  }

  if (notes.length === 0) {
    notes.push("Gün sonu için kritik uyarı görünmüyor.");
  }

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {user.restaurantName}</p>

            <h1>Gün Sonu Raporu</h1>

            <p>
              Seçilen günün cirosunu, giderini, fire maliyetini ve kasa hareketini
              tek ekranda gösterir.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
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
              onClick={() => goTo("Günlük Ciro / Gelir Girişi")}
              style={{ background: "#166534" }}
            >
              Ciro Gir
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
          <p>Günlük Ciro</p>
          <h3>{money(report.revenue)}</h3>
          <span>{report.daySales.length} ciro kaydı</span>
        </div>

        <div className="stat-card">
          <p>Gider</p>
          <h3>{money(report.expenseTotal)}</h3>
          <span>{report.dayExpenses.length} gider kaydı</span>
        </div>

        <div className="stat-card">
          <p>Fire / Zayi</p>
          <h3>{money(report.wasteTotal)}</h3>
          <span>{report.dayWaste.length} kayıt</span>
        </div>

        <div className="stat-card">
          <p>Gün Sonu Sonucu</p>
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
          <span>Günlük ciro içinden</span>
        </div>

        <div className="stat-card">
          <p>Kart Ciro</p>
          <h3>{money(report.cardRevenue)}</h3>
          <span>Günlük ciro içinden</span>
        </div>

        <div className="stat-card">
          <p>Online / Paket</p>
          <h3>{money(report.onlineRevenue)}</h3>
          <span>Platform ve diğer gelirler</span>
        </div>

        <div className="stat-card">
          <p>Manuel Kasa Net</p>
          <h3>{money(report.cashIn - report.cashOut)}</h3>
          <span>Giriş - çıkış</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Kapanış Notları</h2>

            <p className="panel-sub">
              Gün sonu kapatmadan önce kontrol edilmesi gereken başlıklar.
            </p>
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        <button type="button" onClick={() => goTo("Günlük Ciro / Gelir Girişi")}>
          Günlük Ciro Gir
        </button>

        <button type="button" onClick={() => goTo("Gider Yönetimi")}>
          Gider Ekle
        </button>

        <button type="button" onClick={() => goTo("Zayi / Kırılma")}>
          Zayi / Fire Ekle
        </button>

        <button type="button" onClick={() => goTo("Veri Yedekleme / Dışa Aktarma")}>
          Yedek Al
        </button>
      </div>
    </div>
  );
}
