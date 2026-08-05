import React, { useMemo, useState } from "react";
import { API_BASE_URL } from "./apiConfig";

const knownEndpoints = [
  { key: "dailySales", label: "Günlük Satışlar", path: "/api/daily-sales" },
  { key: "expenses", label: "Giderler", path: "/api/expenses" },
  { key: "cashMovements", label: "Nakit Hareketleri", path: "/api/cash-movements" },
  { key: "suppliers", label: "Tedarikçiler", path: "/api/suppliers" },
  { key: "inventoryItems", label: "Stok Ürünleri", path: "/api/inventory-items" },
  { key: "stockMovements", label: "Stok Hareketleri", path: "/api/stock-movements" },
  { key: "stockCounts", label: "Stok Sayımları", path: "/api/stock-counts" },
  { key: "wasteRecords", label: "Zayi / Kırılma", path: "/api/waste-records" },
  { key: "purchaseOrders", label: "Satın Alma Talepleri", path: "/api/purchase-orders" },
  { key: "supplierStatements", label: "Tedarikçi Cari", path: "/api/supplier-statements" },
  { key: "supplierPayments", label: "Tedarikçi Ödemeleri", path: "/api/supplier-payments" },
  { key: "actionTasks", label: "Aksiyon Görevleri", path: "/api/action-tasks" },
  { key: "restaurantSettings", label: "Restoran Ayarları", path: "/api/restaurant-settings" },
  { key: "userRoles", label: "Kullanıcı Rolleri", path: "/api/user-roles" },
];

function getAuthToken() {
  const directToken =
    localStorage.getItem("handsoff_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

  if (directToken) return directToken;

  try {
    const session = JSON.parse(localStorage.getItem("handsoff_session") || "{}");

    return (
      session.token ||
      session.accessToken ||
      session.jwt ||
      session.authToken ||
      session?.user?.token ||
      session?.user?.accessToken ||
      ""
    );
  } catch {
    return "";
  }
}

function getAuthHeaders() {
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function normalizePayload(payload) {
  if (payload === null || payload === undefined) return null;

  return payload;
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function readErrorBody(response) {
  try {
    const text = await response.text();
    return text ? text.slice(0, 500) : "";
  } catch {
    return "";
  }
}

async function fetchJsonWithAuth(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new Error(`HTTP ${response.status}${body ? ` - ${body}` : ""}`);
  }

  return response.json();
}

async function collectFallbackBackup() {
  const backup = {
    exportedAt: new Date().toISOString(),
    app: "HandsOff Restoran Panel",
    source: "fallback-endpoint-collector",
    apiBaseUrl: API_BASE_URL,
    data: {},
    errors: [],
  };

  let successCount = 0;

  for (const endpoint of knownEndpoints) {
    try {
      const payload = await fetchJsonWithAuth(endpoint.path);

      backup.data[endpoint.key] = normalizePayload(payload);
      successCount += 1;
    } catch (error) {
      backup.errors.push({
        key: endpoint.key,
        label: endpoint.label,
        path: endpoint.path,
        error: error.message || "Veri alınamadı",
      });
    }
  }

  backup.summary = {
    totalEndpoints: knownEndpoints.length,
    successfulEndpoints: successCount,
    failedEndpoints: backup.errors.length,
  };

  return backup;
}

function BackupExportPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [lastResult, setLastResult] = useState(null);

  const tokenInfo = useMemo(() => {
    const token = getAuthToken();

    return {
      hasToken: Boolean(token),
      preview: token ? `${token.slice(0, 8)}...${token.slice(-6)}` : "Token bulunamadı",
    };
  }, []);

  async function handleBackendExport() {
    setLoading(true);
    setStatus("");
    setError("");
    setLastResult(null);

    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("Oturum tokenı bulunamadı. Çıkış yapıp tekrar giriş yap.");
      }

      let payload;
      let mode = "main-backup-export";

      try {
        payload = await fetchJsonWithAuth("/api/backup/export");
      } catch (mainExportError) {
        mode = "fallback-endpoint-collector";
        payload = await collectFallbackBackup();

        payload.mainExportError = mainExportError.message || "Ana backup endpoint çalışmadı.";
      }

      const filename = `handsoff-backup-${mode}-${new Date().toISOString().slice(0, 10)}.json`;

      downloadJson(filename, payload);

      const failedCount = payload?.summary?.failedEndpoints || payload?.errors?.length || 0;
      const successCount = payload?.summary?.successfulEndpoints;

      setLastResult({
        mode,
        failedCount,
        successCount,
        payload,
      });

      if (mode === "fallback-endpoint-collector") {
        setStatus(
          failedCount > 0
            ? `Yedek alındı ama ${failedCount} endpoint veri vermedi. Detaylar indirilen JSON dosyasında.`
            : "Fallback yedek başarıyla indirildi."
        );
      } else {
        setStatus("Backend veri yedeği başarıyla indirildi.");
      }
    } catch (err) {
      setError(err.message || "Yedek alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  function handleLocalSessionExport() {
    setStatus("");
    setError("");
    setLastResult(null);

    const localSnapshot = {
      exportedAt: new Date().toISOString(),
      app: "HandsOff Restoran Panel",
      apiBaseUrl: API_BASE_URL,
      location: window.location.href,
      localStorage: {},
      sessionStorage: {},
    };

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      localSnapshot.localStorage[key] = localStorage.getItem(key);
    }

    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      localSnapshot.sessionStorage[key] = sessionStorage.getItem(key);
    }

    downloadJson(
      `handsoff-local-session-${new Date().toISOString().slice(0, 10)}.json`,
      localSnapshot
    );

    setStatus("Tarayıcı oturum yedeği indirildi.");
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>HandsOff Güvenli Yedekleme</p>
          <h1 style={styles.title}>Veri Yedekleme / Dışa Aktarma</h1>
          <p style={styles.subtitle}>
            Backend yedeği önce ana export endpointinden alınır. Ana endpoint cevap vermezse sistem otomatik olarak modüllerden tek tek veri toplamayı dener.
          </p>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroLabel}>Oturum Durumu</span>
          <strong style={tokenInfo.hasToken ? styles.heroValueOk : styles.heroValueWarn}>
            {tokenInfo.hasToken ? "Token Var" : "Token Yok"}
          </strong>
          <small style={styles.heroNote}>{tokenInfo.preview}</small>
        </div>
      </section>

      {(status || error) && (
        <section style={error ? styles.errorBox : styles.successBox}>
          {error || status}
        </section>
      )}

      {lastResult && (
        <section style={styles.resultBox}>
          <strong>Son yedek sonucu</strong>
          <span>Mod: {lastResult.mode}</span>
          {lastResult.successCount !== undefined && (
            <span>Başarılı endpoint: {lastResult.successCount}</span>
          )}
          <span>Hatalı endpoint: {lastResult.failedCount}</span>
        </section>
      )}

      <section style={styles.grid}>
        <article style={styles.card}>
          <div>
            <h2 style={styles.cardTitle}>Backend Veri Yedeği</h2>
            <p style={styles.cardText}>
              Ana backup endpointini dener. Olmazsa satış, gider, stok, tedarikçi, görev ve ayar verilerini tek tek toplamayı dener.
            </p>
          </div>

          <button
            type="button"
            onClick={handleBackendExport}
            disabled={loading}
            style={loading ? styles.buttonDisabled : styles.button}
          >
            {loading ? "Yedek Alınıyor..." : "Backend Yedeği İndir"}
          </button>
        </article>

        <article style={styles.card}>
          <div>
            <h2 style={styles.cardTitle}>Tarayıcı Oturum Yedeği</h2>
            <p style={styles.cardText}>
              Sadece bu tarayıcıdaki localStorage ve sessionStorage kayıtlarını indirir. Ana veri yedeği yerine geçmez.
            </p>
          </div>

          <button type="button" onClick={handleLocalSessionExport} style={styles.secondaryButton}>
            Oturum Yedeği İndir
          </button>
        </article>
      </section>

      <section style={styles.panel}>
        <h2 style={styles.panelTitle}>Yedekleme Notları</h2>

        <div style={styles.noteGrid}>
          <div style={styles.noteBox}>
            <strong>Ana yedek</strong>
            <span>/api/backup/export çalışırsa en sağlıklı yedek odur.</span>
          </div>

          <div style={styles.noteBox}>
            <strong>Fallback yedek</strong>
            <span>Ana endpoint çalışmazsa sistem modüllerden tek tek veri toplamayı dener.</span>
          </div>

          <div style={styles.noteBox}>
            <strong>Yetki hataları</strong>
            <span>401 veya 403 olan endpointler için kullanıcı rolünde yetki eksik olabilir.</span>
          </div>
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "28px",
    color: "#f8fafc",
    background:
      "radial-gradient(circle at top left, #065f46 0, transparent 34%), linear-gradient(135deg, #0f172a 0%, #111827 48%, #020617 100%)",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: "20px",
    alignItems: "stretch",
    marginBottom: "18px",
  },
  eyebrow: {
    margin: 0,
    color: "#a7f3d0",
    fontSize: "12px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    fontWeight: 800,
  },
  title: {
    margin: "8px 0",
    fontSize: "38px",
    lineHeight: 1.08,
  },
  subtitle: {
    margin: 0,
    maxWidth: "760px",
    color: "#cbd5e1",
    lineHeight: 1.6,
  },
  heroCard: {
    padding: "22px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.09)",
    border: "1px solid rgba(255,255,255,0.13)",
    boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
  },
  heroLabel: {
    display: "block",
    color: "#cbd5e1",
    marginBottom: "10px",
  },
  heroValueOk: {
    display: "block",
    color: "#bbf7d0",
    fontSize: "30px",
  },
  heroValueWarn: {
    display: "block",
    color: "#fde68a",
    fontSize: "30px",
  },
  heroNote: {
    display: "block",
    color: "#94a3b8",
    marginTop: "8px",
  },
  successBox: {
    padding: "14px 16px",
    borderRadius: "16px",
    color: "#bbf7d0",
    background: "rgba(34,197,94,0.16)",
    border: "1px solid rgba(34,197,94,0.24)",
    marginBottom: "16px",
  },
  errorBox: {
    padding: "14px 16px",
    borderRadius: "16px",
    color: "#fecaca",
    background: "rgba(239,68,68,0.16)",
    border: "1px solid rgba(239,68,68,0.24)",
    marginBottom: "16px",
  },
  resultBox: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "center",
    padding: "14px 16px",
    borderRadius: "16px",
    color: "#d1fae5",
    background: "rgba(16,185,129,0.12)",
    border: "1px solid rgba(16,185,129,0.24)",
    marginBottom: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "16px",
  },
  card: {
    minHeight: "230px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "18px",
    padding: "22px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  cardTitle: {
    margin: 0,
    fontSize: "22px",
  },
  cardText: {
    margin: "10px 0 0",
    color: "#cbd5e1",
    lineHeight: 1.6,
  },
  button: {
    border: 0,
    borderRadius: "999px",
    padding: "13px 18px",
    color: "#052e16",
    background: "linear-gradient(135deg, #86efac, #34d399)",
    fontWeight: 900,
    cursor: "pointer",
  },
  buttonDisabled: {
    border: 0,
    borderRadius: "999px",
    padding: "13px 18px",
    color: "#e5e7eb",
    background: "rgba(255,255,255,0.16)",
    fontWeight: 900,
    cursor: "not-allowed",
  },
  secondaryButton: {
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "999px",
    padding: "13px 18px",
    color: "#ffffff",
    background: "rgba(255,255,255,0.1)",
    fontWeight: 900,
    cursor: "pointer",
  },
  panel: {
    padding: "22px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  panelTitle: {
    margin: "0 0 16px",
    fontSize: "22px",
  },
  noteGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },
  noteBox: {
    display: "grid",
    gap: "8px",
    padding: "16px",
    borderRadius: "18px",
    background: "rgba(15,23,42,0.55)",
    color: "#cbd5e1",
  },
};

export default BackupExportPage;
