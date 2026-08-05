import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const menuGroups = [
  {
    title: "Her Gün",
    items: [
      { label: "Anasayfa", path: "/" },
      { label: "Günlük Operasyon", path: "/daily" },
      { label: "Rezervasyonlar", path: "/reservations" },
      { label: "Masa Düzeni", path: "/tables" },
      { label: "Adisyo Rapor Yükle", path: "/adisyo-import" },
      { label: "Kasa Sayımı", path: "/cash-count" },
      { label: "Görev Listesi", path: "/todos" },
      { label: "Günlük Çeklistler", path: "/daily-checklists" },
      { label: "AI Asistan", path: "/ai-assistant" },
    ],
  },
  {
    title: "Para & Muhasebe",
    items: [
      { label: "Para Paneli", path: "/profit-center" },
      { label: "Gelir Takibi", path: "/revenue" },
      { label: "Gider Yönetimi", path: "/expenses" },
      { label: "Kasa & Ödeme", path: "/cashflow" },
      { label: "Nakit Akışı", path: "/cashflow-dashboard" },
      { label: "Fatura Yükle / Alım", path: "/invoice-import" },
      { label: "Tedarikçiler", path: "/suppliers" },
      { label: "Ticari Borçlar", path: "/payables" },
      { label: "Ödenmezler", path: "/house-accounts" },
      { label: "Banka Hesapları", path: "/banks" },
      { label: "Kredi Kartları", path: "/credit-cards" },
      { label: "Vergi Takvimi", path: "/tax-calendar" },
      { label: "Yasal Parametreler", path: "/legal-params" },
      { label: "Mali Tablolar", path: "/financial-reports" },
      { label: "Mali Müşavir Paketi", path: "/accountant-package" },
    ],
  },
  {
    title: "Menü & Satış",
    items: [
      { label: "Menü & Maliyet", path: "/menu" },
      { label: "Menü Mühendisliği", path: "/engineering" },
      { label: "Müşteri Menüsü", path: "/print-menu" },
      { label: "Kampanya & İndirim", path: "/campaigns" },
      { label: "Rakip Fiyatları", path: "/competitor-prices" },
      { label: "Masa QR Kartları", path: "/table-qr" },
      { label: "Özel Gün Menüleri", path: "/event-menu" },
    ],
  },
  {
    title: "Mutfak, Bar & Stok",
    items: [
      { label: "Hammadde Deposu", path: "/ingredients" },
      { label: "Stok Sayım & Fire", path: "/stock-count" },
      { label: "Satın Alma Talepleri", path: "/purchase-requests" },
      { label: "Stoksuzluk", path: "/shortfalls" },
      { label: "Stok Optimizasyonu", path: "/stock-optimization" },
      { label: "Kırılma & Zayi", path: "/breakage" },
      { label: "Şarap Envanteri", path: "/wine-inventory" },
      { label: "İçki & Bar Envanteri", path: "/beverage-inventory" },
      { label: "Şarap Pairing", path: "/wine-pairing" },
    ],
  },
  {
    title: "Ekip & Müşteri",
    items: [
      { label: "Ekip Merkezi", path: "/team-center" },
      { label: "Personel & Vardiya", path: "/staff" },
      { label: "Bordro", path: "/payroll" },
      { label: "Yıllık İzin", path: "/leave-management" },
      { label: "Bahşiş Yönetimi", path: "/tips" },
      { label: "Müşteri CRM", path: "/customers" },
      { label: "Geri Bildirim", path: "/feedback" },
      { label: "Pazarlama Merkezi", path: "/marketing-center" },
    ],
  },
  {
    title: "Strateji & Rapor",
    items: [
      { label: "Raporlar Merkezi", path: "/reports-hub" },
      { label: "Hedef & KPI", path: "/kpis" },
      { label: "Karar Destek", path: "/decision-center" },
      { label: "Karşılaştırma", path: "/compare-reports" },
      { label: "Operasyon Paneli", path: "/operations-center" },
      { label: "İleri Analiz", path: "/analytics" },
      { label: "Raporlar & Export", path: "/reports" },
      { label: "Birleşik Takvim", path: "/unified-calendar" },
      { label: "Etkinlik Takvimi", path: "/events" },
      { label: "Akış Rehberi", path: "/flow-guide" },
    ],
  },
  {
    title: "Arka Ofis & Sistem",
    items: [
      { label: "Kalite & HACCP", path: "/quality" },
      { label: "Çeklist Şablonları", path: "/checklist-templates" },
      { label: "Pest Control", path: "/pest-control" },
      { label: "Yasal İzinler", path: "/legal-permits" },
      { label: "KVKK", path: "/kvkk" },
      { label: "Sabit Kıymetler", path: "/fixed-assets" },
      { label: "Sigortalar", path: "/insurance" },
      { label: "POS Komisyon", path: "/pos-commission" },
      { label: "Servis Rehberi", path: "/service-directory" },
      { label: "AI Denetim", path: "/ai-audit" },
      { label: "Veri Sağlığı", path: "/data-health" },
      { label: "Denetim & Yedek", path: "/audit" },
      { label: "Yardım", path: "/help" },
      { label: "Ayarlar", path: "/settings" },
    ],
  },
];

function getCurrentTime() {
  return new Date().toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCurrentDate() {
  return new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export default function MainLayout() {
  const location = useLocation();
  const [openGroup, setOpenGroup] = useState("Her Gün");
  const [time, setTime] = useState(getCurrentTime());

  const activeGroupTitle = useMemo(() => {
    const group = menuGroups.find((group) =>
      group.items.some((item) =>
        item.path === "/"
          ? location.pathname === "/"
          : location.pathname.startsWith(item.path)
      )
    );

    return group?.title || "Her Gün";
  }, [location.pathname]);

  useEffect(() => {
    setOpenGroup(activeGroupTitle);
  }, [activeGroupTitle]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getCurrentTime());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  function toggleGroup(groupTitle) {
    setOpenGroup((current) => (current === groupTitle ? "" : groupTitle));
  }

  return (
    <div className="flex min-h-screen bg-[#f4efe7] text-[#241c17]">
      <aside className="sticky top-0 h-screen w-[300px] shrink-0 overflow-y-auto border-r border-[#c9a45c]/25 bg-[radial-gradient(circle_at_top,#2b2117_0%,#131313_42%,#070707_100%)] px-4 py-5 text-[#b9b1a6] shadow-2xl">
        <div className="relative mb-6 px-4 text-center">
          <div className="absolute left-1/2 top-6 h-24 w-24 -translate-x-1/2 rounded-full bg-[#c9a45c]/20 blur-2xl" />

          <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#c9a45c]/40 bg-gradient-to-br from-[#2b2117] to-[#050505] text-3xl font-semibold tracking-widest text-[#e6c57a] shadow-[0_20px_45px_rgba(0,0,0,0.45)]">
            N1
          </div>

          <h1 className="font-serif text-xl font-semibold tracking-[0.24em] text-[#e6c57a]">
            NO1
          </h1>

          <p className="mt-1 text-[10px] uppercase tracking-[0.38em] text-white/35">
            Culinaria Panel
          </p>

          <div className="mx-auto mt-4 h-px w-36 bg-gradient-to-r from-transparent via-[#c9a45c]/70 to-transparent" />
        </div>

        <div className="mx-2 mb-4 rounded-2xl border border-[#c9a45c]/25 bg-white/[0.04] px-4 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="text-3xl font-semibold tracking-[0.12em] text-[#e6c57a]">
            {time}
          </div>

          <div className="mt-1 text-[11px] capitalize text-white/45">
            {getCurrentDate()}
          </div>

          <button className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs text-white/70 transition hover:border-[#c9a45c]/40 hover:bg-[#c9a45c]/10 hover:text-white">
            <span>Bildirimler</span>
            <span className="rounded-full border border-[#c9a45c]/30 bg-[#c9a45c]/10 px-2 py-0.5 text-[10px] text-[#e6c57a]">
              0
            </span>
          </button>
        </div>

        <div className="mx-2 mb-5">
          <button className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-left text-xs text-white/45 transition hover:border-[#c9a45c]/30 hover:bg-white/[0.07] hover:text-white">
            <span>Hızlı ara...</span>
            <span className="rounded-lg border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] text-white/35">
              Ctrl K
            </span>
          </button>
        </div>

        <nav className="space-y-2 pb-8">
          {menuGroups.map((group, index) => {
            const isOpen = openGroup === group.title;
            const hasActiveChild = group.title === activeGroupTitle;

            return (
              <div key={group.title}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.title)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.18em] transition ${
                    hasActiveChild
                      ? "border border-[#c9a45c]/20 bg-[#c9a45c]/10 text-[#e6c57a]"
                      : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-lg border text-[10px] ${
                      hasActiveChild
                        ? "border-[#c9a45c]/40 bg-[#c9a45c]/15 text-[#e6c57a]"
                        : "border-white/10 bg-white/[0.03] text-white/35"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="flex-1">{group.title}</span>

                  <span className="text-sm text-white/35">
                    {isOpen ? "-" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-1 space-y-1 rounded-2xl border border-white/[0.04] bg-black/10 p-1">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/"}
                        className={({ isActive }) =>
                          `group flex items-center gap-3 rounded-xl px-4 py-2.5 text-[13px] transition ${
                            isActive
                              ? "bg-gradient-to-r from-[#c9a45c]/25 to-white/[0.06] text-white shadow-[inset_3px_0_0_#c9a45c]"
                              : "text-[#aaa197] hover:translate-x-1 hover:bg-white/[0.06] hover:text-white"
                          }`
                        }
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#c9a45c]/60 opacity-60 transition group-hover:opacity-100" />
                        <span className="leading-none">{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-[#dfd0b8] bg-[#fbf8f3]/90 px-8 shadow-sm backdrop-blur-xl">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
              No1 Culinaria
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#211914]">
              Restoran Yönetim Sistemi
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="rounded-full border border-[#c9a45c]/30 bg-white px-4 py-2 text-xs font-medium text-[#6f5630] shadow-sm transition hover:bg-[#fff7e7]">
              Bugünkü Özet
            </button>

            <div className="flex items-center gap-3 rounded-full border border-[#c9a45c]/25 bg-white px-3 py-2 shadow-sm">
              <div className="text-right">
                <p className="text-sm font-medium text-[#2b2118]">Admin</p>
                <p className="text-[11px] text-[#8a7560]">Yönetici</p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#1f1712] to-[#050505] text-sm font-semibold text-[#e6c57a] shadow-md">
                N1
              </div>
            </div>
          </div>
        </header>

        <main className="relative flex-1 overflow-hidden p-8">
          <div className="pointer-events-none absolute right-[-120px] top-[-120px] h-80 w-80 rounded-full bg-[#c9a45c]/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-160px] left-[30%] h-96 w-96 rounded-full bg-[#1f1712]/5 blur-3xl" />

          <div className="relative">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}