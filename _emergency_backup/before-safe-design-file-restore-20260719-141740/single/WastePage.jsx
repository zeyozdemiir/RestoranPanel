import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "./apiConfig";

const fallbackRecords = [
  {
    id: "waste-1",
    productName: "Dana bonfile",
    category: "Et",
    department: "Mutfak",
    reason: "Porsiyon hazırlık firesi",
    quantity: 0.45,
    unit: "kg",
    unitCost: 1650,
    preventable: true,
    recordDate: "Bugün",
    createdBy: "Şef",
  },
  {
    id: "waste-2",
    productName: "Kadeh",
    category: "Ekipman",
    department: "Servis",
    reason: "Kırılma",
    quantity: 2,
    unit: "adet",
    unitCost: 180,
    preventable: false,
    recordDate: "Bugün",
    createdBy: "Servis",
  },
  {
    id: "waste-3",
    productName: "Mozzarella",
    category: "Süt Ürünleri",
    department: "Mutfak",
    reason: "Son kullanma tarihi",
    quantity: 1.2,
    unit: "kg",
    unitCost: 320,
    preventable: true,
    recordDate: "Bu hafta",
    createdBy: "Stok Sorumlusu",
  },
];

const emptyForm = {
  productName: "",
  category: "",
  department: "",
  reason: "",
  quantity: "",
  unit: "",
  unitCost: "",
  createdBy: "",
  preventable: true,
};

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function normalizeRecords(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.wasteRecords)) return data.wasteRecords;
  if (Array.isArray(data?.wastes)) return data.wastes;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getQuantity(record) {
  return Number(record.quantity ?? record.amount ?? 0);
}

function getUnitCost(record) {
  return Number(record.unitCost ?? record.cost ?? record.price ?? 0);
}

function getLossAmount(record) {
  return getQuantity(record) * getUnitCost(record);
}

function getPreventable(record) {
  return record.preventable === true || record.isPreventable === true;
}

function getType(record) {
  const reason = String(record.reason || "").toLocaleLowerCase("tr-TR");

  if (reason.includes("kır") || reason.includes("kir")) return "BREAKAGE";
  if (reason.includes("son kullan") || reason.includes("bozul")) return "EXPIRED";
  if (getPreventable(record)) return "PREVENTABLE";
  return "NORMAL";
}

function getTypeLabel(type) {
  if (type === "BREAKAGE") return "Kırılma";
  if (type === "EXPIRED") return "SKT / Bozulma";
  if (type === "PREVENTABLE") return "Önlenebilir";
  return "Operasyonel Fire";
}

function getTypeStyle(type) {
  if (type === "BREAKAGE") return styles.badgeWarn;
  if (type === "EXPIRED") return styles.badgeError;
  if (type === "PREVENTABLE") return styles.badgeError;
  return styles.badgeBlue;
}

function WastePage() {
  const [records, setRecords] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [form, setForm] = useState(emptyForm);
  const [source, setSource] = useState("api");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formMessage, setFormMessage] = useState("");

  async function fetchRecords() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/waste-records", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setRecords(fallbackRecords);
        setSource("demo");
        setError("Backend zayi/fire verisi alınamadı. Ekran örnek verilerle gösteriliyor.");
        return;
      }

      const normalized = normalizeRecords(data);

      if (normalized.length === 0) {
        setRecords(fallbackRecords);
        setSource("demo");
        setError("Kayıtlı zayi/fire kaydı bulunamadı. Örnek kayıtlar gösteriliyor.");
        return;
      }

      setRecords(normalized);
      setSource("api");
    } catch {
      setRecords(fallbackRecords);
      setSource("demo");
      setError("Backend bağlantısı kurulamadı. Ekran örnek verilerle gösteriliyor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecords();
  }, []);

  async function handleCreateRecord(event) {
    event.preventDefault();

    if (!form.productName.trim()) {
      setFormMessage("Ürün adı zorunlu.");
      return;
    }

    const newRecord = {
      id: "local-waste-" + Date.now(),
      productName: form.productName.trim(),
      category: form.category.trim() || "Genel",
      department: form.department.trim() || "Belirtilmedi",
      reason: form.reason.trim() || "Sebep girilmedi",
      quantity: Number(form.quantity || 0),
      unit: form.unit.trim() || "adet",
      unitCost: Number(form.unitCost || 0),
      createdBy: form.createdBy.trim() || "Belirtilmedi",
      preventable: Boolean(form.preventable),
      recordDate: new Date().toLocaleDateString("tr-TR"),
    };

    try {
      setSaving(true);
      setFormMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/waste-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(newRecord),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        const savedRecord = data.record || data.wasteRecord || data.data || data || newRecord;
        setRecords((current) => [savedRecord, ...current]);
        setSource("api");
        setFormMessage("Zayi / fire kaydı backend’e kaydedildi.");
      } else {
        setRecords((current) => [newRecord, ...current]);
        setFormMessage("Backend kayıt almadı; kayıt geçici olarak ekranda gösteriliyor.");
      }

      setForm(emptyForm);
    } catch {
      setRecords((current) => [newRecord, ...current]);
      setFormMessage("Backend bağlantısı yok; kayıt geçici olarak ekranda gösteriliyor.");
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  }

  const departments = useMemo(() => {
    return Array.from(new Set(records.map((record) => record.department).filter(Boolean))).sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (selectedDepartment === "ALL") return records;
    return records.filter((record) => record.department === selectedDepartment);
  }, [records, selectedDepartment]);

  const summary = useMemo(() => {
    const totalLoss = records.reduce((sum, record) => sum + getLossAmount(record), 0);
    const preventableLoss = records
      .filter((record) => getPreventable(record))
      .reduce((sum, record) => sum + getLossAmount(record), 0);

    const breakage = records.filter((record) => getType(record) === "BREAKAGE").length;
    const expired = records.filter((record) => getType(record) === "EXPIRED").length;

    return {
      total: records.length,
      totalLoss,
      preventableLoss,
      breakage,
      expired,
    };
  }, [records]);

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>HandsOff Stok Kontrolü</p>
          <h1 style={styles.title}>Zayi / Fire / Kırılma</h1>
          <p style={styles.subtitle}>
            Mutfak, bar, servis ve depo kaynaklı fireleri kayıt altına alın. Ürün miktarı ve birim maliyete göre toplam kayıp otomatik hesaplanır.
          </p>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroLabel}>Toplam Kayıp Tutarı</span>
          <strong style={summary.totalLoss > 0 ? styles.heroValueWarn : styles.heroValueOk}>
            {formatCurrency(summary.totalLoss)}
          </strong>
          <small style={source === "api" ? styles.heroNoteOk : styles.heroNoteWarn}>
            {source === "api" ? "Backend verisi kullanılıyor" : "Örnek veri gösteriliyor"}
          </small>
        </div>
      </section>

      <section style={styles.kpiGrid}>
        <KpiCard title="Toplam Kayıt" value={summary.total} note="Zayi / fire kaydı" />
        <KpiCard title="Önlenebilir Kayıp" value={formatCurrency(summary.preventableLoss)} note="Kontrol edilebilir kayıp tutarı" tone="danger" />
        <KpiCard title="Kırılma" value={summary.breakage} note="Servis / ekipman kırığı" tone="warning" />
        <KpiCard title="SKT / Bozulma" value={summary.expired} note="Son kullanım veya bozulma" tone="danger" />
      </section>

      <section style={styles.createGrid}>
        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Yeni Zayi / Fire Kaydı</h2>
          <p style={styles.panelText}>Ürün, miktar, birim maliyet ve sebep girildiğinde toplam kayıp otomatik hesaplanır.</p>

          <form onSubmit={handleCreateRecord} style={styles.formGrid}>
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
              placeholder="Bölüm: Mutfak / Bar / Servis"
              value={form.department}
              onChange={(event) => setForm({ ...form, department: event.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Sebep: kırılma / bozulma / fire"
              value={form.reason}
              onChange={(event) => setForm({ ...form, reason: event.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Miktar"
              type="number"
              step="0.01"
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
              placeholder="Birim maliyet"
              type="number"
              step="0.01"
              value={form.unitCost}
              onChange={(event) => setForm({ ...form, unitCost: event.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Kaydı giren kişi"
              value={form.createdBy}
              onChange={(event) => setForm({ ...form, createdBy: event.target.value })}
            />

            <label style={styles.checkLine}>
              <input
                type="checkbox"
                checked={form.preventable}
                onChange={(event) => setForm({ ...form, preventable: event.target.checked })}
              />
              Önlenebilir / takip gerektiren kayıp
            </label>

            <div style={styles.previewBox}>
              <span>Bu kaydın hesaplanan kaybı</span>
              <strong>{formatCurrency(Number(form.quantity || 0) * Number(form.unitCost || 0))}</strong>
            </div>

            <button type="submit" style={styles.buttonWide} disabled={saving}>
              {saving ? "Kaydediliyor..." : "Zayi / Fire Kaydı Ekle"}
            </button>
          </form>

          {formMessage ? <div style={styles.infoMessage}>{formMessage}</div> : null}
        </article>

        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Fire Analizi</h2>
          <p style={styles.panelText}>Kayıpları bölüm ve sebebe göre takip etmek maliyeti düşürür.</p>

          <div style={styles.flowList}>
            <FlowItem title="Miktar × Birim Maliyet" text="Her kayıt için toplam kayıp tutarı böyle hesaplanır." />
            <FlowItem title="Önlenebilir Kayıp" text="Hatalı hazırlık, fazla üretim, takip eksikliği gibi kontrol edilebilir kayıplardır." />
            <FlowItem title="Kırılma" text="Servis ekipmanı veya cam ürün kaybı ayrı takip edilir." />
            <FlowItem title="SKT / Bozulma" text="Stok devir hızı ve satın alma planı için kritik uyarıdır." />
          </div>
        </article>
      </section>

      <section style={styles.toolbar}>
        <div>
          <h2 style={styles.panelTitle}>Kayıp Listesi</h2>
          <p style={styles.panelText}>Zayi, fire ve kırılma kayıtlarını bölüme göre filtreleyin.</p>
        </div>

        <div style={styles.actions}>
          <select
            value={selectedDepartment}
            onChange={(event) => setSelectedDepartment(event.target.value)}
            style={styles.select}
          >
            <option value="ALL">Tüm Bölümler</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <button type="button" onClick={fetchRecords} style={styles.button}>
            Yenile
          </button>
        </div>
      </section>

      {loading ? (
        <section style={styles.stateBox}>Zayi / fire kayıtları yükleniyor...</section>
      ) : (
        <>
          {error ? <section style={styles.warningBox}>{error}</section> : null}

          <section style={styles.grid}>
            {filteredRecords.map((record) => {
              const type = getType(record);

              return (
                <article key={record.id || record.productName} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div>
                      <h3 style={styles.cardTitle}>{record.productName || record.name || "Ürün"}</h3>
                      <p style={styles.cardText}>
                        {record.category || "Kategori yok"} · {record.department || "Bölüm yok"}
                      </p>
                    </div>

                    <span style={{ ...styles.badge, ...getTypeStyle(type) }}>
                      {getTypeLabel(type)}
                    </span>
                  </div>

                  <div style={styles.lossBox}>
                    <span>Kayıp Tutarı</span>
                    <strong>{formatCurrency(getLossAmount(record))}</strong>
                  </div>

                  <div style={styles.metaGrid}>
                    <div style={styles.metaBox}>
                      <span>Miktar</span>
                      <strong>
                        {getQuantity(record)} {record.unit || "adet"}
                      </strong>
                    </div>

                    <div style={styles.metaBox}>
                      <span>Birim Maliyet</span>
                      <strong>{formatCurrency(getUnitCost(record))}</strong>
                    </div>

                    <div style={styles.metaBox}>
                      <span>Sebep</span>
                      <strong>{record.reason || "Sebep yok"}</strong>
                    </div>

                    <div style={styles.metaBox}>
                      <span>Kayıt</span>
                      <strong>{record.createdBy || record.owner || "Belirtilmedi"}</strong>
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
      "radial-gradient(circle at top left, #7f1d1d 0, transparent 34%), linear-gradient(135deg, #0f172a 0%, #111827 48%, #020617 100%)",
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
    color: "#fecaca",
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
    maxWidth: "820px",
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
    fontSize: "34px",
    color: "#bbf7d0",
  },
  heroValueWarn: {
    display: "block",
    fontSize: "34px",
    color: "#fecaca",
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
    fontSize: "28px",
    color: "#ffffff",
  },
  kpiValueDanger: {
    display: "block",
    fontSize: "28px",
    color: "#fecaca",
  },
  kpiValueWarn: {
    display: "block",
    fontSize: "28px",
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
  checkLine: {
    gridColumn: "1 / -1",
    display: "flex",
    gap: "10px",
    alignItems: "center",
    padding: "12px",
    borderRadius: "14px",
    background: "rgba(15,23,42,0.55)",
    color: "#cbd5e1",
  },
  previewBox: {
    gridColumn: "1 / -1",
    display: "grid",
    gap: "6px",
    padding: "14px",
    borderRadius: "16px",
    background: "rgba(239,68,68,0.14)",
    color: "#fecaca",
  },
  buttonWide: {
    gridColumn: "1 / -1",
    height: "44px",
    border: 0,
    borderRadius: "14px",
    padding: "0 16px",
    background: "linear-gradient(135deg, #ef4444, #f97316)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },
  infoMessage: {
    marginTop: "12px",
    padding: "12px",
    borderRadius: "14px",
    color: "#fecaca",
    background: "rgba(239,68,68,0.14)",
    border: "1px solid rgba(239,68,68,0.2)",
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
    background: "linear-gradient(135deg, #ef4444, #f97316)",
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
  lossBox: {
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

export default WastePage;
