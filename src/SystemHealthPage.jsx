import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "./apiConfig";

function getStorageStatus() {
  const token = localStorage.getItem("handsoff_token");
  const user = localStorage.getItem("handsoff_user");
  const restaurant = localStorage.getItem("handsoff_restaurant");

  return {
    token: Boolean(token),
    user: Boolean(user),
    restaurant: Boolean(restaurant),
  };
}

function getBrowserInfo() {
  return {
    origin: window.location.origin,
    pathname: window.location.pathname,
    apiBaseUrl: API_BASE_URL,
  };
}

function StatusBadge({ status }) {
  if (status === "ok") {
    return <span style={styles.badgeOk}>Çalışıyor</span>;
  }

  if (status === "warning") {
    return <span style={styles.badgeWarn}>Kontrol</span>;
  }

  return <span style={styles.badgeError}>Sorun Var</span>;
}

function KpiCard({ title, value, note, status }) {
  return (
    <article style={styles.kpiCard}>
      <div style={styles.kpiTop}>
        <span style={styles.kpiTitle}>{title}</span>
        <StatusBadge status={status} />
      </div>

      <strong style={styles.kpiValue}>{value}</strong>
      <small style={styles.kpiNote}>{note}</small>
    </article>
  );
}

function SystemHealthPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedAt, setCheckedAt] = useState("");
  const [error, setError] = useState("");

  const storage = useMemo(() => getStorageStatus(), []);
  const browser = useMemo(() => getBrowserInfo(), []);

  async function checkHealth() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_BASE_URL + "/api/health");
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setHealth(null);
        setError("Backend cevap verdi ama sağlık kontrolü başarısız döndü.");
        return;
      }

      setHealth(data);
      setCheckedAt(new Date().toLocaleString("tr-TR"));
    } catch {
      setHealth(null);
      setError("Backend bağlantısı kurulamadı. Backend terminali açık mı kontrol edilmeli.");
      setCheckedAt(new Date().toLocaleString("tr-TR"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkHealth();
  }, []);

  const backendOk = Boolean(health);
  const tokenOk = storage.token;
  const userOk = storage.user;
  const apiOk = browser.apiBaseUrl.includes("4000");

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>HandsOff Teknik Kontrol</p>
          <h1 style={styles.title}>Sistem Sağlık Kontrolü</h1>
          <p style={styles.subtitle}>
            Backend bağlantısı, API adresi, oturum bilgisi ve tarayıcı durumunu tek ekranda kontrol edin.
          </p>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroLabel}>Genel Durum</span>
          <strong style={backendOk && tokenOk ? styles.heroValueOk : styles.heroValueWarn}>
            {backendOk && tokenOk ? "Sağlıklı" : "Kontrol Gerekli"}
          </strong>
          <small style={styles.heroNote}>
            Son kontrol: {checkedAt || "Henüz kontrol edilmedi"}
          </small>
        </div>
      </section>

      <section style={styles.kpiGrid}>
        <KpiCard
          title="Backend"
          value={backendOk ? "Bağlı" : "Bağlantı Yok"}
          note={backendOk ? "API sağlık kontrolü başarılı" : "Backend terminali veya port kontrol edilmeli"}
          status={backendOk ? "ok" : "error"}
        />

        <KpiCard
          title="API Adresi"
          value={browser.apiBaseUrl}
          note={apiOk ? "Local backend adresi kullanılıyor" : "API adresi farklı görünüyor"}
          status={apiOk ? "ok" : "warning"}
        />

        <KpiCard
          title="Oturum Token"
          value={tokenOk ? "Var" : "Yok"}
          note={tokenOk ? "Kullanıcı oturumu kayıtlı" : "Tekrar giriş gerekebilir"}
          status={tokenOk ? "ok" : "warning"}
        />

        <KpiCard
          title="Kullanıcı Bilgisi"
          value={userOk ? "Var" : "Yok"}
          note={userOk ? "Kullanıcı bilgisi tarayıcıda kayıtlı" : "LocalStorage kullanıcı kaydı bulunamadı"}
          status={userOk ? "ok" : "warning"}
        />
      </section>

      <section style={styles.mainGrid}>
        <article style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Bağlantı Detayları</h2>
              <p style={styles.panelText}>Frontend ve backend bağlantı bilgileri.</p>
            </div>

            <button type="button" onClick={checkHealth} style={styles.button}>
              Tekrar Kontrol Et
            </button>
          </div>

          {loading ? (
            <div style={styles.stateBox}>Sistem kontrol ediliyor...</div>
          ) : error ? (
            <div style={styles.errorBox}>{error}</div>
          ) : (
            <div style={styles.detailGrid}>
              <DetailRow label="Frontend Origin" value={browser.origin} />
              <DetailRow label="Frontend Path" value={browser.pathname || "/"} />
              <DetailRow label="API Base URL" value={browser.apiBaseUrl} />
              <DetailRow label="Health Response" value={JSON.stringify(health)} />
            </div>
          )}
        </article>

        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Oturum Kontrolü</h2>
          <p style={styles.panelText}>Tarayıcıda kayıtlı temel oturum bilgileri.</p>

          <div style={styles.sessionList}>
            <SessionItem label="Token" active={storage.token} />
            <SessionItem label="Kullanıcı" active={storage.user} />
            <SessionItem label="Restoran" active={storage.restaurant} />
          </div>

          <div style={styles.warningBox}>
            <strong>Not</strong>
            <span>
              Oturum bilgileri yoksa bazı sayfalarda veri alınamaz. Bu durumda çıkış yapıp tekrar giriş yapılmalı.
            </span>
          </div>
        </article>
      </section>

      <section style={styles.infoPanel}>
        <h2 style={styles.panelTitle}>Sorun Giderme</h2>

        <div style={styles.noteGrid}>
          <div style={styles.noteBox}>
            <strong>Backend kapalıysa</strong>
            <span>Backend terminalinde npm run dev çalışmalı ve port 4000 açık olmalı.</span>
          </div>

          <div style={styles.noteBox}>
            <strong>Frontend eski görünüyorsa</strong>
            <span>Vite cache temizlenmeli ve Ctrl + Shift + R ile sayfa yenilenmeli.</span>
          </div>

          <div style={styles.noteBox}>
            <strong>Veri gelmiyorsa</strong>
            <span>Token, kullanıcı rolü ve endpoint yetkileri kontrol edilmeli.</span>
          </div>
        </div>
      </section>
    </main>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={styles.detailRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SessionItem({ label, active }) {
  return (
    <div style={styles.sessionItem}>
      <span>{label}</span>
      {active ? <span style={styles.badgeOk}>Var</span> : <span style={styles.badgeWarn}>Yok</span>}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "28px",
    color: "#f8fafc",
    background:
      "radial-gradient(circle at top left, #1e3a8a 0, transparent 34%), linear-gradient(135deg, #0f172a 0%, #111827 48%, #020617 100%)",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: "20px",
    alignItems: "stretch",
    marginBottom: "20px",
  },
  eyebrow: {
    margin: 0,
    color: "#93c5fd",
    fontSize: "12px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    fontWeight: 800,
  },
  title: {
    margin: "8px 0",
    fontSize: "40px",
    lineHeight: 1.05,
  },
  subtitle: {
    margin: 0,
    maxWidth: "760px",
    color: "#cbd5e1",
    lineHeight: 1.6,
    fontSize: "15px",
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
    fontSize: "13px",
    marginBottom: "10px",
  },
  heroValueOk: {
    display: "block",
    fontSize: "32px",
    color: "#bbf7d0",
  },
  heroValueWarn: {
    display: "block",
    fontSize: "32px",
    color: "#fde68a",
  },
  heroNote: {
    display: "inline-block",
    marginTop: "10px",
    color: "#bfdbfe",
    background: "rgba(59,130,246,0.16)",
    padding: "6px 10px",
    borderRadius: "999px",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "18px",
  },
  kpiCard: {
    padding: "18px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  kpiTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center",
    marginBottom: "10px",
  },
  kpiTitle: {
    color: "#cbd5e1",
    fontSize: "13px",
  },
  kpiValue: {
    display: "block",
    fontSize: "22px",
    color: "#ffffff",
    wordBreak: "break-word",
  },
  kpiNote: {
    display: "block",
    color: "#94a3b8",
    marginTop: "8px",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.25fr 0.75fr",
    gap: "16px",
    marginBottom: "16px",
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
    gap: "16px",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  panelTitle: {
    margin: 0,
    fontSize: "21px",
  },
  panelText: {
    margin: "6px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
  },
  button: {
    height: "42px",
    border: 0,
    borderRadius: "14px",
    padding: "0 16px",
    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
  },
  detailGrid: {
    display: "grid",
    gap: "10px",
  },
  detailRow: {
    display: "grid",
    gridTemplateColumns: "180px 1fr",
    gap: "12px",
    padding: "13px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.5)",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "#cbd5e1",
    wordBreak: "break-word",
  },
  sessionList: {
    display: "grid",
    gap: "10px",
    marginTop: "16px",
  },
  sessionItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    padding: "13px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.5)",
    border: "1px solid rgba(255,255,255,0.07)",
  },
  badgeOk: {
    padding: "6px 10px",
    borderRadius: "999px",
    color: "#bbf7d0",
    background: "rgba(34,197,94,0.16)",
    fontSize: "12px",
    fontWeight: 900,
  },
  badgeWarn: {
    padding: "6px 10px",
    borderRadius: "999px",
    color: "#fde68a",
    background: "rgba(245,158,11,0.18)",
    fontSize: "12px",
    fontWeight: 900,
  },
  badgeError: {
    padding: "6px 10px",
    borderRadius: "999px",
    color: "#fecaca",
    background: "rgba(239,68,68,0.18)",
    fontSize: "12px",
    fontWeight: 900,
  },
  stateBox: {
    padding: "18px",
    borderRadius: "18px",
    background: "rgba(15,23,42,0.5)",
    color: "#cbd5e1",
  },
  errorBox: {
    padding: "18px",
    borderRadius: "18px",
    background: "rgba(239,68,68,0.13)",
    border: "1px solid rgba(248,113,113,0.24)",
    color: "#fecaca",
  },
  warningBox: {
    display: "grid",
    gap: "8px",
    marginTop: "16px",
    padding: "16px",
    borderRadius: "18px",
    background: "rgba(245,158,11,0.12)",
    border: "1px solid rgba(245,158,11,0.2)",
    color: "#fde68a",
  },
  infoPanel: {
    padding: "20px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  noteGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginTop: "14px",
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

export default SystemHealthPage;
