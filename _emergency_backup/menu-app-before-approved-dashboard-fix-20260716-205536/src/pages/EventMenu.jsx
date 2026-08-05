import { useState } from "react";

const initialEventMenus = [
  {
    id: 1,
    eventName: "Pazar Brunch",
    eventType: "Brunch",
    date: "2026-06-28",
    timeRange: "11:30 - 15:00",
    menuName: "No1 Brunch Menüsü",
    pricePerPerson: 1200,
    reservationLimit: 80,
    currentReservations: 46,
    status: "Aktif",
    includedItems:
      "Açık büfe kahvaltı lezzetleri, mezeler, sıcak büfe, kahvaltı pizzası, peymacun, omlet, tatlılar, limitsiz çay ve filtre kahve.",
    note: "Kahvaltı pizzası özellikle vurgulanacak.",
  },
  {
    id: 2,
    eventName: "Yunan Gecesi",
    eventType: "Konsept Gece",
    date: "2026-07-04",
    timeRange: "19:30 - 23:30",
    menuName: "Ege Esintisi Menü",
    pricePerPerson: 1850,
    reservationLimit: 60,
    currentReservations: 22,
    status: "Planlandı",
    includedItems:
      "Ege mezeleri, ara sıcaklar, ana yemek seçenekleri ve canlı müzik konsepti.",
    note: "Mavi beyaz konseptle sosyal medya duyurusu yapılacak.",
  },
  {
    id: 3,
    eventName: "After Party",
    eventType: "Özel Davet",
    date: "2026-06-27",
    timeRange: "22:00 - 02:00",
    menuName: "Kokteyl Menü",
    pricePerPerson: 0,
    reservationLimit: 120,
    currentReservations: 120,
    status: "Tamamlandı",
    includedItems:
      "King in North, Basil Kiss, Fig and Ash, Kuzu Kulağı, soft içecek seçenekleri.",
    note: "Düğün sonrası özel davet menüsü.",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function getRemainingCapacity(menu) {
  return Number(menu.reservationLimit) - Number(menu.currentReservations);
}

function getPotentialRevenue(menu) {
  return Number(menu.pricePerPerson) * Number(menu.currentReservations);
}

function getCapacityRate(menu) {
  if (Number(menu.reservationLimit) === 0) return 0;

  return (Number(menu.currentReservations) / Number(menu.reservationLimit)) * 100;
}

function getStatusClass(status) {
  if (status === "Aktif") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "Planlandı") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (status === "Tamamlandı") {
    return "bg-gray-50 text-gray-700 border-gray-200";
  }

  return "bg-amber-50 text-amber-700 border-amber-200";
}

function getCapacityClass(menu) {
  const rate = getCapacityRate(menu);

  if (rate >= 100) {
    return {
      label: "Doldu",
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }

  if (rate >= 75) {
    return {
      label: "Son Yerler",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  return {
    label: "Uygun",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
}

function getEventTypeClass(type) {
  if (type === "Brunch") {
    return "bg-[#fff7e7] text-[#9c7439] border-[#c9a45c]/30";
  }

  if (type === "Konsept Gece") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (type === "Özel Davet") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

export default function EventMenu() {
  const [eventMenus, setEventMenus] = useState(initialEventMenus);

  const [form, setForm] = useState({
    eventName: "",
    eventType: "",
    date: "",
    timeRange: "",
    menuName: "",
    pricePerPerson: "",
    reservationLimit: "",
    currentReservations: "",
    status: "Planlandı",
    includedItems: "",
    note: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const newEventMenu = {
      id: Date.now(),
      eventName: form.eventName,
      eventType: form.eventType,
      date: form.date,
      timeRange: form.timeRange,
      menuName: form.menuName,
      pricePerPerson: Number(form.pricePerPerson || 0),
      reservationLimit: Number(form.reservationLimit),
      currentReservations: Number(form.currentReservations || 0),
      status: form.status,
      includedItems: form.includedItems,
      note: form.note,
    };

    setEventMenus((prev) => [newEventMenu, ...prev]);

    setForm({
      eventName: "",
      eventType: "",
      date: "",
      timeRange: "",
      menuName: "",
      pricePerPerson: "",
      reservationLimit: "",
      currentReservations: "",
      status: "Planlandı",
      includedItems: "",
      note: "",
    });
  }

  function updateStatus(id, nextStatus) {
    setEventMenus((prev) =>
      prev.map((menu) =>
        menu.id === id ? { ...menu, status: nextStatus } : menu
      )
    );
  }

  const totalMenus = eventMenus.length;

  const activeMenus = eventMenus.filter(
    (menu) => menu.status === "Aktif" || menu.status === "Planlandı"
  ).length;

  const totalReservations = eventMenus.reduce(
    (total, menu) => total + Number(menu.currentReservations),
    0
  );

  const totalRevenue = eventMenus.reduce(
    (total, menu) => total + getPotentialRevenue(menu),
    0
  );

  const fullEvents = eventMenus.filter(
    (menu) => getRemainingCapacity(menu) <= 0
  ).length;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Menü & Satış
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Özel Gün Menüleri
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Brunch, özel davet, konsept gece ve etkinlik menülerini kişi başı
              fiyat, kapasite, rezervasyon ve içerik bilgisiyle yönet.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Etkinlik Menü Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Menü</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalMenus}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Aktif / Planlı</p>
          <h3 className="mt-3 text-2xl font-semibold text-blue-700">
            {activeMenus}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Rezervasyon</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {totalReservations}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Dolu etkinlik: {fullEvents}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Tahmini Gelir</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {formatCurrency(totalRevenue)}
          </h3>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Özel Gün Menüsü Oluştur
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Bu kayıt ileride rezervasyonlar, sosyal medya duyuruları ve müşteri
            menüsüyle ilişkilendirilecek.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="eventName"
            value={form.eventName}
            onChange={handleChange}
            placeholder="Etkinlik adı"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="eventType"
            value={form.eventType}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Etkinlik türü seç</option>
            <option value="Brunch">Brunch</option>
            <option value="Konsept Gece">Konsept Gece</option>
            <option value="Özel Davet">Özel Davet</option>
            <option value="Tadım Menüsü">Tadım Menüsü</option>
          </select>

          <input
            name="date"
            value={form.date}
            onChange={handleChange}
            type="date"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="timeRange"
            value={form.timeRange}
            onChange={handleChange}
            placeholder="Saat aralığı"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="menuName"
            value={form.menuName}
            onChange={handleChange}
            placeholder="Menü adı"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="pricePerPerson"
            value={form.pricePerPerson}
            onChange={handleChange}
            placeholder="Kişi başı fiyat"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="reservationLimit"
            value={form.reservationLimit}
            onChange={handleChange}
            placeholder="Kapasite"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="currentReservations"
            value={form.currentReservations}
            onChange={handleChange}
            placeholder="Mevcut rezervasyon"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Planlandı">Planlandı</option>
            <option value="Aktif">Aktif</option>
            <option value="Tamamlandı">Tamamlandı</option>
            <option value="Pasif">Pasif</option>
          </select>

          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Not"
            className="col-span-3 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <textarea
            name="includedItems"
            value={form.includedItems}
            onChange={handleChange}
            placeholder="Menü içeriği"
            rows="3"
            className="col-span-4 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Özel Menü Ekle
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
        <div className="border-b border-[#eadfce] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Özel Gün Menü Listesi
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Kapasite ve rezervasyon durumuna göre doluluk otomatik hesaplanır.
          </p>
        </div>

        <table className="w-full text-left">
          <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
            <tr>
              <th className="px-6 py-4">Etkinlik</th>
              <th className="px-6 py-4">Tür</th>
              <th className="px-6 py-4">Tarih / Saat</th>
              <th className="px-6 py-4">Fiyat</th>
              <th className="px-6 py-4">Rezervasyon</th>
              <th className="px-6 py-4">Gelir</th>
              <th className="px-6 py-4">Doluluk</th>
              <th className="px-6 py-4 text-right">Durum</th>
            </tr>
          </thead>

          <tbody>
            {eventMenus.map((menu) => {
              const capacity = getCapacityClass(menu);
              const remainingCapacity = getRemainingCapacity(menu);
              const capacityRate = getCapacityRate(menu);

              return (
                <tr
                  key={menu.id}
                  className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#211914]">
                      {menu.eventName}
                    </p>
                    <p className="mt-1 text-xs text-[#8a7560]">
                      {menu.menuName}
                    </p>
                    <p className="mt-2 max-w-[360px] text-xs leading-5 text-[#7d6b5a]">
                      {menu.includedItems}
                    </p>
                    {menu.note && (
                      <p className="mt-2 text-xs font-medium text-[#9c7439]">
                        {menu.note}
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${getEventTypeClass(
                        menu.eventType
                      )}`}
                    >
                      {menu.eventType}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    <p>{menu.date}</p>
                    <p>{menu.timeRange}</p>
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-[#211914]">
                    {formatCurrency(menu.pricePerPerson)}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#211914]">
                    <p>
                      {menu.currentReservations} / {menu.reservationLimit}
                    </p>
                    <p className="mt-1 text-xs text-[#8a7560]">
                      Kalan: {remainingCapacity < 0 ? 0 : remainingCapacity}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-emerald-700">
                    {formatCurrency(getPotentialRevenue(menu))}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${capacity.className}`}
                    >
                      {capacity.label}
                    </span>

                    <div className="mt-3 h-2 w-28 overflow-hidden rounded-full bg-[#f0e6d7]">
                      <div
                        className="h-full rounded-full bg-[#c9a45c]"
                        style={{
                          width: `${Math.min(capacityRate, 100)}%`,
                        }}
                      />
                    </div>

                    <p className="mt-1 text-xs text-[#8a7560]">
                      %{capacityRate.toFixed(1)}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <select
                      value={menu.status}
                      onChange={(event) =>
                        updateStatus(menu.id, event.target.value)
                      }
                      className={`rounded-xl border px-3 py-2 text-xs outline-none ${getStatusClass(
                        menu.status
                      )}`}
                    >
                      <option value="Planlandı">Planlandı</option>
                      <option value="Aktif">Aktif</option>
                      <option value="Tamamlandı">Tamamlandı</option>
                      <option value="Pasif">Pasif</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}