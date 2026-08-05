import { useEffect, useMemo, useState } from "react";

const emptyForm = {
  fullName: "",
  email: "",
  role: "READONLY",
  status: "ACTIVE",
  canViewReports: false,
  canManageFinance: false,
  canManageStock: false,
  canManageSuppliers: false,
  canManageSettings: false,
};

const roleLabels = {
  OWNER: "İşletme Sahibi",
  ACCOUNTING: "Muhasebe",
  KITCHEN: "Mutfak",
  BAR: "Bar",
  WAITER: "Garson",
  READONLY: "Sadece Görüntüleme",
};

export default function UserRolesPage({ user }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [roleFilter, setRoleFilter] = useState("Tümü");
  const [statusFilter, setStatusFilter] = useState("Tümü");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
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

  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const data = await apiFetch("http://localhost:4000/api/user-roles");

      setUsers(data.users || []);
      setMessage("Kullanıcı rolleri database’den yüklendi.");
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
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.fullName.trim()) {
      setError("Ad soyad gir.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (editingId) {
        const data = await apiFetch(
          "http://localhost:4000/api/user-roles/" + editingId,
          {
            method: "PUT",
            body: JSON.stringify(form),
          }
        );

        setUsers((current) =>
          current.map((item) => (item.id === editingId ? data.user : item))
        );

        setMessage("Kullanıcı rolü database’de güncellendi.");
        resetForm();
        return;
      }

      const data = await apiFetch("http://localhost:4000/api/user-roles", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setUsers((current) => [...current, data.user]);
      setMessage("Kullanıcı rolü database’e eklendi.");
      resetForm();
    } catch (error) {
      setError(error.message || "Kayıt yapılamadı.");
    } finally {
      setSaving(false);
    }
  }

  function editUser(item) {
    setEditingId(item.id);
    setForm({
      fullName: item.fullName || "",
      email: item.email || "",
      role: item.role || "READONLY",
      status: item.status || "ACTIVE",
      canViewReports: Boolean(item.canViewReports),
      canManageFinance: Boolean(item.canManageFinance),
      canManageStock: Boolean(item.canManageStock),
      canManageSuppliers: Boolean(item.canManageSuppliers),
      canManageSettings: Boolean(item.canManageSettings),
    });
  }

  async function deleteUser(id) {
    try {
      await apiFetch("http://localhost:4000/api/user-roles/" + id, {
        method: "DELETE",
      });

      setUsers((current) => current.filter((item) => item.id !== id));
      setMessage("Kullanıcı rolü database’den silindi.");

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      setError(error.message || "Silme işlemi başarısız.");
    }
  }

  async function quickStatus(id, status) {
    const currentUser = users.find((item) => item.id === id);

    if (!currentUser) return;

    try {
      const data = await apiFetch("http://localhost:4000/api/user-roles/" + id, {
        method: "PUT",
        body: JSON.stringify({
          ...currentUser,
          status,
        }),
      });

      setUsers((current) =>
        current.map((item) => (item.id === id ? data.user : item))
      );

      setMessage("Kullanıcı durumu güncellendi.");
    } catch (error) {
      setError(error.message || "Durum güncellenemedi.");
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      if (roleFilter !== "Tümü" && item.role !== roleFilter) return false;
      if (statusFilter !== "Tümü" && item.status !== statusFilter) return false;
      return true;
    });
  }, [users, roleFilter, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((item) => item.status === "ACTIVE").length,
      passive: users.filter((item) => item.status !== "ACTIVE").length,
      owners: users.filter((item) => item.role === "OWNER").length,
    };
  }, [users]);

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {user.restaurantName}</p>

            <h1>Kullanıcı Rolleri / Yetkilendirme</h1>

            <p>
              Kullanıcı rolleri artık database’e kaydedilir. Bu ekran gerçek
              yetki yönetiminin temelini hazırlar.
            </p>
          </div>

          <button className="hero-button" type="button" onClick={fetchUsers}>
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
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 18,
        }}
      >
        <div className="stat-card">
          <p>Toplam Kullanıcı</p>
          <h3>{summary.total}</h3>
          <span>Database kayıtlı</span>
        </div>

        <div className="stat-card">
          <p>Aktif</p>
          <h3>{summary.active}</h3>
          <span>Kullanıma açık</span>
        </div>

        <div className="stat-card">
          <p>Pasif</p>
          <h3>{summary.passive}</h3>
          <span>Devre dışı</span>
        </div>

        <div className="stat-card">
          <p>Owner</p>
          <h3>{summary.owners}</h3>
          <span>Tam yetkili</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>{editingId ? "Kullanıcı Rolü Düzenle" : "Yeni Kullanıcı Rolü"}</h2>
              <p className="panel-sub">
                Bu kayıtlar database’de tutulur; tarayıcı verisine bağlı değildir.
              </p>
            </div>

            {editingId && (
              <button type="button" onClick={resetForm}>
                Yeni Kayıt
              </button>
            )}
          </div>

          <div className="form-grid">
            <label>
              Ad Soyad
              <input
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                placeholder="Örn: Zeynep Özdemir"
              />
            </label>

            <label>
              E-posta
              <input
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="ornek@firma.com"
              />
            </label>

            <label>
              Rol
              <select
                value={form.role}
                onChange={(event) => updateField("role", event.target.value)}
              >
                <option value="OWNER">İşletme Sahibi</option>
                <option value="ACCOUNTING">Muhasebe</option>
                <option value="KITCHEN">Mutfak</option>
                <option value="BAR">Bar</option>
                <option value="WAITER">Garson</option>
                <option value="READONLY">Sadece Görüntüleme</option>
              </select>
            </label>

            <label>
              Durum
              <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
              >
                <option value="ACTIVE">Aktif</option>
                <option value="PASSIVE">Pasif</option>
              </select>
            </label>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
              gap: 12,
              marginTop: 18,
            }}
          >
            <label>
              <input
                type="checkbox"
                checked={form.canViewReports}
                onChange={(event) => updateField("canViewReports", event.target.checked)}
              />{" "}
              Rapor Görür
            </label>

            <label>
              <input
                type="checkbox"
                checked={form.canManageFinance}
                onChange={(event) => updateField("canManageFinance", event.target.checked)}
              />{" "}
              Finans
            </label>

            <label>
              <input
                type="checkbox"
                checked={form.canManageStock}
                onChange={(event) => updateField("canManageStock", event.target.checked)}
              />{" "}
              Stok
            </label>

            <label>
              <input
                type="checkbox"
                checked={form.canManageSuppliers}
                onChange={(event) => updateField("canManageSuppliers", event.target.checked)}
              />{" "}
              Tedarikçi
            </label>

            <label>
              <input
                type="checkbox"
                checked={form.canManageSettings}
                onChange={(event) => updateField("canManageSettings", event.target.checked)}
              />{" "}
              Ayarlar
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
            <button className="hero-button" type="submit" disabled={saving}>
              {saving ? "Kaydediliyor..." : editingId ? "Güncelle" : "Kaydet"}
            </button>
          </div>
        </div>
      </form>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Kullanıcı Listesi</h2>
            <p className="panel-sub">Database kayıtlı rol listesi.</p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              <option>Tümü</option>
              <option value="OWNER">İşletme Sahibi</option>
              <option value="ACCOUNTING">Muhasebe</option>
              <option value="KITCHEN">Mutfak</option>
              <option value="BAR">Bar</option>
              <option value="WAITER">Garson</option>
              <option value="READONLY">Sadece Görüntüleme</option>
            </select>

            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option>Tümü</option>
              <option value="ACTIVE">Aktif</option>
              <option value="PASSIVE">Pasif</option>
            </select>
          </div>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>Kullanıcı</th>
              <th>Rol</th>
              <th>Durum</th>
              <th>Yetkiler</th>
              <th>İşlem</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5">Kayıt yok.</td>
              </tr>
            ) : (
              filteredUsers.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.fullName}</strong>
                    <br />
                    <span style={{ color: "#6b7280", fontSize: 12 }}>
                      {item.email || "-"}
                    </span>
                  </td>

                  <td>{roleLabels[item.role] || item.role}</td>

                  <td>{item.status === "ACTIVE" ? "Aktif" : "Pasif"}</td>

                  <td>
                    {[
                      item.canViewReports ? "Rapor" : null,
                      item.canManageFinance ? "Finans" : null,
                      item.canManageStock ? "Stok" : null,
                      item.canManageSuppliers ? "Tedarikçi" : null,
                      item.canManageSettings ? "Ayarlar" : null,
                    ]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </td>

                  <td>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button type="button" onClick={() => editUser(item)}>
                        Düzenle
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          quickStatus(item.id, item.status === "ACTIVE" ? "PASSIVE" : "ACTIVE")
                        }
                      >
                        {item.status === "ACTIVE" ? "Pasif Yap" : "Aktif Yap"}
                      </button>

                      <button type="button" onClick={() => deleteUser(item.id)}>
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
    </div>
  );
}
