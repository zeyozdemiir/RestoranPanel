import React from "react";

const dailyRows = [
  { day: "Pazartesi", date: "15 Tem", cash: 38450, card: 74800, online: 15200, cashIn: 38450, cashOut: 14200, closingCash: 24250 },
  { day: "Salı", date: "16 Tem", cash: 42100, card: 81250, online: 18400, cashIn: 42100, cashOut: 16800, closingCash: 49550 },
  { day: "Çarşamba", date: "17 Tem", cash: 35600, card: 69500, online: 12600, cashIn: 35600, cashOut: 19300, closingCash: 65850 },
  { day: "Perşembe", date: "18 Tem", cash: 47200, card: 88900, online: 22150, cashIn: 47200, cashOut: 22100, closingCash: 90950 },
  { day: "Cuma", date: "19 Tem", cash: 58600, card: 104700, online: 28400, cashIn: 58600, cashOut: 26400, closingCash: 123150 },
  { day: "Cumartesi", date: "20 Tem", cash: 73250, card: 126800, online: 34700, cashIn: 73250, cashOut: 31800, closingCash: 164600 },
  { day: "Pazar", date: "21 Tem", cash: 61400, card: 98200, online: 26150, cashIn: 61400, cashOut: 28600, closingCash: 197400 },
];

const expenseData = [28, 31, 37, 42, 39, 46, 44, 51, 49, 56, 54, 61];

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

function KpiCard({ title, value, note }) {
  return (
    <article style={styles.kpiCard}>
      <span style={styles.kpiTitle}>{title}</span>
      <strong style={styles.kpiValue}>{value}</strong>
      <small style={styles.kpiNote}>{note}</small>
    </article>
  );
}

function DailyRevenueTable() {
  const rows = dailyRows.map((row) => ({
    ...row,
    total: row.cash + row.card + row.online,
  }));

  return (
    <div style={styles.tableWrap}>
      <div style={styles.tableHeader}>
        <span>Gün</span>
        <span>Nakit</span>
        <span>Kredi Kartı</span>
        <span>Online</span>
        <span>Günlük Toplam</span>
      </div>

      {rows.map((row) => (
        <div key={row.date} style={styles.tableRow}>
          <div style={styles.dayCell}>
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
  );
}

function CashFlowPanel() {
  return (
    <div style={styles.cashFlowList}>
      {dailyRows.map((row) => (
        <article key={row.date} style={styles.cashFlowItem}>
          <div style={styles.cashFlowTop}>
            <div>
              <strong>{row.day}</strong>
              <small>{row.date}</small>
            </div>

            <strong style={styles.cashClosing}>{formatCurrency(row.closingCash)}</strong>
          </div>

          <div style={styles.cashFlowMini}>
            <span>Giriş: {formatCurrency(row.cashIn)}</span>
            <span>Çıkış: {formatCurrency(row.cashOut)}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

function ExpenseBars() {
  const max = Math.max(...expenseData);

  return (
    <div style={styles.barChart}>
      {expenseData.map((value, index) => (
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

function ProfitDonut() {
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

function ExecutiveDashboardPage() {
  const today = dailyRows[dailyRows.length - 1];
  const todayTotal = today.cash + today.card + today.online;
  const weeklyTotal = dailyRows.reduce((sum, row) => sum + row.cash + row.card + row.online, 0);
  const weeklyCash = sumBy(dailyRows, "cash");
  const weeklyCard = sumBy(dailyRows, "card");
  const weeklyOnline = sumBy(dailyRows, "online");

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>HandsOff Yönetim Paneli</p>
          <h1 style={styles.title}>Yönetim Özeti</h1>
          <p style={styles.subtitle}>
            Ciro, ödeme dağılımı, nakit akışı, gider ve operasyon durumunu tek ekranda takip edin.
          </p>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroLabel}>Haftalık Toplam Gelir</span>
          <strong style={styles.heroValue}>{formatCurrency(weeklyTotal)}</strong>
          <small style={styles.heroNote}>Günlük gelir tablosundan hesaplandı</small>
        </div>
      </section>

      <section style={styles.kpiGrid}>
        <KpiCard title="Bugünkü Ciro" value={formatCurrency(todayTotal)} note="Son gün toplam gelir" />
        <KpiCard title="Haftalık Nakit" value={formatCurrency(weeklyCash)} note="Nakit tahsilat" />
        <KpiCard title="Haftalık Kart" value={formatCurrency(weeklyCard)} note="Kredi kartı tahsilat" />
        <KpiCard title="Haftalık Online" value={formatCurrency(weeklyOnline)} note="Online ödeme" />
      </section>

      <section style={styles.mainGrid}>
        <article style={styles.largePanel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Günlük Gelir Tablosu</h2>
              <p style={styles.panelText}>Her gün için nakit, kredi kartı, online ve toplam gelir.</p>
            </div>
            <span style={styles.pill}>Tablo</span>
          </div>

          <DailyRevenueTable />
        </article>

        <article style={styles.sidePanel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Günlük Nakit Akışı</h2>
              <p style={styles.panelText}>Günlük kasa giriş, çıkış ve kapanış.</p>
            </div>
          </div>

          <CashFlowPanel />
        </article>
      </section>

      <section style={styles.mainGrid}>
        <article style={styles.largePanel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Gider Dağılımı</h2>
              <p style={styles.panelText}>Dönemsel gider hareketi.</p>
            </div>
            <span style={styles.pill}>Bar</span>
          </div>

          <ExpenseBars />
        </article>

        <article style={styles.sidePanel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Kârlılık</h2>
              <p style={styles.panelText}>Genel oran</p>
            </div>
          </div>

          <ProfitDonut />
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
    fontSize: "32px",
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
    fontSize: "26px",
    color: "#ffffff",
  },
  kpiNote: {
    display: "block",
    color: "#94a3b8",
    marginTop: "8px",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.55fr) minmax(300px, 0.75fr)",
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
  pill: {
    padding: "7px 11px",
    borderRadius: "999px",
    color: "#ddd6fe",
    background: "rgba(139,92,246,0.2)",
    fontSize: "12px",
    fontWeight: 800,
  },
  tableWrap: {
    display: "grid",
    gap: "8px",
    overflowX: "auto",
  },
  tableHeader: {
    minWidth: "760px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr 1.15fr",
    gap: "12px",
    padding: "0 14px 6px",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 900,
  },
  tableRow: {
    minWidth: "760px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr 1.15fr",
    gap: "12px",
    alignItems: "center",
    padding: "13px 14px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.5)",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "#e5e7eb",
    fontSize: "13px",
  },
  dayCell: {
    display: "grid",
    gap: "3px",
  },
  cashFlowList: {
    display: "grid",
    gap: "10px",
  },
  cashFlowItem: {
    padding: "13px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.5)",
    border: "1px solid rgba(255,255,255,0.07)",
  },
  cashFlowTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "flex-start",
  },
  cashClosing: {
    color: "#bbf7d0",
    whiteSpace: "nowrap",
  },
  cashFlowMini: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginTop: "9px",
    color: "#94a3b8",
    fontSize: "12px",
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
