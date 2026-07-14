import { useState } from "react";

const pages = [
  "Yönetim Özeti",
  "Ayarlar / Restoran Bilgileri",
  "Kullanıcı Rolleri / Yetkilendirme",
  "Sistem Sağlık Kontrolü",
  "Veri Yedekleme / Dışa Aktarma",
  "Günlük Ciro / Gelir Girişi",
  "Nakit Akışı / Kasa Banka",
  "Kâr Zarar",
  "Tedarikçiler",
  "Tedarikçi Cari / Borç Takibi",
  "Satın Alma Talepleri",
  "Stok Yönetimi",
  "Stok Sayımı",
  "Zayi / Kırılma",
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
    <div
      style={{
        position: "fixed",
        right: 18,
        bottom: 18,
        zIndex: 2147483647,
        fontFamily: "Arial, sans-serif",
      }}
    >
      {open && (
        <div
          style={{
            width: 300,
            maxHeight: "60vh",
            overflow: "auto",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 12,
            marginBottom: 10,
            boxShadow: "0 20px 55px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <strong style={{ fontSize: 14, color: "#111827" }}>
              Hızlı Menü
            </strong>

            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                border: "none",
                background: "#f3f4f6",
                borderRadius: 8,
                padding: "5px 8px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Kapat
            </button>
          </div>

          <div style={{ display: "grid", gap: 7 }}>
            {pages.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => goTo(page)}
                style={{
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  color: "#111827",
                  borderRadius: 10,
                  padding: "9px 10px",
                  textAlign: "left",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        style={{
          width: 58,
          height: 58,
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
    </div>
  );
}
