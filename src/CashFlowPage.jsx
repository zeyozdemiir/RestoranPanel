import { useMemo, useState } from "react";

const initialMovements = [
  { id: "1", type: "INCOME", title: "Günlük nakit satış", category: "Satış", method: "Nakit", amount: 68500, date: "2026-07-18", note: "Kasa girişi" },
  { id: "2", type: "INCOME", title: "Kredi kartı satış", category: "Satış", method: "Kredi Kartı", amount: 142000, date: "2026-07-18", note: "POS tahsilatı" },
  { id: "3", type: "OUTCOME", title: "Sebze meyve ödemesi", category: "Tedarikçi", method: "Nakit", amount: 18500, date: "2026-07-18", note: "Günlük tedarik ödemesi" },
  { id: "4", type: "OUTCOME", title: "Personel avansı", category: "Personel", method: "Nakit", amount: 12000, date: "2026-07-18", note: "Personel avans çıkışı" },
  { id: "5", type: "OUTCOME", title: "Elektrik faturası", category: "Fatura", method: "Banka", amount: 38500, date: "2026-07-19", note: "Planlı ödeme" },
];

const emptyForm = {
  type: "INCOME",
  title: "",
  category: "Satış",
  method: "Nakit",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  note: "",
};

const categories = ["Satış", "Tedarikçi", "Personel", "Kira", "Vergi", "SGK", "Fatura", "Kredi / Finansman", "Diğer"];
const methods = ["Nakit", "Banka", "Kredi Kartı", "Yemek Kartı", "Online"];

function money(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function CashFlowPage() {
  const saved = (() => {
    try {
      const raw = localStorage.getItem("handsoff_cash_flow_v2");
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) && parsed.length ? parsed : initialMovements;
    } catch {
      return initialMovements;
    }
  })();

  const [movements, setMovements] = useState(saved);
  const [form, setForm] = useState(emptyForm);
  const [openingCash, setOpeningCash] = useState(Number(localStorage.getItem("handsoff_opening_cash_v2") || 0));
  const [filter, setFilter] = useState("ALL");
  const [message, setMessage] = useState("");

  function save(next) {
    setMovements(next);
    localStorage.setItem("handsoff_cash_flow_v2", JSON.stringify(next));
  }

  function addMovement(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setMessage("Başlık zorunlu.");
      return;
    }

    if (!Number(form.amount || 0)) {
      setMessage("Tutar zorunlu.");
      return;
    }

    const movement = {
      id: String(Date.now()),
      type: form.type,
      title: form.title.trim(),
      category: form.category,
      method: form.method,
      amount: Number(form.amount || 0),
      date: form.date,
      note: form.note.trim() || "Not yok",
    };

    save([movement, ...movements]);
    setForm(emptyForm);
    setMessage("Nakit hareketi eklendi.");
  }

  function updateOpeningCash(value) {
    setOpeningCash(Number(value || 0));
    localStorage.setItem("handsoff_opening_cash_v2", String(Number(value || 0)));
  }

  const filtered = filter === "ALL" ? movements : movements.filter((item) => item.type === filter);

  const summary = useMemo(() => {
    const income = movements
      .filter((item) => item.type === "INCOME")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const outcome = movements
      .filter((item) => item.type === "OUTCOME")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const net = income - outcome;
    const closing = Number(openingCash || 0) + net;

    const byMethod = methods
      .map((method) => {
        const amount = movements
          .filter((item) => item.method === method)
          .reduce((sum, item) => {
            return item.type === "INCOME"
              ? sum + Number(item.amount || 0)
              : sum - Number(item.amount || 0);
          }, 0);

        return { method, amount };
      })
      .filter((item) => item.amount !== 0);

    return { income, outcome, net, closing, byMethod };
  }, [movements, openingCash]);

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>HandsOff Finans Kontrolü</p>
          <h1 style={styles.title}>Nakit Akışı</h1>
          <p style={styles.subtitle}>
            Günlük para girişlerini, ödeme çıkışlarını, kasa-banka hareketlerini ve kapanış nakit durumunu tek ekrandan takip edin.
          </p>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroLabel}>Kapanış Nakit Durumu</span>
          <strong style={summary.closing >= 0 ? styles.heroValueOk : styles.heroValueDanger}>
            {money(summary.closing)}
          </strong>
          <small style={styles.heroNote}>Bu gerçek Nakit Akışı ekranıdır</small>
        </div>
      </section>

      <section style={styles.kpis}>
        <Kpi title="Toplam Giriş" value={money(summary.income)} note="Satış ve tahsilatlar" />
        <Kpi title="Toplam Çıkış" value={money(summary.outcome)} note="Ödemeler ve giderler" danger />
        <Kpi title="Net Akış" value={money(summary.net)} note="Giriş - çıkış farkı" danger={summary.net < 0} />
        <Kpi title="Açılış Kasa" value={money(openingCash)} note="Günün başlangıç nakdi" />
      </section>

      <section style={styles.forms}>
        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Yeni Nakit Hareketi</h2>
          <p style={styles.panelText}>Satış, tahsilat, tedarikçi ödemesi, kira, vergi, SGK veya fatura çıkışı ekle.</p>

          <form onSubmit={addMovement} style={styles.form}>
            <select style={styles.input} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="INCOME">Para Girişi</option>
              <option value="OUTCOME">Para Çıkışı</option>
            </select>

            <input style={styles.input} placeholder="Başlık" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

            <select style={styles.input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>

            <select style={styles.input} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
              {methods.map((item) => <option key={item}>{item}</option>)}
            </select>

            <input style={styles.input} type="number" placeholder="Tutar" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <input style={styles.input} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />

            <input style={styles.inputWide} placeholder="Not" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />

            <button style={styles.mainButton}>Hareketi Kaydet</button>
          </form>

          {message ? <div style={styles.message}>{message}</div> : null}
        </article>

        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Kasa Açılışı ve Kanal Dağılımı</h2>
          <p style={styles.panelText}>Açılış kasa tutarı net nakit hesabına dahil edilir.</p>

          <label style={styles.label}>Açılış kasa tutarı</label>
          <input style={styles.inputFull} type="number" value={openingCash} onChange={(e) => updateOpeningCash(e.target.value)} />

          <div style={styles.channelList}>
            {summary.byMethod.map((item) => (
              <div key={item.method} style={styles.channelRow}>
                <span>{item.method}</span>
                <strong style={item.amount >= 0 ? styles.greenText : styles.redText}>{money(item.amount)}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section style={styles.toolbar}>
        <div>
          <h2 style={styles.panelTitle}>Nakit Hareketleri</h2>
          <p style={styles.panelText}>Giriş ve çıkışları filtrele.</p>
        </div>

        <select style={styles.select} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="ALL">Tüm Hareketler</option>
          <option value="INCOME">Para Girişi</option>
          <option value="OUTCOME">Para Çıkışı</option>
        </select>
      </section>

      <section style={styles.grid}>
        {filtered.map((item) => (
          <article key={item.id} style={styles.card}>
            <div style={styles.cardTop}>
              <div>
                <h3 style={styles.cardTitle}>{item.title}</h3>
                <p style={styles.cardText}>{item.category} · {item.method}</p>
              </div>

              <span style={{ ...styles.badge, ...(item.type === "INCOME" ? styles.okBadge : styles.redBadge) }}>
                {item.type === "INCOME" ? "Giriş" : "Çıkış"}
              </span>
            </div>

            <div style={styles.amountBox}>
              <span>{item.type === "INCOME" ? "Giriş Tutarı" : "Çıkış Tutarı"}</span>
              <strong style={item.type === "INCOME" ? styles.greenAmount : styles.redAmount}>
                {item.type === "INCOME" ? "+" : "-"}{money(item.amount)}
              </strong>
            </div>

            <div style={styles.meta}>
              <Meta label="Tarih" value={item.date} />
              <Meta label="Not" value={item.note} />
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function Kpi({ title, value, note, danger }) {
  return (
    <article style={styles.kpi}>
      <span>{title}</span>
      <strong style={danger ? styles.kpiDanger : styles.kpiValue}>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function Meta({ label, value }) {
  return (
    <div style={styles.metaBox}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: 28,
    color: "#f8fafc",
    background: "radial-gradient(circle at top left, #064e3b 0, transparent 34%), linear-gradient(135deg, #0f172a 0%, #111827 48%, #020617 100%)",
  },
  hero: { display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, marginBottom: 20 },
  eyebrow: { margin: 0, color: "#a7f3d0", fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 900 },
  title: { margin: "8px 0", fontSize: 42 },
  subtitle: { margin: 0, color: "#cbd5e1", maxWidth: 850, lineHeight: 1.6 },
  heroCard: { padding: 22, borderRadius: 24, background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.13)" },
  heroLabel: { display: "block", color: "#cbd5e1", marginBottom: 10 },
  heroValueOk: { display: "block", fontSize: 34, color: "#bbf7d0" },
  heroValueDanger: { display: "block", fontSize: 34, color: "#fecaca" },
  heroNote: { display: "inline-block", marginTop: 10, padding: "6px 10px", borderRadius: 999, color: "#bbf7d0", background: "rgba(34,197,94,0.16)" },
  kpis: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 18 },
  kpi: { display: "grid", gap: 8, padding: 18, borderRadius: 20, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" },
  kpiValue: { fontSize: 26, color: "#fff" },
  kpiDanger: { fontSize: 26, color: "#fecaca" },
  forms: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },
  panel: { padding: 20, borderRadius: 24, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" },
  panelTitle: { margin: 0, fontSize: 21 },
  panelText: { margin: "6px 0 14px", color: "#94a3b8", fontSize: 13 },
  form: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  input: { height: 42, borderRadius: 14, border: "1px solid rgba(255,255,255,0.14)", background: "#0f172a", color: "#f8fafc", padding: "0 12px", outline: "none" },
  inputWide: { gridColumn: "1 / -1", height: 42, borderRadius: 14, border: "1px solid rgba(255,255,255,0.14)", background: "#0f172a", color: "#f8fafc", padding: "0 12px", outline: "none" },
  inputFull: { width: "100%", height: 42, borderRadius: 14, border: "1px solid rgba(255,255,255,0.14)", background: "#0f172a", color: "#f8fafc", padding: "0 12px", outline: "none", boxSizing: "border-box" },
  label: { display: "block", color: "#cbd5e1", fontSize: 12, fontWeight: 800, marginBottom: 8 },
  mainButton: { gridColumn: "1 / -1", height: 44, border: 0, borderRadius: 14, color: "#fff", background: "linear-gradient(135deg, #10b981, #14b8a6)", fontWeight: 900, cursor: "pointer" },
  message: { marginTop: 12, padding: 12, borderRadius: 14, background: "rgba(16,185,129,0.14)", color: "#a7f3d0" },
  channelList: { display: "grid", gap: 10, marginTop: 16 },
  channelRow: { display: "flex", justifyContent: "space-between", padding: 12, borderRadius: 14, background: "rgba(15,23,42,0.48)" },
  greenText: { color: "#bbf7d0" },
  redText: { color: "#fecaca" },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 20, borderRadius: 24, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: 16 },
  select: { height: 42, minWidth: 190, borderRadius: 14, border: "1px solid rgba(255,255,255,0.14)", background: "#0f172a", color: "#f8fafc", padding: "0 12px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 },
  card: { padding: 20, borderRadius: 24, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" },
  cardTop: { display: "flex", justifyContent: "space-between", gap: 14, marginBottom: 16 },
  cardTitle: { margin: 0, fontSize: 20 },
  cardText: { margin: "7px 0 0", color: "#cbd5e1", fontSize: 13 },
  amountBox: { display: "grid", gap: 6, padding: 16, borderRadius: 18, background: "rgba(15,23,42,0.55)", marginBottom: 14 },
  greenAmount: { color: "#bbf7d0", fontSize: 26 },
  redAmount: { color: "#fecaca", fontSize: 26 },
  meta: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  metaBox: { display: "grid", gap: 6, padding: 14, borderRadius: 16, background: "rgba(15,23,42,0.45)" },
  badge: { height: "fit-content", padding: "7px 11px", borderRadius: 999, fontSize: 12, fontWeight: 900 },
  okBadge: { color: "#bbf7d0", background: "rgba(34,197,94,0.16)" },
  redBadge: { color: "#fecaca", background: "rgba(239,68,68,0.18)" },
};

export default CashFlowPage;
