import React from "react";

const reportCards = [
  {
    title: "Yönetim Özeti",
    status: "Onaylı",
    description: "Ciro, ödeme dağılımı, nakit akışı, gider ve operasyon durumunun ana ekranı.",
    owner: "Yönetim",
    frequency: "Günlük",
  },
  {
    title: "Gün Sonu Raporu",
    status: "Hazır",
    description: "Günlük satış, kasa, gider ve operasyon kapanışının kontrol edildiği rapor.",
    owner: "Muhasebe / Yönetici",
    frequency: "Her gün",
  },
  {
    title: "Haftalık Yönetim Raporu",
    status: "Hazır",
    description: "Haftalık ciro, gider, stok, tedarik ve aksiyon takibi için özet rapor.",
    owner: "Yönetim",
    frequency: "Haftalık",
  },
  {
    title: "Aylık Yönetim Raporu",
    status: "Hazır",
    description: "Aylık performans, kârlılık, gider ve büyüme görünümü.",
    owner: "Yönetim",
    frequency: "Aylık",
  },
  {
    title: "Sistem Sağlık Kontrolü",
    status: "Kontrol",
    description: "Backend, frontend, API adresi ve oturum durumunu kontrol eder.",
    owner: "Teknik",
    frequency: "Gerektikçe",
  },
  {
    title: "Veri Yedekleme",
    status: "İncelenecek",
    description: "Backend export ve oturum yedekleme alanı. Backend endpoint tarafı ayrıca kontrol edilmeli.",
    owner: "Teknik / Yönetim",
    frequency: "Düzenli",
  },
];

function ReportCenterPage() {
  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>HandsOff Rapor Merkezi</p>
          <h1 style={styles.title}>Rapor Merkezi</h1>
          <p style={styles.subtitle}>
            Yönetim, finans, operasyon ve teknik kontrol raporlarını tek ekranda takip edin.
          </p>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroLabel}>Toplam Rapor Alanı</span>
          <strong style={styles.heroValue}>{reportCards.length}</strong>
          <small style={styles.heroNote}>Dashboard onaylı tasarım korunur</small>
        </div>
      </section>

      <section style={styles.summaryGrid}>
        <SummaryCard title="Günlük Takip" value="2" note="Yönetim özeti ve gün sonu" />
        <SummaryCard title="Periyodik Rapor" value="2" note="Haftalık ve aylık rapor" />
        <SummaryCard title="Teknik Kontrol" value="1" note="Sistem sağlık ekranı" />
        <SummaryCard title="İncelenecek" value="1" note="Yedekleme endpoint kontrolü" tone="warning" />
      </section>

      <section style={styles.grid}>
        {reportCards.map((report) => (
          <article key={report.title} style={styles.card}>
            <div style={styles.cardTop}>
              <div>
                <h2 style={styles.cardTitle}>{report.title}</h2>
                <p style={styles.cardText}>{report.description}</p>
              </div>

              <StatusBadge status={report.status} />
            </div>

            <div style={styles.metaGrid}>
              <div style={styles.metaBox}>
                <span>Sorumlu</span>
                <strong>{report.owner}</strong>
              </div>

              <div style={styles.metaBox}>
                <span>Sıklık</span>
                <strong>{report.frequency}</strong>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section style={styles.panel}>
        <h2 style={styles.panelTitle}>Rapor Kullanım Notları</h2>

        <div style={styles.noteGrid}>
          <div style={styles.noteBox}>
            <strong>Dashboard sabit.</strong>
            <span>Onaylanan Yönetim Özeti tasarımına dokunulmayacak.</span>
          </div>

          <div style={styles.noteBox}>
            <strong>Yedekleme ayrı incelenecek.</strong>
            <span>Veri alamama sorunu frontend değil, backend export/yetki tarafı olabilir.</span>
          </div>

          <div style={styles.noteBox}>
            <strong>Raporlar sırayla geliştirilecek.</strong>
            <span>Her ekran tek tek build kontrolünden geçirilerek ilerleyecek.</span>
          </div>
        </div>
      </section>
    </main>
  );
}

function SummaryCard({ title, value, note, tone }) {
  return (
    <article style={styles.summaryCard}>
      <span style={styles.summaryTitle}>{title}</span>
      <strong style={tone === "warning" ? styles.summaryValueWarn : styles.summaryValue}>
        {value}
      </strong>
      <small style={styles.summaryNote}>{note}</small>
    </article>
  );
}

function StatusBadge({ status }) {
  const style =
    status === "Onaylı"
      ? styles.badgeOk
      : status === "İncelenecek"
        ? styles.badgeWarn
        : status === "Kontrol"
          ? styles.badgeBlue
          : styles.badgeNeutral;

  return <span style={{ ...styles.badge, ...style }}>{status}</span>;
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "28px",
    color: "#f8fafc",
    background:
      "radial-gradient(circle at top left, #312e81 0, transparent 34%), linear-gradient(135deg, #0f172a 0%, #111827 48%, #020617 100%)",
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
    color: "#c4b5fd",
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
    maxWidth: "720px",
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
  heroValue: {
    display: "block",
    fontSize: "36px",
    color: "#ffffff",
  },
  heroNote: {
    display: "inline-block",
    marginTop: "10px",
    color: "#bbf7d0",
    background: "rgba(34,197,94,0.16)",
    padding: "6px 10px",
    borderRadius: "999px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "18px",
  },
  summaryCard: {
    padding: "18px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  summaryTitle: {
    display: "block",
    color: "#cbd5e1",
    fontSize: "13px",
    marginBottom: "10px",
  },
  summaryValue: {
    display: "block",
    fontSize: "30px",
    color: "#ffffff",
  },
  summaryValueWarn: {
    display: "block",
    fontSize: "30px",
    color: "#fde68a",
  },
  summaryNote: {
    display: "block",
    color: "#94a3b8",
    marginTop: "8px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  card: {
    padding: "20px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "flex-start",
    marginBottom: "18px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "21px",
  },
  cardText: {
    margin: "8px 0 0",
    color: "#cbd5e1",
    lineHeight: 1.55,
    fontSize: "14px",
  },
  badge: {
    flex: "0 0 auto",
    padding: "7px 11px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 900,
  },
  badgeOk: {
    color: "#bbf7d0",
    background: "rgba(34,197,94,0.16)",
  },
  badgeWarn: {
    color: "#fde68a",
    background: "rgba(245,158,11,0.18)",
  },
  badgeBlue: {
    color: "#bfdbfe",
    background: "rgba(59,130,246,0.18)",
  },
  badgeNeutral: {
    color: "#ddd6fe",
    background: "rgba(139,92,246,0.18)",
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  metaBox: {
    display: "grid",
    gap: "6px",
    padding: "14px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.5)",
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

export default ReportCenterPage;
