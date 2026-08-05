import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "./apiConfig";

const fallbackSuppliers = [
  {
    id: "demo-1",
    name: "Et ve Şarküteri Tedarikçisi",
    contactName: "Satış Temsilcisi",
    phone: "Telefon eklenmedi",
    taxNumber: "Vergi no bekleniyor",
    category: "Et / Şarküteri",
    balance: 42800,
    status: "ACTIVE",
    lastOrderDate: "Bu hafta",
  },
  {
    id: "demo-2",
    name: "Sebze Meyve Tedarikçisi",
    contactName: "Operasyon",
    phone: "Telefon eklenmedi",
    taxNumber: "Vergi no bekleniyor",
    category: "Sebze / Meyve",
    balance: 18600,
    status: "ACTIVE",
    lastOrderDate: "Bugün",
  },
  {
    id: "demo-3",
    name: "İçecek Tedarikçisi",
    contactName: "Satış",
    phone: "Telefon eklenmedi",
    taxNumber: "Vergi no bekleniyor",
    category: "İçecek",
    balance: 31250,
    status: "ACTIVE",
    lastOrderDate: "Bu hafta",
  },
  {
    id: "demo-4",
    name: "Kuru Gıda Tedarikçisi",
    contactName: "Muhasebe",
    phone: "Telefon eklenmedi",
    taxNumber: "Vergi no bekleniyor",
    category: "Kuru Gıda",
    balance: 9400,
    status: "PASSIVE",
    lastOrderDate: "Geçen hafta",
  },
];

function formatCurrency(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(number);
}

function normalizeSuppliers(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.suppliers)) return data.suppliers;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getSupplierName(supplier) {
  return supplier.name || supplier.companyName || supplier.title || "İsimsiz Tedarikçi";
}

function getBalance(supplier) {
  return supplier.balance || supplier.currentBalance || supplier.debt || supplier.totalDebt || 0;
}

function getStatusLabel(status) {
  if (status === "ACTIVE") return "Aktif";
  if (status === "PASSIVE") return "Pasif";
  if (status === "BLOCKED") return "Blokeli";
  return status || "Durum Yok";
}

function getStatusStyle(status) {
  if (status === "ACTIVE") return styles.badgeOk;
  if (status === "BLOCKED") return styles.badgeError;
  return styles.badgeWarn;
}

function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [source, setSource] = useState("api");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchSuppliers() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/suppliers", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSuppliers(fallbackSuppliers);
        setSource("demo");
        setError("Backend tedarikçi verisi alınamadı. Ekran örnek verilerle gösteriliyor.");
        return;
      }

      const normalized = normalizeSuppliers(data);

      if (normalized.length === 0) {
        setSuppliers(fallbackSuppliers);
        setSource("demo");
        setError("Kayıtlı tedarikçi bulunamadı. Örnek tedarikçi listesi gösteriliyor.");
        return;
      }

      setSuppliers(normalized);
      setSource("api");
    } catch {
      setSuppliers(fallbackSuppliers);
      setSource("demo");
      setError("Backend bağlantısı kurulamadı. Ekran örnek verilerle gösteriliyor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = useMemo(() => {
    if (selectedStatus === "ALL") return suppliers;
    return suppliers.filter((supplier) => supplier.status === selectedStatus);
  }, [suppliers, selectedStatus]);

  const summary = useMemo(() => {
    const totalDebt = suppliers.reduce((sum, supplier) => sum + Number(getBalance(supplier)), 0);
    const active = suppliers.filter((supplier) => supplier.status === "ACTIVE").length;
    const passive = suppliers.filter((supplier) => supplier.status && supplier.status !== "ACTIVE").length;
    const categories = new Set(suppliers.map((supplier) => supplier.category).filter(Boolean)).size;

    return {
      total: suppliers.length,
      active,
      passive,
      categories,
      totalDebt,
    };
  }, [suppliers]);

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>HandsOff Satın Alma</p>
          <h1 style={styles.title}>Tedarikçiler</h1>
          <p style={styles.subtitle}>
            Tedarikçi kartlarını, iletişim bilgilerini, cari borçları ve operasyon durumunu tek ekranda takip edin.
          </p>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroLabel}>Toplam Cari Borç</span>
          <strong style={styles.heroValue}>{formatCurrency(summary.totalDebt)}</strong>
          <small style={source === "api" ? styles.heroNoteOk : styles.heroNoteWarn}>
            {source === "api" ? "Backend verisi kullanılıyor" : "Örnek veri gösteriliyor"}
          </small>
        </div>
      </section>

      <section style={styles.kpiGrid}>
        <KpiCard title="Toplam Tedarikçi" value={summary.total} note="Kayıtlı tedarikçi sayısı" />
        <KpiCard title="Aktif" value={summary.active} note="Aktif çalışılan tedarikçiler" />
        <KpiCard title="Pasif / Kontrol" value={summary.passive} note="Kontrol edilmesi gereken kayıtlar" />
        <KpiCard title="Kategori" value={summary.categories} note="Tedarikçi grubu" />
      </section>

      <section style={styles.toolbar}>
        <div>
          <h2 style={styles.panelTitle}>Tedarikçi Listesi</h2>
          <p style={styles.panelText}>
            Cari borç, kategori, iletişim ve son sipariş durumunu görüntüleyin.
          </p>
        </div>

        <div style={styles.actions}>
          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            style={styles.select}
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="ACTIVE">Aktif</option>
            <option value="PASSIVE">Pasif</option>
            <option value="BLOCKED">Blokeli</option>
          </select>

          <button type="button" onClick={fetchSuppliers} style={styles.button}>
            Yenile
          </button>
        </div>
      </section>

      {loading ? (
        <section style={styles.stateBox}>Tedarikçiler yükleniyor...</section>
      ) : (
        <>
          {error ? <section style={styles.warningBox}>{error}</section> : null}

          <section style={styles.grid}>
            {filteredSuppliers.map((supplier) => (
              <article key={supplier.id || getSupplierName(supplier)} style={styles.card}>
                <div style={styles.cardTop}>
                  <div>
                    <h3 style={styles.cardTitle}>{getSupplierName(supplier)}</h3>
                    <p style={styles.cardText}>
                      {supplier.category || supplier.type || "Kategori belirtilmemiş"}
                    </p>
                  </div>

                  <span style={{ ...styles.badge, ...getStatusStyle(supplier.status) }}>
                    {getStatusLabel(supplier.status)}
                  </span>
                </div>

                <div style={styles.balanceBox}>
                  <span>Cari Borç</span>
                  <strong>{formatCurrency(getBalance(supplier))}</strong>
                </div>

                <div style={styles.metaGrid}>
                  <div style={styles.metaBox}>
                    <span>Yetkili</span>
                    <strong>{supplier.contactName || supplier.contact || "Belirtilmedi"}</strong>
                  </div>

                  <div style={styles.metaBox}>
                    <span>Telefon</span>
                    <strong>{supplier.phone || supplier.phoneNumber || "Belirtilmedi"}</strong>
                  </div>

                  <div style={styles.metaBox}>
                    <span>Vergi No</span>
                    <strong>{supplier.taxNumber || supplier.taxNo || "Belirtilmedi"}</strong>
                  </div>

                  <div style={styles.metaBox}>
                    <span>Son Sipariş</span>
                    <strong>{supplier.lastOrderDate || supplier.lastPurchaseDate || "Kayıt Yok"}</strong>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </>
      )}

      <section style={styles.infoPanel}>
        <h2 style={styles.panelTitle}>Tedarikçi Takip Notları</h2>

        <div style={styles.noteGrid}>
          <div style={styles.noteBox}>
            <strong>Cari borç</strong>
            <span>Tedarikçiye olan açık borçların yönetim ve muhasebe tarafından kontrol edilmesi gerekir.</span>
          </div>

          <div style={styles.noteBox}>
            <strong>Vergi bilgileri</strong>
            <span>Fatura ve ödeme süreçleri için vergi numarası ve iletişim bilgileri eksiksiz tutulmalı.</span>
          </div>

          <div style={styles.noteBox}>
            <strong>Son sipariş</strong>
            <span>Stok ve satın alma planı için son tedarik tarihi düzenli takip edilmeli.</span>
          </div>
        </div>
      </section>
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

const styles = {
  page: {
    minHeight: "100vh",
    padding: "28px",
    color: "#f8fafc",
    background:
      "radial-gradient(circle at top left, #713f12 0, transparent 34%), linear-gradient(135deg, #0f172a 0%, #111827 48%, #020617 100%)",
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
    color: "#fde68a",
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
  panelTitle: {
    margin: 0,
    fontSize: "21px",
  },
  panelText: {
    margin: "6px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
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
    background: "linear-gradient(135deg, #f59e0b, #ea580c)",
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
  badgeError: {
    color: "#fecaca",
    background: "rgba(239,68,68,0.18)",
  },
  balanceBox: {
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

export default SuppliersPage;
