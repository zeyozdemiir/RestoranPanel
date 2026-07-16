import { useState } from "react";

const menuGroups = [
  {
    title: "Genel",
    items: [
      "Yönetim Özeti",
      "Ayarlar / Restoran Bilgileri",
      "Kullanıcı Rolleri / Yetkilendirme",
      "Sistem Sağlık Kontrolü",
      "Veri Yedekleme / Dışa Aktarma",
    ],
  },
  {
    title: "Finans",
    items: [
      "Günlük Ciro / Gelir Girişi",
      "Rapor Merkezi",
      "Aylık Yönetim Raporu",
      "Gün Sonu Raporu",
      "Günlük Kontrol Listesi",
      "Aksiyon Takip / Yönetim Görevleri",
      "Nakit Akışı / Kasa Banka",
      "Kâr Zarar",
      "Gider Yönetimi",
      "Tedarikçi Cari / Borç Takibi",
    ],
  },
  {
    title: "Tedarik & Stok",
    items: [
      "Tedarikçiler",
      "Satın Alma Talepleri",
      "Stok Yönetimi",
      "Stok Sayımı",
      "Zayi / Kırılma",
    ],
  },
  {
    title: "Operasyon",
    items: [
      "Rezervasyonlar",
      "Siparişler",
      "Görevler",
      "Müşteriler",
      "Raporlar",
    ],
  },
];

export default function HandsOffFloatingMenu() {
  const [open, setOpen] = useState(false);

  function goTo(page) {
    localStorage.setItem("handsoff_last_requested_page", page);

    window.dispatchEvent(
      new CustomEvent("handsoff:navigate", {
        detail: page,
      })
    );

    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        style={{
          position: "fixed",
          left: 18,
          bottom: 18,
          zIndex: 2147483647,
          width: 62,
          height: 62,
          borderRadius: "999px",
          border: "none",
          background: "#111827",
          color: "#ffffff",
          cursor: "pointer",
          fontWeight: 800,
          fontSize: 12,
          boxShadow: "0 14px 35px rgba(0,0,0,0.28)",
        }}
      >
        Menü
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            left: 18,
            top: 18,
            bottom: 92,
            zIndex: 2147483647,
            width: 320,
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 22,
            padding: 16,
            boxShadow: "0 24px 70px rgba(15,23,42,0.28)",
            overflow: "auto",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <div>
              <strong
                style={{
                  display: "block",
                  fontSize: 17,
                  color: "#111827",
                }}
              >
                HandsOff Panel
              </strong>

              <span
                style={{
                  display: "block",
                  color: "#6b7280",
                  fontSize: 12,
                  marginTop: 3,
                }}
              >
                Modül menüsü
              </span>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                border: "none",
                background: "#f3f4f6",
                borderRadius: 10,
                padding: "7px 10px",
                cursor: "pointer",
                fontWeight: 800,
                color: "#111827",
              }}
            >
              Kapat
            </button>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            {menuGroups.map((group) => (
              <div key={group.title}>
                <div
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 0.7,
                    marginBottom: 8,
                  }}
                >
                  {group.title}
                </div>

                <div style={{ display: "grid", gap: 7 }}>
                  {group.items.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => goTo(page)}
                      style={{
                        width: "100%",
                        border: "1px solid #e5e7eb",
                        background: "#f9fafb",
                        color: "#111827",
                        borderRadius: 13,
                        padding: "10px 12px",
                        textAlign: "left",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
