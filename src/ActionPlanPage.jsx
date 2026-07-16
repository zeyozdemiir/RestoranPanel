import { useEffect, useMemo, useState } from "react";

const emptyForm = {
  title: "",
  owner: "",
  source: "Yönetim",
  priority: "Orta",
  status: "Açık",
  dueDate: "",
  note: "",
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("tr-TR");
}

function goTo(page) {
  localStorage.setItem("handsoff_last_requested_page", page);

  window.dispatchEvent(
    new CustomEvent("handsoff:navigate", {
      detail: page,
    })
  );
}

export default function ActionPlanPage({ user }) {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    ...emptyForm,
    dueDate: today(),
  });
  const [editingId, setEditingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Tümü");
  const [priorityFilter, setPriorityFilter] = useState("Tümü");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  async function apiFetch(url, options = {}) {
    const token = localStorage.getItem("handsoff_token");

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        ...(options.headers || {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "İşlem başarısız.");
    }

    return data;
  }

  async function fetchTasks() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const data = await apiFetch("http://localhost:4000/api/action-tasks");

      setTasks(data.tasks || []);
      setMessage("Görevler database’den yüklendi.");
    } catch (error) {
      setError(error.message || "Backend bağlantısı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm({
      ...emptyForm,
      dueDate: today(),
    });
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Görev başlığı gir.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (editingId) {
        const data = await apiFetch(
          "http://localhost:4000/api/action-tasks/" + editingId,
          {
            method: "PUT",
            body: JSON.stringify(form),
          }
        );

        setTasks((current) =>
          current.map((task) => (task.id === editingId ? data.task : task))
        );

        setMessage("Görev database’de güncellendi.");
        resetForm();
        return;
      }

      const data = await apiFetch("http://localhost:4000/api/action-tasks", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setTasks((current) => [data.task, ...current]);
      setMessage("Görev database’e eklendi.");
      resetForm();
    } catch (error) {
      setError(error.message || "Backend bağlantısı kurulamadı.");
    } finally {
      setSaving(false);
    }
  }

  function editTask(task) {
    setEditingId(task.id);
    setForm({
      title: task.title || "",
      owner: task.owner || "",
      source: task.source || "Yönetim",
      priority: task.priority || "Orta",
      status: task.status || "Açık",
      dueDate: task.dueDate || today(),
      note: task.note || "",
    });
  }

  async function changeStatus(taskId, status) {
    try {
      const currentTask = tasks.find((task) => task.id === taskId);

      if (!currentTask) return;

      const data = await apiFetch(
        "http://localhost:4000/api/action-tasks/" + taskId,
        {
          method: "PUT",
          body: JSON.stringify({
            ...currentTask,
            status,
          }),
        }
      );

      setTasks((current) =>
        current.map((task) => (task.id === taskId ? data.task : task))
      );

      setMessage("Görev durumu database’de güncellendi.");
    } catch (error) {
      setError(error.message || "Durum güncellenemedi.");
    }
  }

  async function deleteTask(taskId) {
    try {
      await apiFetch("http://localhost:4000/api/action-tasks/" + taskId, {
        method: "DELETE",
      });

      setTasks((current) => current.filter((task) => task.id !== taskId));
      setMessage("Görev database’den silindi.");

      if (editingId === taskId) {
        resetForm();
      }
    } catch (error) {
      setError(error.message || "Görev silinemedi.");
    }
  }

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (statusFilter !== "Tümü" && task.status !== statusFilter) return false;
        if (priorityFilter !== "Tümü" && task.priority !== priorityFilter) return false;
        return true;
      })
      .sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
  }, [tasks, statusFilter, priorityFilter]);

  const summary = useMemo(() => {
    return {
      total: tasks.length,
      open: tasks.filter((task) => task.status === "Açık").length,
      doing: tasks.filter((task) => task.status === "Devam Ediyor").length,
      done: tasks.filter((task) => task.status === "Tamamlandı").length,
      high: tasks.filter((task) => task.priority === "Yüksek").length,
    };
  }, [tasks]);

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {user.restaurantName}</p>

            <h1>Aksiyon Takip / Yönetim Görevleri</h1>

            <p>
              Görevler database’e kaydedilir. Tarayıcı verisi silinse bile
              kayıtlar backend’de kalır.
            </p>
          </div>

          <button className="hero-button" type="button" onClick={fetchTasks}>
            {loading ? "Yükleniyor..." : "Yenile"}
          </button>
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
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 18,
        }}
      >
        <div className="stat-card">
          <p>Toplam Görev</p>
          <h3>{summary.total}</h3>
          <span>Database kayıtlı</span>
        </div>

        <div className="stat-card">
          <p>Açık</p>
          <h3>{summary.open}</h3>
          <span>Başlanacak işler</span>
        </div>

        <div className="stat-card">
          <p>Devam Ediyor</p>
          <h3>{summary.doing}</h3>
          <span>Aktif takipte</span>
        </div>

        <div className="stat-card">
          <p>Tamamlandı</p>
          <h3>{summary.done}</h3>
          <span>Kapanan işler</span>
        </div>

        <div className="stat-card">
          <p>Yüksek Öncelik</p>
          <h3>{summary.high}</h3>
          <span>Acil işler</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>{editingId ? "Görev Düzenle" : "Yeni Görev"}</h2>
              <p className="panel-sub">Yönetim raporlarından çıkan işi kayıt altına al.</p>
            </div>

            {editingId && (
              <button type="button" onClick={resetForm}>
                Yeni Göreve Dön
              </button>
            )}
          </div>

          <div className="form-grid">
            <label style={{ gridColumn: "1 / -1" }}>
              Görev Başlığı
              <input
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Örn: Düşük stok ürünleri satın almaya aktar"
              />
            </label>

            <label>
              Sorumlu
              <input
                value={form.owner}
                onChange={(event) => updateField("owner", event.target.value)}
                placeholder="Yönetim / Mutfak / Muhasebe"
              />
            </label>

            <label>
              Kaynak
              <select
                value={form.source}
                onChange={(event) => updateField("source", event.target.value)}
              >
                <option>Yönetim</option>
                <option>Gün Sonu Raporu</option>
                <option>Haftalık Rapor</option>
                <option>Aylık Rapor</option>
                <option>Stok Yönetimi</option>
                <option>Tedarikçi Cari</option>
                <option>Günlük Kontrol Listesi</option>
              </select>
            </label>

            <label>
              Öncelik
              <select
                value={form.priority}
                onChange={(event) => updateField("priority", event.target.value)}
              >
                <option>Yüksek</option>
                <option>Orta</option>
                <option>Düşük</option>
              </select>
            </label>

            <label>
              Durum
              <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
              >
                <option>Açık</option>
                <option>Devam Ediyor</option>
                <option>Tamamlandı</option>
                <option>İptal</option>
              </select>
            </label>

            <label>
              Termin Tarihi
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) => updateField("dueDate", event.target.value)}
              />
            </label>

            <label style={{ gridColumn: "1 / -1" }}>
              Not
              <textarea
                rows="3"
                value={form.note}
                onChange={(event) => updateField("note", event.target.value)}
                placeholder="Görev detayı veya açıklama"
              />
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
            <button className="hero-button" type="submit" disabled={saving}>
              {saving ? "Kaydediliyor..." : editingId ? "Görevi Güncelle" : "Görev Ekle"}
            </button>
          </div>
        </div>
      </form>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Görev Listesi</h2>
            <p className="panel-sub">Database kayıtlı aksiyonlar.</p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option>Tümü</option>
              <option>Açık</option>
              <option>Devam Ediyor</option>
              <option>Tamamlandı</option>
              <option>İptal</option>
            </select>

            <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
              <option>Tümü</option>
              <option>Yüksek</option>
              <option>Orta</option>
              <option>Düşük</option>
            </select>
          </div>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>Görev</th>
              <th>Sorumlu</th>
              <th>Kaynak</th>
              <th>Öncelik</th>
              <th>Termin</th>
              <th>Durum</th>
              <th>İşlem</th>
            </tr>
          </thead>

          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="7">Henüz görev yok.</td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <strong>{task.title}</strong>
                    {task.note && (
                      <>
                        <br />
                        <span style={{ color: "#6b7280", fontSize: 12 }}>
                          {task.note}
                        </span>
                      </>
                    )}
                  </td>

                  <td>{task.owner || "-"}</td>
                  <td>{task.source || "-"}</td>
                  <td>{task.priority}</td>
                  <td>{formatDate(task.dueDate)}</td>

                  <td>
                    <select
                      value={task.status}
                      onChange={(event) => changeStatus(task.id, event.target.value)}
                    >
                      <option>Açık</option>
                      <option>Devam Ediyor</option>
                      <option>Tamamlandı</option>
                      <option>İptal</option>
                    </select>
                  </td>

                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="button" onClick={() => editTask(task)}>
                        Düzenle
                      </button>

                      <button type="button" onClick={() => deleteTask(task.id)}>
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Hızlı Geçişler</h2>
            <p className="panel-sub">Görevlerin kaynak ekranlarına hızlı geç.</p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          <button type="button" onClick={() => goTo("Gün Sonu Raporu")}>
            Gün Sonu
          </button>

          <button type="button" onClick={() => goTo("Haftalık Yönetim Raporu")}>
            Haftalık
          </button>

          <button type="button" onClick={() => goTo("Aylık Yönetim Raporu")}>
            Aylık
          </button>

          <button type="button" onClick={() => goTo("Günlük Kontrol Listesi")}>
            Kontrol
          </button>

          <button type="button" onClick={() => goTo("Yönetim Özeti")}>
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
