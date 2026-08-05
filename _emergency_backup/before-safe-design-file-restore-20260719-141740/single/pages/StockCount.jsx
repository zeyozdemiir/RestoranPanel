import { useState } from "react";

const initialCounts = [
  {
    id: 1,
    itemName: "Mozzarella",
    category: "Süt Ürünleri",
    unit: "kg",
    systemStock: 6,
    countedStock: 4,
    unitCost: 280,
    countedBy: "Mutfak Şefi",
    date: "2026-06-27",
  },
  {
    id: 2,
    itemName: "Dana Bonfile",
    category: "Et",
    unit: "kg",
    systemStock: 12,
    countedStock: 12,
    unitCost: 950,
    countedBy: "Mutfak Şefi",
    date: "2026-06-27",
  },
  {
    id: 3,
    itemName: "Lime",
    category: "Bar",
    unit: "kg",
    systemStock: 8,
    countedStock: 5,
    unitCost: 120,
    countedBy: "Bar Sorumlusu",
    date: "2026-06-27",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function getDifference(item) {
  return Number(item.countedStock) - Number(item.systemStock);
}

function getDifferenceCost(item) {
  return getDifference(item) * Number(item.unitCost);
}

function getStatus(item) {
  const difference = getDifference(item);

  if (difference < 0) {
    return {
      label: "Eksik / Fire",
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }

  if (difference > 0) {
    return {
      label: "Fazla",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    };
  }

  return {
    label: "Denk",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
}

export default function StockCount() {
  const [counts, setCounts] = useState(initialCounts);

  const [form, setForm] = useState({
    itemName: "",
    category: "",
    unit: "kg",
    systemStock: "",
    countedStock: "",
    unitCost: "",
    countedBy: "",
    date: "",
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

    const newCount = {
      id: Date.now(),
      itemName: form.itemName,
      category: form.category,
      unit: form.unit,
      systemStock: Number(form.systemStock),
      countedStock: Number(form.countedStock),
      unitCost: Number(form.unitCost),
      countedBy: form.countedBy,
      date: form.date,
    };

    setCounts((prev) => [newCount, ...prev]);

    setForm({
      itemName: "",
      category: "",
      unit: "kg",
      systemStock: "",
      countedStock: "",
      unitCost: "",
      countedBy: "",
      date: "",
    });
  }

  const totalItems = counts.length;

  const differentItems = counts.filter((item) => getDifference(item) !== 0).length;

  const totalFireCost = counts
    .filter((item) => getDifference(item) < 0)
    .reduce((total, item) => total + Math.abs(getDifferenceCost(item)), 0);

  const totalSurplusCost = counts
    .filter((item) => getDifference(item) > 0)
    .reduce((total, item) => total + getDifferenceCost(item), 0);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Mutfak, Bar & Stok
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Stok Sayım & Fire
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Sistem stoğu ile gerçek sayım sonucunu karşılaştır. Eksik, fazla
              ve fire maliyetlerini takip et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Sayım Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Sayılan Ürün</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalItems}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Fark Olan Ürün</p>
          <h3 className="mt-3 text-2xl font-semibold text-amber-700">
            {differentItems}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Fire Maliyeti</p>
          <h3 className="mt-3 text-2xl font-semibold text-red-700">
            {formatCurrency(totalFireCost)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Fazla Stok Değeri</p>
          <h3 className="mt-3 text-2xl font-semibold text-blue-700">
            {formatCurrency(totalSurplusCost)}
          </h3>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Sayım Kaydı
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Sayım farkları ileride zayi, kırılma, satın alma ve stok hareketleri
            ile ilişkilendirilecek.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="itemName"
            value={form.itemName}
            onChange={handleChange}
            placeholder="Ürün / hammadde adı"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Kategori"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="kg">kg</option>
            <option value="gr">gr</option>
            <option value="lt">lt</option>
            <option value="ml">ml</option>
            <option value="adet">adet</option>
            <option value="şişe">şişe</option>
            <option value="paket">paket</option>
            <option value="koli">koli</option>
          </select>

          <input
            name="systemStock"
            value={form.systemStock}
            onChange={handleChange}
            placeholder="Sistem stoğu"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="countedStock"
            value={form.countedStock}
            onChange={handleChange}
            placeholder="Sayılan stok"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="unitCost"
            value={form.unitCost}
            onChange={handleChange}
            placeholder="Birim maliyet"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="countedBy"
            value={form.countedBy}
            onChange={handleChange}
            placeholder="Sayımı yapan"
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
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Sayım Kaydı Ekle
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
        <div className="border-b border-[#eadfce] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Sayım Listesi
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Eksik çıkan ürünler fire/zayi maliyeti olarak izlenir.
          </p>
        </div>

        <table className="w-full text-left">
          <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
            <tr>
              <th className="px-6 py-4">Ürün</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Sistem</th>
              <th className="px-6 py-4">Sayım</th>
              <th className="px-6 py-4">Fark</th>
              <th className="px-6 py-4">Fark Maliyeti</th>
              <th className="px-6 py-4">Durum</th>
              <th className="px-6 py-4 text-right">Tarih</th>
            </tr>
          </thead>

          <tbody>
            {counts.map((item) => {
              const difference = getDifference(item);
              const differenceCost = getDifferenceCost(item);
              const status = getStatus(item);

              return (
                <tr
                  key={item.id}
                  className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#211914]">
                      {item.itemName}
                    </p>
                    <p className="mt-1 text-xs text-[#8a7560]">
                      Sayımı yapan: {item.countedBy}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {item.category}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#211914]">
                    {item.systemStock} {item.unit}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#211914]">
                    {item.countedStock} {item.unit}
                  </td>

                  <td
                    className={`px-6 py-4 text-sm font-medium ${
                      difference < 0
                        ? "text-red-700"
                        : difference > 0
                        ? "text-blue-700"
                        : "text-emerald-700"
                    }`}
                  >
                    {difference > 0 ? "+" : ""}
                    {difference} {item.unit}
                  </td>

                  <td
                    className={`px-6 py-4 text-sm font-medium ${
                      differenceCost < 0
                        ? "text-red-700"
                        : differenceCost > 0
                        ? "text-blue-700"
                        : "text-emerald-700"
                    }`}
                  >
                    {formatCurrency(differenceCost)}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right text-sm text-[#7d6b5a]">
                    {item.date}
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