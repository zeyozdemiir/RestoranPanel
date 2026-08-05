import { useState } from "react";

const initialMenuItems = [
  {
    id: 1,
    name: "Kara Od Bonfile",
    category: "Ana Yemek",
    salePrice: 1450,
    ingredientCost: 520,
    laborCost: 90,
    extraCost: 60,
    status: "Aktif",
  },
  {
    id: 2,
    name: "Kahvaltı Pizzası",
    category: "Brunch",
    salePrice: 620,
    ingredientCost: 185,
    laborCost: 45,
    extraCost: 25,
    status: "Aktif",
  },
  {
    id: 3,
    name: "No1 Dana Burger",
    category: "Burger",
    salePrice: 540,
    ingredientCost: 210,
    laborCost: 40,
    extraCost: 30,
    status: "Aktif",
  },
  {
    id: 4,
    name: "Gerçek İtalyan Tiramisu",
    category: "Tatlı",
    salePrice: 360,
    ingredientCost: 95,
    laborCost: 30,
    extraCost: 15,
    status: "Aktif",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function getTotalCost(item) {
  return (
    Number(item.ingredientCost) +
    Number(item.laborCost) +
    Number(item.extraCost)
  );
}

function getGrossProfit(item) {
  return Number(item.salePrice) - getTotalCost(item);
}

function getFoodCostRate(item) {
  if (Number(item.salePrice) === 0) return 0;

  return (getTotalCost(item) / Number(item.salePrice)) * 100;
}

function getProfitRate(item) {
  if (Number(item.salePrice) === 0) return 0;

  return (getGrossProfit(item) / Number(item.salePrice)) * 100;
}

function getCostStatus(item) {
  const foodCostRate = getFoodCostRate(item);

  if (foodCostRate >= 45) {
    return {
      label: "Maliyet Yüksek",
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }

  if (foodCostRate >= 35) {
    return {
      label: "Kontrol Edilmeli",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  return {
    label: "Sağlıklı",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
}

function getStatusClass(status) {
  if (status === "Aktif") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

export default function MenuCost() {
  const [menuItems, setMenuItems] = useState(initialMenuItems);

  const [form, setForm] = useState({
    name: "",
    category: "",
    salePrice: "",
    ingredientCost: "",
    laborCost: "",
    extraCost: "",
    status: "Aktif",
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

    const newMenuItem = {
      id: Date.now(),
      name: form.name,
      category: form.category,
      salePrice: Number(form.salePrice),
      ingredientCost: Number(form.ingredientCost),
      laborCost: Number(form.laborCost || 0),
      extraCost: Number(form.extraCost || 0),
      status: form.status,
    };

    setMenuItems((prev) => [newMenuItem, ...prev]);

    setForm({
      name: "",
      category: "",
      salePrice: "",
      ingredientCost: "",
      laborCost: "",
      extraCost: "",
      status: "Aktif",
    });
  }

  function updateStatus(id, nextStatus) {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item
      )
    );
  }

  const totalRevenuePotential = menuItems.reduce(
    (total, item) => total + Number(item.salePrice),
    0
  );

  const totalCost = menuItems.reduce(
    (total, item) => total + getTotalCost(item),
    0
  );

  const averageFoodCostRate =
    menuItems.length === 0
      ? 0
      : menuItems.reduce((total, item) => total + getFoodCostRate(item), 0) /
        menuItems.length;

  const highCostItems = menuItems.filter(
    (item) => getCostStatus(item).label === "Maliyet Yüksek"
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
              Menü & Maliyet
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Menü ürünlerinin satış fiyatını, reçete maliyetini, işçilik ve ek
              maliyetlerini takip ederek kârlılık durumunu analiz et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Menü Maliyet Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Menü Ürünü</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {menuItems.length}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Satış Potansiyeli</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {formatCurrency(totalRevenuePotential)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Maliyet</p>
          <h3 className="mt-3 text-2xl font-semibold text-red-700">
            {formatCurrency(totalCost)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Ort. Food Cost</p>
          <h3 className="mt-3 text-2xl font-semibold text-amber-700">
            %{averageFoodCostRate.toFixed(1)}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Yüksek maliyetli ürün: {highCostItems}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Menü Ürünü Ekle
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Ürün maliyeti satış fiyatına göre otomatik analiz edilir. İdeal
            food cost oranı ürün tipine göre değişebilir.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ürün adı"
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
            name="salePrice"
            value={form.salePrice}
            onChange={handleChange}
            placeholder="Satış fiyatı"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="ingredientCost"
            value={form.ingredientCost}
            onChange={handleChange}
            placeholder="Reçete maliyeti"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="laborCost"
            value={form.laborCost}
            onChange={handleChange}
            placeholder="İşçilik maliyeti"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="extraCost"
            value={form.extraCost}
            onChange={handleChange}
            placeholder="Ek maliyet"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Aktif">Aktif</option>
            <option value="Pasif">Pasif</option>
          </select>

          <button className="rounded-2xl bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Ürün Ekle
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
        <div className="border-b border-[#eadfce] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Menü Maliyet Listesi
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Food cost oranı yüksek çıkan ürünlerde fiyat veya reçete revizyonu
            gerekir.
          </p>
        </div>

        <table className="w-full text-left">
          <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
            <tr>
              <th className="px-6 py-4">Ürün</th>
              <th className="px-6 py-4">Satış</th>
              <th className="px-6 py-4">Reçete</th>
              <th className="px-6 py-4">Toplam Maliyet</th>
              <th className="px-6 py-4">Kâr</th>
              <th className="px-6 py-4">Food Cost</th>
              <th className="px-6 py-4">Durum</th>
              <th className="px-6 py-4 text-right">Yayın</th>
            </tr>
          </thead>

          <tbody>
            {menuItems.map((item) => {
              const status = getCostStatus(item);

              return (
                <tr
                  key={item.id}
                  className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#211914]">{item.name}</p>
                    <p className="mt-1 text-xs text-[#8a7560]">
                      {item.category}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-[#211914]">
                    {formatCurrency(item.salePrice)}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {formatCurrency(item.ingredientCost)}
                  </td>

                  <td className="px-6 py-4 text-sm text-red-700">
                    {formatCurrency(getTotalCost(item))}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-emerald-700">
                    {formatCurrency(getGrossProfit(item))}
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[#211914]">
                      %{getFoodCostRate(item).toFixed(1)}
                    </p>
                    <p className="mt-1 text-xs text-[#8a7560]">
                      Kâr: %{getProfitRate(item).toFixed(1)}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
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
                      <option value="Aktif">Aktif</option>
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