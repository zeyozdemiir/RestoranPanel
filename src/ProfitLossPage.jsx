import { useEffect, useState } from "react";

function getCurrentMonth() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function formatMoney(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);

  return date.toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });
}

export default function ProfitLossPage({ user }) {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSummary();
  }, [selectedMonth]);

  async function fetchSummary() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(
        `http://localhost:4000/api/finance/monthly-summary?month=${selectedMonth}`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Aylık finans özeti alınamadı.");
        return;
      }

      setSummary(data);
    } catch {
      setError("Backend bağlantısı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }

  const totals = summary?.totals || {
    totalRevenue: 0,
    totalExpenses: 0,
    approvedExpenses: 0,
    unpaidExpenses: 0,
    netProfit: 0,
    reportCount: 0,
    expenseCount: 0,
  };

  const netIsPositive = Number(totals.netProfit || 0) >= 0;

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {user.restaurantName}</p>

            <h1>Kâr Zarar</h1>

            <p>
              Günlük raporlardaki ciro ve gider yönetimindeki kayıtlar aylık
              olarak karşılaştırılır. Net sonuç ciro eksi gider olarak hesaplanır.
            </p>
          </div>

          <button className="hero-button" type="button" onClick={fetchSummary}>
            Yenile
          </button>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Aylık Finans Özeti</h2>

            <p className="panel-sub">
              Seçili ay: {getMonthLabel(selectedMonth)}
            </p>
          </div>

          <input
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              background: "#ffffff",
            }}
          />
        </div>

        {loading ? (
          <p className="panel-sub">Finans özeti yükleniyor...</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 18,
            }}
          >
            <div className="stat-card">
              <p>Toplam Ciro</p>
              <h3>{formatMoney(totals.totalRevenue)}</h3>
              <span>{totals.reportCount} günlük rapor</span>
            </div>

            <div className="stat-card">
              <p>Toplam Gider</p>
              <h3>{formatMoney(totals.totalExpenses)}</h3>
              <span>{totals.expenseCount} gider kaydı</span>
            </div>

            <div className="stat-card">
              <p>Ödenmemiş Gider</p>
              <h3>{formatMoney(totals.unpaidExpenses)}</h3>
              <span>Ödeme takibi gerekli</span>
            </div>

            <div className="stat-card">
              <p>Net Sonuç</p>
              <h3 style={{ color: netIsPositive ? "#166534" : "#991b1b" }}>
                {formatMoney(totals.netProfit)}
              </h3>
              <span>{netIsPositive ? "Kârda" : "Zararda"}</span>
            </div>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Kategori Bazlı Giderler</h2>

            <p className="panel-sub">
              Gider yönetimindeki kayıtların kategori kırılımı.
            </p>
          </div>

          <span className="mini-pill">
            {(summary?.expenseCategories || []).length} kategori
          </span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>Kategori</th>
              <th>Kayıt Sayısı</th>
              <th>Toplam Tutar</th>
            </tr>
          </thead>

          <tbody>
            {(summary?.expenseCategories || []).length === 0 ? (
              <tr>
                <td colSpan="3">Bu ay için gider kaydı yok.</td>
              </tr>
            ) : (
              summary.expenseCategories.map((item) => (
                <tr key={item.category}>
                  <td>{item.category}</td>
                  <td>{item.count}</td>
                  <td>{formatMoney(item.totalAmount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Günlük Ciro Kayıtları</h2>

            <p className="panel-sub">
              Günlük Operasyon ekranından girilen ciro kayıtları.
            </p>
          </div>

          <span className="mini-pill">{totals.reportCount} kayıt</span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Ciro</th>
              <th>Rezervasyon</th>
              <th>Kasa Farkı</th>
            </tr>
          </thead>

          <tbody>
            {(summary?.dailyReports || []).length === 0 ? (
              <tr>
                <td colSpan="4">Bu ay için günlük rapor yok.</td>
              </tr>
            ) : (
              summary.dailyReports.map((report) => (
                <tr key={report.id}>
                  <td>{report.reportDate}</td>
                  <td>{formatMoney(report.revenue)}</td>
                  <td>{report.reservationCount}</td>
                  <td>{formatMoney(report.cashDifference)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}