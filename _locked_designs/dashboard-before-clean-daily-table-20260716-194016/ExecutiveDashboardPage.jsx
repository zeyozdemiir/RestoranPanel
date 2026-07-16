import React from "react";

const dailyRevenueRows = [
  { day: "Pazartesi", date: "15 Tem", cash: 38450, card: 74800, online: 15200 },
  { day: "Salı", date: "16 Tem", cash: 42100, card: 81250, online: 18400 },
  { day: "Çarşamba", date: "17 Tem", cash: 35600, card: 69500, online: 12600 },
  { day: "Perşembe", date: "18 Tem", cash: 47200, card: 88900, online: 22150 },
  { day: "Cuma", date: "19 Tem", cash: 58600, card: 104700, online: 28400 },
  { day: "Cumartesi", date: "20 Tem", cash: 73250, card: 126800, online: 34700 },
  { day: "Pazar", date: "21 Tem", cash: 61400, card: 98200, online: 26150 },
];
const expenseData = [28, 31, 37, 42, 39, 46, 44, 51, 49, 56, 54, 61];
const tableData = [
  { label: "Nakit", value: "38.450 ₺", percent: 32 },
  { label: "Kredi Kartı", value: "74.800 ₺", percent: 58 },
  { label: "Online", value: "15.200 ₺", percent: 10 },
];

const tasks = [
  { title: "Kritik stok kontrolü", detail: "3 ürün minimum seviyeye yakın", status: "Takip" },
  { title: "Tedarikçi ödemeleri", detail: "Bu hafta kontrol edilmeli", status: "Finans" },
  { title: "Gün sonu raporu", detail: "Ciro ve gider girişi tamamlanmalı", status: "Operasyon" },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function sumBy(rows, key) {
  return rows.reduce((total, row) => total + row[key], 0);
}

function DailyRevenueBreakdown() {
  const rows = dailyRevenueRows.map((row) => ({
    ...row,
    total: row.cash + row.card + row.online,
  }));

  const totalCash = sumBy(rows, "cash");
  const totalCard = sumBy(rows, "card");
  const totalOnline = sumBy(rows, "online");
  const grandTotal = totalCash + totalCard + totalOnline;

  const paymentTypes = [
    { label: "Nakit", value: totalCash },
    { label: "Kredi Kartı", value: totalCard },
    { label: "Online", value: totalOnline },
  ];

  return (
    <div style={styles.revenueLayout}>
      <div style={styles.revenueTableCard}>
        <div style={styles.revenueTableTop}>
          <div>
            <h3 style={styles.revenueTableTitle}>Günlük Gelir Tablosu</h3>
            <p style={styles.revenueTableText}>Nakit, kredi kartı ve online ödeme kırılımı</p>
          </div>
        </div>

        <div style={styles.cleanTable}>
          <div style={styles.cleanTableHeader}>
            <span>Gün</span>
            <span>Nakit</span>
            <span>Kredi Kartı</span>
            <span>Online</span>
            <span>Günlük Toplam</span>
          </div>

          {rows.map((row) => (
            <div key={row.date} style={styles.cleanTableRow}>
              <div style={styles.cleanDayCell}>
                <strong>{row.day}</strong>
                <small>{row.date}</small>
              </div>

              <span>{formatCurrency(row.cash)}</span>
              <span>{formatCurrency(row.card)}</span>
              <span>{formatCurrency(row.online)}</span>
              <strong>{formatCurrency(row.total)}</strong>
            </div>
          ))}
        </div>
      </div>

      <aside style={styles.revenueSummaryCard}>
        <span style={styles.summaryLabel}>Haftalık Toplam</span>
        <strong style={styles.summaryTotal}>{formatCurrency(grandTotal)}</strong>

        <div style={styles.summaryDivider} />

        <div style={styles.summaryList}>
          {paymentTypes.map((item) => (
            <div key={item.label} style={styles.summaryItem}>
              <div>
                <span style={styles.summaryItemLabel}>{item.label}</span>
                <small style={styles.summaryItemPercent}>
                  %{Math.round((item.value / grandTotal) * 100)}
                </small>
              </div>

              <strong style={styles.summaryItemValue}>{formatCurrency(item.value)}</strong>
            </div>
          ))}
        </div>

        <div style={styles.summaryNote}>
          Günlük gelirler ödeme tipine göre ayrı gösterilir.
        </div>
      </aside>
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data);

  return (
    <div style={styles.barChart}>
      {data.map((value, index) => (
        <div key={index} style={styles.barWrap}>
          <div
            style={{
              ...styles.bar,
              height: `${Math.max(12, (value / max) * 150)}px`,
            }}
          />
          <span style={styles.barLabel}>{index + 1}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart() {
  return (
    <div style={styles.donutWrap}>
      <div style={styles.donut}>
        <div style={styles.donutCenter}>
          <strong>68%</strong>
          <span>Kârlılık</span>
        </div>
      </div>
    </div>
  );
}

function ProgressRow({ label, value, percent }) {
  return (
    <div style={styles.progressRow}>
      <div style={styles.progressHead}>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div style={styles.progressBg}>
        <div style={{ ...styles.progressFill, width: `${percent}%` }} />
      </div>
    </div>
  );
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

function ExecutiveDashboardPage() {
  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>HandsOff Yönetim Paneli</p>
          <h1 style={styles.title}>Yönetim Özeti</h1>
          <p style={styles.subtitle}>
            Ciro, gider, nakit, stok ve operasyon durumunu tek ekranda takip etmek için hazırlanmış grafikli özet ekranı.
          </p>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroLabel}>Bugünkü Tahmini Ciro</span>
          <strong style={styles.heroValue}>{formatCurrency(128450)}</strong>
          <small style={styles.heroNote}>Dünkü güne göre +%12</small>
        </div>
      </section>

      <section style={styles.kpiGrid}>
        <KpiCard title="Bugünkü Ciro" value="128.450 ₺" note="Tahmini günlük satış" />
        <KpiCard title="Bugünkü Gider" value="42.180 ₺" note="Operasyonel gider" />
        <KpiCard title="Net Durum" value="86.270 ₺" note="Ciro - gider" />
        <KpiCard title="Kritik Stok" value="3" note="Takip gereken ürün" tone="danger" />
      </section>

      <section style={styles.dashboardGrid}>
        <article style={styles.largePanel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Günlük Gelir Dağılımı</h2>
              <p style={styles.panelText}>Nakit, kredi kartı ve online ödemelerin günlük görünümü</p>
            </div>
            <span style={styles.pill}>Grafik</span>
          </div>
          <DailyRevenueBreakdown />
        </article>

        <article style={styles.sidePanel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Kârlılık</h2>
              <p style={styles.panelText}>Genel oran</p>
            </div>
          </div>
          <DonutChart />
        </article>
      </section>

      <section style={styles.dashboardGrid}>
        <article style={styles.largePanel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Gider Dağılımı</h2>
              <p style={styles.panelText}>Dönemsel gider hareketi</p>
            </div>
            <span style={styles.pill}>Bar</span>
          </div>
          <BarChart data={expenseData} />
        </article>

        <article style={styles.sidePanel}>
          <h2 style={styles.panelTitle}>Ödeme Kanalları</h2>
          <div style={styles.progressList}>
            {tableData.map((item) => (
              <ProgressRow key={item.label} {...item} />
            ))}
          </div>
        </article>
      </section>

      <section style={styles.bottomGrid}>
        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Operasyon Notları</h2>
          <div style={styles.taskList}>
            {tasks.map((task) => (
              <div key={task.title} style={styles.taskItem}>
                <div>
                  <strong style={styles.taskTitle}>{task.title}</strong>
                  <p style={styles.taskDetail}>{task.detail}</p>
                </div>
                <span style={styles.taskBadge}>{task.status}</span>
              </div>
            ))}
          </div>
        </article>

        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Hızlı Durum</h2>
          <div style={styles.quickGrid}>
            <div style={styles.quickBox}>
              <span>Rezervasyon</span>
              <strong>18</strong>
            </div>
            <div style={styles.quickBox}>
              <span>Açık Görev</span>
              <strong>7</strong>
            </div>
            <div style={styles.quickBox}>
              <span>Tedarikçi</span>
              <strong>12</strong>
            </div>
            <div style={styles.quickBox}>
              <span>Personel</span>
              <strong>24</strong>
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
    background: "radial-gradient(circle at top left, #312e81 0, transparent 34%), linear-gradient(135deg, #0f172a 0%, #111827 48%, #020617 100%)",
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
  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.55fr) minmax(280px, 0.75fr)",
    gap: "16px",
    marginBottom: "16px",
  },
  largePanel: {
    padding: "20px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  sidePanel: {
    padding: "20px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
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
    marginBottom: "12px",
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
  pill: {
    padding: "7px 11px",
    borderRadius: "999px",
    color: "#ddd6fe",
    background: "rgba(139,92,246,0.2)",
    fontSize: "12px",
    fontWeight: 800,
  },
  chartSvg: {
    width: "100%",
    height: "230px",
    display: "block",
    marginTop: "8px",
  },
  revenueLayout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 280px",
    gap: "16px",
    alignItems: "stretch",
    marginTop: "16px",
  },
  revenueTableCard: {
    minWidth: 0,
    padding: "16px",
    borderRadius: "20px",
    background: "rgba(15,23,42,0.46)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  revenueTableTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "14px",
  },
  revenueTableTitle: {
    margin: 0,
    fontSize: "16px",
    color: "#ffffff",
  },
  revenueTableText: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: "12px",
  },
  cleanTable: {
    display: "grid",
    gap: "8px",
    width: "100%",
  },
  cleanTableHeader: {
    display: "grid",
    gridTemplateColumns: "1.15fr 1fr 1fr 1fr 1.15fr",
    gap: "10px",
    padding: "0 10px 4px",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 900,
  },
  cleanTableRow: {
    display: "grid",
    gridTemplateColumns: "1.15fr 1fr 1fr 1fr 1.15fr",
    gap: "10px",
    alignItems: "center",
    padding: "12px 10px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.065)",
    color: "#e5e7eb",
    fontSize: "13px",
  },
  cleanDayCell: {
    display: "grid",
    gap: "3px",
  },
  revenueSummaryCard: {
    padding: "18px",
    borderRadius: "20px",
    background: "rgba(15,23,42,0.58)",
    border: "1px solid rgba(255,255,255,0.09)",
  },
  summaryLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "13px",
    marginBottom: "8px",
  },
  summaryTotal: {
    display: "block",
    color: "#ffffff",
    fontSize: "30px",
    lineHeight: 1.08,
  },
  summaryDivider: {
    height: "1px",
    background: "rgba(255,255,255,0.1)",
    margin: "18px 0",
  },
  summaryList: {
    display: "grid",
    gap: "11px",
  },
  summaryItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    padding: "12px",
    borderRadius: "15px",
    background: "rgba(255,255,255,0.07)",
  },
  summaryItemLabel: {
    display: "block",
    color: "#e5e7eb",
    fontSize: "13px",
    fontWeight: 900,
  },
  summaryItemPercent: {
    display: "block",
    color: "#c4b5fd",
    marginTop: "3px",
  },
  summaryItemValue: {
    color: "#ffffff",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  summaryNote: {
    marginTop: "14px",
    padding: "12px",
    borderRadius: "14px",
    color: "#cbd5e1",
    background: "rgba(139,92,246,0.13)",
    fontSize: "12px",
    lineHeight: 1.5,
  },
  barChart: {
    height: "210px",
    display: "flex",
    alignItems: "flex-end",
    gap: "12px",
    paddingTop: "20px",
  },
  barWrap: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  bar: {
    width: "100%",
    maxWidth: "28px",
    borderRadius: "999px 999px 8px 8px",
    background: "linear-gradient(180deg, #c4b5fd, #7c3aed)",
    boxShadow: "0 10px 30px rgba(124,58,237,0.32)",
  },
  barLabel: {
    color: "#94a3b8",
    fontSize: "11px",
  },
  donutWrap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "230px",
  },
  donut: {
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    background: "conic-gradient(#a78bfa 0deg 245deg, rgba(255,255,255,0.12) 245deg 360deg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 18px 60px rgba(124,58,237,0.22)",
  },
  donutCenter: {
    width: "112px",
    height: "112px",
    borderRadius: "50%",
    background: "#111827",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  progressList: {
    display: "grid",
    gap: "18px",
    marginTop: "22px",
  },
  progressRow: {
    display: "grid",
    gap: "8px",
  },
  progressHead: {
    display: "flex",
    justifyContent: "space-between",
    color: "#e5e7eb",
    fontSize: "13px",
  },
  progressBg: {
    height: "10px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #8b5cf6, #c4b5fd)",
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1.25fr 0.75fr",
    gap: "16px",
  },
  taskList: {
    display: "grid",
    gap: "12px",
    marginTop: "16px",
  },
  taskItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    padding: "14px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.5)",
  },
  taskTitle: {
    display: "block",
    fontSize: "14px",
  },
  taskDetail: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: "12px",
  },
  taskBadge: {
    padding: "6px 10px",
    borderRadius: "999px",
    color: "#fde68a",
    background: "rgba(245,158,11,0.16)",
    fontSize: "12px",
    fontWeight: 800,
  },
  quickGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "16px",
  },
  quickBox: {
    padding: "16px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.5)",
  },
};

export default ExecutiveDashboardPage;
