import { useState } from "react";

const initialCalendarItems = [
  {
    id: 1,
    title: "Pazar Brunch",
    type: "Etkinlik",
    date: "2026-06-28",
    time: "11:30",
    endTime: "15:00",
    owner: "Operasyon",
    priority: "Yüksek",
    status: "Planlandı",
    location: "Ana Salon",
    note: "Açık büfe, kahvaltı pizzası ve rezervasyon masaları kontrol edilecek.",
  },
  {
    id: 2,
    title: "Kritik stok satın alma kontrolü",
    type: "Stok",
    date: "2026-06-27",
    time: "10:30",
    endTime: "11:00",
    owner: "Mutfak",
    priority: "Yüksek",
    status: "Aksiyon Gerekli",
    location: "Mutfak",
    note: "Eksik ürünler satın alma talepleriyle karşılaştırılacak.",
  },
  {
    id: 3,
    title: "Haftalık finans raporu",
    type: "Finans",
    date: "2026-06-30",
    time: "17:00",
    endTime: "18:00",
    owner: "Yönetim",
    priority: "Orta",
    status: "Takipte",
    location: "Ofis",
    note: "Ciro, maliyet, kâr ve ödeme planı raporları kontrol edilecek.",
  },
  {
    id: 4,
    title: "Personel izin planı",
    type: "Ekip",
    date: "2026-07-01",
    time: "12:00",
    endTime: "12:30",
    owner: "İnsan Kaynakları",
    priority: "Düşük",
    status: "Planlandı",
    location: "Ofis",
    note: "Temmuz izinleri vardiya planıyla karşılaştırılacak.",
  },
];

function getTypeClass(type) {
  if (type === "Etkinlik") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  if (type === "Rezervasyon") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (type === "Finans") {
    return "bg-[#fff7e7] text-[#9c7439] border-[#c9a45c]/30";
  }

  if (type === "Stok") {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }

  if (type === "Ekip") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (type === "Vergi") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

function getPriorityClass(priority) {
  if (priority === "Yüksek") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (priority === "Orta") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

function getStatusClass(status) {
  if (status === "Tamamlandı") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "Takipte") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (status === "Planlandı") {
    return "bg-gray-50 text-gray-700 border-gray-200";
  }

  if (status === "Aksiyon Gerekli") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (status === "Gecikti") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

function formatDate(date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function getDayName(date) {
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
  }).format(new Date(date));
}

export default function UnifiedCalendar() {
  const [calendarItems, setCalendarItems] = useState(initialCalendarItems);

  const [form, setForm] = useState({
    title: "",
    type: "",
    date: "",
    time: "",
    endTime: "",
    owner: "",
    priority: "Orta",
    status: "Planlandı",
    location: "",
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

    const newCalendarItem = {
      id: Date.now(),
      title: form.title,
      type: form.type,
      date: form.date,
      time: form.time,
      endTime: form.endTime,
      owner: form.owner,
      priority: form.priority,
      status: form.status,
      location: form.location,
      note: form.note,
    };

    setCalendarItems((prev) =>
      [newCalendarItem, ...prev].sort(
        (a, b) =>
          new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
      )
    );

    setForm({
      title: "",
      type: "",
      date: "",
      time: "",
      endTime: "",
      owner: "",
      priority: "Orta",
      status: "Planlandı",
      location: "",
      note: "",
    });
  }

  function updateStatus(id, nextStatus) {
    setCalendarItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item
      )
    );
  }

  function updatePriority(id, nextPriority) {
    setCalendarItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, priority: nextPriority } : item
      )
    );
  }

  const sortedItems = [...calendarItems].sort(
    (a, b) =>
      new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
  );

  const totalItems = calendarItems.length;

  const today = new Date().toISOString().slice(0, 10);

  const todayItems = calendarItems.filter((item) => item.date === today).length;

  const actionNeededItems = calendarItems.filter(
    (item) => item.status === "Aksiyon Gerekli" || item.status === "Gecikti"
  ).length;

  const highPriorityItems = calendarItems.filter(
    (item) => item.priority === "Yüksek"
  ).length;

  const upcomingItems = calendarItems.filter(
    (item) => new Date(item.date) >= new Date(today)
  ).length;

  const types = [...new Set(calendarItems.map((item) => item.type))];

  const nextItem = sortedItems.find((item) => new Date(item.date) >= new Date(today));

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Strateji & Rapor
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Birleşik Takvim
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Rezervasyon, etkinlik, stok, ödeme, vergi, personel ve operasyon
              hatırlatmalarını tek takvim ekranında takip et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Takvim Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Kayıt</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalItems}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Yaklaşan: {upcomingItems}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Bugünkü Kayıt</p>
          <h3 className="mt-3 text-2xl font-semibold text-blue-700">
            {todayItems}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Aksiyon / Gecikme</p>
          <h3 className="mt-3 text-2xl font-semibold text-amber-700">
            {actionNeededItems}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Yüksek Öncelik</p>
          <h3 className="mt-3 text-2xl font-semibold text-red-700">
            {highPriorityItems}
          </h3>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Takvim Kaydı Ekle
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Etkinlik, rezervasyon, ödeme, vergi, stok veya ekip hatırlatmasını
            buradan takvime ekle.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Başlık"
            className="col-span-2 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Tip seç</option>
            <option value="Etkinlik">Etkinlik</option>
            <option value="Rezervasyon">Rezervasyon</option>
            <option value="Finans">Finans</option>
            <option value="Stok">Stok</option>
            <option value="Ekip">Ekip</option>
            <option value="Vergi">Vergi</option>
            <option value="Operasyon">Operasyon</option>
          </select>

          <input
            name="owner"
            value={form.owner}
            onChange={handleChange}
            placeholder="Sorumlu kişi / ekip"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="date"
            value={form.date}
            onChange={handleChange}
            type="date"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="time"
            value={form.time}
            onChange={handleChange}
            type="time"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
            type="time"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Konum"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Düşük">Düşük</option>
            <option value="Orta">Orta</option>
            <option value="Yüksek">Yüksek</option>
          </select>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Planlandı">Planlandı</option>
            <option value="Takipte">Takipte</option>
            <option value="Aksiyon Gerekli">Aksiyon Gerekli</option>
            <option value="Tamamlandı">Tamamlandı</option>
            <option value="Gecikti">Gecikti</option>
          </select>

          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Takvim notu"
            className="col-span-3 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Takvim Kaydı Ekle
          </button>
        </div>
      </form>

      <div className="grid grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
          <div className="border-b border-[#eadfce] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#211914]">
              Takvim Akışı
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Tüm kayıtlar tarih ve saate göre sıralanır.
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
              <tr>
                <th className="px-6 py-4">Takvim Kaydı</th>
                <th className="px-6 py-4">Tip</th>
                <th className="px-6 py-4">Tarih / Saat</th>
                <th className="px-6 py-4">Öncelik</th>
                <th className="px-6 py-4">Sorumlu</th>
                <th className="px-6 py-4 text-right">Durum</th>
              </tr>
            </thead>

            <tbody>
              {sortedItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#211914]">{item.title}</p>

                    <p className="mt-1 text-xs text-[#8a7560]">
                      Konum: {item.location || "Belirtilmedi"}
                    </p>

                    {item.note && (
                      <p className="mt-2 max-w-[360px] text-xs leading-5 text-[#7d6b5a]">
                        {item.note}
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${getTypeClass(
                        item.type
                      )}`}
                    >
                      {item.type}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[#211914]">
                      {formatDate(item.date)}
                    </p>

                    <p className="mt-1 text-xs capitalize text-[#8a7560]">
                      {getDayName(item.date)}
                    </p>

                    <p className="mt-1 text-xs text-[#8a7560]">
                      {item.time} - {item.endTime}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <select
                      value={item.priority}
                      onChange={(event) =>
                        updatePriority(item.id, event.target.value)
                      }
                      className={`rounded-xl border px-3 py-2 text-xs outline-none ${getPriorityClass(
                        item.priority
                      )}`}
                    >
                      <option value="Düşük">Düşük</option>
                      <option value="Orta">Orta</option>
                      <option value="Yüksek">Yüksek</option>
                    </select>
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {item.owner}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <select
                      value={item.status}
                      onChange={(event) =>
                        updateStatus(item.id, event.target.value)
                      }
                      className={`rounded-xl border px-3 py-2 text-xs outline-none ${getStatusClass(
                        item.status
                      )}`}
                    >
                      <option value="Planlandı">Planlandı</option>
                      <option value="Takipte">Takipte</option>
                      <option value="Aksiyon Gerekli">Aksiyon Gerekli</option>
                      <option value="Tamamlandı">Tamamlandı</option>
                      <option value="Gecikti">Gecikti</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          {nextItem && (
            <div className="rounded-3xl border border-[#c9a45c]/30 bg-[#211914] p-6 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e6c57a]">
                Sıradaki Kayıt
              </p>

              <h2 className="mt-3 text-xl font-semibold text-white">
                {nextItem.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#d8c7ad]">
                {nextItem.note}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#e6c57a]/20 bg-white/5 p-4">
                  <p className="text-xs text-[#d8c7ad]">Tarih</p>
                  <p className="mt-1 text-sm font-semibold text-[#e6c57a]">
                    {formatDate(nextItem.date)}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e6c57a]/20 bg-white/5 p-4">
                  <p className="text-xs text-[#d8c7ad]">Saat</p>
                  <p className="mt-1 text-sm font-semibold text-[#e6c57a]">
                    {nextItem.time}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Tip Özeti
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Takvim kayıtlarının tip bazlı dağılımı.
            </p>

            <div className="mt-6 space-y-4">
              {types.map((type) => {
                const typeItems = calendarItems.filter(
                  (item) => item.type === type
                );

                const typeActionCount = typeItems.filter(
                  (item) =>
                    item.status === "Aksiyon Gerekli" ||
                    item.status === "Gecikti"
                ).length;

                return (
                  <div key={type} className="rounded-2xl bg-[#fbf8f3] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getTypeClass(
                          type
                        )}`}
                      >
                        {type}
                      </span>

                      <span className="text-sm font-semibold text-[#211914]">
                        {typeItems.length} kayıt
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-[#8a7560]">
                      Aksiyon / gecikme: {typeActionCount}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Takvim Notu
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#7d6b5a]">
              Bu ekran ileride rezervasyon, etkinlik, vergi, ödeme, izin,
              operasyon ve stok modüllerinden otomatik takvim kayıtları
              oluşturacak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}