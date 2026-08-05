import { useState } from "react";

const initialEvents = [
  {
    id: 1,
    eventName: "Pazar Brunch",
    eventType: "Brunch",
    date: "2026-06-28",
    startTime: "11:30",
    endTime: "15:00",
    capacity: 90,
    reservations: 64,
    budget: 12000,
    estimatedRevenue: 76800,
    owner: "Operasyon",
    status: "Planlandı",
    priority: "Yüksek",
    location: "Ana Salon",
    preparationNote:
      "Açık büfe düzeni, kahvaltı pizzası, peymacun ve içecek istasyonu kontrol edilecek.",
  },
  {
    id: 2,
    eventName: "Yunan Gecesi",
    eventType: "Tema Gecesi",
    date: "2026-07-04",
    startTime: "19:30",
    endTime: "23:30",
    capacity: 120,
    reservations: 72,
    budget: 28000,
    estimatedRevenue: 156000,
    owner: "Yönetim",
    status: "Hazırlıkta",
    priority: "Yüksek",
    location: "Bahçe",
    preparationNote:
      "Canlı müzik, mavi beyaz masa düzeni ve story duyuruları hazırlanacak.",
  },
  {
    id: 3,
    eventName: "Çağla & Arda After Party",
    eventType: "Özel Davet",
    date: "2026-06-27",
    startTime: "22:00",
    endTime: "02:00",
    capacity: 80,
    reservations: 80,
    budget: 35000,
    estimatedRevenue: 0,
    owner: "Etkinlik Ekibi",
    status: "Tamamlandı",
    priority: "Orta",
    location: "Bar Alanı",
    preparationNote:
      "Kokteyl listesi, ücretsiz biletler ve bar hazırlığı tamamlandı.",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function getOccupancyRate(event) {
  if (Number(event.capacity) === 0) return 0;

  return (Number(event.reservations) / Number(event.capacity)) * 100;
}

function getProfit(event) {
  return Number(event.estimatedRevenue) - Number(event.budget);
}

function getStatusClass(status) {
  if (status === "Tamamlandı") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "Hazırlıkta") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (status === "Planlandı") {
    return "bg-gray-50 text-gray-700 border-gray-200";
  }

  if (status === "Aksiyon Gerekli") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (status === "İptal") {
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

function getEventTypeClass(eventType) {
  if (eventType === "Brunch") {
    return "bg-[#fff7e7] text-[#9c7439] border-[#c9a45c]/30";
  }

  if (eventType === "Tema Gecesi") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (eventType === "Özel Davet") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  if (eventType === "Kurumsal") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (eventType === "Tadım") {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

function getOccupancyClass(rate) {
  if (rate >= 90) {
    return "bg-emerald-500";
  }

  if (rate >= 70) {
    return "bg-blue-500";
  }

  if (rate >= 45) {
    return "bg-amber-500";
  }

  return "bg-red-500";
}

function formatDate(date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default function Events() {
  const [events, setEvents] = useState(initialEvents);

  const [form, setForm] = useState({
    eventName: "",
    eventType: "",
    date: "",
    startTime: "",
    endTime: "",
    capacity: "",
    reservations: "",
    budget: "",
    estimatedRevenue: "",
    owner: "",
    status: "Planlandı",
    priority: "Orta",
    location: "",
    preparationNote: "",
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

    const newEvent = {
      id: Date.now(),
      eventName: form.eventName,
      eventType: form.eventType,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      capacity: Number(form.capacity || 0),
      reservations: Number(form.reservations || 0),
      budget: Number(form.budget || 0),
      estimatedRevenue: Number(form.estimatedRevenue || 0),
      owner: form.owner,
      status: form.status,
      priority: form.priority,
      location: form.location,
      preparationNote: form.preparationNote,
    };

    setEvents((prev) =>
      [newEvent, ...prev].sort(
        (a, b) =>
          new Date(`${a.date}T${a.startTime}`) -
          new Date(`${b.date}T${b.startTime}`)
      )
    );

    setForm({
      eventName: "",
      eventType: "",
      date: "",
      startTime: "",
      endTime: "",
      capacity: "",
      reservations: "",
      budget: "",
      estimatedRevenue: "",
      owner: "",
      status: "Planlandı",
      priority: "Orta",
      location: "",
      preparationNote: "",
    });
  }

  function updateStatus(id, nextStatus) {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, status: nextStatus } : event
      )
    );
  }

  function updateReservations(id, nextReservations) {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id
          ? { ...event, reservations: Number(nextReservations) }
          : event
      )
    );
  }

  const sortedEvents = [...events].sort(
    (a, b) =>
      new Date(`${a.date}T${a.startTime}`) -
      new Date(`${b.date}T${b.startTime}`)
  );

  const totalEvents = events.length;

  const activeEvents = events.filter(
    (event) => event.status === "Planlandı" || event.status === "Hazırlıkta"
  ).length;

  const actionNeeded = events.filter(
    (event) => event.status === "Aksiyon Gerekli"
  ).length;

  const totalReservations = events.reduce(
    (total, event) => total + Number(event.reservations),
    0
  );

  const totalRevenue = events.reduce(
    (total, event) => total + Number(event.estimatedRevenue),
    0
  );

  const totalBudget = events.reduce(
    (total, event) => total + Number(event.budget),
    0
  );

  const averageOccupancy =
    events.length === 0
      ? 0
      : events.reduce((total, event) => total + getOccupancyRate(event), 0) /
        events.length;

  const eventTypes = [...new Set(events.map((event) => event.eventType))];

  const nextEvent = sortedEvents.find(
    (event) => new Date(event.date) >= new Date(new Date().toISOString().slice(0, 10))
  );

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Strateji & Rapor
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Etkinlik Takvimi
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Brunch, tema gecesi, özel davet, kurumsal organizasyon ve tadım
              etkinliklerini kapasite, rezervasyon, bütçe, gelir ve hazırlık
              durumuyla takip et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Etkinlik Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Etkinlik</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalEvents}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Aktif: {activeEvents}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Rezervasyon</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {totalReservations}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Tahmini Gelir</p>
          <h3 className="mt-3 text-2xl font-semibold text-blue-700">
            {formatCurrency(totalRevenue)}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Bütçe: {formatCurrency(totalBudget)}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Ortalama Doluluk</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            %{averageOccupancy.toFixed(1)}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Aksiyon gerekli: {actionNeeded}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Etkinlik Ekle
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Etkinliğin tarihini, kapasitesini, rezervasyon sayısını, bütçesini
            ve hazırlık notlarını buradan kaydet.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="eventName"
            value={form.eventName}
            onChange={handleChange}
            placeholder="Etkinlik adı"
            className="col-span-2 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="eventType"
            value={form.eventType}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Etkinlik tipi seç</option>
            <option value="Brunch">Brunch</option>
            <option value="Tema Gecesi">Tema Gecesi</option>
            <option value="Özel Davet">Özel Davet</option>
            <option value="Kurumsal">Kurumsal</option>
            <option value="Tadım">Tadım</option>
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
            name="startTime"
            value={form.startTime}
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

          <input
            name="capacity"
            value={form.capacity}
            onChange={handleChange}
            placeholder="Kapasite"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="reservations"
            value={form.reservations}
            onChange={handleChange}
            placeholder="Rezervasyon"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="budget"
            value={form.budget}
            onChange={handleChange}
            placeholder="Bütçe"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="estimatedRevenue"
            value={form.estimatedRevenue}
            onChange={handleChange}
            placeholder="Tahmini gelir"
            type="number"
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
            <option value="Hazırlıkta">Hazırlıkta</option>
            <option value="Aksiyon Gerekli">Aksiyon Gerekli</option>
            <option value="Tamamlandı">Tamamlandı</option>
            <option value="İptal">İptal</option>
          </select>

          <textarea
            name="preparationNote"
            value={form.preparationNote}
            onChange={handleChange}
            placeholder="Hazırlık notu"
            rows="3"
            className="col-span-2 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Etkinlik Ekle
          </button>
        </div>
      </form>

      <div className="grid grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
          <div className="border-b border-[#eadfce] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#211914]">
              Etkinlik Listesi
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Doluluk, kâr tahmini ve hazırlık durumu otomatik hesaplanır.
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
              <tr>
                <th className="px-6 py-4">Etkinlik</th>
                <th className="px-6 py-4">Tip</th>
                <th className="px-6 py-4">Tarih</th>
                <th className="px-6 py-4">Rezervasyon</th>
                <th className="px-6 py-4">Finans</th>
                <th className="px-6 py-4 text-right">Durum</th>
              </tr>
            </thead>

            <tbody>
              {sortedEvents.map((event) => {
                const occupancyRate = getOccupancyRate(event);
                const profit = getProfit(event);

                return (
                  <tr
                    key={event.id}
                    className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#211914]">
                        {event.eventName}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Sorumlu: {event.owner} / Konum:{" "}
                        {event.location || "Belirtilmedi"}
                      </p>

                      <p className="mt-2 max-w-[360px] text-xs leading-5 text-[#7d6b5a]">
                        {event.preparationNote}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getEventTypeClass(
                          event.eventType
                        )}`}
                      >
                        {event.eventType}
                      </span>

                      <span
                        className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getPriorityClass(
                          event.priority
                        )}`}
                      >
                        {event.priority}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#211914]">
                        {formatDate(event.date)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        {event.startTime} - {event.endTime}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <input
                        type="number"
                        min="0"
                        value={event.reservations}
                        onChange={(changeEvent) =>
                          updateReservations(event.id, changeEvent.target.value)
                        }
                        className="w-24 rounded-xl border border-[#dfd0b8] bg-[#fbf8f3] px-3 py-2 text-xs outline-none focus:border-[#c9a45c]"
                      />

                      <p className="mt-2 text-xs text-[#8a7560]">
                        Kapasite: {event.capacity}
                      </p>

                      <div className="mt-2 h-2 w-28 overflow-hidden rounded-full bg-[#f0e6d7]">
                        <div
                          className={`h-full rounded-full ${getOccupancyClass(
                            occupancyRate
                          )}`}
                          style={{
                            width: `${Math.min(occupancyRate, 100)}%`,
                          }}
                        />
                      </div>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        %{occupancyRate.toFixed(1)} doluluk
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-emerald-700">
                        {formatCurrency(event.estimatedRevenue)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Bütçe: {formatCurrency(event.budget)}
                      </p>

                      <p
                        className={`mt-1 text-xs font-medium ${
                          profit >= 0 ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        Kâr: {formatCurrency(profit)}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <select
                        value={event.status}
                        onChange={(changeEvent) =>
                          updateStatus(event.id, changeEvent.target.value)
                        }
                        className={`rounded-xl border px-3 py-2 text-xs outline-none ${getStatusClass(
                          event.status
                        )}`}
                      >
                        <option value="Planlandı">Planlandı</option>
                        <option value="Hazırlıkta">Hazırlıkta</option>
                        <option value="Aksiyon Gerekli">Aksiyon Gerekli</option>
                        <option value="Tamamlandı">Tamamlandı</option>
                        <option value="İptal">İptal</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          {nextEvent && (
            <div className="rounded-3xl border border-[#c9a45c]/30 bg-[#211914] p-6 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e6c57a]">
                Sıradaki Etkinlik
              </p>

              <h2 className="mt-3 text-xl font-semibold text-white">
                {nextEvent.eventName}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#d8c7ad]">
                {nextEvent.preparationNote}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#e6c57a]/20 bg-white/5 p-4">
                  <p className="text-xs text-[#d8c7ad]">Tarih</p>
                  <p className="mt-1 text-sm font-semibold text-[#e6c57a]">
                    {formatDate(nextEvent.date)}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e6c57a]/20 bg-white/5 p-4">
                  <p className="text-xs text-[#d8c7ad]">Doluluk</p>
                  <p className="mt-1 text-sm font-semibold text-[#e6c57a]">
                    %{getOccupancyRate(nextEvent).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Etkinlik Tipi Özeti
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Etkinliklerin tür bazlı dağılımı.
            </p>

            <div className="mt-6 space-y-4">
              {eventTypes.map((eventType) => {
                const typeEvents = events.filter(
                  (event) => event.eventType === eventType
                );

                const typeReservations = typeEvents.reduce(
                  (total, event) => total + Number(event.reservations),
                  0
                );

                return (
                  <div
                    key={eventType}
                    className="rounded-2xl bg-[#fbf8f3] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getEventTypeClass(
                          eventType
                        )}`}
                      >
                        {eventType}
                      </span>

                      <span className="text-sm font-semibold text-[#211914]">
                        {typeEvents.length} etkinlik
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-[#8a7560]">
                      Toplam rezervasyon: {typeReservations}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Etkinlik Notu
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#7d6b5a]">
              Bu ekran ileride rezervasyon, pazarlama, stok, ekip ve birleşik
              takvim modülleriyle bağlanarak etkinlik hazırlıklarını otomatik
              takip edecek.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}