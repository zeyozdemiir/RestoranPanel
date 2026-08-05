export default function PlaceholderPage({ title, description }) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/80 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          No1 Culinaria
        </p>

        <h1 className="mt-3 text-3xl font-semibold text-[#211914]">
          {title}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Durum</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            Hazırlanıyor
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Veri Kaynağı</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            Frontend Demo
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Backend</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            Sonra Bağlanacak
          </h3>
        </div>
      </div>

      <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#211914]">
          Modül Notları
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#7d6b5a]">
          Bu ekran şimdilik geçici sayfa olarak hazırlandı. Modülün gerçek
          form, tablo, filtre, rapor ve backend bağlantıları ilerleyen adımlarda
          eklenecek.
        </p>
      </div>
    </div>
  );
}