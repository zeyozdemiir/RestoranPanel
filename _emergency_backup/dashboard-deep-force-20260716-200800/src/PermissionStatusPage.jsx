import { API_BASE_URL } from "./apiConfig";
﻿import { useEffect, useMemo, useState } from "react";

const roleLabels = {
  OWNER: "İşletme Sahibi",
  ACCOUNTING: "Muhasebe",
  KITCHEN: "Mutfak",
  BAR: "Bar",
  WAITER: "Garson",
  READONLY: "Sadece Görüntüleme",
};

const fallbackOwner = {
  fullName: "İşletme Sahibi",
  email: "owner@handsoff.local",
  role: "OWNER",
  status: "ACTIVE",
  canViewReports: true,
  canManageFinance: true,
  canManageStock: true,
  canManageSuppliers: true,
  canManageSettings: true,
};

function getSessionUser() {
  try {
    const raw = localStorage.getItem("handsoff_session");

    if (!raw) return {};

    const parsed = JSON.parse(raw);

    return parsed?.user || parsed || {};
  } catch {
    return {};
  }
}

function yesNo(value) {
  return value ? "Var" : "Yok";
}

function permissionStatus(value) {
  return value ? "Yetkili" : "Yetkisiz";
}

function getRoleName(role) {
  return roleLabels[role] || role || "-";
}

function normalizePermissions(member) {
  const isOwner = member?.role === "OWNER";

  return {
    canViewReports: Boolean(member?.canViewReports || isOwner),
    canManageFinance: Boolean(member?.canManageFinance || isOwner),
    canManageStock: Boolean(member?.canManageStock || isOwner),
    canManageSuppliers: Boolean(member?.canManageSuppliers || isOwner),
    canManageSettings: Boolean(member?.canManageSettings || isOwner),
  };
}

export default function PermissionStatusPage({ user }) {
  const [roleUsers, setRoleUsers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [activeMember, setActiveMember] = useState(fallbackOwner);
  const [permissions, setPermissions] = useState(normalizePermissions(fallbackOwner));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRoleUsers();
  }, []);

  async function fetchRoleUsers() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/user-roles", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setRoleUsers([]);
        setActiveMember(fallbackOwner);
        setPermissions(normalizePermissions(fallbackOwner));
        setError(
          data.message ||
            "Rol listesi alınamadı. Bu ekran şimdilik Owner görünümüyle açıldı."
        );
        return;
      }

      const users = data.users || [];
      setRoleUsers(users);

      const sessionUser = getSessionUser();
      const sessionEmail = String(sessionUser.email || "").toLowerCase();

      const matchedByEmail = users.find((item) => {
        return String(item.email || "").toLowerCase() === sessionEmail && sessionEmail;
      });

      const owner = users.find((item) => item.role === "OWNER" && item.status === "ACTIVE");

      const member = matchedByEmail || owner || users[0] || fallbackOwner;

      setActiveMember(member);
      setSelectedId(member?.id ? String(member.id) : "");
      setPermissions(normalizePermissions(member));
      setMessage("Yetki bilgileri mevcut User Roles API üzerinden alındı.");
    } catch {
      setRoleUsers([]);
      setActiveMember(fallbackOwner);
      setPermissions(normalizePermissions(fallbackOwner));
      setError("Backend bağlantısı kurulamadı. Bu ekran şimdilik Owner görünümüyle açıldı.");
    } finally {
      setLoading(false);
    }
  }

  function selectMember(id) {
    setSelectedId(id);

    const member =
      roleUsers.find((item) => String(item.id) === String(id)) || fallbackOwner;

    setActiveMember(member);
    setPermissions(normalizePermissions(member));
  }

  const summary = useMemo(() => {
    const values = [
      permissions.canViewReports,
      permissions.canManageFinance,
      permissions.canManageStock,
      permissions.canManageSuppliers,
      permissions.canManageSettings,
    ];

    const allowed = values.filter(Boolean).length;

    return {
      total: values.length,
      allowed,
      denied: values.length - allowed,
    };
  }, [permissions]);

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {user.restaurantName}</p>

            <h1>Yetki Durumu</h1>

            <p>
              Aktif rolün ve seçili kullanıcının menü / işlem yetkilerini gösterir.
              Bu ekran yeni backend endpoint kullanmaz.
            </p>
          </div>

          <button className="hero-button" type="button" onClick={fetchRoleUsers}>
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

      {roleUsers.length > 0 && (
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Yetki Önizleme</h2>
              <p className="panel-sub">
                Farklı kullanıcıların hangi yetkileri olduğunu buradan kontrol et.
              </p>
            </div>
          </div>

          <select
            value={selectedId}
            onChange={(event) => selectMember(event.target.value)}
            style={{
              width: "100%",
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: "12px 14px",
              fontWeight: 700,
            }}
          >
            {roleUsers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.fullName} - {getRoleName(item.role)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 18,
        }}
      >
        <div className="stat-card">
          <p>Aktif Rol</p>
          <h3>{getRoleName(activeMember?.role)}</h3>
          <span>{activeMember?.status === "ACTIVE" ? "Aktif" : "Pasif"}</span>
        </div>

        <div className="stat-card">
          <p>Yetkili Alan</p>
          <h3>{summary.allowed}</h3>
          <span>{summary.total} alan içinde</span>
        </div>

        <div className="stat-card">
          <p>Yetkisiz Alan</p>
          <h3>{summary.denied}</h3>
          <span>Rol kaydına göre</span>
        </div>

        <div className="stat-card">
          <p>Kullanıcı</p>
          <h3>{activeMember?.fullName || "-"}</h3>
          <span>{activeMember?.email || "-"}</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Yetki Özeti</h2>
            <p className="panel-sub">
              Bu tablo Kullanıcı Rolleri ekranındaki database kayıtlarına göre hesaplanır.
            </p>
          </div>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>Alan</th>
              <th>Durum</th>
              <th>Açıklama</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Rapor Görüntüleme</td>
              <td>{permissionStatus(permissions.canViewReports)}</td>
              <td>Yönetim özeti, rapor merkezi, haftalık ve aylık raporlar</td>
            </tr>

            <tr>
              <td>Finans Yönetimi</td>
              <td>{permissionStatus(permissions.canManageFinance)}</td>
              <td>Ciro, gider, kasa ve finans yazma işlemleri</td>
            </tr>

            <tr>
              <td>Stok Yönetimi</td>
              <td>{permissionStatus(permissions.canManageStock)}</td>
              <td>Stok, stok sayımı, zayi ve kırılma işlemleri</td>
            </tr>

            <tr>
              <td>Tedarikçi Yönetimi</td>
              <td>{permissionStatus(permissions.canManageSuppliers)}</td>
              <td>Tedarikçi, satın alma ve cari işlemleri</td>
            </tr>

            <tr>
              <td>Ayar Yönetimi</td>
              <td>{permissionStatus(permissions.canManageSettings)}</td>
              <td>Ayarlar, kullanıcı rolleri, sistem kontrol ve yedekleme</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Kullanıcı Detayı</h2>
            <p className="panel-sub">Seçili kullanıcı rolünün ham yetki özeti.</p>
          </div>
        </div>

        <table className="module-table">
          <tbody>
            <tr>
              <td>Ad Soyad</td>
              <td>{activeMember?.fullName || "-"}</td>
            </tr>

            <tr>
              <td>E-posta</td>
              <td>{activeMember?.email || "-"}</td>
            </tr>

            <tr>
              <td>Rol</td>
              <td>{getRoleName(activeMember?.role)}</td>
            </tr>

            <tr>
              <td>Durum</td>
              <td>{activeMember?.status === "ACTIVE" ? "Aktif" : "Pasif"}</td>
            </tr>

            <tr>
              <td>Rapor</td>
              <td>{yesNo(permissions.canViewReports)}</td>
            </tr>

            <tr>
              <td>Finans</td>
              <td>{yesNo(permissions.canManageFinance)}</td>
            </tr>

            <tr>
              <td>Stok</td>
              <td>{yesNo(permissions.canManageStock)}</td>
            </tr>

            <tr>
              <td>Tedarikçi</td>
              <td>{yesNo(permissions.canManageSuppliers)}</td>
            </tr>

            <tr>
              <td>Ayar</td>
              <td>{yesNo(permissions.canManageSettings)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
