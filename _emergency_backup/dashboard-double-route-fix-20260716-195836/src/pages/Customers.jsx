import { useState } from "react";

const initialCustomers = [
  {
    id: 1,
    fullName: "Derya Aksoy",
    phone: "0532 000 00 00",
    email: "derya@example.com",
    segment: "VIP",
    visitCount: 18,
    totalSpent: 84500,
    lastVisit: "2026-06-22",
    favorite: "Kara Od Bonfile, kırmızı şarap",
    status: "Aktif",
    note: "Cam kenarı masa tercih ediyor. Özel günlerde aranabilir.",
  },
  {
    id: 2,
    fullName: "Mert Yıldırım",
    phone: "0533 000 00 00",
    email: "mert@example.com",
    segment: "Sadık Müşteri",
    visitCount: 9,
    totalSpent: 32600,
    lastVisit: "2026-06-20",
    favorite: "No1 Dana Burger, kokteyl",
    status: "Aktif",
    note: "Hafta sonu akşam rezervasyonu yapıyor.",
  },
  {
    id: 3,
    fullName: "Selin Korkmaz",
    phone: "0534 000 00 00",
    email: "selin@example.com",
    segment: "Yeni Müşteri",
    visitCount: 2,
    totalSpent: 6400,
    lastVisit: "2026-06-18",
    favorite: "Brunch",
    status: "Takip Edilecek",
    note: "Brunch sonrası memnuniyet mesajı gönderilebilir.",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function getAverageSpend(customer) {
  if (Number(customer.visitCount) === 0) return 0;

  return Number(customer.totalSpent) / Number(customer.visitCount);
}

function getSegmentClass(segment) {
  if (segment === "VIP") {
    return "bg-[#fff7e7] text-[#9c7439] border-[#c9a45c]/30";
  }

  if (segment === "Sadık Müşteri") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (segment === "Yeni Müşteri") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (segment === "Riskli") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

function getStatusClass(status) {
  if (status === "Aktif") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "Takip Edilecek") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (status === "Pasif") {
    return "bg-gray-50 text-gray-700 border-gray-200";
  }

  return "bg-blue-50 text-blue-700 border-blue-200";
}

function getCustomerValue(customer) {
  const totalSpent = Number(customer.totalSpent);

  if (totalSpent >= 75000) {
    return {
      label: "Çok Yüksek Değer",
      className: "bg-[#fff7e7] text-[#9c7439] border-[#c9a45c]/30",
    };
  }

  if (totalSpent >= 30000) {
    return {
      label: "Yüksek Değer",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  if (totalSpent >= 10000) {
    return {
      label: "Orta Değer",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    };
  }

  return {
    label: "Geliştirilecek",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  };
}

export default function Customers() {
  const [customers, setCustomers] = useState(initialCustomers);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    segment: "Yeni Müşteri",
    visitCount: "",
    totalSpent: "",
    lastVisit: "",
    favorite: "",
    status: "Aktif",
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

    const newCustomer = {
      id: Date.now(),
      fullName: form.fullName,
      phone: form.phone,
      email: form.email,
      segment: form.segment,
      visitCount: Number(form.visitCount || 0),
      totalSpent: Number(form.totalSpent || 0),
      lastVisit: form.lastVisit,
      favorite: form.favorite,
      status: form.status,
      note: form.note,
    };

    setCustomers((prev) => [newCustomer, ...prev]);

    setForm({
      fullName: "",
      phone: "",
      email: "",
      segment: "Yeni Müşteri",
      visitCount: "",
      totalSpent: "",
      lastVisit: "",
      favorite: "",
      status: "Aktif",
      note: "",
    });
  }

  function updateStatus(id, nextStatus) {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === id ? { ...customer, status: nextStatus } : customer
      )
    );
  }

  function updateSegment(id, nextSegment) {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === id ? { ...customer, segment: nextSegment } : customer
      )
    );
  }

  const totalCustomers = customers.length;

  const vipCustomers = customers.filter(
    (customer) => customer.segment === "VIP"
  ).length;

  const followUpCustomers = customers.filter(
    (customer) => customer.status === "Takip Edilecek"
  ).length;

  const totalRevenue = customers.reduce(
    (total, customer) => total + Number(customer.totalSpent),
    0
  );

  const totalVisits = customers.reduce(
    (total, customer) => total + Number(customer.visitCount),
    0
  );

  const averageSpend =
    totalVisits === 0 ? 0 : totalRevenue / totalVisits;

  const segments = [...new Set(customers.map((customer) => customer.segment))];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Ekip & Müşteri
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Müşteri CRM
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Müşteri profillerini, ziyaret sayılarını, toplam harcamayı, favori
              tercihleri, segmentleri ve takip notlarını tek ekrandan yönet.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            CRM Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Müşteri</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalCustomers}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">VIP Müşteri</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#9c7439]">
            {vipCustomers}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">CRM Geliri</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {formatCurrency(totalRevenue)}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Ziyaret başı: {formatCurrency(averageSpend)}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Takip Edilecek</p>
          <h3 className="mt-3 text-2xl font-semibold text-amber-700">
            {followUpCustomers}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Segment: {segments.length}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Müşteri Kaydı Ekle
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Bu kayıt ileride rezervasyon, geri bildirim, kampanya ve pazarlama
            merkeziyle ilişkilendirilecek.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Ad soyad"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Telefon"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="E-posta"
            type="email"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <select
            name="segment"
            value={form.segment}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Yeni Müşteri">Yeni Müşteri</option>
            <option value="Sadık Müşteri">Sadık Müşteri</option>
            <option value="VIP">VIP</option>
            <option value="Riskli">Riskli</option>
          </select>

          <input
            name="visitCount"
            value={form.visitCount}
            onChange={handleChange}
            placeholder="Ziyaret sayısı"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="totalSpent"
            value={form.totalSpent}
            onChange={handleChange}
            placeholder="Toplam harcama"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="lastVisit"
            value={form.lastVisit}
            onChange={handleChange}
            type="date"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Aktif">Aktif</option>
            <option value="Takip Edilecek">Takip Edilecek</option>
            <option value="Pasif">Pasif</option>
          </select>

          <input
            name="favorite"
            value={form.favorite}
            onChange={handleChange}
            placeholder="Favori ürün / tercih"
            className="col-span-2 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Müşteri notu"
            className="col-span-2 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Müşteri Ekle
          </button>
        </div>
      </form>

      <div className="grid grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
          <div className="border-b border-[#eadfce] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#211914]">
              Müşteri Listesi
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Müşteri değeri toplam harcama ve ziyaret davranışına göre
              yorumlanır.
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
              <tr>
                <th className="px-6 py-4">Müşteri</th>
                <th className="px-6 py-4">Segment</th>
                <th className="px-6 py-4">Ziyaret</th>
                <th className="px-6 py-4">Harcama</th>
                <th className="px-6 py-4">Değer</th>
                <th className="px-6 py-4 text-right">Durum</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => {
                const customerValue = getCustomerValue(customer);

                return (
                  <tr
                    key={customer.id}
                    className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#211914]">
                        {customer.fullName}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        {customer.phone || "-"} / {customer.email || "-"}
                      </p>

                      <p className="mt-2 max-w-[300px] text-xs leading-5 text-[#7d6b5a]">
                        {customer.note}
                      </p>

                      {customer.favorite && (
                        <p className="mt-2 text-xs font-medium text-[#9c7439]">
                          Favori: {customer.favorite}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={customer.segment}
                        onChange={(event) =>
                          updateSegment(customer.id, event.target.value)
                        }
                        className={`rounded-xl border px-3 py-2 text-xs outline-none ${getSegmentClass(
                          customer.segment
                        )}`}
                      >
                        <option value="Yeni Müşteri">Yeni Müşteri</option>
                        <option value="Sadık Müşteri">Sadık Müşteri</option>
                        <option value="VIP">VIP</option>
                        <option value="Riskli">Riskli</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#211914]">
                        {customer.visitCount} ziyaret
                      </p>
                      <p className="mt-1 text-xs text-[#8a7560]">
                        Son: {customer.lastVisit || "-"}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-emerald-700">
                        {formatCurrency(customer.totalSpent)}
                      </p>
                      <p className="mt-1 text-xs text-[#8a7560]">
                        Ortalama: {formatCurrency(getAverageSpend(customer))}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${customerValue.className}`}
                      >
                        {customerValue.label}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <select
                        value={customer.status}
                        onChange={(event) =>
                          updateStatus(customer.id, event.target.value)
                        }
                        className={`rounded-xl border px-3 py-2 text-xs outline-none ${getStatusClass(
                          customer.status
                        )}`}
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Takip Edilecek">Takip Edilecek</option>
                        <option value="Pasif">Pasif</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Segment Özeti
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Müşterilerin segment bazlı dağılımı.
            </p>

            <div className="mt-6 space-y-4">
              {segments.map((segment) => {
                const segmentCustomers = customers.filter(
                  (customer) => customer.segment === segment
                );

                const segmentRevenue = segmentCustomers.reduce(
                  (total, customer) => total + Number(customer.totalSpent),
                  0
                );

                return (
                  <div key={segment} className="rounded-2xl bg-[#fbf8f3] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getSegmentClass(
                          segment
                        )}`}
                      >
                        {segment}
                      </span>

                      <span className="text-sm font-semibold text-[#211914]">
                        {segmentCustomers.length} kişi
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-[#8a7560]">
                      Gelir: {formatCurrency(segmentRevenue)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              CRM Notu
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#7d6b5a]">
              Müşteri notları ileride rezervasyon geçmişi, doğum günü
              kampanyaları, özel gün mesajları ve geri bildirim modülüyle
              bağlanacak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}