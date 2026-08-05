import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "./apiConfig";

function getTokenInfo() {
  const token =
    localStorage.getItem("handsoff_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

  const session = localStorage.getItem("handsoff_session");

  return {
    hasToken: Boolean(token),
    tokenPreview: token ? `${token.slice(0, 8)}...${token.slice(-6)}` : "Token yok",
    hasSession: Boolean(session),
    sessionSize: session ? `${session.length} karakter` : "Session yok",
  };
}

function StatusBadge({ status }) {
  const config = {
    ok: {
      text: "Çalışıyor",
      style: styles.badgeOk,
    },
    warning: {
      text: "Kontrol Gerekli",
      style: styles.badgeWarning,
    },
    error: {
      text: "Sorun Var",
      style: styles.badgeError,
    },
    loading: {
      text: "Kontrol Ediliyor",
      style: styles.badgeLoading,
    },
  };

  const item = config[status] || config.warning;

  return <span style={{ ...styles.badge, ...item.style }}>{item.text}</span>;
}

function SystemHealthPage() {
  const [backendStatus, setBackendStatus] = useState("loading");
  const [backendResponse, setBackendResponse] = useState(null);
  const [backendError, setBackendError] = useState("");
  const [lastChecked, setLastChecked] = useState("");

  const tokenInfo = useMemo(() => getTokenInfo(), []);

  async function checkBackend() {
    setBackendStatus("loading");
    setBackendError("");
    setBackendResponse(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();

      setBackendResponse(payload);
      setBackendStatus("ok");
      setLastChecked(new Date().toLocaleString("tr-TR"));
    } catch (error) {
      setBackendError(error.message || "Backend bağlantısı kurulamadı.");
      setBackendStatus("error");
      setLastChecked(new Date().toLocaleString("tr-TR"));
    }
  }

  useEffect(() => {
    checkBackend();
  }, []);

  const checks = [
    {
      title: "Backend API",
      value: API_BASE_URL,
      status: backendStatus,
      note:
        backendStatus === "ok"
          ? "Backend sağlık kontrolünden cevap alındı."
          : "Backend terminali açık mı ve 4000 portunda mı kontrol et.",
    },
    {
      title: "Frontend",
      value: window.location.origin,
      status: "ok",
      note: "Uygulama tarayıcıda çalışıyor.",
    },
    {
      title: "Oturum Token",
      value: tokenInfo.tokenPreview,
      status: tokenInfo.hasToken ? "ok" : "warning",
      note: tokenInfo.hasToken
        ? "Giriş tokenı tarayıcıda mevcut."
        : "Giriş yapılmadıysa API istekleri 401 dönebilir.",
    },
    {
      title: "Session Kaydı",
      value: tokenInfo.sessionSize,
      status: tokenInfo.hasSession ? "ok" : "warning",
      note: tokenInfo.hasSession
        ? "Oturum bilgisi localStorage içinde mevcut."
        : "Session kaydı bulunamadı.",
    },
  ];

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>HandsOff Sistem Kontrolü</p>
          <h1 style={styles.title}>Sistem Sağlık Kontrolü</h1>
          <p style={styles.subtitle}>
            Backend bağlantısı, frontend adresi, API ayarı ve oturum durumunu tek ekranda kontrol edin.
          </p>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroLabel}>Genel Durum</span>
          <StatusBadge status={backendStatus} />
          <small style={styles.heroNote}>
            Son kontrol: {lastChecked || "Henüz kontrol edilmedi"}
          </small>
        </div>
      </section>

      <section style={styles.grid}>
        {checks.map((check) => (
          <article key={check.title} style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>{check.title}</h2>
              <StatusBadge status={check.status} />
            </div>

            <strong style={styles.cardValue}>{check.value}</strong>
            <p style={styles.cardNote}>{check.note}</p>
          </article>
        ))}
      </section>

      <section style={styles.panelGrid}>
        <article style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Backend Cevabı</h2>
              <p style={styles.panelText}>/api/health endpointinden alınan cevap.</p>
            </div>

            <button type="button" onClick={checkBackend} style={styles.button}>
              Tekrar Kontrol Et
            </button>
          </div>

          {backendStatus === "ok" ? (
            <pre style={styles.codeBlock}>
              {JSON.stringify(backendResponse, null, 2)}
            </pre>
          ) : (
            <div style={styles.errorBox}>
              <strong>Backend bağlantısı kurulamadı.</strong>
              <span>{backendError || "Backend terminalini kontrol et."}</span>
            </div>
          )}
        </article>

        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Hızlı Çözüm</h2>

          <div style={styles.commandList}>
            <div style={styles.commandBox}>
              <span>Backend açma</span>
              <code>cd backend && npm run dev</code>
            </div>

            <div style={styles.commandBox}>
              <span>Frontend açma</span>
              <code>npm run dev -- --port 5173</code>
            </div>

            <div style={styles.commandBox}>
              <span>Doğru adres</span>
              <code>http://localhost:5173</code>
            </div>

            <div style={styles.commandBox}>
              <span>Backend test</span>
              <code>http://localhost:4000/api/health</code>
            </div>
          </div>
        </article>
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
      "radial-gradient(circle at top left, #1d4ed8 0, transparent 34%), linear-gradient(135deg, #0f172a 0%, #111827 50%, #020617 100%)",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: "20px",
    alignItems: "stretch",
    marginBottom: "20px",
  },
  eyebrow: {
    margin: 0,
    color: "#bfdbfe",
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
    color: "#cbd5e1",
    maxWidth: "740px",
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
    marginBottom: "14px",
  },
  heroNote: {
    display: "block",
    marginTop: "14px",
    color: "#94a3b8",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  card: {
    padding: "18px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    marginBottom: "12px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "15px",
    color: "#e5e7eb",
  },
  cardValue: {
    display: "block",
    fontSize: "16px",
    wordBreak: "break-all",
    color: "#ffffff",
  },
  cardNote: {
    margin: "10px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    padding: "7px 10px",
    fontSize: "12px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  badgeOk: {
    color: "#bbf7d0",
    background: "rgba(34,197,94,0.18)",
  },
  badgeWarning: {
    color: "#fde68a",
    background: "rgba(245,158,11,0.18)",
  },
  badgeError: {
    color: "#fecaca",
    background: "rgba(239,68,68,0.2)",
  },
  badgeLoading: {
    color: "#dbeafe",
    background: "rgba(59,130,246,0.18)",
  },
  panelGrid: {
    display: "grid",
    gridTemplateColumns: "1.25fr 0.75fr",
    gap: "16px",
  },
  panel: {
    padding: "20px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "14px",
  },
  panelTitle: {
    margin: 0,
    fontSize: "20px",
  },
  panelText: {
    margin: "6px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
  },
  button: {
    border: "0",
    borderRadius: "999px",
    padding: "10px 14px",
    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
  },
  codeBlock: {
    margin: 0,
    minHeight: "180px",
    padding: "16px",
    borderRadius: "16px",
    overflow: "auto",
    color: "#dbeafe",
    background: "rgba(15,23,42,0.72)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  errorBox: {
    display: "grid",
    gap: "8px",
    minHeight: "160px",
    padding: "16px",
    borderRadius: "16px",
    color: "#fecaca",
    background: "rgba(239,68,68,0.14)",
    border: "1px solid rgba(239,68,68,0.24)",
  },
  commandList: {
    display: "grid",
    gap: "12px",
    marginTop: "16px",
  },
  commandBox: {
    display: "grid",
    gap: "7px",
    padding: "14px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.55)",
  },
};

export default SystemHealthPage;
