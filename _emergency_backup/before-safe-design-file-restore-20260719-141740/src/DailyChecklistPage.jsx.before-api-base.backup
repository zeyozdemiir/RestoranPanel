import { useEffect, useMemo, useState } from "react";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function goTo(page) {
  localStorage.setItem("handsoff_last_requested_page", page);

  window.dispatchEvent(
    new CustomEvent("handsoff:navigate", {
      detail: page,
    })
  );
}

export default function DailyChecklistPage({ user }) {
  const [selectedDate, setSelectedDate] = useState(today());
  const [items, setItems] = useState([]);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchChecklist();
  }, [selectedDate]);

  async function fetchChecklist() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(
        "http://localhost:4000/api/daily-checklists/" + selectedDate,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Kontrol listesi alınamadı.");
        return;
      }

      setItems(data.checklist?.items || []);
      setNote(data.checklist?.note || "");
      setStatus(data.checklist?.status || "OPEN");
      setMessage("Kontrol listesi database’den yüklendi.");
    } catch {
      setError("Backend bağlantısı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function saveChecklist(nextItems = items, nextNote = note, nextStatus = status) {
    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(
        "http://localhost:4000/api/daily-checklists/" + selectedDate,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            note: nextNote,
            status: nextStatus,
            items: nextItems,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Kontrol listesi kaydedilemedi.");
        return;
      }

      setItems(data.checklist?.items || nextItems);
      setNote(data.checklist?.note || nextNote);
      setStatus(data.checklist?.status || nextStatus);
      setMessage("Kontrol listesi database’e kaydedildi.");
    } catch {
      setError("Backend bağlantısı kurulamadı.");
    } finally {
      setSaving(false);
    }
  }

  function toggleItem(id) {
    const nextItems = items.map((item) =>
      item.id === id
        ? {
            ...item,
            done: !item.done,
          }
        : item
    );

    setItems(nextItems);
    saveChecklist(nextItems, note, status);
  }

  function markAllDone() {
    const nextItems = items.map((item) => ({
      ...item,
      done: true,
    }));

    setItems(nextItems);
    saveChecklist(nextItems, note, "COMPLETED");
  }

  function markAllOpen() {
    const nextItems = items.map((item) => ({
      ...item,
      done: false,
    }));

    setItems(nextItems);
    saveChecklist(nextItems, note, "OPEN");
  }

  function updateNote(value) {
    setNote(value);
    saveChecklist(items, value, status);
  }

  const summary = useMemo(() => {
    const total = items.length;
    const done = items.filter((item) => item.done).length;
    const remaining = total - done;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      total,
      done,
      remaining,
      percent,
    };
  }, [items]);

  const grouped = useMemo(() => {
    const groups = [];

    items.forEach((item) => {
      let group = groups.find((entry) => entry.title === item.section);

      if (!group) {
        group = {
          title: item.section,
          items: [],
        };

        groups.push(group);
      }

      group.items.push(item);
    });

    return groups;
  }, [items]);

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {user.restaurantName}</p>

            <h1>Günlük Kontrol Listesi</h1>

            <p>
              Gün sonu kapanış adımları database’e kaydedilir. Tarayıcı verisi
              silinse bile kayıtlar backend’de kalır.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "12px 14px",
                fontWeight: 700,
              }}
            />

            <button className="hero-button" type="button" onClick={fetchChecklist}>
              {loading ? "Yükleniyor..." : "Yenile"}
            </button>

            <button className="hero-button" type="button" onClick={markAllDone}>
              Tümünü Tamamla
            </button>

            <button
              className="hero-button"
              type="button"
              onClick={markAllOpen}
              style={{ background: "#991b1b" }}
            >
              Sıfırla
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div
          className="error-box"
          style={{
            color: "#166534",
            background: "#f0fdf4",
            borderColor: "#bbf7d0",
          }}
        >
          {message}
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 18,
        }}
      >
        <div className="stat-card">
          <p>Durum</p>
          <h3>{summary.percent === 100 ? "Tamam" : "Devam Ediyor"}</h3>
          <span>{selectedDate}</span>
        </div>

        <div className="stat-card">
          <p>Tamamlanan</p>
          <h3>{summary.done}</h3>
          <span>{summary.total} madde içinde</span>
        </div>

        <div className="stat-card">
          <p>Kalan</p>
          <h3>{summary.remaining}</h3>
          <span>Kapanış öncesi eksik</span>
        </div>

        <div className="stat-card">
          <p>Tamamlanma</p>
          <h3>%{summary.percent}</h3>
          <span>{saving ? "Kaydediliyor..." : "Database kayıtlı"}</span>
        </div>
      </div>

      <div
        style={{
          height: 14,
          background: "#e5e7eb",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${summary.percent}%`,
            height: "100%",
            background: summary.percent === 100 ? "#16a34a" : "#111827",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 18,
        }}
      >
        {grouped.map((section) => (
          <div className="panel" key={section.title}>
            <div className="panel-head">
              <div>
                <h2>{section.title}</h2>

                <p className="panel-sub">
                  {section.items.filter((item) => item.done).length} /{" "}
                  {section.items.length} tamamlandı
                </p>
              </div>
            </div>

            <table className="module-table">
              <tbody>
                {section.items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ width: 44 }}>
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => toggleItem(item.id)}
                      />
                    </td>

                    <td
                      style={{
                        textDecoration: item.done ? "line-through" : "none",
                        color: item.done ? "#6b7280" : "#111827",
                      }}
                    >
                      {item.text}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Gün Notu</h2>
            <p className="panel-sub">Bu not da database’e kaydedilir.</p>
          </div>
        </div>

        <textarea
          rows="5"
          value={note}
          onChange={(event) => updateNote(event.target.value)}
          placeholder="Örn: Yarın kahve çekirdeği ve süt stoğu kontrol edilecek."
          style={{
            width: "100%",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 14,
            resize: "vertical",
          }}
        />
      </div>
    </div>
  );
}
