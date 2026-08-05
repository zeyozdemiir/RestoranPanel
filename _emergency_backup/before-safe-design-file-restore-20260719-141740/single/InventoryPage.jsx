import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "./apiConfig";

const fallbackItems = [
  {
    id: "stock-1",
    name: "Dana bonfile",
    category: "Et",
    unit: "kg",
    quantity: 8,
    minQuantity: 10,
    unitCost: 1250,
    status: "CRITICAL",
  },
  {
    id: "stock-2",
    name: "Mozzarella",
    category: "Süt Ürünleri",
    unit: "kg",
    quantity: 18,
    minQuantity: 12,
    unitCost: 320,
    status: "OK",
  },
  {
    id: "stock-3",
    name: "Domates",
    category: "Sebze",
    unit: "kg",
    quantity: 14,
    minQuantity: 15,
    unitCost: 55,
    status: "LOW",
  },
  {
    id: "stock-4",
    name: "Aperol",
    category: "Bar",
    unit: "şişe",
    quantity: 9,
    minQuantity: 4,
    unitCost: 1180,
    status: "OK",
  },
];

const emptyForm = {
  name: "",
  category: "",
  unit: "",
  quantity: "",
  minQuantity: "",
  unitCost: "",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function normalizeItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.inventoryItems)) return data.inventoryItems;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getQuantity(item) {
  return Number(item.quantity ?? item.currentStock ?? item.stock ?? 0);
}

function getMinQuantity(item) {
  return Number(item.minQuantity ?? item.minimumStock ?? item.minStock ?? 0);
}

function getUnitCost(item) {
  return Number(item.unitCost ?? item.cost ?? item.price ?? 0);
}

function getStockStatus(item) {
  const quantity = getQuantity(item);
  const minQuantity = getMinQuantity(item);

  if (item.status) return item.status;
  if (quantity <= 0) return "OUT";
  if (quantity < minQuantity) return "CRITICAL";
  if (quantity === minQuantity) return "LOW";
  return "OK";
}

function getStatusLabel(status) {
  if (status === "OK") return "Yeterli";
  if (status === "LOW") return "Sınırda";
  if (status === "CRITICAL") return "Kritik";
  if (status === "OUT") return "Bitti";
  return status || "Durum Yok";
}

function getStatusStyle(status) {
  if (status === "OK") return styles.badgeOk;
  if (status === "LOW") return styles.badgeWarn;
  if (status === "CRITICAL" || status === "OUT") return styles.badgeError;
  return styles.badgeBlue;
}

function InventoryPage() {
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [form, setForm] = useState(emptyForm);
  const [source, setSource] = useState("api");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formMessage, setFormMessage] = useState("");

  async function fetchItems() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/inventory-items", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setItems(fallbackItems);
        setSource("demo");
        setError("Backend stok verisi alınamadı. Ekran örnek verilerle gösteriliyor.");
        return;
      }

      const normalized = normalizeItems(data);

      if (normalized.length === 0) {
        setItems(fallbackItems);
        setSource("demo");
        setError("Kayıtlı stok ürünü bulunamadı. Örnek stok listesi gösteriliyor.");
        return;
      }

      setItems(normalized);
      setSource("api");
    } catch {
      setItems(fallbackItems);
      setSource("demo");
      setError("Backend bağlantısı kurulamadı. Ekran örnek verilerle gösteriliyor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  async function handleCreateItem(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setFormMessage("Ürün adı zorunlu.");
      return;
    }

    const newItem = {
      id: "local-stock-" + Date.now(),
      name: form.name.trim(),
      category: form.category.trim() || "Genel",
      unit: form.unit.trim() || "adet",
      quantity: Number(form.quantity || 0),
      minQuantity: Number(form.minQuantity || 0),
      unitCost: Number(form.unitCost || 0),
    };

    try {
      setSaving(true);
      setFormMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/inventory-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(newItem),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        const savedItem = data.item || data.inventoryItem || data.data || data || newItem;
        setItems((current) => [savedItem, ...current]);
        setSource("api");
        setFormMessage("Stok ürünü backend’e kaydedildi.");
      } else {
        setItems((current) => [newItem, ...current]);
        setFormMessage("Backend kayıt almadı; ürün geçici olarak ekranda gösteriliyor.");
      }

      setForm(emptyForm);
    } catch {
      setItems((current) => [newItem, ...current]);
      setFormMessage("Backend bağlantısı yok; ürün geçici olarak ekranda gösteriliyor.");
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  }

  const categories = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.category).filter(Boolean))).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "ALL") return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  const summary = useMemo(() => {
    const totalValue = items.reduce((sum, item) => {
      return sum + getQuantity(item) * getUnitCost(item);
    }, 0);

    const critical = items.filter((item) => {
      const status = getStockStatus(item);
      return status === "CRITICAL" || status === "OUT";
    }).length;

    const low = items.filter((item) => getStockStatus(item) === "LOW").length;

    return {
      total: items.length,
      categories: categories.length,
      critical,
      low,
      totalValue,
    };
  }, [items, categories.length]);

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>HandsOff Stok Kontrolü</p>
          <h1 style={styles.title}>Stok Yönetimi</h1>
          <p style={styles.subtitle}>
            Ürün stoklarını, kritik seviyeleri, kategori dağılımını ve toplam stok değerini tek ekranda takip edin.
          </p>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroLabel}>Toplam Stok Değeri</span>
          <strong style={styles.heroValue}>{formatCurrency(summary.totalValue)}</strong>
          <small style={source === "api" ? styles.heroNoteOk : styles.heroNoteWarn}>
            {source === "api" ? "Backend verisi kullanılıyor" : "Örnek veri gösteriliyor"}
          </small>
        </div>
      </section>

      <section style={styles.kpiGrid}>
        <KpiCard title="Toplam Ürün" value={summary.total} note="Stokta takip edilen ürün" />
        <KpiCard title="Kategori" value={summary.categories} note="Ürün grubu" />
        <KpiCard title="Kritik" value={summary.critical} note="Acil tedarik gereken ürün" tone="danger" />
        <KpiCard title="Sınırda" value={summary.low} note="Minimum seviyeye yaklaşan ürün" tone="warning" />
      </section>

      <section style={styles.createGrid}>
        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Yeni Stok Ürünü Ekle</h2>
          <p style={styles.panelText}>Ürün, kategori, birim, miktar ve minimum stok seviyesini girin.</p>

          <form onSubmit={handleCreateItem} style={styles.formGrid}>
            <input
              style={styles.input}
              placeholder="Ürün adı"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Kategori"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Birim"
              value={form.unit}
              onChange={(event) => setForm({ ...form, unit: event.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Mevcut miktar"
              type="number"
              value={form.quantity}
              onChange={(event) => setForm({ ...form, quantity: event.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Minimum miktar"
              type="number"
              value={form.minQuantity}
              onChange={(event) => setForm({ ...form, minQuantity: event.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Birim maliyet"
              type="number"
              value={form.unitCost}
              onChange={(event) => setForm({ ...form, unitCost: event.target.value })}
            />

            <button type="submit" style={styles.buttonWide} disabled={saving}>
              {saving ? "Kaydediliyor..." : "Stok Ürünü Ekle"}
            </button>
          </form>

          {formMessage ? <div style={styles.infoMessage}>{formMessage}</div> : null}
        </article>

        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Kritik Stok Takibi</h2>
          <p style={styles.panelText}>Minimum seviyenin altında kalan ürünler burada öne çıkar.</p>

          <div style={styles.criticalList}>
            {items
              .filter((item) => {
                const status = getStockStatus(item);
                return status === "CRITICAL" || status === "OUT" || status === "LOW";
              })
              .slice(0, 5)
              .map((item) => (
                <div key={item.id || item.name} style={styles.criticalItem}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>
                      {getQuantity(item)} {item.unit || "adet"} / Min: {getMinQuantity(item)}
                    </span>
                  </div>

                  <span style={{ ...styles.badge, ...getStatusStyle(getStockStatus(item)) }}>
                    {getStatusLabel(getStockStatus(item))}
                  </span>
                </div>
              ))}

            {summary.critical === 0 && summary.low === 0 ? (
              <div style={styles.emptyCritical}>Kritik stok bulunmuyor.</div>
            ) : null}
          </div>
        </article>
      </section>

      <section style={styles.toolbar}>
        <div>
          <h2 style={styles.panelTitle}>Stok Listesi</h2>
          <p style={styles.panelText}>Kategoriye göre ürün stoklarını filtreleyin.</p>
        </div>

        <div style={styles.actions}>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            style={styles.select}
          >
            <option value="ALL">Tüm Kategoriler</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <button type="button" onClick={fetchItems} style={styles.button}>
            Yenile
          </button>
        </div>
      </section>

      {loading ? (
        <section style={styles.stateBox}>Stok ürünleri yükleniyor...</section>
      ) : (
        <>
          {error ? <section style={styles.warningBox}>{error}</section> : null}

          <section style={styles.grid}>
            {filteredItems.map((item) => {
              const status = getStockStatus(item);

              return (
                <article key={item.id || item.name} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div>
                      <h3 style={styles.cardTitle}>{item.name || item.productName || "Ürün"}</h3>
                      <p style={styles.cardText}>{item.category || "Kategori belirtilmedi"}</p>
                    </div>

                    <span style={{ ...styles.badge, ...getStatusStyle(status) }}>
                      {getStatusLabel(status)}
                    </span>
                  </div>

                  <div style={styles.stockBox}>
                    <span>Mevcut Stok</span>
                    <strong>
                      {getQuantity(item)} {item.unit || "adet"}
                    </strong>
                  </div>

                  <div style={styles.metaGrid}>
                    <div style={styles.metaBox}>
                      <span>Minimum</span>
                      <strong>
                        {getMinQuantity(item)} {item.unit || "adet"}
                      </strong>
                    </div>

                    <div style={styles.metaBox}>
                      <span>Birim Maliyet</span>
                      <strong>{formatCurrency(getUnitCost(item))}</strong>
                    </div>

                    <div style={styles.metaBox}>
                      <span>Stok Değeri</span>
                      <strong>{formatCurrency(getQuantity(item) * getUnitCost(item))}</strong>
                    </div>

                    <div style={styles.metaBox}>
                      <span>Birim</span>
                      <strong>{item.unit || "adet"}</strong>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}
    </main>
  );
}

function KpiCard({ title, value, note, tone }) {
  return (
    <article style={styles.kpiCard}>
      <span style={styles.kpiTitle}>{title}</span>
      <strong
        style={
          tone === "danger"
            ? styles.kpiValueDanger
            : tone === "warning"
              ? styles.kpiValueWarn
              : styles.kpiValue
        }
      >
        {value}
      </strong>
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
      "radial-gradient(circle at top left, #14532d 0, transparent 34%), linear-gradient(135deg, #0f172a 0%, #111827 48%, #020617 100%)",
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
    color: "#86efac",
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
  kpiValueDanger: {
    display: "block",
    fontSize: "30px",
    color: "#fecaca",
  },
  kpiValueWarn: {
    display: "block",
    fontSize: "30px",
    color: "#fde68a",
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
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },
  infoMessage: {
    marginTop: "12px",
    padding: "12px",
    borderRadius: "14px",
    color: "#bbf7d0",
    background: "rgba(34,197,94,0.13)",
    border: "1px solid rgba(34,197,94,0.18)",
  },
  criticalList: {
    display: "grid",
    gap: "10px",
  },
  criticalItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    padding: "14px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.55)",
  },
  emptyCritical: {
    padding: "14px",
    borderRadius: "16px",
    background: "rgba(34,197,94,0.12)",
    color: "#bbf7d0",
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
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
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
  badgeError: {
    color: "#fecaca",
    background: "rgba(239,68,68,0.18)",
  },
  badgeBlue: {
    color: "#bfdbfe",
    background: "rgba(59,130,246,0.18)",
  },
  stockBox: {
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
};

export default InventoryPage;
