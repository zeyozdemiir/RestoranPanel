import { API_BASE_URL } from "./apiConfig";
import { useEffect, useMemo, useState } from "react";

const menuGroups = [
  {
    title: "Genel",
    items: [
      {
        label: "YÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶netim ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“zeti",
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
        label: "KullanÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â±cÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â± Rolleri / Yetkilendirme",
        permission: "canManageSettings",
      },
      {
        label: "Sistem SaÃƒÆ’Ã¢â‚¬ÂÃƒâ€¦Ã‚Â¸lÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â±k KontrolÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¼",
        permission: "canManageSettings",
      },
      {
        label: "Veri Yedekleme / DÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â±ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€¦Ã‚Â¸a Aktarma",
        permission: "canManageSettings",
      },
    ],
  },
  {
    title: "Finans",
    items: [
      {
        label: "GÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¼nlÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¼k Ciro / Gelir GiriÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€¦Ã‚Â¸i",
        permission: "canManageFinance",
      },
      {
        label: "GÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¼n Sonu Raporu",
        permission: "canViewReports",
      },
      {
        label: "GÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¼nlÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¼k Kontrol Listesi",
        permission: "canManageFinance",
      },
      {
        label: "HaftalÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â±k YÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶netim Raporu",
        permission: "canViewReports",
      },
      {
        label: "AylÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â±k YÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶netim Raporu",
        permission: "canViewReports",
      },
      {
        label: "Aksiyon Takip / YÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶netim GÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶revleri",
        permission: "canViewReports",
      },
      {
        label: "Nakit AkÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â±ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€¦Ã‚Â¸ÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â± / Kasa Banka",
        permission: "canManageFinance",
      },
      {
        label: "KÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢r Zarar",
        permission: "canViewReports",
      },
      {
        label: "Gider YÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶netimi",
        permission: "canManageFinance",
      },
      {
        label: "TedarikÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§i Cari / BorÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ Takibi",
        permission: "canManageSuppliers",
      },
    ],
  },
  {
    title: "Tedarik & Stok",
    items: [
      {
        label: "TedarikÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§iler",
        permission: "canManageSuppliers",
      },
      {
        label: "SatÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â±n Alma Talepleri",
        permission: "canManageSuppliers",
      },
      {
        label: "Stok YÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶netimi",
        permission: "canManageStock",
      },
      {
        label: "Stok SayÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â±mÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â±",
        permission: "canManageStock",
      },
      {
        label: "Zayi / KÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â±rÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â±lma",
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
        label: "SipariÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€¦Ã‚Â¸ler",
        permission: "operation",
      },
      {
        label: "GÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶revler",
        permission: "operation",
      },
      {
        label: "MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¼ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€¦Ã‚Â¸teriler",
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
  fullName: "ÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€¦Ã‚Â¸letme Sahibi",
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
    OWNER: "ÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€¦Ã‚Â¸letme Sahibi",
    ACCOUNTING: "Muhasebe",
    KITCHEN: "Mutfak",
    BAR: "Bar",
    WAITER: "Garson",
    READONLY: "Sadece GÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¼ntÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¼leme",
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
  const safePage =
    typeof page === "string"
      ? page
      : page?.page || page?.label || page?.name || page?.title || "";

  if (!safePage) return;

  localStorage.setItem("handsoff_last_requested_page", safePage);
  window.dispatchEvent(new CustomEvent("handsoff:navigate", { detail: safePage }));
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

      const response = await fetch(API_BASE_URL + "/api/user-roles", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setRoleUsers([]);
        setError(data.message || "Roller alÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â±namadÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â±.");
        return;
      }

      setRoleUsers(data.users || []);
    } catch {
      setRoleUsers([]);
      setError("Rol listesi alÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â±namadÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â±.");
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
        MenÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¼
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
                Yetki ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“nizleme
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
                <option value="">Oturumdaki kullanÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â±cÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â± / Owner</option>

                {roleUsers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.fullName} - {getRoleName(item.role)}
                  </option>
                ))}
              </select>

              <p style={{ margin: "8px 0 0", color: "#6b7280", fontSize: 11 }}>
                Bu alan yayÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â±n ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ncesi test iÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§indir. GerÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ek gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¼venlik iÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§in backend
                yetki kontrolÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¼ ayrÃƒÆ’Ã¢â‚¬ÂÃƒâ€šÃ‚Â±ca baÃƒÆ’Ã¢â‚¬ÂÃƒâ€¦Ã‚Â¸lanacak.
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
              Bu rol iÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§in gÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¼ntÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¼lenecek menÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¼ bulunmuyor.
            </div>
          )}
        </div>
      )}
    </>
  );
}
