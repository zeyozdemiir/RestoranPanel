import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "./apiConfig";

const endpoints = {
  dailySales: "/api/daily-sales",
  expenses: "/api/expenses",
  cashMovements: "/api/cash-movements",
  suppliers: "/api/suppliers",
  inventoryItems: "/api/inventory-items",
  wasteRecords: "/api/waste-records",
  purchaseOrders: "/api/purchase-orders",
  actionTasks: "/api/action-tasks",
};

function normalizeArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const cleaned = String(value)
    .replace("₺", "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pickNumber(row, keys) {
  for (const key of keys) {
    if (row && row[key] !== undefined && row[key] !== null && row[key] !== "") {
      return toNumber(row[key]);
    }
  }

  return 0;
}

function pickText(row, keys) {
  for (const key of keys) {
    if (row && row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
      return String(row[key]);
    }
  }

  return "";
}

function pickDate(row) {
  return pickText(row, [
    "date",
    "createdAt",
    "updatedAt",
    "saleDate",
    "movementDate",
    "expenseDate",
    "orderDate",
    "dueDate",
  ]);
}

function isToday(dateValue) {
  if (!dateValue) return false;

  const now = new Date();
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    const todayText = now.toISOString().slice(0, 10);
    return String(dateValue).includes(todayText);
  }

  return date.toISOString().slice(0, 10) === now.toISOString().slice(0, 10);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

function statusBadge(status) {
  const text = String(status || "Açık");

  const normalized = text.toLowerCase();

  if (
    normalized.includes("tamam") ||
    normalized.includes("kapalı") ||
    normalized.includes("closed") ||
    normalized.includes("done")
  ) {
    return { text, tone: "success" };
  }

  if (
    normalized.includes("iptal") ||
    normalized.includes("cancel") ||
    normalized.includes("gecik") ||
    normalized.includes("risk")
  ) {
    return { text, tone: "danger" };
  }

  return { text, tone: "warning" };
}


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

function ExecutiveDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    dailySales: [],
    expenses: [],
    cashMovements: [],
    suppliers: [],
    inventoryItems: [],
    wasteRecords: [],
    purchaseOrders: [],
    actionTasks: [],
  });
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setErrors([]);

      const authHeaders = getAuthHeaders();

      if (!authHeaders.Authorization) {
        setErrors(["Oturum token bulunamadı. Lütfen çıkış yapıp tekrar giriş yap."]);
        setLoading(false);
        return;
      }

      const entries = await Promise.all(
        Object.entries(endpoints).map(async ([key, path]) => {
          try {
            const response = await fetch(`${API_BASE_URL}${path}`, { headers: authHeaders });

            if (!response.ok) {
              throw new Error(`${path} ${response.status}`);
            }

            const payload = await response.json();
            return [key, normalizeArray(payload), null];
          } catch (error) {
            return [key, [], error.message || "Veri alınamadı"];
          }
        })
      );

      if (cancelled) return;

      const nextData = {};
      const nextErrors = [];

      for (const [key, value, error] of entries) {
        nextData[key] = value;

        if (error) {
          nextErrors.push(`${key}: ${error}`);
        }
      }

      setData((current) => ({
        ...current,
        ...nextData,
      }));

      setErrors(nextErrors);
      setLoading(false);
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const todaySales = data.dailySales
      .filter((row) => isToday(pickDate(row)))
      .reduce(
        (sum, row) =>
          sum +
          pickNumber(row, [
            "totalAmount",
            "total",
            "amount",
            "revenue",
            "cashTotal",
            "cardTotal",
            "netSales",
          ]),
        0
      );

    const todayExpenses = data.expenses
      .filter((row) => isToday(pickDate(row)))
      .reduce(
        (sum, row) =>
          sum +
          pickNumber(row, [
            "amount",
            "total",
            "totalAmount",
            "price",
            "expenseAmount",
          ]),
        0
      );

    const cashIn = data.cashMovements.reduce((sum, row) => {
      const type = pickText(row, ["type", "movementType", "direction"]).toLowerCase();
      const amount = pickNumber(row, ["amount", "total", "value"]);

      if (type.includes("out") || type.includes("çık") || type.includes("gider")) {
        return sum;
      }

      return sum + amount;
    }, 0);

    const cashOut = data.cashMovements.reduce((sum, row) => {
      const type = pickText(row, ["type", "movementType", "direction"]).toLowerCase();
      const amount = pickNumber(row, ["amount", "total", "value"]);

      if (type.includes("out") || type.includes("çık") || type.includes("gider")) {
        return sum + amount;
      }

      return sum;
    }, 0);

    const lowStockCount = data.inventoryItems.filter((row) => {
      const quantity = pickNumber(row, ["quantity", "stock", "currentStock", "count"]);
      const minStock = pickNumber(row, ["minStock", "minimumStock", "criticalStock"]);

      return minStock > 0 && quantity <= minStock;
    }).length;

    const openTasks = data.actionTasks.filter((row) => {
      const status = pickText(row, ["status", "state"]);
      const normalized = status.toLowerCase();

      return !(
        normalized.includes("tamam") ||
        normalized.includes("kapalı") ||
        normalized.includes("closed") ||
        normalized.includes("done")
      );
    }).length;

    const openOrders = data.purchaseOrders.filter((row) => {
      const status = pickText(row, ["status", "state"]);
      const normalized = status.toLowerCase();

      return !(
        normalized.includes("tamam") ||
        normalized.includes("teslim") ||
        normalized.includes("kapalı") ||
        normalized.includes("closed") ||
        normalized.includes("done")
      );
    }).length;

    const wasteTotal = data.wasteRecords.reduce(
      (sum, row) =>
        sum +
        pickNumber(row, [
          "amount",
          "total",
          "cost",
          "totalCost",
          "wasteAmount",
          "estimatedCost",
        ]),
      0
    );

    return {
      todaySales,
      todayExpenses,
      estimatedProfit: todaySales - todayExpenses,
      cashBalance: cashIn - cashOut,
      supplierCount: data.suppliers.length,
      inventoryCount: data.inventoryItems.length,
      lowStockCount,
      openTasks,
      openOrders,
      wasteTotal,
    };
  }, [data]);

  const recentTasks = useMemo(() => {
    return [...data.actionTasks]
      .slice()
      .sort((a, b) => {
        const aDate = new Date(pickDate(a)).getTime() || 0;
        const bDate = new Date(pickDate(b)).getTime() || 0;
        return bDate - aDate;
      })
      .slice(0, 6);
  }, [data.actionTasks]);

  const recentOrders = useMemo(() => {
    return [...data.purchaseOrders]
      .slice()
      .sort((a, b) => {
        const aDate = new Date(pickDate(a)).getTime() || 0;
        const bDate = new Date(pickDate(b)).getTime() || 0;
        return bDate - aDate;
      })
      .slice(0, 6);
  }, [data.purchaseOrders]);

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>HandsOff Yönetim Paneli</p>
          <h1 style={styles.title}>Yönetim Özeti</h1>
          <p style={styles.subtitle}>
            Günlük ciro, gider, nakit, stok, tedarik ve aksiyon durumlarını tek ekranda takip edin.
          </p>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroLabel}>Bugünkü Tahmini Kâr</span>
          <strong style={summary.estimatedProfit >= 0 ? styles.heroValue : styles.heroValueDanger}>
            {formatCurrency(summary.estimatedProfit)}
          </strong>
          <small style={styles.muted}>
            Ciro - gider üzerinden hesaplandı
          </small>
        </div>
      </section>

      {loading && (
        <div style={styles.notice}>
          Veriler yükleniyor...
        </div>
      )}

      {!loading && errors.length > 0 && (
        <div style={styles.warningBox}>
          Bazı veriler alınamadı ama ekran çalışmaya devam ediyor.
          <br />
          <small>{errors.join(" | ")}</small>
        </div>
      )}

      <section style={styles.grid}>
        <KpiCard title="Bugünkü Ciro" value={formatCurrency(summary.todaySales)} note="Günlük satış kayıtları" />
        <KpiCard title="Bugünkü Gider" value={formatCurrency(summary.todayExpenses)} note="Günlük gider kayıtları" />
        <KpiCard title="Nakit Durumu" value={formatCurrency(summary.cashBalance)} note="Kasa / banka hareketleri" />
        <KpiCard title="Açık Aksiyon" value={summary.openTasks} note="Takip bekleyen görevler" />
        <KpiCard title="Kritik Stok" value={summary.lowStockCount} note="Minimum seviyeye düşen ürün" danger={summary.lowStockCount > 0} />
        <KpiCard title="Açık Satın Alma" value={summary.openOrders} note="Tamamlanmamış talepler" />
        <KpiCard title="Tedarikçi" value={summary.supplierCount} note="Kayıtlı tedarikçi" />
        <KpiCard title="Zayi / Kayıp" value={formatCurrency(summary.wasteTotal)} note="Toplam tahmini kayıt" danger={summary.wasteTotal > 0} />
      </section>

      <section style={styles.twoColumn}>
        <Panel title="Son Aksiyonlar">
          {recentTasks.length === 0 ? (
            <Empty text="Henüz aksiyon kaydı yok." />
          ) : (
            <div style={styles.list}>
              {recentTasks.map((task, index) => {
                const badge = statusBadge(pickText(task, ["status", "state"]));

                return (
                  <div key={task.id || index} style={styles.listItem}>
                    <div>
                      <strong style={styles.itemTitle}>
                        {pickText(task, ["title", "name", "description"]) || "İsimsiz aksiyon"}
                      </strong>
                      <p style={styles.itemMeta}>
                        {pickText(task, ["owner", "assignedTo", "responsible"]) || "Sorumlu yok"}
                        {pickText(task, ["dueDate", "date"]) ? ` • ${pickText(task, ["dueDate", "date"])}` : ""}
                      </p>
                    </div>
                    <span style={{ ...styles.badge, ...styles[`badge_${badge.tone}`] }}>
                      {badge.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel title="Son Satın Alma Talepleri">
          {recentOrders.length === 0 ? (
            <Empty text="Henüz satın alma kaydı yok." />
          ) : (
            <div style={styles.list}>
              {recentOrders.map((order, index) => {
                const badge = statusBadge(pickText(order, ["status", "state"]));

                return (
                  <div key={order.id || index} style={styles.listItem}>
                    <div>
                      <strong style={styles.itemTitle}>
                        {pickText(order, ["title", "supplierName", "supplier", "name"]) || "Satın alma talebi"}
                      </strong>
                      <p style={styles.itemMeta}>
                        {pickText(order, ["date", "orderDate", "createdAt"]) || "Tarih yok"}
                      </p>
                    </div>
                    <span style={{ ...styles.badge, ...styles[`badge_${badge.tone}`] }}>
                      {badge.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </section>
    </main>
  );
}

function KpiCard({ title, value, note, danger }) {
  return (
    <article style={styles.card}>
      <span style={styles.cardTitle}>{title}</span>
      <strong style={danger ? styles.cardValueDanger : styles.cardValue}>{value}</strong>
      <small style={styles.cardNote}>{note}</small>
    </article>
  );
}

function Panel({ title, children }) {
  return (
    <section style={styles.panel}>
      <h2 style={styles.panelTitle}>{title}</h2>
      {children}
    </section>
  );
}

function Empty({ text }) {
  return <div style={styles.empty}>{text}</div>;
}

const styles = {
  page: {
    padding: "28px",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #111827 0%, #1f2937 48%, #0f172a 100%)",
    color: "#f9fafb",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 320px",
    gap: "20px",
    alignItems: "stretch",
    marginBottom: "22px",
  },
  eyebrow: {
    margin: 0,
    color: "#c4b5fd",
    fontSize: "13px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontWeight: 700,
  },
  title: {
    margin: "8px 0 8px",
    fontSize: "38px",
    lineHeight: 1.1,
  },
  subtitle: {
    margin: 0,
    maxWidth: "720px",
    color: "#d1d5db",
    fontSize: "15px",
    lineHeight: 1.6,
  },
  heroCard: {
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "22px",
    padding: "22px",
    background: "rgba(255,255,255,0.08)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
  },
  heroLabel: {
    display: "block",
    color: "#d1d5db",
    fontSize: "14px",
    marginBottom: "10px",
  },
  heroValue: {
    display: "block",
    fontSize: "34px",
    color: "#bbf7d0",
  },
  heroValueDanger: {
    display: "block",
    fontSize: "34px",
    color: "#fecaca",
  },
  muted: {
    display: "block",
    color: "#9ca3af",
    marginTop: "8px",
  },
  notice: {
    padding: "14px 16px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.08)",
    marginBottom: "18px",
  },
  warningBox: {
    padding: "14px 16px",
    borderRadius: "14px",
    background: "rgba(251,191,36,0.14)",
    color: "#fde68a",
    border: "1px solid rgba(251,191,36,0.28)",
    marginBottom: "18px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  card: {
    borderRadius: "20px",
    padding: "18px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    minHeight: "118px",
  },
  cardTitle: {
    display: "block",
    color: "#d1d5db",
    fontSize: "13px",
    marginBottom: "10px",
  },
  cardValue: {
    display: "block",
    fontSize: "27px",
    color: "#ffffff",
  },
  cardValueDanger: {
    display: "block",
    fontSize: "27px",
    color: "#fca5a5",
  },
  cardNote: {
    display: "block",
    color: "#9ca3af",
    marginTop: "9px",
  },
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  panel: {
    borderRadius: "22px",
    padding: "20px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  panelTitle: {
    margin: "0 0 16px",
    fontSize: "19px",
  },
  list: {
    display: "grid",
    gap: "12px",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "center",
    padding: "13px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.46)",
  },
  itemTitle: {
    display: "block",
    fontSize: "14px",
  },
  itemMeta: {
    margin: "5px 0 0",
    color: "#9ca3af",
    fontSize: "12px",
  },
  badge: {
    flex: "0 0 auto",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },
  badge_success: {
    color: "#bbf7d0",
    background: "rgba(34,197,94,0.16)",
  },
  badge_warning: {
    color: "#fde68a",
    background: "rgba(245,158,11,0.18)",
  },
  badge_danger: {
    color: "#fecaca",
    background: "rgba(239,68,68,0.18)",
  },
  empty: {
    padding: "18px",
    color: "#9ca3af",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.35)",
  },
};

export default ExecutiveDashboardPage;
