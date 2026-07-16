import { useEffect, useMemo, useState } from "react";

const menuGroups = [
  {
    title: "Genel",
    items: [
      {
        label: "Yönetim Özeti",
        permission: "canViewReports",
      },
      {
        label: "Yetki Durumu",
        permission: "self",
      },
      {
        label: "Rapor Merkezi",
        permission: "canViewReports",
      },
      {
        label: "Ayarlar / Restoran Bilgileri",
        permission: "canManageSettings",
      },
      {
        label: "Kullanıcı Rolleri / Yetkilendirme",
        permission: "canManageSettings",
      },
      {
        label: "Sistem Sağlık Kontrolü",
        permission: "canManageSettings",
      },
      {
        label: "Veri Yedekleme / Dışa Aktarma",
        permission: "canManageSettings",
      },
    ],
  },
  {
    title: "Finans",
    items: [
      {
        label: "Günlük Ciro / Gelir Girişi",
        permission: "canManageFinance",
      },
      {
        label: "Gün Sonu Raporu",
        permission: "canViewReports",
      },
      {
        label: "Günlük Kontrol Listesi",
        permission: "canManageFinance",
      },
      {
        label: "Haftalık Yönetim Raporu",
        permission: "canViewReports",
      },
      {
        label: "Aylık Yönetim Raporu",
        permission: "canViewReports",
      },
      {
        label: "Aksiyon Takip / Yönetim Görevleri",
        permission: "canViewReports",
      },
      {
        label: "Nakit Akışı / Kasa Banka",
        permission: "canManageFinance",
      },
      {
        label: "Kâr Zarar",
        permission: "canViewReports",
      },
      {
        label: "Gider Yönetimi",
        permission: "canManageFinance",
      },
      {
        label: "Tedarikçi Cari / Borç Takibi",
        permission: "canManageSuppliers",
      },
    ],
  },
  {
    title: "Tedarik & Stok",
    items: [
      {
        label: "Tedarikçiler",
        permission: "canManageSuppliers",
      },
      {
        label: "Satın Alma Talepleri",
        permission: "canManageSuppliers",
      },
      {
        label: "Stok Yönetimi",
        permission: "canManageStock",
      },
      {
        label: "Stok Sayımı",
        permission: "canManageStock",
      },
      {
        label: "Zayi / Kırılma",
        permission: "canManageStock",
      },
    ],
  },
  {
    title: "Operasyon",
    items: [
      {
        label: "Rezervasyonlar",
        permission: "operation",
      },
      {
        label: "Siparişler",
        permission: "operation",
      },
      {
        label: "Görevler",
        permission: "operation",
      },
      {
        label: "Müşteriler",
        permission: "operation",
      },
      {
        label: "Raporlar",
        permission: "canViewReports",
      },
    ],
  },
];

const fallbackOwner = {
  id: "fallback-owner",
  fullName: "İşletme Sahibi",
  email: "",
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

function getRoleName(role) {
  const names = {
    OWNER: "İşletme Sahibi",
    ACCOUNTING: "Muhasebe",
    KITCHEN: "Mutfak",
    BAR: "Bar",
    WAITER: "Garson",
    READONLY: "Sadece Görüntüleme",
  };

  return names[role] || role || "Rol Yok";
}

function canSeeItem(member, permission) {
  if (!member) return false;

  if (member.status && member.status !== "ACTIVE") {
    return false;
  }

  if (member.role === "OWNER") {
    return true;
  }

  if (permission === "self") {
    return true;
  }

  if (permission === "operation") {
    return ["WAITER", "BAR", "KITCHEN", "ACCOUNTING"].includes(member.role);
  }

  return Boolean(member[permission]);
}

function goTo(page) {
  localStorage.setItem("handsoff_last_requested_page", page);

  window.dispatchEvent(
    new CustomEvent("handsoff:navigate", {
      detail: page,
    })
  );
}

export default function HandsOffFloatingMenu() {
  const [open, setOpen] = useState(false);
  const [roleUsers, setRoleUsers] = useState([]);
  const [previewId, setPreviewId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRoleUsers();
  }, []);

  async function fetchRoleUsers() {
    try {
      setError("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch("http://localhost:4000/api/user-roles", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setRoleUsers([]);
        setError(data.message || "Roller alınamadı.");
        return;
      }

      setRoleUsers(data.users || []);
    } catch {
      setRoleUsers([]);
      setError("Rol listesi alınamadı.");
    }
  }

  const activeMember = useMemo(() => {
    const previewMember = roleUsers.find((item) => String(item.id) === String(previewId));

    if (previewMember) {
      return previewMember;
    }

    const sessionUser = getSessionUser();
    const sessionEmail = String(sessionUser.email || "").toLowerCase();

    const matchedByEmail = roleUsers.find((item) => {
      return String(item.email || "").toLowerCase() === sessionEmail && sessionEmail;
    });

    if (matchedByEmail) {
      return matchedByEmail;
    }

    return fallbackOwner;
  }, [roleUsers, previewId]);

  const visibleGroups = useMemo(() => {
    return menuGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => canSeeItem(activeMember, item.permission)),
      }))
      .filter((group) => group.items.length > 0);
  }, [activeMember]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        style={{
          position: "fixed",
          left: 22,
          bottom: 22,
          zIndex: 9999,
          width: 64,
          height: 64,
          borderRadius: 999,
          border: "none",
          background: "#111827",
          color: "#ffffff",
          fontWeight: 800,
          boxShadow: "0 18px 50px rgba(15,23,42,0.35)",
          cursor: "pointer",
        }}
      >
        Menü
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            left: 22,
            bottom: 96,
            zIndex: 9999,
            width: 360,
            maxHeight: "78vh",
            overflowY: "auto",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 24,
            boxShadow: "0 24px 80px rgba(15,23,42,0.25)",
            padding: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "flex-start",
              marginBottom: 14,
            }}
          >
            <div>
              <strong style={{ display: "block", color: "#111827", fontSize: 18 }}>
                HandsOff Panel
              </strong>

              <span style={{ color: "#6b7280", fontSize: 12 }}>
                Aktif rol: {getRoleName(activeMember.role)}
              </span>

              {activeMember.fullName && (
                <span style={{ display: "block", color: "#6b7280", fontSize: 12 }}>
                  {activeMember.fullName}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
                borderRadius: 12,
                padding: "8px 10px",
                cursor: "pointer",
              }}
            >
              Kapat
            </button>
          </div>

          {roleUsers.length > 0 && (
            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: 12,
                marginBottom: 14,
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#374151",
                  marginBottom: 6,
                }}
              >
                Yetki Önizleme
              </label>

              <select
                value={previewId}
                onChange={(event) => setPreviewId(event.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "10px 12px",
                }}
              >
                <option value="">Oturumdaki kullanıcı / Owner</option>

                {roleUsers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.fullName} - {getRoleName(item.role)}
                  </option>
                ))}
              </select>

              <p style={{ margin: "8px 0 0", color: "#6b7280", fontSize: 11 }}>
                Bu alan yayın öncesi test içindir. Gerçek güvenlik için backend
                yetki kontrolü ayrıca bağlanacak.
              </p>
            </div>
          )}

          {error && (
            <div
              style={{
                background: "#fef2f2",
                color: "#991b1b",
                border: "1px solid #fecaca",
                borderRadius: 14,
                padding: 10,
                fontSize: 12,
                marginBottom: 12,
              }}
            >
              {error}
            </div>
          )}

          {visibleGroups.map((group) => (
            <div key={group.title} style={{ marginBottom: 16 }}>
              <p
                style={{
                  margin: "0 0 8px",
                  color: "#6b7280",
                  fontSize: 12,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                }}
              >
                {group.title}
              </p>

              <div style={{ display: "grid", gap: 8 }}>
                {group.items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      goTo(item.label);
                      setOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      border: "1px solid #e5e7eb",
                      background: "#ffffff",
                      color: "#111827",
                      borderRadius: 14,
                      padding: "11px 12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {visibleGroups.length === 0 && (
            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: 14,
                color: "#6b7280",
              }}
            >
              Bu rol için görüntülenecek menü bulunmuyor.
            </div>
          )}
        </div>
      )}
    </>
  );
}
