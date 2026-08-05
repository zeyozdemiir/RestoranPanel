import { useMemo, useState } from "react";

const categories = [
  "Tedarikçi",
  "Kira",
  "Personel Maaşı",
  "Vergi",
  "SGK",
  "Fatura",
  "Kredi / Finansman",
  "Bakım / Hizmet",
  "Diğer",
];

const initialDebts = [
  {
    id: "1",
    title: "Aylık kira",
    category: "Kira",
    creditor: "Mülk sahibi",
    amount: 185000,
    paid: 0,
    dueDate: "2026-07-30",
    priority: "HIGH",
    note: "Ay sonu kira ödemesi",
  },
  {
    id: "2",
    title: "Personel maaşları",
    category: "Personel Maaşı",
    creditor: "Personel",
    amount: 420000,
    paid: 120000,
    dueDate: "2026-08-01",
    priority: "HIGH",
    note: "Kalan maaş ödemesi",
  },
  {
    id: "3",
    title: "KDV / vergi ödemesi",
    category: "Vergi",
    creditor: "Vergi Dairesi",
    amount: 96000,
    paid: 0,
    dueDate: "2026-07-26",
    priority: "HIGH",
    note: "Vergi ödeme planına alınmalı",
  },
  {
    id: "4",
    title: "SGK primi",
    category: "SGK",
    creditor: "SGK",
    amount: 74000,
    paid: 0,
    dueDate: "2026-07-31",
    priority: "HIGH",
    note: "Personel SGK ödemesi",
  },
  {
    id: "5",
    title: "Et tedarikçi cari borcu",
    category: "Tedarikçi",
    creditor: "Et ve Şarküteri Tedarikçisi",
    amount: 42800,
    paid: 10000,
    dueDate: "2026-07-24",
    priority: "MEDIUM",
    note: "Tedarikçi borcu sadece bir kategori olarak takip edilir",
  },
  {
    id: "6",
    title: "Elektrik faturası",
    category: "Fatura",
    creditor: "Elektrik Dağıtım",
    amount: 38500,
    paid: 0,
    dueDate: "2026-07-25",
    priority: "MEDIUM",
    note: "İşletme elektrik faturası",
  },
];

const emptyDebt = {
  title: "",
  category: "Tedarikçi",
  creditor: "",
  amount: "",
  paid: "",
  dueDate: "",
  priority: "MEDIUM",
  note: "",
};

const emptyPayment = {
  debtId: "",
  amount: "",
};

function money(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function remaining(debt) {
  return Math.max(Number(debt.amount || 0) - Number(debt.paid || 0), 0);
}

function debtStatus(debt) {
  if (remaining(debt) <= 0) return "PAID";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = debt.dueDate ? new Date(debt.dueDate) : null;

  if (due && due < today) return "OVERDUE";
  if (Number(debt.paid || 0) > 0) return "PARTIAL";

  return "OPEN";
}

function statusLabel(status) {
  if (status === "PAID") return "Ödendi";
  if (status === "PARTIAL") return "Kısmi Ödendi";
  if (status === "OVERDUE") return "Gecikti";
  return "Açık";
}

function statusStyle(status) {
  if (status === "PAID") return styles.okBadge;
  if (status === "PARTIAL") return styles.blueBadge;
  if (status === "OVERDUE") return styles.redBadge;
  return styles.yellowBadge;
}

function priorityLabel(priority) {
  if (priority === "HIGH") return "Yüksek";
  if (priority === "LOW") return "Düşük";
  return "Orta";
}

function CommercialDebtsPage() {
  const saved = (() => {
    try {
      const raw = localStorage.getItem("handsoff_commercial_debts_v3");
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) && parsed.length ? parsed : initialDebts;
    } catch {
      return initialDebts;
    }
  })();

  const [debts, setDebts] = useState(saved);
  const [debtForm, setDebtForm] = useState(emptyDebt);
  const [paymentForm, setPaymentForm] = useState(emptyPayment);
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [message, setMessage] = useState("");

  function save(nextDebts) {
    setDebts(nextDebts);
    localStorage.setItem("handsoff_commercial_debts_v3", JSON.stringify(nextDebts));
  }

  function addDebt(event) {
    event.preventDefault();

    if (!debtForm.title.trim()) {
      setMessage("Borç başlığı zorunlu.");
      return;
    }

    if (!Number(debtForm.amount || 0)) {
      setMessage("Borç tutarı zorunlu.");
      return;
    }

    const newDebt = {
      id: String(Date.now()),
      title: debtForm.title.trim(),
      category: debtForm.category,
      creditor: debtForm.creditor.trim() || "Belirtilmedi",
      amount: Number(debtForm.amount || 0),
      paid: Number(debtForm.paid || 0),
      dueDate: debtForm.dueDate,
      priority: debtForm.priority,
      note: debtForm.note.trim() || "Not yok",
    };

    save([newDebt, ...debts]);
    setDebtForm(emptyDebt);
    setMessage("Ticari borç eklendi.");
  }

  function addPayment(event) {
    event.preventDefault();

    if (!paymentForm.debtId) {
      setMessage("Ödeme için borç seç.");
      return;
    }

    if (!Number(paymentForm.amount || 0)) {
      setMessage("Ödeme tutarı gir.");
      return;
    }

    const nextDebts = debts.map((debt) => {
      if (debt.id !== paymentForm.debtId) return debt;

      return {
        ...debt,
        paid: Number(debt.paid || 0) + Number(paymentForm.amount || 0),
      };
    });

    save(nextDebts);
    setPaymentForm(emptyPayment);
    setMessage("Ödeme işlendi ve kalan borç güncellendi.");
  }

  const filteredDebts = useMemo(() => {
    return debts.filter((debt) => {
      const categoryOk = category === "ALL" || debt.category === category;
      const statusOk = status === "ALL" || debtStatus(debt) === status;
      return categoryOk && statusOk;
    });
  }, [debts, category, status]);

  const summary = useMemo(() => {
    const total = debts.reduce((sum, debt) => sum + Number(debt.amount || 0), 0);
    const paid = debts.reduce((sum, debt) => sum + Number(debt.paid || 0), 0);
    const left = debts.reduce((sum, debt) => sum + remaining(debt), 0);
    const overdue = debts.filter((debt) => debtStatus(debt) === "OVERDUE").length;
    const high = debts.filter((debt) => debt.priority === "HIGH" && debtStatus(debt) !== "PAID").length;

    const grouped = categories
      .map((item) => {
        const amount = debts
          .filter((debt) => debt.category === item)
          .reduce((sum, debt) => sum + remaining(debt), 0);

        return { category: item, amount };
      })
      .filter((item) => item.amount > 0);

    return { total, paid, left, overdue, high, grouped };
  }, [debts]);

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>HandsOff Finans Kontrolü</p>
          <h1 style={styles.title}>Ticari Borçlar</h1>
          <p style={styles.subtitle}>
            Kira, personel maaşı, vergi, SGK, tedarikçi borcu, kredi, fatura ve diğer işletme borçlarını tek ödeme planında takip edin.
          </p>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroLabel}>Toplam Kalan Borç</span>
          <strong style={styles.heroValue}>{money(summary.left)}</strong>
          <small style={styles.heroNote}>Bu ekran tedarikçi cari değil, genel ticari borç ekranıdır</small>
        </div>
      </section>

      <section style={styles.kpis}>
        <Kpi title="Toplam Borç" value={money(summary.total)} note="Tüm borç kayıtları" />
        <Kpi title="Ödenen" value={money(summary.paid)} note="İşlenen ödemeler" />
        <Kpi title="Kalan" value={money(summary.left)} note="Açık borç bakiyesi" danger />
        <Kpi title="Geciken / Kritik" value={`${summary.overdue} / ${summary.high}`} note="Vadesi geçen ve yüksek öncelik" danger />
      </section>

      <section style={styles.forms}>
        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Yeni Ticari Borç Ekle</h2>
          <p style={styles.panelText}>Kira, maaş, vergi, SGK, tedarikçi, kredi veya fatura borcu ekle.</p>

          <form onSubmit={addDebt} style={styles.form}>
            <input style={styles.input} placeholder="Borç başlığı" value={debtForm.title} onChange={(e) => setDebtForm({ ...debtForm, title: e.target.value })} />

            <select style={styles.input} value={debtForm.category} onChange={(e) => setDebtForm({ ...debtForm, category: e.target.value })}>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>

            <input style={styles.input} placeholder="Alacaklı / kurum / kişi" value={debtForm.creditor} onChange={(e) => setDebtForm({ ...debtForm, creditor: e.target.value })} />
            <input style={styles.input} type="number" placeholder="Toplam borç tutarı" value={debtForm.amount} onChange={(e) => setDebtForm({ ...debtForm, amount: e.target.value })} />
            <input style={styles.input} type="number" placeholder="Varsa ödenen tutar" value={debtForm.paid} onChange={(e) => setDebtForm({ ...debtForm, paid: e.target.value })} />
            <input style={styles.input} type="date" value={debtForm.dueDate} onChange={(e) => setDebtForm({ ...debtForm, dueDate: e.target.value })} />

            <select style={styles.input} value={debtForm.priority} onChange={(e) => setDebtForm({ ...debtForm, priority: e.target.value })}>
              <option value="HIGH">Yüksek Öncelik</option>
              <option value="MEDIUM">Orta Öncelik</option>
              <option value="LOW">Düşük Öncelik</option>
            </select>

            <input style={styles.input} placeholder="Not" value={debtForm.note} onChange={(e) => setDebtForm({ ...debtForm, note: e.target.value })} />

            <button style={styles.mainButton}>Borç Ekle</button>
          </form>

          {message ? <div style={styles.message}>{message}</div> : null}
        </article>

        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Borç Ödemesi Gir</h2>
          <p style={styles.panelText}>Seçili borca ödeme işlenince kalan bakiye otomatik düşer.</p>

          <form onSubmit={addPayment} style={styles.form}>
            <select style={styles.input} value={paymentForm.debtId} onChange={(e) => setPaymentForm({ ...paymentForm, debtId: e.target.value })}>
              <option value="">Borç seç</option>
              {debts.filter((debt) => debtStatus(debt) !== "PAID").map((debt) => (
                <option key={debt.id} value={debt.id}>
                  {debt.title} · {money(remaining(debt))}
                </option>
              ))}
            </select>

            <input style={styles.input} type="number" placeholder="Ödeme tutarı" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} />

            <button style={styles.mainButton}>Ödemeyi İşle</button>
          </form>

          <div style={styles.categoryBox}>
            <h3 style={styles.smallTitle}>Kategoriye Göre Kalan Borç</h3>

            {summary.grouped.map((item) => (
              <div key={item.category} style={styles.categoryRow}>
                <span>{item.category}</span>
                <strong>{money(item.amount)}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section style={styles.toolbar}>
        <div>
          <h2 style={styles.panelTitle}>Borç Listesi</h2>
          <p style={styles.panelText}>Kategori ve duruma göre filtrele.</p>
        </div>

        <div style={styles.filters}>
          <select style={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="ALL">Tüm Kategoriler</option>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>

          <select style={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">Tüm Durumlar</option>
            <option value="OPEN">Açık</option>
            <option value="PARTIAL">Kısmi Ödendi</option>
            <option value="OVERDUE">Gecikti</option>
            <option value="PAID">Ödendi</option>
          </select>
        </div>
      </section>

      <section style={styles.grid}>
        {filteredDebts.map((debt) => {
          const currentStatus = debtStatus(debt);

          return (
            <article key={debt.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <h3 style={styles.cardTitle}>{debt.title}</h3>
                  <p style={styles.cardText}>{debt.category} · {debt.creditor}</p>
                </div>

                <span style={{ ...styles.badge, ...statusStyle(currentStatus) }}>
                  {statusLabel(currentStatus)}
                </span>
              </div>

              <div style={styles.amountBox}>
                <span>Kalan Borç</span>
                <strong>{money(remaining(debt))}</strong>
              </div>

              <div style={styles.meta}>
                <Meta label="Toplam" value={money(debt.amount)} />
                <Meta label="Ödenen" value={money(debt.paid)} />
                <Meta label="Vade" value={debt.dueDate || "Tarih yok"} />
                <Meta label="Öncelik" value={priorityLabel(debt.priority)} />
              </div>

              <p style={styles.note}>{debt.note}</p>
            </article>
          );
        })}
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
    background: "radial-gradient(circle at top left, #7c2d12 0, transparent 34%), linear-gradient(135deg, #0f172a 0%, #111827 48%, #020617 100%)",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: 20,
    marginBottom: 20,
  },
  eyebrow: {
    margin: 0,
    color: "#fed7aa",
    fontSize: 12,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    fontWeight: 900,
  },
  title: {
    margin: "8px 0",
    fontSize: 42,
  },
  subtitle: {
    margin: 0,
    color: "#cbd5e1",
    maxWidth: 850,
    lineHeight: 1.6,
  },
  heroCard: {
    padding: 22,
    borderRadius: 24,
    background: "rgba(255,255,255,0.09)",
    border: "1px solid rgba(255,255,255,0.13)",
  },
  heroLabel: {
    display: "block",
    color: "#cbd5e1",
    marginBottom: 10,
  },
  heroValue: {
    display: "block",
    fontSize: 34,
    color: "#fde68a",
  },
  heroNote: {
    display: "inline-block",
    marginTop: 10,
    padding: "6px 10px",
    borderRadius: 999,
    color: "#fed7aa",
    background: "rgba(249,115,22,0.18)",
  },
  kpis: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 18,
  },
  kpi: {
    display: "grid",
    gap: 8,
    padding: 18,
    borderRadius: 20,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  kpiValue: {
    fontSize: 26,
    color: "#fff",
  },
  kpiDanger: {
    fontSize: 26,
    color: "#fecaca",
  },
  forms: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 16,
  },
  panel: {
    padding: 20,
    borderRadius: 24,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  panelTitle: {
    margin: 0,
    fontSize: 21,
  },
  panelText: {
    margin: "6px 0 14px",
    color: "#94a3b8",
    fontSize: 13,
  },
  form: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  input: {
    height: 42,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "#0f172a",
    color: "#f8fafc",
    padding: "0 12px",
    outline: "none",
  },
  mainButton: {
    gridColumn: "1 / -1",
    height: 44,
    border: 0,
    borderRadius: 14,
    color: "#fff",
    background: "linear-gradient(135deg, #f97316, #dc2626)",
    fontWeight: 900,
    cursor: "pointer",
  },
  message: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    background: "rgba(249,115,22,0.14)",
    color: "#fed7aa",
  },
  categoryBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    background: "rgba(15,23,42,0.45)",
  },
  smallTitle: {
    margin: "0 0 12px",
  },
  categoryRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    marginBottom: 8,
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    padding: 20,
    borderRadius: 24,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    marginBottom: 16,
  },
  filters: {
    display: "flex",
    gap: 10,
  },
  select: {
    height: 42,
    minWidth: 180,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "#0f172a",
    color: "#f8fafc",
    padding: "0 12px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: 24,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 16,
  },
  cardTitle: {
    margin: 0,
    fontSize: 20,
  },
  cardText: {
    margin: "7px 0 0",
    color: "#cbd5e1",
    fontSize: 13,
  },
  amountBox: {
    display: "grid",
    gap: 6,
    padding: 16,
    borderRadius: 18,
    background: "rgba(15,23,42,0.55)",
    marginBottom: 14,
  },
  meta: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  metaBox: {
    display: "grid",
    gap: 6,
    padding: 14,
    borderRadius: 16,
    background: "rgba(15,23,42,0.45)",
  },
  note: {
    margin: "12px 0 0",
    color: "#cbd5e1",
    background: "rgba(15,23,42,0.38)",
    padding: 12,
    borderRadius: 14,
  },
  badge: {
    height: "fit-content",
    padding: "7px 11px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
  },
  okBadge: {
    color: "#bbf7d0",
    background: "rgba(34,197,94,0.16)",
  },
  blueBadge: {
    color: "#bfdbfe",
    background: "rgba(59,130,246,0.18)",
  },
  yellowBadge: {
    color: "#fde68a",
    background: "rgba(245,158,11,0.18)",
  },
  redBadge: {
    color: "#fecaca",
    background: "rgba(239,68,68,0.18)",
  },
};

export default CommercialDebtsPage;
