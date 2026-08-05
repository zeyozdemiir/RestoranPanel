import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "./apiConfig";

const STORAGE_KEY = "handsoff_commercial_debts";

const fallbackDebts = [
  {
    id: "debt-1",
    title: "Aylık kira",
    category: "Kira",
    creditor: "Mülk Sahibi",
    totalAmount: 185000,
    paidAmount: 0,
    dueDate: "2026-07-30",
    priority: "HIGH",
    status: "OPEN",
    note: "Ay sonu kira ödemesi",
  },
  {
    id: "debt-2",
    title: "Personel maaşları",
    category: "Personel Maaşı",
    creditor: "Personel",
    totalAmount: 420000,
    paidAmount: 120000,
    dueDate: "2026-08-01",
    priority: "HIGH",
    status: "PARTIAL",
    note: "Kalan maaş ödemesi takip edilecek",
  },
  {
    id: "debt-3",
    title: "KDV / vergi ödemesi",
    category: "Vergi",
    creditor: "Vergi Dairesi",
    totalAmount: 96000,
    paidAmount: 0,
    dueDate: "2026-07-26",
    priority: "HIGH",
    status: "OPEN",
    note: "Vergi ödeme planına alınmalı",
  },
  {
    id: "debt-4",
    title: "SGK primi",
    category: "SGK",
    creditor: "SGK",
    totalAmount: 74000,
    paidAmount: 0,
    dueDate: "2026-07-31",
    priority: "HIGH",
    status: "OPEN",
    note: "Personel sigorta primi",
  },
  {
    id: "debt-5",
    title: "Et ve şarküteri cari borcu",
    category: "Tedarikçi",
    creditor: "Et ve Şarküteri Tedarikçisi",
    totalAmount: 42800,
    paidAmount: 10000,
    dueDate: "2026-07-24",
    priority: "MEDIUM",
    status: "PARTIAL",
    note: "Tedarikçi açık hesap",
  },
  {
    id: "debt-6",
    title: "Elektrik faturası",
    category: "Fatura",
    creditor: "Elektrik Dağıtım",
    totalAmount: 38500,
    paidAmount: 0,
    dueDate: "2026-07-25",
    priority: "MEDIUM",
    status: "OPEN",
    note: "İşletme elektrik faturası",
  },
];

const emptyDebt = {
  title: "",
  category: "Tedarikçi",
  creditor: "",
  totalAmount: "",
  paidAmount: "",
  dueDate: "",
  priority: "MEDIUM",
  note: "",
};

const emptyPayment = {
  debtId: "",
  amount: "",
  method: "Nakit",
  note: "",
};

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

function formatDate(value) {
  if (!value) return "Tarih yok";

  try {
    return new Date(value).toLocaleDateString("tr-TR");
  } catch {
    return value;
  }
}

function normalizeDebts(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.debts)) return data.debts;
  if (Array.isArray(data?.commercialDebts)) return data.commercialDebts;
  if (Array.isArray(data?.payables)) return data.payables;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getTotalAmount(debt) {
  return Number(debt.totalAmount ?? debt.amount ?? debt.debtAmount ?? 0);
}

function getPaidAmount(debt) {
  return Number(debt.paidAmount ?? debt.paid ?? 0);
}

function getRemainingAmount(debt) {
  return Math.max(getTotalAmount(debt) - getPaidAmount(debt), 0);
}

function getDebtStatus(debt) {
  if (debt.status === "PAID") return "PAID";

  const total = getTotalAmount(debt);
  const paid = getPaidAmount(debt);
  const remaining = getRemainingAmount(debt);

  if (remaining <= 0 && total > 0) return "PAID";
  if (paid > 0 && remaining > 0) return "PARTIAL";

  const due = debt.dueDate ? new Date(debt.dueDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (due && due < today) return "OVERDUE";

  return "OPEN";
}

function getStatusLabel(status) {
  if (status === "PAID") return "Ödendi";
  if (status === "PARTIAL") return "Kısmi Ödendi";
  if (status === "OVERDUE") return "Gecikti";
  if (status === "OPEN") return "Açık";
  return "Durum Yok";
}

function getStatusStyle(status) {
  if (status === "PAID") return styles.badgeOk;
  if (status === "PARTIAL") return styles.badgeBlue;
  if (status === "OVERDUE") return styles.badgeError;
  return styles.badgeWarn;
}

function getPriorityLabel(priority) {
  return priorityLabels[priority] || priority || "Öncelik Yok";
}

function getPriorityStyle(priority) {
  if (priority === "HIGH") return styles.priorityHigh;
  if (priority === "LOW") return styles.priorityLow;
  return styles.priorityMedium;
}

function CommercialDebtsPage() {
  const [debts, setDebts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [debtForm, setDebtForm] = useState(emptyDebt);
  const [paymentForm, setPaymentForm] = useState(emptyPayment);
  const [source, setSource] = useState("api");
  const [loading, setLoading] = useState(true);
  const [savingDebt, setSavingDebt] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function fetchDebts() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/commercial-debts", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        loadLocalOrFallback("Backend ticari borç verisi alınamadı. Ekran yerel/örnek verilerle gösteriliyor.");
        return;
      }

      const normalized = normalizeDebts(data);

      if (normalized.length === 0) {
        loadLocalOrFallback("Kayıtlı ticari borç bulunamadı. Örnek ödeme planı gösteriliyor.");
        return;
      }

      setDebts(normalized);
      setSource("api");
    } catch {
      loadLocalOrFallback("Backend bağlantısı kurulamadı. Ekran yerel/örnek verilerle gösteriliyor.");
    } finally {
      setLoading(false);
    }
  }

  function loadLocalOrFallback(errorMessage) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed) && parsed.length > 0) {
          setDebts(parsed);
          setSource("local");
          setError(errorMessage);
          return;
        }
      }
    } catch {
      // local kayıt okunamazsa örnek veri kullanılır
    }

    setDebts(fallbackDebts);
    setSource("demo");
    setError(errorMessage);
  }

  useEffect(() => {
    fetchDebts();
  }, []);

  useEffect(() => {
    if (debts.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(debts));
    }
  }, [debts]);

  async function handleCreateDebt(event) {
    event.preventDefault();

    if (!debtForm.title.trim()) {
      setMessage("Borç başlığı zorunlu.");
      return;
    }

    if (!Number(debtForm.totalAmount || 0)) {
      setMessage("Borç tutarı zorunlu.");
      return;
    }

    const newDebt = {
      id: "debt-" + Date.now(),
      title: debtForm.title.trim(),
      category: debtForm.category,
      creditor: debtForm.creditor.trim() || "Belirtilmedi",
      totalAmount: Number(debtForm.totalAmount || 0),
      paidAmount: Number(debtForm.paidAmount || 0),
      dueDate: debtForm.dueDate,
      priority: debtForm.priority,
      status: "OPEN",
      note: debtForm.note.trim() || "Not yok",
    };

    try {
      setSavingDebt(true);
      setMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/commercial-debts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(newDebt),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        const savedDebt = data.debt || data.commercialDebt || data.data || data || newDebt;
        setDebts((current) => [savedDebt, ...current]);
        setSource("api");
        setMessage("Ticari borç backend’e kaydedildi.");
      } else {
        setDebts((current) => [newDebt, ...current]);
        setSource("local");
        setMessage("Backend kayıt almadı; borç yerel olarak ekranda tutuluyor.");
      }

      setDebtForm(emptyDebt);
    } catch {
      setDebts((current) => [newDebt, ...current]);
      setSource("local");
      setMessage("Backend bağlantısı yok; borç yerel olarak ekranda tutuluyor.");
      setDebtForm(emptyDebt);
    } finally {
      setSavingDebt(false);
    }
  }

  async function handlePaymentSubmit(event) {
    event.preventDefault();

    if (!paymentForm.debtId) {
      setMessage("Ödeme için borç seçmelisin.");
      return;
    }

    if (!Number(paymentForm.amount || 0)) {
      setMessage("Ödeme tutarı zorunlu.");
      return;
    }

    const paymentAmount = Number(paymentForm.amount || 0);
    const selectedDebt = debts.find((debt) => debt.id === paymentForm.debtId);

    if (!selectedDebt) {
      setMessage("Seçilen borç bulunamadı.");
      return;
    }

    const payment = {
      debtId: selectedDebt.id,
      amount: paymentAmount,
      method: paymentForm.method,
      note: paymentForm.note.trim() || "Borç ödemesi",
      paidAt: new Date().toISOString(),
    };

    try {
      setSavingPayment(true);
      setMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/commercial-debt-payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payment),
      });

      await response.json().catch(() => ({}));

      if (response.ok) {
        applyLocalPayment(selectedDebt.id, paymentAmount);
        setSource("api");
        setMessage("Ödeme backend’e kaydedildi ve bakiye güncellendi.");
      } else {
        applyLocalPayment(selectedDebt.id, paymentAmount);
        setSource("local");
        setMessage("Backend ödeme almadı; ödeme yerel olarak işlendi.");
      }

      setPaymentForm(emptyPayment);
    } catch {
      applyLocalPayment(selectedDebt.id, paymentAmount);
      setSource("local");
      setMessage("Backend bağlantısı yok; ödeme yerel olarak işlendi.");
      setPaymentForm(emptyPayment);
    } finally {
      setSavingPayment(false);
    }
  }

  function applyLocalPayment(debtId, amount) {
    setDebts((current) =>
      current.map((debt) => {
        if (debt.id !== debtId) return debt;

        const nextPaid = getPaidAmount(debt) + Number(amount || 0);
        const total = getTotalAmount(debt);

        return {
          ...debt,
          paidAmount: nextPaid,
          status: nextPaid >= total ? "PAID" : "PARTIAL",
        };
      })
    );
  }

  const filteredDebts = useMemo(() => {
    return debts.filter((debt) => {
      const categoryOk = selectedCategory === "ALL" || debt.category === selectedCategory;
      const statusOk = selectedStatus === "ALL" || getDebtStatus(debt) === selectedStatus;

      return categoryOk && statusOk;
    });
  }, [debts, selectedCategory, selectedStatus]);

  const summary = useMemo(() => {
    const totalDebt = debts.reduce((sum, debt) => sum + getTotalAmount(debt), 0);
    const totalPaid = debts.reduce((sum, debt) => sum + getPaidAmount(debt), 0);
    const remaining = debts.reduce((sum, debt) => sum + getRemainingAmount(debt), 0);
    const overdue = debts.filter((debt) => getDebtStatus(debt) === "OVERDUE").length;
    const highPriority = debts.filter((debt) => debt.priority === "HIGH" && getDebtStatus(debt) !== "PAID").length;

    const byCategory = categories.map((category) => {
      const categoryDebts = debts.filter((debt) => debt.category === category);
      const amount = categoryDebts.reduce((sum, debt) => sum + getRemainingAmount(debt), 0);

      return {
        category,
        amount,
        count: categoryDebts.length,
      };
    }).filter((item) => item.count > 0);

    return {
      totalCount: debts.length,
      totalDebt,
      totalPaid,
      remaining,
      overdue,
      highPriority,
      byCategory,
    };
  }, [debts]);

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>HandsOff Finans Kontrolü</p>
          <h1 style={styles.title}>Ticari Borçlar</h1>
          <p style={styles.subtitle}>
            Kira, personel maaşı, vergi, SGK, tedarikçi borcu, kredi ve işletme faturalarını tek ödeme planında takip edin.
          </p>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroLabel}>Toplam Kalan Borç</span>
          <strong style={summary.remaining > 0 ? styles.heroValueWarn : styles.heroValueOk}>
            {formatCurrency(summary.remaining)}
          </strong>
          <small style={source === "api" ? styles.heroNoteOk : styles.heroNoteWarn}>
            {source === "api"
              ? "Backend verisi kullanılıyor"
              : source === "local"
                ? "Yerel kayıt gösteriliyor"
                : "Örnek veri gösteriliyor"}
          </small>
        </div>
      </section>

      <section style={styles.kpiGrid}>
        <KpiCard title="Toplam Borç" value={formatCurrency(summary.totalDebt)} note="Girilen tüm borçların toplamı" />
        <KpiCard title="Ödenen" value={formatCurrency(summary.totalPaid)} note="Yapılan ödemeler" />
        <KpiCard title="Kalan" value={formatCurrency(summary.remaining)} note="Açık borç bakiyesi" tone="warning" />
        <KpiCard title="Geciken / Kritik" value={`${summary.overdue} / ${summary.highPriority}`} note="Geciken ve yüksek öncelikli kayıtlar" tone="danger" />
      </section>

      <section style={styles.topGrid}>
        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Yeni Ticari Borç Ekle</h2>
          <p style={styles.panelText}>
            Kira, maaş, vergi, SGK, tedarikçi, kredi veya fatura borcu ekleyin.
          </p>

          <form onSubmit={handleCreateDebt} style={styles.formGrid}>
            <input
              style={styles.input}
              placeholder="Borç başlığı"
              value={debtForm.title}
              onChange={(event) => setDebtForm({ ...debtForm, title: event.target.value })}
            />

            <select
              style={styles.input}
              value={debtForm.category}
              onChange={(event) => setDebtForm({ ...debtForm, category: event.target.value })}
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>

            <input
              style={styles.input}
              placeholder="Alacaklı / kurum / kişi"
              value={debtForm.creditor}
              onChange={(event) => setDebtForm({ ...debtForm, creditor: event.target.value })}
            />

            <input
              style={styles.input}
              type="number"
              placeholder="Toplam borç tutarı"
              value={debtForm.totalAmount}
              onChange={(event) => setDebtForm({ ...debtForm, totalAmount: event.target.value })}
            />

            <input
              style={styles.input}
              type="number"
              placeholder="Varsa ödenen tutar"
              value={debtForm.paidAmount}
              onChange={(event) => setDebtForm({ ...debtForm, paidAmount: event.target.value })}
            />

            <input
              style={styles.input}
              type="date"
              value={debtForm.dueDate}
              onChange={(event) => setDebtForm({ ...debtForm, dueDate: event.target.value })}
            />

            <select
              style={styles.input}
              value={debtForm.priority}
              onChange={(event) => setDebtForm({ ...debtForm, priority: event.target.value })}
            >
              <option value="HIGH">Yüksek Öncelik</option>
              <option value="MEDIUM">Orta Öncelik</option>
              <option value="LOW">Düşük Öncelik</option>
            </select>

            <input
              style={styles.input}
              placeholder="Not"
              value={debtForm.note}
              onChange={(event) => setDebtForm({ ...debtForm, note: event.target.value })}
            />

            <button type="submit" style={styles.buttonWide} disabled={savingDebt}>
              {savingDebt ? "Kaydediliyor..." : "Borç Ekle"}
            </button>
          </form>

          {message ? <div style={styles.infoMessage}>{message}</div> : null}
        </article>

        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Borç Ödemesi Gir</h2>
          <p style={styles.panelText}>
            Seçili borca ödeme işleyin; kalan bakiye otomatik düşer.
          </p>

          <form onSubmit={handlePaymentSubmit} style={styles.formGrid}>
            <select
              style={styles.input}
              value={paymentForm.debtId}
              onChange={(event) => setPaymentForm({ ...paymentForm, debtId: event.target.value })}
            >
              <option value="">Borç seç</option>
              {debts
                .filter((debt) => getDebtStatus(debt) !== "PAID")
                .map((debt) => (
                  <option key={debt.id} value={debt.id}>
                    {debt.title} · {formatCurrency(getRemainingAmount(debt))}
                  </option>
                ))}
            </select>

            <input
              style={styles.input}
              type="number"
              placeholder="Ödeme tutarı"
              value={paymentForm.amount}
              onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })}
            />

            <select
              style={styles.input}
              value={paymentForm.method}
              onChange={(event) => setPaymentForm({ ...paymentForm, method: event.target.value })}
            >
              <option>Nakit</option>
              <option>Banka</option>
              <option>Kredi Kartı</option>
              <option>Çek / Senet</option>
            </select>

            <input
              style={styles.input}
              placeholder="Ödeme notu"
              value={paymentForm.note}
              onChange={(event) => setPaymentForm({ ...paymentForm, note: event.target.value })}
            />

            <button type="submit" style={styles.buttonWide} disabled={savingPayment}>
              {savingPayment ? "İşleniyor..." : "Ödemeyi İşle"}
            </button>
          </form>

          <div style={styles.categoryPanel}>
            <h3 style={styles.smallTitle}>Kategoriye Göre Kalan Borç</h3>

            <div style={styles.categoryList}>
              {summary.byCategory.map((item) => (
                <div key={item.category} style={styles.categoryRow}>
                  <span>{item.category}</span>
                  <strong>{formatCurrency(item.amount)}</strong>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section style={styles.toolbar}>
        <div>
          <h2 style={styles.panelTitle}>Borç Listesi</h2>
          <p style={styles.panelText}>
            Tüm ticari borçları kategori ve durumuna göre filtreleyin.
          </p>
        </div>

        <div style={styles.actions}>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            style={styles.select}
          >
            <option value="ALL">Tüm Kategoriler</option>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            style={styles.select}
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="OPEN">Açık</option>
            <option value="PARTIAL">Kısmi Ödendi</option>
            <option value="OVERDUE">Gecikti</option>
            <option value="PAID">Ödendi</option>
          </select>

          <button type="button" onClick={fetchDebts} style={styles.button}>
            Yenile
          </button>
        </div>
      </section>

      {loading ? (
        <section style={styles.stateBox}>Ticari borçlar yükleniyor...</section>
      ) : (
        <>
          {error ? <section style={styles.warningBox}>{error}</section> : null}

          <section style={styles.grid}>
            {filteredDebts.map((debt) => {
              const status = getDebtStatus(debt);
              const remaining = getRemainingAmount(debt);

              return (
                <article key={debt.id || debt.title} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div>
                      <h3 style={styles.cardTitle}>{debt.title || "Borç kaydı"}</h3>
                      <p style={styles.cardText}>
                        {debt.category || "Kategori yok"} · {debt.creditor || "Alacaklı yok"}
                      </p>
                    </div>

                    <span style={{ ...styles.badge, ...getStatusStyle(status) }}>
                      {getStatusLabel(status)}
                    </span>
                  </div>

                  <div style={styles.amountBox}>
                    <span>Kalan Borç</span>
                    <strong style={remaining > 0 ? styles.amountWarn : styles.amountOk}>
                      {formatCurrency(remaining)}
                    </strong>
                  </div>

                  <div style={styles.metaGrid}>
                    <div style={styles.metaBox}>
                      <span>Toplam</span>
                      <strong>{formatCurrency(getTotalAmount(debt))}</strong>
                    </div>

                    <div style={styles.metaBox}>
                      <span>Ödenen</span>
                      <strong>{formatCurrency(getPaidAmount(debt))}</strong>
                    </div>

                    <div style={styles.metaBox}>
                      <span>Vade</span>
                      <strong>{formatDate(debt.dueDate)}</strong>
                    </div>

                    <div style={styles.metaBox}>
                      <span>Öncelik</span>
                      <strong style={{ ...styles.priorityText, ...getPriorityStyle(debt.priority) }}>
                        {getPriorityLabel(debt.priority)}
                      </strong>
                    </div>
                  </div>

                  <div style={styles.noteBox}>
                    {debt.note || "Not girilmedi"}
                  </div>
                </article>
              );
            })}

            {filteredDebts.length === 0 ? (
              <section style={styles.stateBox}>Bu filtreye uygun borç bulunamadı.</section>
            ) : null}
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
    maxWidth: "850px",
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
    fontSize: "28px",
    color: "#ffffff",
  },
  kpiValueWarn: {
    display: "block",
    fontSize: "28px",
    color: "#fde68a",
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
  topGrid: {
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
    color: "#fed7aa",
    background: "rgba(249,115,22,0.14)",
    border: "1px solid rgba(249,115,22,0.2)",
  },
  categoryPanel: {
    marginTop: "16px",
    padding: "16px",
    borderRadius: "18px",
    background: "rgba(15,23,42,0.45)",
  },
  smallTitle: {
    margin: "0 0 12px",
    fontSize: "16px",
  },
  categoryList: {
    display: "grid",
    gap: "8px",
  },
  categoryRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    padding: "10px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.06)",
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
  stateBox: {
    padding: "22px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#cbd5e1",
    marginBottom: "16px",
  },
  warningBox: {
    padding: "16px",
    borderRadius: "18px",
    background: "rgba(245,158,11,0.12)",
    border: "1px solid rgba(245,158,11,0.2)",
    color: "#fde68a",
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
  amountBox: {
    display: "grid",
    gap: "6px",
    padding: "16px",
    borderRadius: "18px",
    background: "rgba(15,23,42,0.55)",
    marginBottom: "14px",
  },
  amountWarn: {
    color: "#fde68a",
    fontSize: "26px",
  },
  amountOk: {
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
  noteBox: {
    marginTop: "12px",
    padding: "12px",
    borderRadius: "14px",
    color: "#cbd5e1",
    background: "rgba(15,23,42,0.38)",
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
  priorityText: {
    width: "fit-content",
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

export default CommercialDebtsPage;
