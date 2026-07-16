function goTo(page) {
  localStorage.setItem("handsoff_last_requested_page", page);

  window.dispatchEvent(
    new CustomEvent("handsoff:navigate", {
      detail: page,
    })
  );
}

const reportCards = [
  {
    title: "Gün Sonu Raporu",
    description:
      "Seçilen günün cirosunu, giderini, fire maliyetini ve gün sonu sonucunu gösterir.",
    page: "Gün Sonu Raporu",
    badge: "Günlük",
  },
  {
    title: "Haftalık Yönetim Raporu",
    description:
      "7 günlük ciro, gider, fire, net sonuç ve günlük performans tablosunu gösterir.",
    page: "Haftalık Yönetim Raporu",
    badge: "Haftalık",
  },
  {
    title: "Aylık Yönetim Raporu",
    description:
      "Ay bazında ciro, gider, fire, en iyi gün, en düşük gün ve kategori dağılımlarını gösterir.",
    page: "Aylık Yönetim Raporu",
    badge: "Aylık",
  },
];

const quickActions = [
  {
    title: "Günlük Ciro Gir",
    page: "Günlük Ciro / Gelir Girişi",
  },
  {
    title: "Gider Ekle",
    page: "Gider Yönetimi",
  },
  {
    title: "Fire / Zayi Ekle",
    page: "Zayi / Kırılma",
  },
  {
    title: "Tedarikçi Cari Aç",
    page: "Tedarikçi Cari / Borç Takibi",
  },
  {
    title: "Yedek Al",
    page: "Veri Yedekleme / Dışa Aktarma",
  },
];

export default function ReportCenterPage({ user }) {
  return (
    <div className="page">
      <div
        style={{
          background:
            "linear-gradient(135deg, #111827 0%, #1e3a8a 50%, #111827 100%)",
          color: "#ffffff",
          borderRadius: 28,
          padding: 28,
          boxShadow: "0 24px 70px rgba(15,23,42,0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 24,
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                opacity: 0.75,
                fontWeight: 800,
                letterSpacing: 1,
                textTransform: "uppercase",
                fontSize: 12,
              }}
            >
              HandsOff / {user.restaurantName}
            </p>

            <h1 style={{ margin: "10px 0 8px", fontSize: 34 }}>
              Rapor Merkezi
            </h1>

            <p style={{ margin: 0, opacity: 0.82, maxWidth: 760 }}>
              Günlük, haftalık ve aylık yönetim raporlarını tek ekrandan aç.
              Kapanış, performans ve finans takibini buradan yönet.
            </p>
          </div>

          <button
            className="hero-button"
            type="button"
            onClick={() => goTo("Yönetim Özeti")}
            style={{ background: "#ffffff", color: "#111827" }}
          >
            Yönetim Özeti
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 18,
        }}
      >
        {reportCards.map((card) => (
          <button
            key={card.page}
            type="button"
            onClick={() => goTo(card.page)}
            style={{
              textAlign: "left",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              borderRadius: 22,
              padding: 22,
              cursor: "pointer",
              boxShadow: "0 16px 40px rgba(15,23,42,0.08)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                background: "#eef2ff",
                color: "#3730a3",
                borderRadius: 999,
                padding: "6px 10px",
                fontSize: 12,
                fontWeight: 800,
                marginBottom: 14,
              }}
            >
              {card.badge}
            </span>

            <strong
              style={{
                display: "block",
                color: "#111827",
                fontSize: 19,
                marginBottom: 10,
              }}
            >
              {card.title}
            </strong>

            <span
              style={{
                display: "block",
                color: "#6b7280",
                fontSize: 14,
                lineHeight: 1.55,
              }}
            >
              {card.description}
            </span>
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Rapor Kullanım Sırası</h2>

            <p className="panel-sub">
              Restoran kapanış ve yönetim akışı için önerilen sıra.
            </p>
          </div>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>Sıra</th>
              <th>Rapor</th>
              <th>Ne İçin Kullanılır</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>1</td>
              <td>Gün Sonu Raporu</td>
              <td>
                Günlük ciro girildi mi, gider var mı, fire/zayi kaydı var mı ve
                gün sonucu pozitif mi kontrol edilir.
              </td>
            </tr>

            <tr>
              <td>2</td>
              <td>Haftalık Yönetim Raporu</td>
              <td>
                Haftalık performans, en yoğun günler, gider dağılımı ve operasyon
                uyarıları takip edilir.
              </td>
            </tr>

            <tr>
              <td>3</td>
              <td>Aylık Yönetim Raporu</td>
              <td>
                Ay kapanışı, en yüksek gider kalemleri, açık borçlar, stok
                uyarıları ve genel kâr-zarar sonucu incelenir.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Hızlı İşlemler</h2>

            <p className="panel-sub">
              Raporlarda eksik görülen kayıtları hızlıca tamamla.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {quickActions.map((action) => (
            <button
              key={action.page}
              type="button"
              onClick={() => goTo(action.page)}
            >
              {action.title}
            </button>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Kapanış Kontrol Listesi</h2>

            <p className="panel-sub">
              Her gün kapanıştan önce bu maddeler kontrol edilmeli.
            </p>
          </div>
        </div>

        <table className="module-table">
          <tbody>
            <tr>
              <td>Günlük ciro girildi mi?</td>
            </tr>

            <tr>
              <td>Nakit, kart ve online satış ayrımı doğru mu?</td>
            </tr>

            <tr>
              <td>Günün giderleri işlendi mi?</td>
            </tr>

            <tr>
              <td>Fire, zayi, kırılma veya personel tüketimi işlendi mi?</td>
            </tr>

            <tr>
              <td>Satın alma talepleri gider veya stok ekranına aktarıldı mı?</td>
            </tr>

            <tr>
              <td>Düşük stok uyarıları kontrol edildi mi?</td>
            </tr>

            <tr>
              <td>Gün sonunda veri yedeği alındı mı?</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
