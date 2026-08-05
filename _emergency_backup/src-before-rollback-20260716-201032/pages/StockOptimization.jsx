import { useState } from "react";

const initialItems = [
  {
    id: 1,
    itemName: "Mozzarella",
    category: "Süt Ürünleri",
    currentStock: 3,
    avgDailyUsage: 2,
    unit: "kg",
    unitCost: 280,
    recommendedStock: 10,
  },
  {
    id: 2,
    itemName: "Dana Bonfile",
    category: "Et",
    currentStock: 18,
    avgDailyUsage: 1.5,
    unit: "kg",
    unitCost: 950,
    recommendedStock: 10,
  },
  {
    id: 3,
    itemName: "Lime",
    category: "Bar",
    currentStock: 2,
    avgDailyUsage: 1,
    unit: "kg",
    unitCost: 120,
    recommendedStock: 8,
  },
  {
    id: 4,
    itemName: "Şarap Kadehi",
    category: "Ekipman",
    currentStock: 90,
    avgDailyUsage: 0.2,
    unit: "adet",
    unitCost: 180,
    recommendedStock: 40,
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function getStockValue(item) {
  return Number(item.currentStock) * Number(item.unitCost);
}

function getEstimatedDays(item) {
  if (Number(item.avgDailyUsage) <= 0) return 0;
  return Number(item.currentStock) / Number(item.avgDailyUsage);
}

function getOptimizationStatus(item) {
  const currentStock = Number(item.currentStock);
  const recommendedStock = Number(item.recommendedStock);
  const days = getEstimatedDays(item);

  if (currentStock < recommendedStock * 0.5) {
    return {
      label: "Satın Alma Gerekli",
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }

  if (currentStock > recommendedStock * 1.5) {
    return {
      label: "Fazla Stok",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    };
  }

  if (days <= 3) {
    return {
      label: "Hızlı Tükeniyor",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  return {
    label: "Dengeli",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
}

export default function StockOptimization() {
  const [items, setItems] = useState(initialItems);

  const [form, setForm] = useState({
    itemName: "",
    category: "",
    currentStock: "",
    avgDailyUsage: "",
    unit: "kg",
    unitCost: "",
    recommendedStock: "",
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

    const newItem = {
      id: Date.now(),
      itemName: form.itemName,
      category: form.category,
      currentStock: Number(form.currentStock),
      avgDailyUsage: Number(form.avgDailyUsage),
      unit: form.unit,
      unitCost: Number(form.unitCost),
      recommendedStock: Number(form.recommendedStock),
    };

    setItems((prev) => [newItem, ...prev]);

    setForm({
      itemName: "",
      category: "",
      currentStock: "",
      avgDailyUsage: "",
      unit: "kg",
      unitCost: "",
      recommendedStock: "",
    });
  }

  const totalStockValue = items.reduce(
    (total, item) => total + getStockValue(item),
    0
  );

  const overStockCount = items.filter(
    (item) => getOptimizationStatus(item).label === "Fazla Stok"
  ).length;

  const purchaseNeededCount = items.filter(
    (item) => getOptimizationStatus(item).label === "Satın Alma Gerekli"
  ).length;

  const balancedCount = items.filter(
    (item) => getOptimizationStatus(item).label === "Dengeli"
  ).length;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Mutfak, Bar & Stok
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Stok Optimizasyonu
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Fazla stok, hızlı tükenen ürünler, satın alma ihtiyacı ve stok
              maliyetlerini analiz et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Optimizasyon Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Stok Değeri</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {formatCurrency(totalStockValue)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Satın Alma Gerekli</p>
          <h3 className="mt-3 text-2xl font-semibold text-red-700">
            {purchaseNeededCount}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Fazla Stok</p>
          <h3 className="mt-3 text-2xl font-semibold text-blue-700">
            {overStockCount}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Dengeli Ürün</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {balancedCount}
          </h3>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Optimizasyon Kaydı
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Ortalama günlük tüketim ve önerilen stok seviyesine göre ürün durumu
            otomatik hesaplanır.
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

          <input
            name="currentStock"
            value={form.currentStock}
            onChange={handleChange}
            placeholder="Mevcut stok"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="avgDailyUsage"
            value={form.avgDailyUsage}
            onChange={handleChange}
            placeholder="Günlük tüketim"
            type="number"
            step="0.1"
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
            name="unitCost"
            value={form.unitCost}
            onChange={handleChange}
            placeholder="Birim maliyet"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="recommendedStock"
            value={form.recommendedStock}
            onChange={handleChange}
            placeholder="Önerilen stok"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <button className="rounded-2xl bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Analize Ekle
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
        <div className="border-b border-[#eadfce] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Optimizasyon Listesi
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Ürünler stok seviyesi, tüketim hızı ve maliyet değerine göre
            sınıflandırılır.
          </p>
        </div>

        <table className="w-full text-left">
          <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
            <tr>
              <th className="px-6 py-4">Ürün</th>
              <th className="px-6 py-4">Mevcut Stok</th>
              <th className="px-6 py-4">Günlük Tüketim</th>
              <th className="px-6 py-4">Tahmini Gün</th>
              <th className="px-6 py-4">Önerilen Stok</th>
              <th className="px-6 py-4">Stok Değeri</th>
              <th className="px-6 py-4 text-right">Durum</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => {
              const status = getOptimizationStatus(item);
              const estimatedDays = getEstimatedDays(item);

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
                      {item.category}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm text-[#211914]">
                    {item.currentStock} {item.unit}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {item.avgDailyUsage} {item.unit}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#211914]">
                    {estimatedDays.toFixed(1)} gün
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {item.recommendedStock} {item.unit}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-[#211914]">
                    {formatCurrency(getStockValue(item))}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
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