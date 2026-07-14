import { useEffect, useMemo, useState } from "react";

const storageKey = "handsoff_local_user_roles";

const rolePresets = {
  OWNER: {
    label: "Yönetici",
    description: "Tüm ekranları görür ve yönetir.",
    permissions: [
      "Yönetim Özeti",
      "Ayarlar",
      "Sistem Kontrol",
      "Veri Yedekleme",
      "Günlük Ciro",
      "Nakit Akışı",
      "Kâr Zarar",
      "Tedarikçiler",
      "Tedarikçi Cari",
      "Satın Alma",
      "Stok Yönetimi",
      "Stok Sayımı",
      "Zayi / Kırılma",
    ],
  },
  ACCOUNTING: {
    label: "Muhasebe",
    description: "Gelir, gider, kasa, tedarikçi cari ve kâr zarar ekranlarını görür.",
    permissions: [
      "Yönetim Özeti",
      "Günlük Ciro",
      "Nakit Akışı",
      "Kâr Zarar",
      "Tedarikçiler",
      "Tedarikçi Cari",
      "Veri Yedekleme",
    ],
  },
  KITCHEN: {
    label: "Mutfak",
    description: "Stok, stok sayımı, zayi ve satın alma süreçlerini görür.",
    permissions: [
      "Yönetim Özeti",
      "Satın Alma",
      "Stok Yönetimi",
      "Stok Sayımı",
      "Zayi / Kırılma",
    ],
  },
  BAR: {
    label: "Bar",
    description: "Bar stokları, zayi, sayım ve satın alma taleplerini görür.",
    permissions: [
      "Yönetim Özeti",
      "Satın Alma",
      "Stok Yönetimi",
      "Stok Sayımı",
      "Zayi / Kırılma",
    ],
  },
  WAITER: {
    label: "Garson",
    description: "Sınırlı operasyon ekranlarını görür.",
    permissions: [
      "Yönetim Özeti",
      "Günlük Ciro",
    ],
  },
  READONLY: {
    label: "Sadece Okuma",
    description: "Veri değiştirmeden yalnızca takip eder.",
    permissions: [
      "Yönetim Özeti",
    ],
  },
};

const emptyUser = {
  name: "",
  email: "",
  role: "READONLY",
  permissions: rolePresets.READONLY.permissions,
};

function createDefaultUsers(currentUser) {
  return [
    {
      id: "current-user",
      name:
        currentUser?.name ||
        currentUser?.fullName ||
        currentUser?.restaurantName ||
        "Ana Kullanıcı",
      email: currentUser?.email || "admin@handsoff.com",
      role: "OWNER",
      permissions: rolePresets.OWNER.permissions,
    },
  ];
}

export default function UserRolesPage({ user }) {
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(emptyUser);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed) && parsed.length > 0) {
          setUsers(parsed);
          setSelectedId(parsed[0].id);
          setForm(parsed[0]);
          return;
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
    }

    const defaults = createDefaultUsers(user);
    setUsers(defaults);
    setSelectedId(defaults[0].id);
    setForm(defaults[0]);
    localStorage.setItem(storageKey, JSON.stringify(defaults));
  }, [user]);

  const selectedUser = useMemo(() => {
    return users.find((item) => item.id === selectedId) || null;
  }, [users, selectedId]);

  function saveUsers(nextUsers) {
    setUsers(nextUsers);
    localStorage.setItem(storageKey, JSON.stringify(nextUsers));
  }

  function selectUser(id) {
    const found = users.find((item) => item.id === id);

    if (!found) return;

    setSelectedId(id);
    setForm(found);
    setMessage("");
  }

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function changeRole(role) {
    const preset = rolePresets[role] || rolePresets.READONLY;

    setForm((current) => ({
      ...current,
      role,
      permissions: preset.permissions,
    }));
  }

  function togglePermission(permission) {
    setForm((current) => {
      const currentPermissions = current.permissions || [];

      const nextPermissions = currentPermissions.includes(permission)
        ? currentPermissions.filter((item) => item !== permission)
        : [...currentPermissions, permission];

      return {
        ...current,
        permissions: nextPermissions,
      };
    });
  }

  function saveRole() {
    if (!form.name.trim() && !form.email.trim()) {
      setMessage("Kullanıcı adı veya e-posta gir.");
      return;
    }

    const nextForm = {
      ...form,
      id: form.id || "user-" + Date.now(),
      permissions: form.permissions || [],
    };

    const exists = users.some((item) => item.id === nextForm.id);

    const nextUsers = exists
      ? users.map((item) => (item.id === nextForm.id ? nextForm : item))
      : [...users, nextForm];

    saveUsers(nextUsers);
    setSelectedId(nextForm.id);
    setForm(nextForm);
    setMessage("Rol bilgisi kaydedildi.");
  }

  function createNewUser() {
    const next = {
      ...emptyUser,
      id: "user-" + Date.now(),
      name: "Yeni Kullanıcı",
      email: "",
    };

    setSelectedId(next.id);
    setForm(next);
    setMessage("");
  }

  function deleteUser(id) {
    if (users.length <= 1) {
      setMessage("En az bir kullanıcı kalmalı.");
      return;
    }

    const nextUsers = users.filter((item) => item.id !== id);
    saveUsers(nextUsers);
    setSelectedId(nextUsers[0].id);
    setForm(nextUsers[0]);
    setMessage("Kullanıcı silindi.");
  }

  const allPermissions = Array.from(
    new Set(
      Object.values(rolePresets)
        .map((role) => role.permissions)
        .flat()
    )
  );

  const role = rolePresets[form.role] || rolePresets.READONLY;

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {user.restaurantName}</p>

            <h1>Kullanıcı Rolleri / Yetkilendirme</h1>

            <p>
              Bu ekran şu an güvenli lokal sürümde çalışır. Backend’i bozmadan
              rol planını oluşturur. Daha sonra API seviyesinde zorunlu hale
              getirilecek.
            </p>
          </div>

          <button className="hero-button" type="button" onClick={createNewUser}>
            Yeni Kullanıcı
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr",
          gap: 18,
        }}
      >
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Kullanıcılar</h2>
              <p className="panel-sub">Rol verilecek kullanıcı listesi.</p>
            </div>

            <span className="mini-pill">{users.length} kullanıcı</span>
          </div>

          <table className="module-table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>Rol</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {users.map((item) => {
                const itemRole = rolePresets[item.role] || rolePresets.READONLY;

                return (
                  <tr
                    key={item.id}
                    onClick={() => selectUser(item.id)}
                    style={{
                      cursor: "pointer",
                      background:
                        item.id === selectedId ? "#f3f4f6" : "transparent",
                    }}
                  >
                    <td>
                      <strong>{item.name || "Kullanıcı"}</strong>
                      <br />
                      <span style={{ color: "#6b7280", fontSize: 12 }}>
                        {item.email || "-"}
                      </span>
                    </td>

                    <td>{itemRole.label}</td>

                    <td>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteUser(item.id);
                        }}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Rol Düzenle</h2>
              <p className="panel-sub">{role.description}</p>
            </div>

            <span className="mini-pill">
              {selectedUser ? "Seçili kullanıcı" : "Yeni kullanıcı"}
            </span>
          </div>

          <div className="form-grid">
            <label>
              Ad Soyad
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Kullanıcı adı"
              />
            </label>

            <label>
              E-posta
              <input
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="kullanici@mail.com"
              />
            </label>

            <label style={{ gridColumn: "1 / -1" }}>
              Rol
              <select
                value={form.role}
                onChange={(event) => changeRole(event.target.value)}
              >
                {Object.entries(rolePresets).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ marginTop: 18 }}>
            <h3 style={{ marginBottom: 10 }}>Ekran İzinleri</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              {allPermissions.map((permission) => (
                <label
                  key={permission}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 10,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={(form.permissions || []).includes(permission)}
                    onChange={() => togglePermission(permission)}
                  />

                  <span>{permission}</span>
                </label>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 18,
            }}
          >
            <button className="hero-button" type="button" onClick={saveRole}>
              Rolü Kaydet
            </button>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Rol Şablonları</h2>

            <p className="panel-sub">
              Restoran içinde kullanacağımız temel yetki şablonları.
            </p>
          </div>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>Rol</th>
              <th>Açıklama</th>
              <th>İzinler</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(rolePresets).map(([key, value]) => (
              <tr key={key}>
                <td>{value.label}</td>
                <td>{value.description}</td>
                <td>{value.permissions.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
