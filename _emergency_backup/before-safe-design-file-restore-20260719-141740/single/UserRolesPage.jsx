import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "./apiConfig";

const roleLabels = {
  OWNER: "İşletme Sahibi",
  MANAGER: "Restoran Yöneticisi",
  ACCOUNTING: "Muhasebe Sorumlusu",
  STOCK: "Stok Sorumlusu",
  KITCHEN: "Mutfak",
  BAR: "Bar",
  WAITER: "Operasyon / Garson",
  READONLY: "Sadece Görüntüleme",
};

const permissionLabels = [
  {
    key: "canViewReports",
    label: "Raporları Görüntüleme",
  },
  {
    key: "canManageFinance",
    label: "Finans Yönetimi",
  },
  {
    key: "canManageStock",
    label: "Stok Yönetimi",
  },
  {
    key: "canManageSuppliers",
    label: "Tedarikçi Yönetimi",
  },
  {
    key: "canManageSettings",
    label: "Ayarlar / Yetki Yönetimi",
  },
];

function getRoleLabel(role) {
  return roleLabels[role] || role || "Rol Yok";
}

function getStatusLabel(status) {
  if (status === "ACTIVE") return "Aktif";
  if (status === "PASSIVE") return "Pasif";
  if (status === "INVITED") return "Davetli";
  return status || "Durum Yok";
}

function normalizeUsers(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function PermissionPill({ active, label }) {
  return (
    <span style={active ? styles.permissionActive : styles.permissionPassive}>
      {label}
    </span>
  );
}

function UserRolesPage() {
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchRoles() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/user-roles", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setUsers([]);
        setError(data.message || "Kullanıcı rolleri alınamadı.");
        return;
      }

      setUsers(normalizeUsers(data));
    } catch {
      setUsers([]);
      setError("Kullanıcı rolleri alınamadı. Backend veya oturum kontrol edilmeli.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRoles();
  }, []);

  const filteredUsers = useMemo(() => {
    if (selectedRole === "ALL") return users;
    return users.filter((item) => item.role === selectedRole);
  }, [users, selectedRole]);

  const summary = useMemo(() => {
    const active = users.filter((item) => item.status === "ACTIVE").length;
    const passive = users.filter((item) => item.status && item.status !== "ACTIVE").length;
    const owners = users.filter((item) => item.role === "OWNER").length;
    const managers = users.filter((item) => item.role === "MANAGER").length;

    return {
      total: users.length,
      active,
      passive,
      owners,
      managers,
    };
  }, [users]);

  const roles = useMemo(() => {
    const unique = Array.from(new Set(users.map((item) => item.role).filter(Boolean)));

    return unique.sort();
  }, [users]);

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>HandsOff Yetkilendirme</p>
          <h1 style={styles.title}>Kullanıcı Rolleri</h1>
          <p style={styles.subtitle}>
            İşletme içindeki kullanıcıların görevlerini, yetkilerini ve erişim durumlarını tek ekrandan kontrol edin.
          </p>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroLabel}>Toplam Kullanıcı</span>
          <strong style={styles.heroValue}>{summary.total}</strong>
          <small style={styles.heroNote}>Rol kayıtları backend üzerinden okunur</small>
        </div>
      </section>

      <section style={styles.kpiGrid}>
        <KpiCard title="Aktif Kullanıcı" value={summary.active} note="Sisteme erişimi açık" />
        <KpiCard title="Pasif / Davetli" value={summary.passive} note="Kontrol edilmesi gereken kayıt" />
        <KpiCard title="İşletme Sahibi" value={summary.owners} note="Tam yetki seviyesi" />
        <KpiCard title="Yönetici" value={summary.managers} note="Operasyon ve yönetim yetkisi" />
      </section>

      <section style={styles.toolbar}>
        <div>
          <h2 style={styles.panelTitle}>Rol Listesi</h2>
          <p style={styles.panelText}>
            Kullanıcıların hangi alanlara erişebildiğini hızlıca görüntüleyin.
          </p>
        </div>

        <div style={styles.actions}>
          <select
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value)}
            style={styles.select}
          >
            <option value="ALL">Tüm Roller</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {getRoleLabel(role)}
              </option>
            ))}
          </select>

          <button type="button" onClick={fetchRoles} style={styles.button}>
            Yenile
          </button>
        </div>
      </section>

      {loading ? (
        <section style={styles.stateBox}>Kullanıcı rolleri yükleniyor...</section>
      ) : error ? (
        <section style={styles.errorBox}>{error}</section>
      ) : filteredUsers.length === 0 ? (
        <section style={styles.stateBox}>Gösterilecek kullanıcı rolü bulunamadı.</section>
      ) : (
        <section style={styles.grid}>
          {filteredUsers.map((member) => (
            <article key={member.id || member.email || member.fullName} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <h3 style={styles.cardTitle}>{member.fullName || "İsimsiz Kullanıcı"}</h3>
                  <p style={styles.cardEmail}>{member.email || "E-posta yok"}</p>
                </div>

                <span style={member.status === "ACTIVE" ? styles.statusActive : styles.statusPassive}>
                  {getStatusLabel(member.status)}
                </span>
              </div>

              <div style={styles.roleBox}>
                <span>Rol</span>
                <strong>{getRoleLabel(member.role)}</strong>
              </div>

              <div style={styles.permissionGrid}>
                {permissionLabels.map((permission) => (
                  <PermissionPill
                    key={permission.key}
                    active={Boolean(member[permission.key]) || member.role === "OWNER"}
                    label={permission.label}
                  />
                ))}
              </div>
            </article>
          ))}
        </section>
      )}

      <section style={styles.infoPanel}>
        <h2 style={styles.panelTitle}>Yetki Notları</h2>

        <div style={styles.noteGrid}>
          <div style={styles.noteBox}>
            <strong>İşletme Sahibi</strong>
            <span>Tüm alanlara erişebilir ve ayarları yönetebilir.</span>
          </div>

          <div style={styles.noteBox}>
            <strong>Muhasebe</strong>
            <span>Finans, rapor ve tedarikçi borç takip alanlarını yönetebilir.</span>
          </div>

          <div style={styles.noteBox}>
            <strong>Stok Sorumlusu</strong>
            <span>Stok, sayım, zayi ve tedarikçi hareketlerini kontrol eder.</span>
          </div>
        </div>
      </section>
    </main>
  );
}

function KpiCard({ title, value, note }) {
  return (
    <article style={styles.kpiCard}>
      <span style={styles.kpiTitle}>{title}</span>
      <strong style={styles.kpiValue}>{value}</strong>
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
      "radial-gradient(circle at top left, #164e63 0, transparent 34%), linear-gradient(135deg, #0f172a 0%, #111827 48%, #020617 100%)",
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
    color: "#67e8f9",
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
  heroValue: {
    display: "block",
    fontSize: "36px",
    color: "#ffffff",
  },
  heroNote: {
    display: "inline-block",
    marginTop: "10px",
    color: "#a5f3fc",
    background: "rgba(6,182,212,0.16)",
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
  select: {
    height: "42px",
    minWidth: "180px",
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
    background: "linear-gradient(135deg, #06b6d4, #2563eb)",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  card: {
    padding: "20px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "20px",
  },
  cardEmail: {
    margin: "6px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
  },
  statusActive: {
    padding: "7px 11px",
    borderRadius: "999px",
    color: "#bbf7d0",
    background: "rgba(34,197,94,0.16)",
    fontSize: "12px",
    fontWeight: 900,
  },
  statusPassive: {
    padding: "7px 11px",
    borderRadius: "999px",
    color: "#fde68a",
    background: "rgba(245,158,11,0.18)",
    fontSize: "12px",
    fontWeight: 900,
  },
  roleBox: {
    display: "grid",
    gap: "6px",
    padding: "14px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.55)",
    marginBottom: "14px",
  },
  permissionGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  permissionActive: {
    padding: "7px 10px",
    borderRadius: "999px",
    color: "#bbf7d0",
    background: "rgba(34,197,94,0.16)",
    fontSize: "12px",
    fontWeight: 800,
  },
  permissionPassive: {
    padding: "7px 10px",
    borderRadius: "999px",
    color: "#94a3b8",
    background: "rgba(148,163,184,0.12)",
    fontSize: "12px",
    fontWeight: 800,
  },
  stateBox: {
    padding: "22px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#cbd5e1",
    marginBottom: "16px",
  },
  errorBox: {
    padding: "22px",
    borderRadius: "24px",
    background: "rgba(239,68,68,0.13)",
    border: "1px solid rgba(248,113,113,0.24)",
    color: "#fecaca",
    marginBottom: "16px",
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

export default UserRolesPage;
