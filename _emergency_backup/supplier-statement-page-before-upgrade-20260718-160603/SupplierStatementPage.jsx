import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "./apiConfig";

const fallbackStatements = [
  {
    id: "statement-1",
    supplierName: "Et ve Şarküteri Tedarikçisi",
    category: "Et / Şarküteri",
    openingBalance: 18000,
    purchaseTotal: 42800,
    paymentTotal: 25000,
    currentBalance: 35800,
    lastMovementDate: "Bugün",
    status: "PAYABLE",
    movements: [
      { id: "m-1", type: "PURCHASE", description: "Dana ürünleri alış faturası", amount: 17400, date: "Bugün" },
      { id: "m-2", type: "PAYMENT", description: "Kısmi ödeme", amount: 10000, date: "Dün" },
      { id: "m-3", type: "PURCHASE", description: "Şarküteri ürünleri", amount: 8800, date: "Bu hafta" },
    ],
  },
  {
    id: "statement-2",
    supplierName: "Sebze Meyve Tedarikçisi",
    category: "Sebze / Meyve",
    openingBalance: 4200,
    purchaseTotal: 18600,
    paymentTotal: 15500,
    currentBalance: 7300,
    lastMovementDate: "Bugün",
    status: "PAYABLE",
    movements: [
      { id: "m-4", type: "PURCHASE", description: "Günlük sebze alımı", amount: 6800, date: "Bugün" },
      { id: "m-5", type: "PAYMENT", description: "Nakit ödeme", amount: 5000, date: "Dün" },
    ],
  },
  {
    id: "statement-3",
    supplierName: "İçecek Tedarikçisi",
    category: "İçecek",
    openingBalance: 0,
    purchaseTotal: 31250,
    paymentTotal: 31250,
    currentBalance: 0,
    lastMovementDate: "Bu hafta",
    status: "CLOSED",
    movements: [
      { id: "m-6", type: "PURCHASE", description: "İçecek alımı", amount: 31250, date: "Bu hafta" },
      { id: "m-7", type: "PAYMENT", description: "Tam ödeme", amount: 31250, date: "Bu hafta" },
    ],
  },
];

const emptyPayment = {
  supplierName: "",
  amount: "",
  method: "Nakit",
  note: "",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function normalizeStatements(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.statements)) return data.statements;
  if (Array.isArray(data?.supplierStatements)) return data.supplierStatements;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getSupplierName(statement) {
  return statement.supplierName || statement.supplier || statement.name || "Tedarikçi";
}

function getCurrentBalance(statement) {
  if (statement.currentBalance !== undefined) return Number(statement.currentBalance || 0);

  return (
    Number(statement.openingBalance || 0) +
    Number(statement.purchaseTotal || 0) -
    Number(statement.paymentTotal || 0)
  );
}

function getStatus(statement) {
  const balance = getCurrentBalance(statement);

  if (balance <= 0) return "CLOSED";
  if (balance >= 30000) return "HIGH";
  return "PAYABLE";
}

function getStatusLabel(status) {
  if (status === "CLOSED") return "Kapalı";
  if (status === "HIGH") return "Yüksek Borç";
  if (status === "PAYABLE") return "Ödenecek";
  return "Durum Yok";
}

function getStatusStyle(status) {
  if (status === "CLOSED") return styles.badgeOk;
  if (status === "HIGH") return styles.badgeError;
  return styles.badgeWarn;
}

function SupplierStatementPage() {
  const [statements, setStatements] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("ALL");
  const [paymentForm, setPaymentForm] = useState(emptyPayment);
  const [source, setSource] = useState("api");
  const [loading, setLoading] = useState(true);
  const [savingPayment, setSavingPayment] = useState(false);
  const [error, setError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");

  async function fetchStatements() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/supplier-statements", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatements(fallbackStatements);
        setSource("demo");
        setError("Backend tedarikçi cari verisi alınamadı. Ekran örnek verilerle gösteriliyor.");
        return;
      }

      const normalized = normalizeStatements(data);

      if (normalized.length === 0) {
        setStatements(fallbackStatements);
        setSource("demo");
        setError("Kayıtlı tedarikçi ekstresi bulunamadı. Örnek cari liste gösteriliyor.");
        return;
      }

      setStatements(normalized);
      setSource("api");
    } catch {
      setStatements(fallbackStatements);
      setSource("demo");
      setError("Backend bağlantısı kurulamadı. Ekran örnek verilerle gösteriliyor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatements();
  }, []);

  async function handlePaymentSubmit(event) {
    event.preventDefault();

    if (!paymentForm.supplierName.trim()) {
      setPaymentMessage("Tedarikçi adı zorunlu.");
      return;
    }

    if (!Number(paymentForm.amount || 0)) {
      setPaymentMessage("Ödeme tutarı zorunlu.");
      return;
    }

    const payment = {
      id: "local-payment-" + Date.now(),
      supplierName: paymentForm.supplierName.trim(),
      amount: Number(paymentForm.amount || 0),
      method: paymentForm.method,
      note: paymentForm.note.trim() || "Ödeme kaydı",
      date: new Date().toLocaleDateString("tr-TR"),
    };

    try {
      setSavingPayment(true);
      setPaymentMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/supplier-payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payment),
      });

      await response.json().catch(() => ({}));

      if (response.ok) {
        setPaymentMessage("Ödeme backend’e kaydedildi.");
        fetchStatements();
      } else {
        applyLocalPayment(payment);
        setPaymentMessage("Backend ödeme kaydı almadı; ödeme geçici olarak ekranda işlendi.");
      }

      setPaymentForm(emptyPayment);
    } catch {
      applyLocalPayment(payment);
      setPaymentMessage("Backend bağlantısı yok; ödeme geçici olarak ekranda işlendi.");
      setPaymentForm(emptyPayment);
    } finally {
      setSavingPayment(false);
    }
  }

  function applyLocalPayment(payment) {
    setStatements((current) => {
      const supplierExists = current.some(
        (statement) =>
          getSupplierName(statement).toLocaleLowerCase("tr-TR") ===
          payment.supplierName.toLocaleLowerCase("tr-TR")
      );

      if (!supplierExists) {
        return [
          {
            id: "local-statement-" + Date.now(),
            supplierName: payment.supplierName,
            category: "Genel",
            openingBalance: 0,
            purchaseTotal: 0,
            paymentTotal: payment.amount,
            currentBalance: -payment.amount,
            lastMovementDate: payment.date,
            status: "CLOSED",
            movements: [
              {
                id: payment.id,
                type: "PAYMENT",
                description: payment.note,
                amount: payment.amount,
                date: payment.date,
              },
            ],
          },
          ...current,
        ];
      }

      return current.map((statement) => {
        if (
          getSupplierName(statement).toLocaleLowerCase("tr-TR") !==
          payment.supplierName.toLocaleLowerCase("tr-TR")
        ) {
          return statement;
        }

        const currentBalance = getCurrentBalance(statement) - payment.amount;

        return {
          ...statement,
          paymentTotal: Number(statement.paymentTotal || 0) + payment.amount,
          currentBalance,
          lastMovementDate: payment.date,
          movements: [
            {
              id: payment.id,
              type: "PAYMENT",
              description: payment.note,
              amount: payment.amount,
              date: payment.date,
            },
            ...(statement.movements || []),
          ],
        };
      });
    });
  }

  const supplierNames = useMemo(() => {
    return Array.from(new Set(statements.map((statement) => getSupplierName(statement)))).sort();
  }, [statements]);

  const filteredStatements = useMemo(() => {
    if (selectedSupplier === "ALL") return statements;
    return statements.filter((statement) => getSupplierName(statement) === selectedSupplier);
  }, [statements, selectedSupplier]);

  const selectedStatement = filteredStatements[0] || statements[0] || null;

  const allMovements = useMemo(() => {
    return filteredStatements.flatMap((statement) =>
      (statement.movements || []).map((movement) => ({
        ...movement,
        supplierName: getSupplierName(statement),
      }))
    );
  }, [filteredStatements]);

  const summary = useMemo(() => {
    const totalDebt = statements.reduce((sum, statement) => {
      const balance = getCurrentBalance(statement);
      return balance > 0 ? sum + balance : sum;
    }, 0);

    const totalPurchase = statements.reduce((sum, statement) => {
      return sum + Number(statement.purchaseTotal || 0);
    }, 0);

    const totalPayment = statements.reduce((sum, statement) => {
      return sum + Number(statement.paymentTotal || 0);
    }, 0);

    const highDebt = statements.filter((statement) => getStatus(statement) === "HIGH").length;

    return {
      totalSuppliers: statements.length,
      totalDebt,
      totalPurchase,
      totalPayment,
      highDebt,
    };
  }, [statements]);

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>HandsOff Cari Takip</p>
          <h1 style={styles.title}>Tedarikçi Cari / Ekstre</h1>
          <p style={styles.subtitle}>
            Tedarikçi alışlarını, yapılan ödemeleri, kalan bakiyeyi ve hareket geçmişini tek ekrandan takip edin.
          </p>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroLabel}>Toplam Açık Borç</span>
          <strong style={summary.totalDebt > 0 ? styles.heroValueWarn : styles.heroValueOk}>
            {formatCurrency(summary.totalDebt)}
          </strong>
          <small style={source === "api" ? styles.heroNoteOk : styles.heroNoteWarn}>
            {source === "api" ? "Backend verisi kullanılıyor" : "Örnek veri gösteriliyor"}
          </small>
        </div>
      </section>

      <section style={styles.kpiGrid}>
        <KpiCard title="Tedarikçi" value={summary.totalSuppliers} note="Cari hesabı izlenen kayıt" />
        <KpiCard title="Toplam Alış" value={formatCurrency(summary.totalPurchase)} note="Fatura / sipariş toplamı" />
        <KpiCard title="Toplam Ödeme" value={formatCurrency(summary.totalPayment)} note="Tedarikçilere yapılan ödeme" />
        <KpiCard title="Yüksek Borç" value={summary.highDebt} note="Öncelikli ödeme kontrolü" tone="danger" />
      </section>

      <section style={styles.topGrid}>
        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Ödeme Girişi</h2>
          <p style={styles.panelText}>Tedarikçi seçip ödeme tutarını girin; bakiye ekranda güncellenir.</p>

          <form onSubmit={handlePaymentSubmit} style={styles.formGrid}>
            <input
              style={styles.input}
              list="supplier-names"
              placeholder="Tedarikçi adı"
              value={paymentForm.supplierName}
              onChange={(event) => setPaymentForm({ ...paymentForm, supplierName: event.target.value })}
            />

            <datalist id="supplier-names">
              {supplierNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>

            <input
              style={styles.input}
              placeholder="Ödeme tutarı"
              type="number"
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
              placeholder="Not"
              value={paymentForm.note}
              onChange={(event) => setPaymentForm({ ...paymentForm, note: event.target.value })}
            />

            <button type="submit" style={styles.buttonWide} disabled={savingPayment}>
              {savingPayment ? "Kaydediliyor..." : "Ödemeyi Kaydet"}
            </button>
          </form>

          {paymentMessage ? <div style={styles.infoMessage}>{paymentMessage}</div> : null}
        </article>

        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Cari Mantığı</h2>
          <p style={styles.panelText}>Bu ekran tedarikçi borç hareketlerini özetler.</p>

          <div style={styles.flowList}>
            <FlowItem title="Açılış Bakiyesi" text="Tedarikçiden devreden eski borç veya alacak." />
            <FlowItem title="Alış / Fatura" text="Tedarikçiden alınan ürünler borcu artırır." />
            <FlowItem title="Ödeme" text="Yapılan ödemeler açık bakiyeyi düşürür." />
            <FlowItem title="Kalan Bakiye" text="Açılış + alışlar - ödemeler olarak hesaplanır." />
          </div>
        </article>
      </section>

      <section style={styles.toolbar}>
        <div>
          <h2 style={styles.panelTitle}>Tedarikçi Ekstreleri</h2>
          <p style={styles.panelText}>Tedarikçi bazında cari bakiye ve hareketleri filtreleyin.</p>
        </div>

        <div style={styles.actions}>
          <select
            value={selectedSupplier}
            onChange={(event) => setSelectedSupplier(event.target.value)}
            style={styles.select}
          >
            <option value="ALL">Tüm Tedarikçiler</option>
            {supplierNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <button type="button" onClick={fetchStatements} style={styles.button}>
            Yenile
          </button>
        </div>
      </section>

      {loading ? (
        <section style={styles.stateBox}>Tedarikçi ekstreleri yükleniyor...</section>
      ) : (
        <>
          {error ? <section style={styles.warningBox}>{error}</section> : null}

          <section style={styles.detailGrid}>
            <article style={styles.largePanel}>
              <div style={styles.panelHeader}>
                <div>
                  <h2 style={styles.panelTitle}>
                    {selectedStatement ? getSupplierName(selectedStatement) : "Tedarikçi seçilmedi"}
                  </h2>
                  <p style={styles.panelText}>
                    {selectedStatement?.category || "Cari hareket özeti"}
                  </p>
                </div>

                {selectedStatement ? (
                  <span style={{ ...styles.badge, ...getStatusStyle(getStatus(selectedStatement)) }}>
                    {getStatusLabel(getStatus(selectedStatement))}
                  </span>
                ) : null}
              </div>

              {selectedStatement ? (
                <div style={styles.balanceGrid}>
                  <MiniStat label="Açılış" value={formatCurrency(selectedStatement.openingBalance || 0)} />
                  <MiniStat label="Alış" value={formatCurrency(selectedStatement.purchaseTotal || 0)} />
                  <MiniStat label="Ödeme" value={formatCurrency(selectedStatement.paymentTotal || 0)} />
                  <MiniStat label="Kalan" value={formatCurrency(getCurrentBalance(selectedStatement))} tone="warning" />
                </div>
              ) : null}

              <div style={styles.tableWrap}>
                <div style={styles.tableHeader}>
                  <span>Tedarikçi</span>
                  <span>Hareket</span>
                  <span>Açıklama</span>
                  <span>Tutar</span>
                  <span>Tarih</span>
                </div>

                {allMovements.map((movement) => (
                  <div key={movement.id || movement.description + movement.date} style={styles.tableRow}>
                    <strong>{movement.supplierName}</strong>
                    <span style={movement.type === "PAYMENT" ? styles.paymentText : styles.purchaseText}>
                      {movement.type === "PAYMENT" ? "Ödeme" : "Alış"}
                    </span>
                    <span>{movement.description || movement.note || "Hareket"}</span>
                    <strong>{formatCurrency(movement.amount || 0)}</strong>
                    <span>{movement.date || movement.createdAt || "Tarih yok"}</span>
                  </div>
                ))}

                {allMovements.length === 0 ? (
                  <div style={styles.emptyRow}>Hareket kaydı bulunamadı.</div>
                ) : null}
              </div>
            </article>

            <aside style={styles.sideGrid}>
              {filteredStatements.map((statement) => {
                const status = getStatus(statement);

                return (
                  <article key={statement.id || getSupplierName(statement)} style={styles.sideCard}>
                    <div>
                      <h3 style={styles.sideTitle}>{getSupplierName(statement)}</h3>
                      <p style={styles.cardText}>{statement.category || "Kategori yok"}</p>
                    </div>

                    <strong style={getCurrentBalance(statement) > 0 ? styles.balanceWarn : styles.balanceOk}>
                      {formatCurrency(getCurrentBalance(statement))}
                    </strong>

                    <span style={{ ...styles.badge, ...getStatusStyle(status) }}>
                      {getStatusLabel(status)}
                    </span>
                  </article>
                );
              })}
            </aside>
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
      <strong style={tone === "danger" ? styles.kpiValueDanger : styles.kpiValue}>{value}</strong>
      <small style={styles.kpiNote}>{note}</small>
    </article>
  );
}

function MiniStat({ label, value, tone }) {
  return (
    <div style={styles.miniStat}>
      <span>{label}</span>
      <strong style={tone === "warning" ? styles.miniWarn : undefined}>{value}</strong>
    </div>
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
    background: "linear-gradient(135deg, #f59e0b, #ea580c)",
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
    minWidth: "220px",
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
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1.35fr 0.65fr",
    gap: "16px",
  },
  largePanel: {
    padding: "20px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
    marginBottom: "14px",
  },
  balanceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "16px",
  },
  miniStat: {
    display: "grid",
    gap: "6px",
    padding: "14px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.55)",
  },
  miniWarn: {
    color: "#fde68a",
  },
  tableWrap: {
    display: "grid",
    gap: "8px",
    overflowX: "auto",
  },
  tableHeader: {
    minWidth: "820px",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.7fr 1.5fr 0.8fr 0.8fr",
    gap: "12px",
    padding: "0 14px 6px",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 900,
  },
  tableRow: {
    minWidth: "820px",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.7fr 1.5fr 0.8fr 0.8fr",
    gap: "12px",
    alignItems: "center",
    padding: "13px 14px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.5)",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "#e5e7eb",
    fontSize: "13px",
  },
  emptyRow: {
    padding: "14px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.5)",
    color: "#94a3b8",
  },
  paymentText: {
    color: "#bbf7d0",
    fontWeight: 900,
  },
  purchaseText: {
    color: "#fde68a",
    fontWeight: 900,
  },
  sideGrid: {
    display: "grid",
    gap: "12px",
    alignContent: "start",
  },
  sideCard: {
    display: "grid",
    gap: "10px",
    padding: "18px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  sideTitle: {
    margin: 0,
    fontSize: "18px",
  },
  cardText: {
    margin: "6px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
  },
  balanceWarn: {
    color: "#fde68a",
    fontSize: "24px",
  },
  balanceOk: {
    color: "#bbf7d0",
    fontSize: "24px",
  },
  badge: {
    width: "fit-content",
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
};

export default SupplierStatementPage;
