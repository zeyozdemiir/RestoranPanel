const fs = require("fs");

const dashboardPath = "./src/ExecutiveDashboardPage.jsx";

if (!fs.existsSync(dashboardPath)) {
  throw new Error("ExecutiveDashboardPage.jsx bulunamadı.");
}

let dashboard = fs.readFileSync(dashboardPath, "utf8");

fs.writeFileSync(
  "./src/ExecutiveDashboardPage.before-quick-nav.backup",
  dashboard,
  "utf8"
);

if (!dashboard.includes("const quickModules = [")) {
  const marker = `function isActive(record) {
  const status = String(record?.status || "").toUpperCase();
  return status !== "CANCELLED" && status !== "IPTAL";
}`;

  const insert = `${marker}

const quickModules = [
  {
    title: "Günlük Ciro",
    description: "Nakit, kart, paket servis ve günlük gelir girişi",
    page: "Günlük Ciro / Gelir Girişi",
  },
  {
    title: "Nakit Akışı",
    description: "Kasa, banka, tedarikçi ödemesi ve nakit hareketleri",
    page: "Nakit Akışı / Kasa Banka",
  },
  {
    title: "Kâr Zarar",
    description: "Gelir, gider ve fire maliyeti sonucunu gösterir",
    page: "Kâr Zarar",
  },
  {
    title: "Tedarikçiler",
    description: "Tedarikçi kartları ve iletişim bilgileri",
    page: "Tedarikçiler",
  },
  {
    title: "Tedarikçi Cari",
    description: "Borç, ödeme ve kalan cari bakiye takibi",
    page: "Tedarikçi Cari / Borç Takibi",
  },
  {
    title: "Satın Alma",
    description: "Satın alma talepleri, gidere ve stoğa aktarım",
    page: "Satın Alma Talepleri",
  },
  {
    title: "Stok Yönetimi",
    description: "Stok kartları, mevcut stok ve minimum stok uyarısı",
    page: "Stok Yönetimi",
  },
  {
    title: "Stok Sayımı",
    description: "Fiili sayım, fark hesaplama ve stok düzeltme",
    page: "Stok Sayımı",
  },
  {
    title: "Zayi / Kırılma",
    description: "Fire, kırılma, dökülme ve personel tüketimi",
    page: "Zayi / Kırılma",
  },
  {
    title: "Veri Yedekleme",
    description: "Tüm verileri JSON dosyası olarak dışa aktar",
    page: "Veri Yedekleme / Dışa Aktarma",
  },
  {
    title: "Sistem Kontrol",
    description: "Backend ve modül API sağlık kontrolü",
    page: "Sistem Sağlık Kontrolü",
  },
];`;

  if (!dashboard.includes(marker)) {
    throw new Error("Dashboard içine quickModules eklenecek alan bulunamadı.");
  }

  dashboard = dashboard.replace(marker, insert);
}

if (!dashboard.includes("function goToModule(page)")) {
  const marker = `  async function safeFetch(url, rootKey) {`;

  const insert = `  function goToModule(page) {
    window.dispatchEvent(
      new CustomEvent("handsoff:navigate", {
        detail: page,
      })
    );
  }

${marker}`;

  if (!dashboard.includes(marker)) {
    throw new Error("goToModule eklenecek alan bulunamadı.");
  }

  dashboard = dashboard.replace(marker, insert);
}

if (!dashboard.includes("Hızlı Modül Geçişleri")) {
  const marker = `      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Uyarılar</h2>`;

  const quickPanel = `      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Hızlı Modül Geçişleri</h2>

            <p className="panel-sub">
              Yeni eklenen operasyon, finans, stok ve sistem ekranlarına buradan geç.
            </p>
          </div>

          <span className="mini-pill">{quickModules.length} modül</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          {quickModules.map((module) => (
            <button
              key={module.page}
              type="button"
              onClick={() => goToModule(module.page)}
              style={{
                textAlign: "left",
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                borderRadius: 18,
                padding: 18,
                cursor: "pointer",
                boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
              }}
            >
              <strong
                style={{
                  display: "block",
                  color: "#111827",
                  fontSize: 15,
                  marginBottom: 8,
                }}
              >
                {module.title}
              </strong>

              <span
                style={{
                  display: "block",
                  color: "#6b7280",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {module.description}
              </span>
            </button>
          ))}
        </div>
      </div>

${marker}`;

  if (!dashboard.includes(marker)) {
    throw new Error("Hızlı modül paneli eklenecek alan bulunamadı.");
  }

  dashboard = dashboard.replace(marker, quickPanel);
}

fs.writeFileSync(dashboardPath, dashboard, "utf8");

console.log("Dashboard hızlı modül geçişleri eklendi.");
