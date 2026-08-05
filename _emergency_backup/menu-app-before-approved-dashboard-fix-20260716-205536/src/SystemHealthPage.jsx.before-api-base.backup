import { useEffect, useMemo, useState } from "react";

const checks = [
  {
    key: "health",
    title: "Backend Sağlık",
    url: "http://localhost:4000/api/health",
    rootKey: null,
    auth: false,
  },
  {
    key: "dailySales",
    title: "Günlük Ciro",
    url: "http://localhost:4000/api/daily-sales",
    rootKey: "dailySales",
    auth: true,
  },
  {
    key: "expenses",
    title: "Gider Yönetimi",
    url: "http://localhost:4000/api/expenses",
    rootKey: "expenses",
    auth: true,
  },
  {
    key: "suppliers",
    title: "Tedarikçiler",
    url: "http://localhost:4000/api/suppliers",
    rootKey: "suppliers",
    auth: true,
  },
  {
    key: "supplierStatements",
    title: "Tedarikçi Cari",
    url: "http://localhost:4000/api/supplier-statements",
    rootKey: "supplierStatements",
    auth: true,
  },
  {
    key: "supplierPayments",
    title: "Tedarikçi Ödemeleri",
    url: "http://localhost:4000/api/supplier-payments",
    rootKey: "supplierPayments",
    auth: true,
  },
  {
    key: "purchaseOrders",
    title: "Satın Alma Talepleri",
    url: "http://localhost:4000/api/purchase-orders",
    rootKey: "purchaseOrders",
    auth: true,
  },
  {
    key: "inventoryItems",
    title: "Stok Kartları",
    url: "http://localhost:4000/api/inventory-items",
    rootKey: "inventoryItems",
    auth: true,
  },
  {
    key: "stockMovements",
    title: "Stok Hareketleri",
    url: "http://localhost:4000/api/stock-movements",
    rootKey: "stockMovements",
    auth: true,
  },
  {
    key: "stockCounts",
    title: "Stok Sayımları",
    url: "http://localhost:4000/api/stock-counts",
    rootKey: "stockCounts",
    auth: true,
  },
  {
    key: "wasteRecords",
    title: "Zayi / Kırılma",
    url: "http://localhost:4000/api/waste-records",
    rootKey: "wasteRecords",
    auth: true,
  },
  {
    key: "cashMovements",
    title: "Manuel Kasa Hareketleri",
    url: "http://localhost:4000/api/cash-movements",
    rootKey: "cashMovements",
    auth: true,
  },
  {
    key: "backup",
    title: "Veri Yedekleme",
    url: "http://localhost:4000/api/backup/export",
    rootKey: null,
    auth: true,
  },
];

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("tr-TR");
}

function getCountFromResponse(data, rootKey) {
  if (!data) {
    return 0;
  }

  if (!rootKey) {
    if (data.counts && typeof data.counts === "object") {
      return Object.values(data.counts).reduce((total, value) => {
        return total + Number(value || 0);
      }, 0);
    }

    return 1;
  }

  if (Array.isArray(data)) {
    return data.length;
  }

  if (Array.isArray(data[rootKey])) {
    return data[rootKey].length;
  }

  return 0;
}

export default function SystemHealthPage({ user }) {
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [lastRunAt, setLastRunAt] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    runChecks();
  }, []);

  async function runSingleCheck(check) {
    const start = performance.now();

    try {
      const token = localStorage.getItem("handsoff_token");

      const headers = {};

      if (check.auth) {
        headers.Authorization = "Bearer " + token;
      }

      const response = await fetch(check.url, {
        headers,
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      const durationMs = Math.round(performance.now() - start);

      if (!response.ok) {
        return {
          ...check,
          ok: false,
          status: response.status,
          durationMs,
          count: 0,
          message:
            data?.message ||
            data?.detail ||
            "API cevap verdi ama başarılı değil.",
          checkedAt: new Date().toISOString(),
        };
      }

      return {
        ...check,
        ok: true,
        status: response.status,
        durationMs,
        count: getCountFromResponse(data, check.rootKey),
        message: "Çalışıyor",
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      const durationMs = Math.round(performance.now() - start);

      return {
        ...check,
        ok: false,
        status: "-",
        durationMs,
        count: 0,
        message: "Bağlantı kurulamadı: " + error.message,
        checkedAt: new Date().toISOString(),
      };
    }
  }

  async function runChecks() {
    try {
      setRunning(true);
      setError("");
      setMessage("");

      const checkResults = [];

      for (const check of checks) {
        const result = await runSingleCheck(check);
        checkResults.push(result);
        setResults([...checkResults]);
      }

      setLastRunAt(new Date().toISOString());
      setMessage("Sistem kontrolü tamamlandı.");
    } catch {
      setError("Sistem kontrolü çalıştırılamadı.");
    } finally {
      setRunning(false);
    }
  }

  const summary = useMemo(() => {
    const okCount = results.filter((result) => result.ok).length;
    const failCount = results.filter((result) => !result.ok).length;
    const totalRecords = results.reduce((total, result) => {
      return total + Number(result.count || 0);
    }, 0);

    const slowCount = results.filter((result) => {
      return result.ok && Number(result.durationMs || 0) > 1000;
    }).length;

    return {
      okCount,
      failCount,
      totalRecords,
      slowCount,
      totalChecks: checks.length,
    };
  }, [results]);

  const failedResults = results.filter((result) => !result.ok);
  const workingResults = results.filter((result) => result.ok);

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {user.restaurantName}</p>

            <h1>Sistem Sağlık Kontrolü</h1>

            <p>
              Backend, finans, stok, tedarikçi, yedekleme ve operasyon
              endpointlerinin çalışıp çalışmadığını tek ekranda kontrol eder.
            </p>
          </div>

          <button
            className="hero-button"
            type="button"
            onClick={runChecks}
            disabled={running}
          >
            {running ? "Kontrol Ediliyor..." : "Sistemi Kontrol Et"}
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 18,
        }}
      >
        <div className="stat-card">
          <p>Çalışan Modül</p>
          <h3>{summary.okCount}</h3>
          <span>{summary.totalChecks} kontrol içinde</span>
        </div>

        <div className="stat-card">
          <p>Hatalı Modül</p>
          <h3>{summary.failCount}</h3>
          <span>{failedResults.length > 0 ? "Müdahale gerekli" : "Sorun yok"}</span>
        </div>

        <div className="stat-card">
          <p>Okunan Kayıt</p>
          <h3>{summary.totalRecords}</h3>
          <span>Toplam veri satırı</span>
        </div>

        <div className="stat-card">
          <p>Son Kontrol</p>
          <h3>{lastRunAt ? "Yapıldı" : "-"}</h3>
          <span>{formatDateTime(lastRunAt)}</span>
        </div>
      </div>

      {failedResults.length > 0 && (
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Acil Bakılacak Hatalar</h2>

              <p className="panel-sub">
                Bu modüller backend’den sağlıklı cevap alamadı.
              </p>
            </div>

            <span className="mini-pill">{failedResults.length} hata</span>
          </div>

          <table className="module-table">
            <thead>
              <tr>
                <th>Modül</th>
                <th>HTTP</th>
                <th>Süre</th>
                <th>Mesaj</th>
              </tr>
            </thead>

            <tbody>
              {failedResults.map((result) => (
                <tr key={result.key}>
                  <td>{result.title}</td>
                  <td>{result.status}</td>
                  <td>{result.durationMs} ms</td>
                  <td>{result.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Tüm Modül Kontrolleri</h2>

            <p className="panel-sub">
              Her modül için bağlantı durumu, cevap süresi ve kayıt sayısı.
            </p>
          </div>

          <span className="mini-pill">
            {workingResults.length} çalışıyor / {failedResults.length} hata
          </span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>Durum</th>
              <th>Modül</th>
              <th>HTTP</th>
              <th>Kayıt</th>
              <th>Süre</th>
              <th>Mesaj</th>
              <th>Kontrol Saati</th>
            </tr>
          </thead>

          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan="7">Henüz kontrol yapılmadı.</td>
              </tr>
            ) : (
              results.map((result) => (
                <tr key={result.key}>
                  <td>{result.ok ? "Çalışıyor" : "Hata"}</td>
                  <td>{result.title}</td>
                  <td>{result.status}</td>
                  <td>{result.count}</td>
                  <td>{result.durationMs} ms</td>
                  <td>{result.message}</td>
                  <td>{formatDateTime(result.checkedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Kontrol Notu</h2>

            <p className="panel-sub">
              Bu ekran verileri değiştirmez. Sadece API’lerin çalışıp
              çalışmadığını ve kaç kayıt döndüğünü kontrol eder.
            </p>
          </div>
        </div>

        <table className="module-table">
          <tbody>
            <tr>
              <td>Backend kapalıysa</td>
              <td>Çoğu modül “Bağlantı kurulamadı” gösterir.</td>
            </tr>

            <tr>
              <td>Token bozulduysa</td>
              <td>Auth isteyen modüller 401 veya 403 dönebilir.</td>
            </tr>

            <tr>
              <td>Bir modül kırıldıysa</td>
              <td>Sadece o modül hata verir; diğerleri çalışmaya devam eder.</td>
            </tr>

            <tr>
              <td>Yavaş modül</td>
              <td>1000 ms üzeri cevap süresi performans kontrolü gerektirir.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
