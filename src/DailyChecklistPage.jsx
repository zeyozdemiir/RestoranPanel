import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "./apiConfig";

const defaultChecklist = [
  {
    id: "opening-1",
    group: "Açılış",
    title: "Kasa başlangıç tutarı kontrol edildi",
    owner: "Yönetici",
    status: "DONE",
  },
  {
    id: "opening-2",
    group: "Açılış",
    title: "Mutfak ve bar hazırlıkları kontrol edildi",
    owner: "Operasyon",
    status: "DONE",
  },
  {
    id: "stock-1",
    group: "Stok",
    title: "Kritik stok ürünleri kontrol edildi",
    owner: "Stok Sorumlusu",
    status: "IN_PROGRESS",
  },
  {
    id: "stock-2",
    group: "Stok",
    title: "Zayi / kırılma kayıtları işlendi",
    owner: "Stok Sorumlusu",
    status: "OPEN",
  },
  {
    id: "finance-1",
    group: "Finans",
    title: "Günlük gider fişleri kontrol edildi",
    owner: "Muhasebe",
    status: "OPEN",
  },
  {
    id: "closing-1",
    group: "Kapanış",
    title: "Gün sonu kasa ve POS toplamı eşleştirildi",
    owner: "Yönetici",
    status: "OPEN",
  },
];

const statusLabels = {
  DONE: "Tamamlandı",
  IN_PROGRESS: "Kontrol Ediliyor",
  OPEN: "Bekliyor",
  ISSUE: "Sorun Var",
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeChecklist(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.checklist)) return data.checklist;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getStatusLabel(status) {
  return statusLabels[status] || status || "Durum Yok";
}

function getStatusStyle(status) {
  if (status === "DONE") return styles.badgeOk;
  if (status === "IN_PROGRESS") return styles.badgeBlue;
  if (status === "ISSUE") return styles.badgeError;
  return styles.badgeWarn;
}

function groupItems(items) {
  return items.reduce((groups, item) => {
    const group = item.group || item.category || "Genel";
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
    return groups;
  }, {});
}

function DailyChecklistPage() {
  const [date, setDate] = useState(todayKey());
  const [items, setItems] = useState([]);
  const [source, setSource] = useState("api");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchChecklist(selectedDate = date) {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/daily-checklists/" + selectedDate, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setItems(defaultChecklist);
        setSource("demo");
        setError("Backend kontrol listesi alınamadı. Ekran örnek verilerle gösteriliyor.");
        return;
      }

      const normalized = normalizeChecklist(data);

      if (normalized.length === 0) {
        setItems(defaultChecklist);
        setSource("demo");
        setError("Bu tarih için kayıtlı kontrol listesi bulunamadı. Örnek liste gösteriliyor.");
        return;
      }

      setItems(normalized);
      setSource("api");
    } catch {
      setItems(defaultChecklist);
      setSource("demo");
      setError("Backend bağlantısı kurulamadı. Ekran örnek verilerle gösteriliyor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchChecklist(date);
  }, []);

  const summary = useMemo(() => {
    const total = items.length;
    const done = items.filter((item) => item.status === "DONE" || item.completed === true).length;
    const issue = items.filter((item) => item.status === "ISSUE").length;
    const pending = Math.max(total - done, 0);
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      total,
      done,
      pending,
      issue,
      progress,
    };
  }, [items]);

  const grouped = useMemo(() => groupItems(items), [items]);

  function handleDateChange(event) {
    const nextDate = event.target.value;
    setDate(nextDate);
    fetchChecklist(nextDate);
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>HandsOff Operasyon Kontrolü</p>
          <h1 style={styles.title}>Günlük Kontrol Listesi</h1>
          <p style={styles.subtitle}>
            Açılış, stok, finans ve kapanış kontrollerini tek ekranda takip edin.
          </p>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroLabel}>Tamamlanma Oranı</span>
          <strong style={summary.progress >= 80 ? styles.heroValueOk : styles.heroValueWarn}>
            %{summary.progress}
          </strong>
          <small style={source === "api" ? styles.heroNoteOk : styles.heroNoteWarn}>
            {source === "api" ? "Backend verisi kullanılıyor" : "Örnek veri gösteriliyor"}
          </small>
        </div>
      </section>

      <section style={styles.kpiGrid}>
        <KpiCard title="Toplam Kontrol" value={summary.total} note="Günlük kontrol maddesi" />
        <KpiCard title="Tamamlandı" value={summary.done} note="Kapanan kontroller" />
        <KpiCard title="Bekleyen" value={summary.pending} note="Devam eden veya bekleyen işler" />
        <KpiCard title="Sorunlu" value={summary.issue} note="Yönetici dikkati gerekenler" tone="danger" />
      </section>

      <section style={styles.toolbar}>
        <div>
          <h2 style={styles.panelTitle}>Kontrol Akışı</h2>
          <p style={styles.panelText}>
            Tarihe göre günlük operasyon kontrol listesini görüntüleyin.
          </p>
        </div>

        <div style={styles.actions}>
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            style={styles.input}
          />

          <button type="button" onClick={() => fetchChecklist(date)} style={styles.button}>
            Yenile
          </button>
        </div>
      </section>

      {loading ? (
        <section style={styles.stateBox}>Kontrol listesi yükleniyor...</section>
      ) : (
        <>
          {error ? <section style={styles.warningBox}>{error}</section> : null}

          <section style={styles.groupGrid}>
            {Object.entries(grouped).map(([group, groupItemsList]) => (
              <article key={group} style={styles.panel}>
                <div style={styles.groupHeader}>
                  <h3 style={styles.groupTitle}>{group}</h3>
                  <span style={styles.groupCount}>{groupItemsList.length} madde</span>
                </div>

                <div style={styles.list}>
                  {groupItemsList.map((item) => (
                    <div key={item.id || item.title} style={styles.item}>
                      <div style={styles.itemLeft}>
                        <span
                          style={
                            item.status === "DONE" || item.completed === true
                              ? styles.checkDone
                              : styles.checkOpen
                          }
                        >
                          {item.status === "DONE" || item.completed === true ? "✓" : "•"}
                        </span>

                        <div>
                          <strong style={styles.itemTitle}>
                            {item.title || item.name || "Kontrol maddesi"}
                          </strong>
                          <p style={styles.itemText}>
                            Sorumlu: {item.owner || item.assignee || "Atanmamış"}
                          </p>
                        </div>
                      </div>

                      <span style={{ ...styles.badge, ...getStatusStyle(item.status) }}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>
        </>
      )}

      <section style={styles.infoPanel}>
        <h2 style={styles.panelTitle}>Kontrol Notları</h2>

        <div style={styles.noteGrid}>
          <div style={styles.noteBox}>
            <strong>Açılış kontrolleri</strong>
            <span>Kasa, hazırlık, temizlik ve ekip başlangıç durumunu gösterir.</span>
          </div>

          <div style={styles.noteBox}>
            <strong>Stok kontrolleri</strong>
            <span>Kritik stok, sayım, zayi ve kırılma kayıtlarını takip eder.</span>
          </div>

          <div style={styles.noteBox}>
            <strong>Kapanış kontrolleri</strong>
            <span>Gün sonu kasa, POS, gider ve yönetici onayı için kullanılır.</span>
          </div>
        </div>
      </section>
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

const styles = {
  page: {
    minHeight: "100vh",
    padding: "28px",
    color: "#f8fafc",
    background:
      "radial-gradient(circle at top left, #064e3b 0, transparent 34%), linear-gradient(135deg, #0f172a 0%, #111827 48%, #020617 100%)",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: "20px",
    alignItems: "stretch",
    marginBottom: "20px",
  },
  eyebrow: {
    margin: 0,
    color: "#6ee7b7",
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
  input: {
    height: "42px",
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
    background: "linear-gradient(135deg, #10b981, #14b8a6)",
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
  groupGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  panel: {
    padding: "20px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  groupHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    marginBottom: "14px",
  },
  groupTitle: {
    margin: 0,
    fontSize: "20px",
  },
  groupCount: {
    padding: "7px 10px",
    borderRadius: "999px",
    color: "#bbf7d0",
    background: "rgba(34,197,94,0.16)",
    fontSize: "12px",
    fontWeight: 900,
  },
  list: {
    display: "grid",
    gap: "10px",
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    padding: "14px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.55)",
    border: "1px solid rgba(255,255,255,0.07)",
  },
  itemLeft: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  checkDone: {
    width: "28px",
    height: "28px",
    borderRadius: "999px",
    display: "grid",
    placeItems: "center",
    color: "#052e16",
    background: "#bbf7d0",
    fontWeight: 900,
  },
  checkOpen: {
    width: "28px",
    height: "28px",
    borderRadius: "999px",
    display: "grid",
    placeItems: "center",
    color: "#fde68a",
    background: "rgba(245,158,11,0.18)",
    fontWeight: 900,
  },
  itemTitle: {
    display: "block",
    fontSize: "14px",
  },
  itemText: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: "12px",
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

export default DailyChecklistPage;
