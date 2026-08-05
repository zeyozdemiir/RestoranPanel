import React from "react";

const paymentRows = [
  { label: "Nakit", amount: 61400, note: "Kasa tahsilatı" },
  { label: "Kredi Kartı", amount: 98200, note: "POS tahsilatı" },
  { label: "Online", amount: 26150, note: "Online sipariş / ödeme" },
];

const expenseRows = [
  { label: "Tedarikçi ödemesi", amount: 18600, category: "Satın alma" },
  { label: "Personel avansı", amount: 4200, category: "Personel" },
  { label: "Günlük operasyon gideri", amount: 5800, category: "Operasyon" },
];

const checklistRows = [
  { title: "Kasa sayımı yapıldı", status: "Tamam" },
  { title: "POS raporları kontrol edildi", status: "Tamam" },
  { title: "Zayi / kırılma kaydı kontrol edildi", status: "Kontrol" },
  { title: "Stok kritik ürünleri not edildi", status: "Kontrol" },
  { title: "Gün sonu yönetici onayı alındı", status: "Bekliyor" },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function sumRows(rows) {
  return rows.reduce((total, row) => total + row.amount, 0);
}

function StatusBadge({ status }) {
  const style =
    status === "Tamam"
      ? styles.badgeOk
      : status === "Bekliyor"
        ? styles.badgeWarn
        : styles.badgeBlue;

  return <span style={{ ...styles.badge, ...style }}>{status}</span>;
}

function KpiCard({ title, value, note, tone }) {
  return (
    <article style={styles.kpiCard}>
      <span style={styles.kpiTitle}>{title}</span>
      <strong style={tone === "danger" ? styles.kpiValueDanger : styles.kpiValue}>{value}</strong>
      <small style={styles.kpiNote}>{note}</small>
    </article>
  );
}

function DailyClosingReportPage() {
  const totalRevenue = sumRows(paymentRows);
  const totalExpenses = sumRows(expenseRows);
  const netCash = totalRevenue - totalExpenses;

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>HandsOff Gün Sonu</p>
          <h1 style={styles.title}>Gün Sonu Raporu</h1>
          <p style={styles.subtitle}>
            Günlük ciro, ödeme kırılımı, kasa durumu, giderler ve kapanış kontrol listesini tek ekranda takip edin.
          </p>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroLabel}>Net Gün Sonu</span>
          <strong style={styles.heroValue}>{formatCurrency(netCash)}</strong>
          <small style={styles.heroNote}>Gelir - gider üzerinden hesaplandı</small>
        </div>
      </section>

      <section style={styles.kpiGrid}>
        <KpiCard title="Toplam Ciro" value={formatCurrency(totalRevenue)} note="Nakit + kart + online" />
        <KpiCard title="Toplam Gider" value={formatCurrency(totalExpenses)} note="Gün içi giderler" tone="danger" />
        <KpiCard title="Kasa Nakit" value={formatCurrency(61400)} note="Fiziki kasa tahsilatı" />
        <KpiCard title="Kapanış Durumu" value="Kontrol" note="Yönetici onayı bekleniyor" />
      </section>

      <section style={styles.mainGrid}>
        <article style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Ödeme Kırılımı</h2>
              <p style={styles.panelText}>Günlük cironun ödeme tiplerine göre dağılımı.</p>
            </div>
            <span style={styles.pill}>Gelir</span>
          </div>

          <div style={styles.list}>
            {paymentRows.map((row) => (
              <div key={row.label} style={styles.row}>
                <div>
                  <strong style={styles.rowTitle}>{row.label}</strong>
                  <p style={styles.rowText}>{row.note}</p>
                </div>

                <strong style={styles.rowAmount}>{formatCurrency(row.amount)}</strong>
              </div>
            ))}
          </div>
        </article>

        <article style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Gider Kayıtları</h2>
              <p style={styles.panelText}>Gün içinde işlenen gider kalemleri.</p>
            </div>
            <span style={styles.pillDanger}>Gider</span>
          </div>

          <div style={styles.list}>
            {expenseRows.map((row) => (
              <div key={row.label} style={styles.row}>
                <div>
                  <strong style={styles.rowTitle}>{row.label}</strong>
                  <p style={styles.rowText}>{row.category}</p>
                </div>

                <strong style={styles.rowAmountDanger}>{formatCurrency(row.amount)}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section style={styles.mainGrid}>
        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Kapanış Kontrol Listesi</h2>

          <div style={styles.checkList}>
            {checklistRows.map((item) => (
              <div key={item.title} style={styles.checkItem}>
                <span>{item.title}</span>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </article>

        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Yönetici Notu</h2>

          <div style={styles.noteBox}>
            <strong>Bugünkü kapanış özeti</strong>
            <p>
              Ciro normal seviyede. Nakit kasa kontrolü yapıldı. Zayi / kırılma ve kritik stok kayıtları kapanıştan önce tekrar kontrol edilmeli.
            </p>
          </div>

          <div style={styles.noteGrid}>
            <div style={styles.miniBox}>
              <span>Risk</span>
              <strong>Orta</strong>
            </div>

            <div style={styles.miniBox}>
              <span>Onay</span>
              <strong>Bekliyor</strong>
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
      "radial-gradient(circle at top left, #7c2d12 0, transparent 34%), linear-gradient(135deg, #0f172a 0%, #111827 48%, #020617 100%)",
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
    color: "#fed7aa",
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
    fontSize: "34px",
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
  kpiTitle: {
    display: "block",
    color: "#cbd5e1",
    fontSize: "13px",
    marginBottom: "10px",
  },
  kpiValue: {
    display: "block",
    fontSize: "28px",
    color: "#ffffff",
  },
  kpiValueDanger: {
    display: "block",
    fontSize: "28px",
    color: "#fecaca",
  },
  kpiNote: {
    display: "block",
    color: "#94a3b8",
    marginTop: "8px",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
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
    gap: "12px",
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
  pill: {
    padding: "7px 11px",
    borderRadius: "999px",
    color: "#bbf7d0",
    background: "rgba(34,197,94,0.16)",
    fontSize: "12px",
    fontWeight: 900,
  },
  pillDanger: {
    padding: "7px 11px",
    borderRadius: "999px",
    color: "#fecaca",
    background: "rgba(239,68,68,0.17)",
    fontSize: "12px",
    fontWeight: 900,
  },
  list: {
    display: "grid",
    gap: "12px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
    padding: "14px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.5)",
    border: "1px solid rgba(255,255,255,0.07)",
  },
  rowTitle: {
    display: "block",
    fontSize: "14px",
    color: "#ffffff",
  },
  rowText: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: "12px",
  },
  rowAmount: {
    color: "#bbf7d0",
    whiteSpace: "nowrap",
  },
  rowAmountDanger: {
    color: "#fecaca",
    whiteSpace: "nowrap",
  },
  checkList: {
    display: "grid",
    gap: "11px",
    marginTop: "16px",
  },
  checkItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    padding: "14px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.5)",
    border: "1px solid rgba(255,255,255,0.07)",
  },
  badge: {
    padding: "6px 10px",
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
  noteBox: {
    padding: "16px",
    borderRadius: "18px",
    background: "rgba(15,23,42,0.5)",
    color: "#cbd5e1",
    lineHeight: 1.55,
  },
  noteGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "14px",
  },
  miniBox: {
    display: "grid",
    gap: "6px",
    padding: "15px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.07)",
  },
};

export default DailyClosingReportPage;
