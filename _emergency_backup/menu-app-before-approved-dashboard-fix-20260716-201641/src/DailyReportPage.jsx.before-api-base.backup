import { useEffect, useState } from "react";

export default function DailyReportPage({ user }) {
  const [form, setForm] = useState({
    reportDate: new Date().toISOString().slice(0, 10),
    revenue: "",
    reservationCount: "",
    openTaskCount: "",
    cashDifference: "",
    note: "",
  });

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function fetchReports() {
    try {
      const token = localStorage.getItem("handsoff_token");

      const response = await fetch("http://localhost:4000/api/daily-reports", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Raporlar alinamadi.");
        return;
      }

      setReports(data.reports || []);
    } catch {
      setError("Backend baglantisi kurulamadi.");
    }
  }

  useEffect(() => {
    fetchReports();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch("http://localhost:4000/api/daily-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          reportDate: form.reportDate,
          revenue: Number(form.revenue || 0),
          reservationCount: Number(form.reservationCount || 0),
          openTaskCount: Number(form.openTaskCount || 0),
          cashDifference: Number(form.cashDifference || 0),
          note: form.note,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Rapor kaydedilemedi.");
        return;
      }

      setMessage("Gunluk rapor kaydedildi. Dashboard bu veriden beslenecek.");

      setForm((prev) => ({
        ...prev,
        revenue: "",
        reservationCount: "",
        openTaskCount: "",
        cashDifference: "",
        note: "",
      }));

      await fetchReports();
    } catch {
      setError("Backend baglantisi kurulamadi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {user.restaurantName}</p>

            <h1>{"G\u00fcnl\u00fck Rapor Giri\u015fi"}</h1>

            <p>
              {"Restoran\u0131n g\u00fcnl\u00fck ciro, rezervasyon, g\u00f6rev ve kasa fark\u0131 verileri bu ekrandan kaydedilir. Dashboard bu kay\u0131tlardan hesaplan\u0131r."}
            </p>
          </div>

          <button className="hero-button" type="button" onClick={fetchReports}>
            {"Raporlar\u0131 Yenile"}
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>{"Yeni G\u00fcnl\u00fck Rapor"}</h2>

            <p className="panel-sub">
              {"Ayn\u0131 tarihe tekrar kay\u0131t girilirse eski rapor g\u00fcncellenir."}
            </p>
          </div>

          <span className="mini-pill">Manual Input</span>
        </div>

        {message && (
          <div
            className="error-box"
            style={{
              marginBottom: 18,
              color: "#166534",
              background: "#f0fdf4",
              borderColor: "#bbf7d0",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div className="error-box" style={{ marginBottom: 18 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <table className="module-table">
            <tbody>
              <tr>
                <td>{"Tarih"}</td>
                <td>
                  <input
                    name="reportDate"
                    type="date"
                    value={form.reportDate}
                    onChange={handleChange}
                    required
                  />
                </td>
              </tr>

              <tr>
                <td>{"G\u00fcnl\u00fck Ciro"}</td>
                <td>
                  <input
                    name="revenue"
                    type="number"
                    value={form.revenue}
                    onChange={handleChange}
                    placeholder="150000"
                  />
                </td>
              </tr>

              <tr>
                <td>{"Rezervasyon Say\u0131s\u0131"}</td>
                <td>
                  <input
                    name="reservationCount"
                    type="number"
                    value={form.reservationCount}
                    onChange={handleChange}
                    placeholder="72"
                  />
                </td>
              </tr>

              <tr>
                <td>{"A\u00e7\u0131k G\u00f6rev"}</td>
                <td>
                  <input
                    name="openTaskCount"
                    type="number"
                    value={form.openTaskCount}
                    onChange={handleChange}
                    placeholder="8"
                  />
                </td>
              </tr>

              <tr>
                <td>{"Kasa Fark\u0131"}</td>
                <td>
                  <input
                    name="cashDifference"
                    type="number"
                    value={form.cashDifference}
                    onChange={handleChange}
                    placeholder="-250"
                  />
                </td>
              </tr>

              <tr>
                <td>{"Not"}</td>
                <td>
                  <input
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    placeholder="Gun sonu notu"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <button className="hero-button" type="submit" disabled={loading} style={{ marginTop: 18 }}>
            {loading ? "Kaydediliyor" : "Raporu Kaydet"}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>{"Kay\u0131tl\u0131 G\u00fcnl\u00fck Raporlar"}</h2>

            <p className="panel-sub">
              {"Son girilen raporlar burada listelenir."}
            </p>
          </div>

          <span className="mini-pill">Database</span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>{"Tarih"}</th>
              <th>{"Ciro"}</th>
              <th>{"Rezervasyon"}</th>
              <th>{"A\u00e7\u0131k G\u00f6rev"}</th>
              <th>{"Kasa Fark\u0131"}</th>
              <th>{"Not"}</th>
            </tr>
          </thead>

          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.reportDate}</td>
                <td>{report.revenue}</td>
                <td>{report.reservationCount}</td>
                <td>{report.openTaskCount}</td>
                <td>{report.cashDifference}</td>
                <td>{report.note || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
