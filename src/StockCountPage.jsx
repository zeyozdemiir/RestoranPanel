import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "./apiConfig";

const fallbackCounts = [
  {
    id: "count-1",
    productName: "Dana bonfile",
    category: "Et",
    unit: "kg",
    systemQuantity: 8,
    countedQuantity: 7.2,
    note: "Mutfak kullanım farkı kontrol edilmeli",
    countDate: "Bugün",
    countedBy: "Stok Sorumlusu",
  },
  {
    id: "count-2",
    productName: "Mozzarella",
    category: "Süt Ürünleri",
    unit: "kg",
    systemQuantity: 18,
    countedQuantity: 18,
    note: "Fark yok",
    countDate: "Bugün",
    countedBy: "Mutfak",
  },
  {
    id: "count-3",
    productName: "Aperol",
    category: "Bar",
    unit: "şişe",
    systemQuantity: 9,
    countedQuantity: 10,
    note: "Sisteme işlenmeyen giriş olabilir",
    countDate: "Bugün",
    countedBy: "Bar",
  },
];

const emptyForm = {
  productName: "",
  category: "",
  unit: "",
  systemQuantity: "",
  countedQuantity: "",
  countedBy: "",
  note: "",
};

function normalizeCounts(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.counts)) return data.counts;
  if (Array.isArray(data?.stockCounts)) return data.stockCounts;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getSystemQuantity(item) {
  return Number(item.systemQuantity ?? item.expectedQuantity ?? item.expectedStock ?? 0);
}

function getCountedQuantity(item) {
  return Number(item.countedQuantity ?? item.actualQuantity ?? item.countedStock ?? 0);
}

function getDifference(item) {
  return getCountedQuantity(item) - getSystemQuantity(item);
}

function getAbsDifference(item) {
  return Math.abs(getDifference(item));
}

function getStatus(item) {
  const difference = getDifference(item);

  if (difference === 0) return "OK";
  if (difference < 0) return "SHORT";
  return "EXCESS";
}

function getStatusLabel(status) {
  if (status === "OK") return "Doğru";
  if (status === "SHORT") return "Eksik";
  if (status === "EXCESS") return "Fazla";
  return "Durum Yok";
}

function getStatusStyle(status) {
  if (status === "OK") return styles.badgeOk;
  if (status === "SHORT") return styles.badgeError;
  if (status === "EXCESS") return styles.badgeWarn;
  return styles.badgeBlue;
}

function StockCountPage() {
  const [counts, setCounts] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [form, setForm] = useState(emptyForm);
  const [source, setSource] = useState("api");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formMessage, setFormMessage] = useState("");

  async function fetchCounts() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/stock-counts", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setCounts(fallbackCounts);
        setSource("demo");
        setError("Backend stok sayım verisi alınamadı. Ekran örnek verilerle gösteriliyor.");
        return;
      }

      const normalized = normalizeCounts(data);

      if (normalized.length === 0) {
        setCounts(fallbackCounts);
        setSource("demo");
        setError("Kayıtlı stok sayımı bulunamadı. Örnek sayım listesi gösteriliyor.");
        return;
      }

      setCounts(normalized);
      setSource("api");
    } catch {
      setCounts(fallbackCounts);
      setSource("demo");
      setError("Backend bağlantısı kurulamadı. Ekran örnek verilerle gösteriliyor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCounts();
  }, []);

  async function handleCreateCount(event) {
    event.preventDefault();

    if (!form.productName.trim()) {
      setFormMessage("Ürün adı zorunlu.");
      return;
    }

    const newCount = {
      id: "local-count-" + Date.now(),
      productName: form.productName.trim(),
      category: form.category.trim() || "Genel",
      unit: form.unit.trim() || "adet",
      systemQuantity: Number(form.systemQuantity || 0),
      countedQuantity: Number(form.countedQuantity || 0),
      countedBy: form.countedBy.trim() || "Belirtilmedi",
      note: form.note.trim() || "Not girilmedi",
      countDate: new Date().toLocaleDateString("tr-TR"),
    };

    try {
      setSaving(true);
      setFormMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/stock-counts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(newCount),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        const savedCount = data.count || data.stockCount || data.data || data || newCount;
        setCounts((current) => [savedCount, ...current]);
        setSource("api");
        setFormMessage("Stok sayımı backend’e kaydedildi.");
      } else {
        setCounts((current) => [newCount, ...current]);
        setFormMessage("Backend kayıt almadı; sayım geçici olarak ekranda gösteriliyor.");
      }

      setForm(emptyForm);
    } catch {
      setCounts((current) => [newCount, ...current]);
      setFormMessage("Backend bağlantısı yok; sayım geçici olarak ekranda gösteriliyor.");
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  }

  const filteredCounts = useMemo(() => {
    if (selectedStatus === "ALL") return counts;

    return counts.filter((item) => getStatus(item) === selectedStatus);
  }, [counts, selectedStatus]);

  const summary = useMemo(() => {
    const ok = counts.filter((item) => getStatus(item) === "OK").length;
    const short = counts.filter((item) => getStatus(item) === "SHORT").length;
    const excess = counts.filter((item) => getStatus(item) === "EXCESS").length;

    const totalDifference = counts.reduce((sum, item) => {
      return sum + getAbsDifference(item);
    }, 0);

    return {
      total: counts.length,
      ok,
      short,
      excess,
      totalDifference,
    };
  }, [counts]);

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>HandsOff Stok Kontrolü</p>
          <h1 style={styles.title}>Stok Sayım</h1>
          <p style={styles.subtitle}>
            Sistemde görünen stok ile fiziksel sayım arasındaki farkı takip edin. Eksik, fazla ve doğru sayımları tek ekrandan yönetin.
          </p>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroLabel}>Toplam Sayım Farkı</span>
          <strong style={summary.totalDifference === 0 ? styles.heroValueOk : styles.heroValueWarn}>
            {summary.totalDifference.toFixed(2)}
          </strong>
          <small style={source === "api" ? styles.heroNoteOk : styles.heroNoteWarn}>
            {source === "api" ? "Backend verisi kullanılıyor" : "Örnek veri gösteriliyor"}
          </small>
        </div>
      </section>

      <section style={styles.kpiGrid}>
        <KpiCard title="Toplam Sayım" value={summary.total} note="Kontrol edilen ürün sayısı" />
        <KpiCard title="Doğru" value={summary.ok} note="Sistem ve fiziksel stok eşleşiyor" />
        <KpiCard title="Eksik" value={summary.short} note="Fiziksel stok sistemden az" tone="danger" />
        <KpiCard title="Fazla" value={summary.excess} note="Fiziksel stok sistemden fazla" tone="warning" />
      </section>

      <section style={styles.createGrid}>
        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Yeni Stok Sayımı Gir</h2>
          <p style={styles.panelText}>Ürün için sistem miktarı ve fiziksel sayım miktarını girin.</p>

          <form onSubmit={handleCreateCount} style={styles.formGrid}>
            <input
              style={styles.input}
              placeholder="Ürün adı"
              value={form.productName}
              onChange={(event) => setForm({ ...form, productName: event.target.value })}
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
              placeholder="Sistemdeki miktar"
              type="number"
              step="0.01"
              value={form.systemQuantity}
              onChange={(event) => setForm({ ...form, systemQuantity: event.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Sayılan miktar"
              type="number"
              step="0.01"
              value={form.countedQuantity}
              onChange={(event) => setForm({ ...form, countedQuantity: event.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Sayan kişi / bölüm"
              value={form.countedBy}
              onChange={(event) => setForm({ ...form, countedBy: event.target.value })}
            />

            <textarea
              style={styles.textarea}
              placeholder="Sayım notu"
              value={form.note}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
            />

            <button type="submit" style={styles.buttonWide} disabled={saving}>
              {saving ? "Kaydediliyor..." : "Sayımı Kaydet"}
            </button>
          </form>

          {formMessage ? <div style={styles.infoMessage}>{formMessage}</div> : null}
        </article>

        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Sayım Farkı Mantığı</h2>
          <p style={styles.panelText}>Ekranın hesaplama yöntemi.</p>

          <div style={styles.flowList}>
            <FlowItem title="Sistem Miktarı" text="Panelde kayıtlı görünen stok miktarıdır." />
            <FlowItem title="Sayılan Miktar" text="Depo, mutfak veya barda fiziksel olarak bulunan miktardır." />
            <FlowItem title="Fark" text="Sayılan miktar - sistem miktarı olarak hesaplanır." />
            <FlowItem title="Durum" text="Fark sıfırsa doğru, eksi ise eksik, artı ise fazla gösterilir." />
          </div>
        </article>
      </section>

      <section style={styles.toolbar}>
        <div>
          <h2 style={styles.panelTitle}>Sayım Listesi</h2>
          <p style={styles.panelText}>Sayım farklarını durumuna göre filtreleyin.</p>
        </div>

        <div style={styles.actions}>
          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            style={styles.select}
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="OK">Doğru</option>
            <option value="SHORT">Eksik</option>
            <option value="EXCESS">Fazla</option>
          </select>

          <button type="button" onClick={fetchCounts} style={styles.button}>
            Yenile
          </button>
        </div>
      </section>

      {loading ? (
        <section style={styles.stateBox}>Stok sayımları yükleniyor...</section>
      ) : (
        <>
          {error ? <section style={styles.warningBox}>{error}</section> : null}

          <section style={styles.grid}>
            {filteredCounts.map((item) => {
              const status = getStatus(item);
              const difference = getDifference(item);

              return (
                <article key={item.id || item.productName} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div>
                      <h3 style={styles.cardTitle}>{item.productName || item.name || "Ürün"}</h3>
                      <p style={styles.cardText}>
                        {item.category || "Kategori yok"} · {item.countDate || item.createdAt || "Tarih yok"}
                      </p>
                    </div>

                    <span style={{ ...styles.badge, ...getStatusStyle(status) }}>
                      {getStatusLabel(status)}
                    </span>
                  </div>

                  <div style={styles.diffBox}>
                    <span>Sayım Farkı</span>
                    <strong style={difference < 0 ? styles.diffNegative : difference > 0 ? styles.diffPositive : styles.diffOk}>
                      {difference > 0 ? "+" : ""}
                      {difference.toFixed(2)} {item.unit || "adet"}
                    </strong>
                  </div>

                  <div style={styles.metaGrid}>
                    <div style={styles.metaBox}>
                      <span>Sistemde</span>
                      <strong>
                        {getSystemQuantity(item)} {item.unit || "adet"}
                      </strong>
                    </div>

                    <div style={styles.metaBox}>
                      <span>Sayılan</span>
                      <strong>
                        {getCountedQuantity(item)} {item.unit || "adet"}
                      </strong>
                    </div>

                    <div style={styles.metaBox}>
                      <span>Sayan</span>
                      <strong>{item.countedBy || item.owner || "Belirtilmedi"}</strong>
                    </div>

                    <div style={styles.metaBox}>
                      <span>Not</span>
                      <strong>{item.note || "Not yok"}</strong>
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
    color: "#bfdbfe",
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
    maxWidth: "780px",
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
    fontSize: "36px",
    color: "#bbf7d0",
  },
  heroValueWarn: {
    display: "block",
    fontSize: "36px",
    color: "#fde68a",
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
  textarea: {
    gridColumn: "1 / -1",
    minHeight: "78px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "#0f172a",
    color: "#f8fafc",
    padding: "12px",
    outline: "none",
    resize: "vertical",
  },
  buttonWide: {
    gridColumn: "1 / -1",
    height: "44px",
    border: 0,
    borderRadius: "14px",
    padding: "0 16px",
    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },
  infoMessage: {
    marginTop: "12px",
    padding: "12px",
    borderRadius: "14px",
    color: "#bfdbfe",
    background: "rgba(59,130,246,0.16)",
    border: "1px solid rgba(59,130,246,0.22)",
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
    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
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
  diffBox: {
    display: "grid",
    gap: "6px",
    padding: "16px",
    borderRadius: "18px",
    background: "rgba(15,23,42,0.55)",
    marginBottom: "14px",
  },
  diffNegative: {
    color: "#fecaca",
    fontSize: "26px",
  },
  diffPositive: {
    color: "#fde68a",
    fontSize: "26px",
  },
  diffOk: {
    color: "#bbf7d0",
    fontSize: "26px",
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
};

export default StockCountPage;
