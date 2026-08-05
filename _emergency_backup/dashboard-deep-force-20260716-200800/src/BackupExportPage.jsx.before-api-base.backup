import { useEffect, useState } from "react";

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("tr-TR");
}

const countLabels = {
  suppliers: "Tedarikçiler",
  expenses: "Giderler",
  purchaseOrders: "Satın Alma Talepleri",
  inventoryItems: "Stok Kartları",
  stockMovements: "Stok Hareketleri",
  stockCounts: "Stok Sayımları",
  wasteRecords: "Zayi / Kırılma",
  supplierPayments: "Tedarikçi Ödemeleri",
  cashMovements: "Kasa Hareketleri",
  dailySales: "Günlük Ciro",
  reportUploads: "Yüklenen Belgeler",
};

export default function BackupExportPage({ user }) {
  const [backup, setBackup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBackupPreview();
  }, []);

  async function fetchBackupPreview() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch("http://localhost:4000/api/backup/export", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Yedek önizlemesi alınamadı.");
        return;
      }

      setBackup(data);
      setMessage("Yedek verisi hazırlandı.");
    } catch {
      setError("Backend bağlantısı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadBackup() {
    try {
      setDownloading(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch("http://localhost:4000/api/backup/export", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Yedek dosyası indirilemedi.");
        return;
      }

      const now = new Date();
      const fileDate = now
        .toISOString()
        .slice(0, 19)
        .replaceAll("-", "")
        .replaceAll(":", "")
        .replace("T", "-");

      const fileName = `handsoff-yedek-${fileDate}.json`;

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      setBackup(data);
      setMessage("Yedek dosyası indirildi.");
    } catch {
      setError("Yedek dosyası indirilirken bağlantı kurulamadı.");
    } finally {
      setDownloading(false);
    }
  }

  const countEntries = Object.entries(backup?.counts || {});
  const totalRecordCount = countEntries.reduce((total, [, value]) => {
    return total + Number(value || 0);
  }, 0);

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {user.restaurantName}</p>

            <h1>Veri Yedekleme / Dışa Aktarma</h1>

            <p>
              Paneldeki restoran verilerini tek JSON dosyası olarak dışa aktar.
              Bu dosya güvenli bir klasörde saklanmalı.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              className="hero-button"
              type="button"
              onClick={fetchBackupPreview}
              disabled={loading}
            >
              {loading ? "Hazırlanıyor..." : "Yenile"}
            </button>

            <button
              className="hero-button"
              type="button"
              onClick={handleDownloadBackup}
              disabled={downloading}
              style={{ background: "#166534" }}
            >
              {downloading ? "İndiriliyor..." : "Yedeği İndir"}
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
          <p>Toplam Kayıt</p>
          <h3>{totalRecordCount}</h3>
          <span>Yedeklenecek toplam satır</span>
        </div>

        <div className="stat-card">
          <p>Modül Sayısı</p>
          <h3>{countEntries.length}</h3>
          <span>Yedek kapsamındaki modüller</span>
        </div>

        <div className="stat-card">
          <p>Son Hazırlama</p>
          <h3>{backup ? "Hazır" : "-"}</h3>
          <span>{formatDateTime(backup?.metadata?.exportedAt)}</span>
        </div>

        <div className="stat-card">
          <p>Restoran ID</p>
          <h3>{backup?.metadata?.restaurantId || "-"}</h3>
          <span>{backup?.metadata?.exportedBy || "Kullanıcı bilgisi yok"}</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Yedek İçeriği</h2>

            <p className="panel-sub">
              İndirilecek JSON dosyasına dahil edilen kayıt sayıları.
            </p>
          </div>

          <span className="mini-pill">{totalRecordCount} kayıt</span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>Modül</th>
              <th>Kayıt Sayısı</th>
            </tr>
          </thead>

          <tbody>
            {countEntries.length === 0 ? (
              <tr>
                <td colSpan="2">Henüz yedek önizlemesi yok.</td>
              </tr>
            ) : (
              countEntries.map(([key, value]) => (
                <tr key={key}>
                  <td>{countLabels[key] || key}</td>
                  <td>{value}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Önemli Not</h2>

            <p className="panel-sub">
              Bu işlem şu an dışa aktarma yapar. İçeri alma işlemi otomatik
              değildir; yanlış içeri alma mevcut verileri bozabileceği için ayrı
              güvenli modül olarak yapılmalı.
            </p>
          </div>
        </div>

        <table className="module-table">
          <tbody>
            <tr>
              <td>Dosya tipi</td>
              <td>JSON</td>
            </tr>

            <tr>
              <td>Güvenli saklama</td>
              <td>
                Bilgisayarda ayrı bir klasöre, tercihen tarihli yedek klasörüne
                kaydet.
              </td>
            </tr>

            <tr>
              <td>İçerik</td>
              <td>
                Restoran operasyon verileri, finans kayıtları, stok kayıtları ve
                tedarikçi cari bilgileri.
              </td>
            </tr>

            <tr>
              <td>Uyarı</td>
              <td>
                Bu dosyayı herkese gönderme. İçinde tedarikçi, ödeme, stok ve
                operasyon verileri bulunur.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
