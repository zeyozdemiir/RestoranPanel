import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "./apiConfig";

const fallbackOrders = [
  {
    id: "po-1",
    supplierName: "Et ve Şarküteri Tedarikçisi",
    productName: "Dana ürünleri",
    quantity: 12,
    unit: "kg",
    unitPrice: 1450,
    totalAmount: 17400,
    status: "OPEN",
    priority: "HIGH",
    orderDate: "Bugün",
  },
  {
    id: "po-2",
    supplierName: "Sebze Meyve Tedarikçisi",
    productName: "Günlük sebze alımı",
    quantity: 1,
    unit: "parti",
    unitPrice: 6800,
    totalAmount: 6800,
    status: "APPROVED",
    priority: "MEDIUM",
    orderDate: "Bugün",
  },
  {
    id: "po-3",
    supplierName: "İçecek Tedarikçisi",
    productName: "Soğuk içecek takviyesi",
    quantity: 24,
    unit: "koli",
    unitPrice: 850,
    totalAmount: 20400,
    status: "DELIVERED",
    priority: "MEDIUM",
    orderDate: "Bu hafta",
  },
];

const emptyForm = {
  supplierName: "",
  productName: "",
  quantity: "",
  unit: "",
  unitPrice: "",
  priority: "MEDIUM",
};

const statusLabels = {
  OPEN: "Açık",
  APPROVED: "Onaylandı",
  DELIVERED: "Teslim Alındı",
  CANCELLED: "İptal",
};

const priorityLabels = {
  HIGH: "Yüksek",
  MEDIUM: "Orta",
  LOW: "Düşük",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function normalizeOrders(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.purchaseOrders)) return data.purchaseOrders;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getTotal(order) {
  return Number(order.totalAmount || order.total || Number(order.quantity || 0) * Number(order.unitPrice || 0));
}

function getStatusLabel(status) {
  return statusLabels[status] || status || "Durum Yok";
}

function getPriorityLabel(priority) {
  return priorityLabels[priority] || priority || "Öncelik Yok";
}

function getStatusStyle(status) {
  if (status === "DELIVERED") return styles.badgeOk;
  if (status === "APPROVED") return styles.badgeBlue;
  if (status === "CANCELLED") return styles.badgeError;
  return styles.badgeWarn;
}

function getPriorityStyle(priority) {
  if (priority === "HIGH") return styles.priorityHigh;
  if (priority === "LOW") return styles.priorityLow;
  return styles.priorityMedium;
}

function PurchaseOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [form, setForm] = useState(emptyForm);
  const [source, setSource] = useState("api");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formMessage, setFormMessage] = useState("");

  async function fetchOrders() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/purchase-orders", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setOrders(fallbackOrders);
        setSource("demo");
        setError("Backend satın alma siparişleri alınamadı. Ekran örnek verilerle gösteriliyor.");
        return;
      }

      const normalized = normalizeOrders(data);

      if (normalized.length === 0) {
        setOrders(fallbackOrders);
        setSource("demo");
        setError("Kayıtlı satın alma siparişi bulunamadı. Örnek liste gösteriliyor.");
        return;
      }

      setOrders(normalized);
      setSource("api");
    } catch {
      setOrders(fallbackOrders);
      setSource("demo");
      setError("Backend bağlantısı kurulamadı. Ekran örnek verilerle gösteriliyor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function handleCreateOrder(event) {
    event.preventDefault();

    if (!form.supplierName.trim() || !form.productName.trim()) {
      setFormMessage("Tedarikçi adı ve ürün/hizmet adı zorunlu.");
      return;
    }

    const quantity = Number(form.quantity || 0);
    const unitPrice = Number(form.unitPrice || 0);

    const newOrder = {
      id: "local-po-" + Date.now(),
      supplierName: form.supplierName.trim(),
      productName: form.productName.trim(),
      quantity,
      unit: form.unit.trim() || "adet",
      unitPrice,
      totalAmount: quantity * unitPrice,
      status: "OPEN",
      priority: form.priority,
      orderDate: "Yeni sipariş",
    };

    try {
      setSaving(true);
      setFormMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/purchase-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(newOrder),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        const savedOrder = data.order || data.purchaseOrder || data.data || data || newOrder;
        setOrders((current) => [savedOrder, ...current]);
        setSource("api");
        setFormMessage("Satın alma siparişi backend’e kaydedildi.");
      } else {
        setOrders((current) => [newOrder, ...current]);
        setFormMessage("Backend kayıt almadı; sipariş geçici olarak ekranda gösteriliyor.");
      }

      setForm(emptyForm);
    } catch {
      setOrders((current) => [newOrder, ...current]);
      setFormMessage("Backend bağlantısı yok; sipariş geçici olarak ekranda gösteriliyor.");
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  }

  const filteredOrders = useMemo(() => {
    if (selectedStatus === "ALL") return orders;
    return orders.filter((order) => order.status === selectedStatus);
  }, [orders, selectedStatus]);

  const summary = useMemo(() => {
    const totalAmount = orders.reduce((sum, order) => sum + getTotal(order), 0);
    const open = orders.filter((order) => order.status === "OPEN").length;
    const approved = orders.filter((order) => order.status === "APPROVED").length;
    const delivered = orders.filter((order) => order.status === "DELIVERED").length;
    const high = orders.filter((order) => order.priority === "HIGH").length;

    return {
      total: orders.length,
      totalAmount,
      open,
      approved,
      delivered,
      high,
    };
  }, [orders]);

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>HandsOff Satın Alma</p>
          <h1 style={styles.title}>Satın Alma Siparişleri</h1>
          <p style={styles.subtitle}>
            Tedarikçi siparişlerini, onay durumlarını, teslim alma sürecini ve toplam satın alma tutarını tek ekranda takip edin.
          </p>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroLabel}>Toplam Sipariş Tutarı</span>
          <strong style={styles.heroValue}>{formatCurrency(summary.totalAmount)}</strong>
          <small style={source === "api" ? styles.heroNoteOk : styles.heroNoteWarn}>
            {source === "api" ? "Backend verisi kullanılıyor" : "Örnek veri gösteriliyor"}
          </small>
        </div>
      </section>

      <section style={styles.kpiGrid}>
        <KpiCard title="Toplam Sipariş" value={summary.total} note="Kayıtlı satın alma talebi" />
        <KpiCard title="Açık" value={summary.open} note="Onay bekleyen siparişler" />
        <KpiCard title="Onaylandı" value={summary.approved} note="Satın alma onayı verilenler" />
        <KpiCard title="Teslim Alındı" value={summary.delivered} note="Kapanan satın alma kayıtları" />
      </section>

      <section style={styles.createGrid}>
        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Yeni Satın Alma Siparişi</h2>
          <p style={styles.panelText}>Tedarikçi, ürün, miktar ve birim fiyat girerek yeni sipariş oluşturun.</p>

          <form onSubmit={handleCreateOrder} style={styles.formGrid}>
            <input
              style={styles.input}
              placeholder="Tedarikçi adı"
              value={form.supplierName}
              onChange={(event) => setForm({ ...form, supplierName: event.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Ürün / hizmet adı"
              value={form.productName}
              onChange={(event) => setForm({ ...form, productName: event.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Miktar"
              type="number"
              value={form.quantity}
              onChange={(event) => setForm({ ...form, quantity: event.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Birim"
              value={form.unit}
              onChange={(event) => setForm({ ...form, unit: event.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Birim fiyat"
              type="number"
              value={form.unitPrice}
              onChange={(event) => setForm({ ...form, unitPrice: event.target.value })}
            />

            <select
              style={styles.input}
              value={form.priority}
              onChange={(event) => setForm({ ...form, priority: event.target.value })}
            >
              <option value="HIGH">Yüksek Öncelik</option>
              <option value="MEDIUM">Orta Öncelik</option>
              <option value="LOW">Düşük Öncelik</option>
            </select>

            <button type="submit" style={styles.buttonWide} disabled={saving}>
              {saving ? "Kaydediliyor..." : "Sipariş Oluştur"}
            </button>
          </form>

          {formMessage ? <div style={styles.infoMessage}>{formMessage}</div> : null}
        </article>

        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Satın Alma Akışı</h2>
          <p style={styles.panelText}>Siparişlerin operasyon içindeki takip sırası.</p>

          <div style={styles.flowList}>
            <FlowItem title="1. Talep Açılır" text="Ürün, tedarikçi, miktar ve birim fiyat girilir." />
            <FlowItem title="2. Yönetici Onayı" text="Açık sipariş yönetici tarafından kontrol edilir." />
            <FlowItem title="3. Teslim Alma" text="Ürün geldiğinde teslim alındı durumuna çekilir." />
            <FlowItem title="4. Cari Borç" text="Tutar tedarikçi cari hesabına yansıtılır." />
          </div>
        </article>
      </section>

      <section style={styles.toolbar}>
        <div>
          <h2 style={styles.panelTitle}>Sipariş Listesi</h2>
          <p style={styles.panelText}>Duruma göre satın alma siparişlerini filtreleyin.</p>
        </div>

        <div style={styles.actions}>
          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            style={styles.select}
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="OPEN">Açık</option>
            <option value="APPROVED">Onaylandı</option>
            <option value="DELIVERED">Teslim Alındı</option>
            <option value="CANCELLED">İptal</option>
          </select>

          <button type="button" onClick={fetchOrders} style={styles.button}>
            Yenile
          </button>
        </div>
      </section>

      {loading ? (
        <section style={styles.stateBox}>Satın alma siparişleri yükleniyor...</section>
      ) : (
        <>
          {error ? <section style={styles.warningBox}>{error}</section> : null}

          <section style={styles.grid}>
            {filteredOrders.map((order) => (
              <article key={order.id || order.productName} style={styles.card}>
                <div style={styles.cardTop}>
                  <div>
                    <h3 style={styles.cardTitle}>{order.productName || order.title || "Sipariş"}</h3>
                    <p style={styles.cardText}>{order.supplierName || order.supplier || "Tedarikçi belirtilmedi"}</p>
                  </div>

                  <span style={{ ...styles.badge, ...getStatusStyle(order.status) }}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div style={styles.amountBox}>
                  <span>Toplam Tutar</span>
                  <strong>{formatCurrency(getTotal(order))}</strong>
                </div>

                <div style={styles.metaGrid}>
                  <div style={styles.metaBox}>
                    <span>Miktar</span>
                    <strong>{order.quantity || 0} {order.unit || "adet"}</strong>
                  </div>

                  <div style={styles.metaBox}>
                    <span>Birim Fiyat</span>
                    <strong>{formatCurrency(order.unitPrice || 0)}</strong>
                  </div>

                  <div style={styles.metaBox}>
                    <span>Tarih</span>
                    <strong>{order.orderDate || order.createdAt || "Tarih Yok"}</strong>
                  </div>

                  <div style={styles.metaBox}>
                    <span>Öncelik</span>
                    <strong style={{ ...styles.priorityText, ...getPriorityStyle(order.priority) }}>
                      {getPriorityLabel(order.priority)}
                    </strong>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  );
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

function FlowItem({ title, text }) {
  return (
    <div style={styles.flowItem}>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
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
    gridTemplateColumns: "1fr 340px",
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
  heroValue: {
    display: "block",
    fontSize: "32px",
    color: "#ffffff",
  },
  heroNoteOk: {
    display: "inline-block",
    marginTop: "10px",
    color: "#bbf7d0",
    background: "rgba(34,197,94,0.16)",
    padding: "6px 10px",
    borderRadius: "999px",
  },
  heroNoteWarn: {
    display: "inline-block",
    marginTop: "10px",
    color: "#fde68a",
    background: "rgba(245,158,11,0.18)",
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
    fontSize: "30px",
    color: "#ffffff",
  },
  kpiNote: {
    display: "block",
    color: "#94a3b8",
    marginTop: "8px",
  },
  createGrid: {
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
  panelTitle: {
    margin: 0,
    fontSize: "21px",
  },
  panelText: {
    margin: "6px 0 14px",
    color: "#94a3b8",
    fontSize: "13px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  input: {
    height: "42px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "#0f172a",
    color: "#f8fafc",
    padding: "0 12px",
    outline: "none",
  },
  buttonWide: {
    gridColumn: "1 / -1",
    height: "44px",
    border: 0,
    borderRadius: "14px",
    padding: "0 16px",
    background: "linear-gradient(135deg, #f97316, #dc2626)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },
  infoMessage: {
    marginTop: "12px",
    padding: "12px",
    borderRadius: "14px",
    color: "#fde68a",
    background: "rgba(245,158,11,0.13)",
    border: "1px solid rgba(245,158,11,0.18)",
  },
  flowList: {
    display: "grid",
    gap: "10px",
  },
  flowItem: {
    display: "grid",
    gap: "5px",
    padding: "14px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.55)",
    color: "#cbd5e1",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
    padding: "20px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    marginBottom: "16px",
  },
  actions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  select: {
    height: "42px",
    minWidth: "180px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "#0f172a",
    color: "#f8fafc",
    padding: "0 12px",
    outline: "none",
  },
  button: {
    height: "42px",
    border: 0,
    borderRadius: "14px",
    padding: "0 16px",
    background: "linear-gradient(135deg, #f97316, #dc2626)",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
  },
  warningBox: {
    padding: "16px",
    borderRadius: "18px",
    background: "rgba(245,158,11,0.12)",
    border: "1px solid rgba(245,158,11,0.2)",
    color: "#fde68a",
    marginBottom: "16px",
  },
  stateBox: {
    padding: "22px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#cbd5e1",
    marginBottom: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
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
    marginBottom: "16px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "20px",
  },
  cardText: {
    margin: "7px 0 0",
    color: "#cbd5e1",
    lineHeight: 1.55,
    fontSize: "13px",
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
  badgeError: {
    color: "#fecaca",
    background: "rgba(239,68,68,0.18)",
  },
  amountBox: {
    display: "grid",
    gap: "6px",
    padding: "16px",
    borderRadius: "18px",
    background: "rgba(15,23,42,0.55)",
    marginBottom: "14px",
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
    background: "rgba(15,23,42,0.45)",
  },
  priorityText: {
    padding: "5px 8px",
    borderRadius: "999px",
    fontSize: "12px",
  },
  priorityHigh: {
    color: "#fecaca",
    background: "rgba(239,68,68,0.18)",
  },
  priorityMedium: {
    color: "#fde68a",
    background: "rgba(245,158,11,0.18)",
  },
  priorityLow: {
    color: "#bbf7d0",
    background: "rgba(34,197,94,0.16)",
  },
};

export default PurchaseOrdersPage;
