import React from "react";

const revenueData = [42, 58, 49, 74, 68, 91, 86, 112, 104, 128, 119, 142];
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

function LineChart({ data }) {
  const width = 520;
  const height = 180;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={styles.chartSvg}>
      <defs>
        <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {[0, 1, 2, 3].map((line) => (
        <line
          key={line}
          x1="0"
          x2={width}
          y1={(height / 3) * line}
          y2={(height / 3) * line}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}

      <polygon points={areaPoints} fill="url(#lineFill)" />
      <polyline
        points={points}
        fill="none"
        stroke="#c4b5fd"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;

        return <circle key={index} cx={x} cy={y} r="5" fill="#ffffff" stroke="#8b5cf6" strokeWidth="3" />;
      })}
    </svg>
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
              <h2 style={styles.panelTitle}>Aylık Ciro Grafiği</h2>
              <p style={styles.panelText}>Son 12 dönem performans görünümü</p>
            </div>
            <span style={styles.pill}>Grafik</span>
          </div>
          <LineChart data={revenueData} />
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
