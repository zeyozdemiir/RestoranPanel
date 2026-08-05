import { useMemo, useState } from "react";

const STORAGE_KEY = "handsoff_daily_sales_v1";

const channels = [
  "Nakit",
  "Kredi Kartı",
  "Yemeksepeti",
  "Getir",
  "Trendyol",
  "Online",
  "Havale / EFT",
  "Diğer",
];

const emptySale = {
  date: new Date().toISOString().slice(0, 10),
  channel: "Nakit",
  grossAmount: "",
  discountAmount: "",
  refundAmount: "",
  commissionRate: "",
  note: "",
};

const initialSales = [
  {
    id: "1",
    date: "2026-07-18",
    channel: "Nakit",
    grossAmount: 68500,
    discountAmount: 1200,
    refundAmount: 0,
    commissionRate: 0,
    note: "Salon nakit satış",
  },
  {
    id: "2",
    date: "2026-07-18",
    channel: "Kredi Kartı",
    grossAmount: 142000,
    discountAmount: 3500,
    refundAmount: 1200,
    commissionRate: 2.5,
    note: "POS satış",
  },
  {
    id: "3",
    date: "2026-07-18",
    channel: "Yemeksepeti",
    grossAmount: 38600,
    discountAmount: 0,
    refundAmount: 0,
    commissionRate: 12,
    note: "Paket servis",
  },
  {
    id: "4",
    date: "2026-07-18",
    channel: "Getir",
    grossAmount: 21800,
    discountAmount: 500,
    refundAmount: 0,
    commissionRate: 10,
    note: "Online sipariş",
  },
];

function money(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function calcCommission(sale) {
  const base =
    Number(sale.grossAmount || 0) -
    Number(sale.discountAmount || 0) -
    Number(sale.refundAmount || 0);

  return Math.max(base, 0) * (Number(sale.commissionRate || 0) / 100);
}

function calcNetSale(sale) {
  return (
    Number(sale.grossAmount || 0) -
    Number(sale.discountAmount || 0) -
    Number(sale.refundAmount || 0) -
    calcCommission(sale)
  );
}

function DailySalesPage() {
  const savedSales = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) && parsed.length ? parsed : initialSales;
    } catch {
      return initialSales;
    }
  })();

  const [sales, setSales] = useState(savedSales);
  const [form, setForm] = useState(emptySale);
  const [selectedChannel, setSelectedChannel] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState("");

  function save(nextSales) {
    setSales(nextSales);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSales));
  }

  function addSale(event) {
    event.preventDefault();

    if (!Number(form.grossAmount || 0)) {
      setMessage("Brüt ciro tutarı zorunlu.");
      return;
    }

    const sale = {
      id: String(Date.now()),
      date: form.date,
      channel: form.channel,
      grossAmount: Number(form.grossAmount || 0),
      discountAmount: Number(form.discountAmount || 0),
      refundAmount: Number(form.refundAmount || 0),
      commissionRate: Number(form.commissionRate || 0),
      note: form.note.trim() || "Not yok",
    };

    save([sale, ...sales]);
    setForm(emptySale);
    setSelectedDate(sale.date);
    setMessage("Günlük ciro kaydı eklendi.");
  }

  function deleteSale(id) {
    save(sales.filter((sale) => sale.id !== id));
    setMessage("Ciro kaydı silindi.");
  }

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const dateOk = !selectedDate || sale.date === selectedDate;
      const channelOk = selectedChannel === "ALL" || sale.channel === selectedChannel;

      return dateOk && channelOk;
    });
  }, [sales, selectedDate, selectedChannel]);

  const summary = useMemo(() => {
    const gross = filteredSales.reduce((sum, sale) => sum + Number(sale.grossAmount || 0), 0);
    const discounts = filteredSales.reduce((sum, sale) => sum + Number(sale.discountAmount || 0), 0);
    const refunds = filteredSales.reduce((sum, sale) => sum + Number(sale.refundAmount || 0), 0);
    const commissions = filteredSales.reduce((sum, sale) => sum + calcCommission(sale), 0);
    const net = filteredSales.reduce((sum, sale) => sum + calcNetSale(sale), 0);

    const byChannel = channels
      .map((channel) => {
        const channelSales = filteredSales.filter((sale) => sale.channel === channel);
        const amount = channelSales.reduce((sum, sale) => sum + calcNetSale(sale), 0);

        return {
          channel,
          amount,
          count: channelSales.length,
        };
      })
      .filter((item) => item.count > 0);

    return {
      gross,
      discounts,
      refunds,
      commissions,
      net,
      count: filteredSales.length,
      byChannel,
    };
  }, [filteredSales]);

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>HandsOff Gelir Kontrolü</p>
          <h1 style={styles.title}>Günlük Ciro / Gelir Girişi</h1>
          <p style={styles.subtitle}>
            Nakit, kredi kartı, Yemeksepeti, Getir ve diğer satış kanallarını ayrı ayrı girin. Sistem brüt ciro, indirim, iade, komisyon ve net ciroyu otomatik hesaplar.
          </p>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroLabel}>Net Ciro</span>
          <strong style={styles.heroValue}>{money(summary.net)}</strong>
          <small style={styles.heroNote}>Seçili tarih ve filtreye göre hesaplanır</small>
        </div>
      </section>

      <section style={styles.kpis}>
        <Kpi title="Brüt Ciro" value={money(summary.gross)} note="Toplam satış tutarı" />
        <Kpi title="İndirim" value={money(summary.discounts)} note="Uygulanan indirimler" warning />
        <Kpi title="İade" value={money(summary.refunds)} note="İade / iptal tutarı" danger />
        <Kpi title="Komisyon" value={money(summary.commissions)} note="Platform / POS kesintisi" danger />
      </section>

      <section style={styles.forms}>
        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Yeni Gelir Kaydı</h2>
          <p style={styles.panelText}>Satış kanalını seçip brüt ciroyu gir. İndirim, iade ve komisyon varsa net cirodan düşer.</p>

          <form onSubmit={addSale} style={styles.form}>
            <input
              style={styles.input}
              type="date"
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
            />

            <select
              style={styles.input}
              value={form.channel}
              onChange={(event) => setForm({ ...form, channel: event.target.value })}
            >
              {channels.map((channel) => (
                <option key={channel}>{channel}</option>
              ))}
            </select>

            <input
              style={styles.input}
              type="number"
              placeholder="Brüt ciro"
              value={form.grossAmount}
              onChange={(event) => setForm({ ...form, grossAmount: event.target.value })}
            />

            <input
              style={styles.input}
              type="number"
              placeholder="İndirim"
              value={form.discountAmount}
              onChange={(event) => setForm({ ...form, discountAmount: event.target.value })}
            />

            <input
              style={styles.input}
              type="number"
              placeholder="İade / iptal"
              value={form.refundAmount}
              onChange={(event) => setForm({ ...form, refundAmount: event.target.value })}
            />

            <input
              style={styles.input}
              type="number"
              placeholder="Komisyon %"
              value={form.commissionRate}
              onChange={(event) => setForm({ ...form, commissionRate: event.target.value })}
            />

            <input
              style={styles.inputWide}
              placeholder="Not"
              value={form.note}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
            />

            <div style={styles.previewBox}>
              <span>Bu kaydın net cirosu</span>
              <strong>{money(calcNetSale(form))}</strong>
            </div>

            <button style={styles.mainButton}>Gelir Kaydını Ekle</button>
          </form>

          {message ? <div style={styles.message}>{message}</div> : null}
        </article>

        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Kanal Dağılımı</h2>
          <p style={styles.panelText}>Seçili günün satış kanallarına göre net gelir dağılımı.</p>

          <div style={styles.channelList}>
            {summary.byChannel.map((item) => (
              <div key={item.channel} style={styles.channelRow}>
                <div>
                  <strong>{item.channel}</strong>
                  <span>{item.count} kayıt</span>
                </div>
                <b>{money(item.amount)}</b>
              </div>
            ))}

            {summary.byChannel.length === 0 ? (
              <div style={styles.emptyBox}>Bu filtreye uygun gelir kaydı yok.</div>
            ) : null}
          </div>
        </article>
      </section>

      <section style={styles.toolbar}>
        <div>
          <h2 style={styles.panelTitle}>Gelir Kayıtları</h2>
          <p style={styles.panelText}>Tarih ve satış kanalına göre filtrele.</p>
        </div>

        <div style={styles.filters}>
          <input
            style={styles.select}
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />

          <select
            style={styles.select}
            value={selectedChannel}
            onChange={(event) => setSelectedChannel(event.target.value)}
          >
            <option value="ALL">Tüm Kanallar</option>
            {channels.map((channel) => (
              <option key={channel}>{channel}</option>
            ))}
          </select>

          <button type="button" style={styles.secondaryButton} onClick={() => setSelectedDate("")}>
            Tüm Tarihler
          </button>
        </div>
      </section>

      <section style={styles.grid}>
        {filteredSales.map((sale) => (
          <article key={sale.id} style={styles.card}>
            <div style={styles.cardTop}>
              <div>
                <h3 style={styles.cardTitle}>{sale.channel}</h3>
                <p style={styles.cardText}>{sale.date} · {sale.note}</p>
              </div>

              <span style={styles.badge}>Net Gelir</span>
            </div>

            <div style={styles.netBox}>
              <span>Net Ciro</span>
              <strong>{money(calcNetSale(sale))}</strong>
            </div>

            <div style={styles.meta}>
              <Meta label="Brüt" value={money(sale.grossAmount)} />
              <Meta label="İndirim" value={money(sale.discountAmount)} />
              <Meta label="İade" value={money(sale.refundAmount)} />
              <Meta label="Komisyon" value={money(calcCommission(sale))} />
            </div>

            <button type="button" style={styles.deleteButton} onClick={() => deleteSale(sale.id)}>
              Kaydı Sil
            </button>
          </article>
        ))}

        {filteredSales.length === 0 ? (
          <section style={styles.emptyBox}>Bu filtreye uygun ciro kaydı bulunamadı.</section>
        ) : null}
      </section>
    </main>
  );
}

function Kpi({ title, value, note, danger, warning }) {
  return (
    <article style={styles.kpi}>
      <span>{title}</span>
      <strong style={danger ? styles.kpiDanger : warning ? styles.kpiWarning : styles.kpiValue}>{value}</strong>
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
    background:
      "radial-gradient(circle at top left, #065f46 0, transparent 34%), linear-gradient(135deg, #0f172a 0%, #111827 48%, #020617 100%)",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: 20,
    marginBottom: 20,
  },
  eyebrow: {
    margin: 0,
    color: "#a7f3d0",
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
    maxWidth: 880,
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
    fontSize: 36,
    color: "#bbf7d0",
  },
  heroNote: {
    display: "inline-block",
    marginTop: 10,
    padding: "6px 10px",
    borderRadius: 999,
    color: "#bbf7d0",
    background: "rgba(34,197,94,0.16)",
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
    fontSize: 27,
    color: "#ffffff",
  },
  kpiDanger: {
    fontSize: 27,
    color: "#fecaca",
  },
  kpiWarning: {
    fontSize: 27,
    color: "#fde68a",
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
  inputWide: {
    gridColumn: "1 / -1",
    height: 42,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "#0f172a",
    color: "#f8fafc",
    padding: "0 12px",
    outline: "none",
  },
  previewBox: {
    gridColumn: "1 / -1",
    display: "grid",
    gap: 6,
    padding: 14,
    borderRadius: 16,
    background: "rgba(34,197,94,0.14)",
    color: "#bbf7d0",
  },
  mainButton: {
    gridColumn: "1 / -1",
    height: 44,
    border: 0,
    borderRadius: 14,
    color: "#fff",
    background: "linear-gradient(135deg, #10b981, #14b8a6)",
    fontWeight: 900,
    cursor: "pointer",
  },
  message: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    background: "rgba(16,185,129,0.14)",
    color: "#a7f3d0",
  },
  channelList: {
    display: "grid",
    gap: 10,
  },
  channelRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    background: "rgba(15,23,42,0.48)",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    padding: 20,
    borderRadius: 24,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    marginBottom: 16,
  },
  filters: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  select: {
    height: 42,
    minWidth: 170,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "#0f172a",
    color: "#f8fafc",
    padding: "0 12px",
  },
  secondaryButton: {
    height: 42,
    border: 0,
    borderRadius: 14,
    padding: "0 14px",
    background: "rgba(16,185,129,0.22)",
    color: "#a7f3d0",
    fontWeight: 900,
    cursor: "pointer",
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
  badge: {
    height: "fit-content",
    padding: "7px 11px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    color: "#bbf7d0",
    background: "rgba(34,197,94,0.16)",
  },
  netBox: {
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
  deleteButton: {
    marginTop: 12,
    height: 38,
    border: 0,
    borderRadius: 13,
    padding: "0 14px",
    color: "#fecaca",
    background: "rgba(239,68,68,0.16)",
    fontWeight: 900,
    cursor: "pointer",
  },
  emptyBox: {
    padding: 16,
    borderRadius: 18,
    color: "#94a3b8",
    background: "rgba(15,23,42,0.45)",
  },
};

export default DailySalesPage;
