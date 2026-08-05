import { useState } from "react";

const initialItems = [
  {
    id: 1,
    name: "Kara Od Bonfile",
    category: "Ana Yemek",
    salesCount: 86,
    salePrice: 1450,
    totalCost: 670,
    status: "Aktif",
  },
  {
    id: 2,
    name: "Kahvaltı Pizzası",
    category: "Brunch",
    salesCount: 134,
    salePrice: 620,
    totalCost: 255,
    status: "Aktif",
  },
  {
    id: 3,
    name: "No1 Dana Burger",
    category: "Burger",
    salesCount: 118,
    salePrice: 540,
    totalCost: 280,
    status: "Aktif",
  },
  {
    id: 4,
    name: "Gerçek İtalyan Tiramisu",
    category: "Tatlı",
    salesCount: 42,
    salePrice: 360,
    totalCost: 140,
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

function getRevenue(item) {
  return Number(item.salesCount) * Number(item.salePrice);
}

function getGrossProfit(item) {
  return Number(item.salesCount) * (Number(item.salePrice) - Number(item.totalCost));
}

function getProfitPerItem(item) {
  return Number(item.salePrice) - Number(item.totalCost);
}

function getProfitRate(item) {
  if (Number(item.salePrice) === 0) return 0;

  return (getProfitPerItem(item) / Number(item.salePrice)) * 100;
}

function getFoodCostRate(item) {
  if (Number(item.salePrice) === 0) return 0;

  return (Number(item.totalCost) / Number(item.salePrice)) * 100;
}

function getAverageSales(items) {
  if (items.length === 0) return 0;

  return (
    items.reduce((total, item) => total + Number(item.salesCount), 0) /
    items.length
  );
}

function getEngineeringStatus(item, averageSales) {
  const isPopular = Number(item.salesCount) >= averageSales;
  const isProfitable = getProfitRate(item) >= 45;

  if (isPopular && isProfitable) {
    return {
      label: "Yıldız Ürün",
      advice: "Öne çıkar, görünürlüğünü artır, fiyatı dikkatli yükselt.",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  if (isPopular && !isProfitable) {
    return {
      label: "Popüler Ama Düşük Kâr",
      advice: "Reçeteyi gözden geçir, porsiyon veya fiyat revizyonu yap.",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  if (!isPopular && isProfitable) {
    return {
      label: "Kârlı Ama Az Satıyor",
      advice: "Garson önerisine, sosyal medya ve menüde daha iyi konuma al.",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    };
  }

  return {
    label: "Zayıf Performans",
    advice: "Menüden çıkarma, reçete değişimi veya kampanya düşün.",
    className: "bg-red-50 text-red-700 border-red-200",
  };
}

function getStatusClass(status) {
  if (status === "Aktif") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

export default function MenuEngineering() {
  const [items, setItems] = useState(initialItems);

  const [form, setForm] = useState({
    name: "",
    category: "",
    salesCount: "",
    salePrice: "",
    totalCost: "",
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

    const newItem = {
      id: Date.now(),
      name: form.name,
      category: form.category,
      salesCount: Number(form.salesCount),
      salePrice: Number(form.salePrice),
      totalCost: Number(form.totalCost),
      status: form.status,
    };

    setItems((prev) => [newItem, ...prev]);

    setForm({
      name: "",
      category: "",
      salesCount: "",
      salePrice: "",
      totalCost: "",
      status: "Aktif",
    });
  }

  function updateStatus(id, nextStatus) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item
      )
    );
  }

  const averageSales = getAverageSales(items);

  const totalRevenue = items.reduce((total, item) => total + getRevenue(item), 0);

  const totalProfit = items.reduce(
    (total, item) => total + getGrossProfit(item),
    0
  );

  const starItems = items.filter(
    (item) => getEngineeringStatus(item, averageSales).label === "Yıldız Ürün"
  ).length;

  const weakItems = items.filter(
    (item) =>
      getEngineeringStatus(item, averageSales).label === "Zayıf Performans"
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
              Menü Mühendisliği
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Menü ürünlerini satış adedi, ciro, kâr oranı ve maliyet yapısına
              göre analiz et. Hangi ürünün öne çıkarılacağını, hangisinin
              revize edileceğini gör.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Mühendislik Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Ciro</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {formatCurrency(totalRevenue)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Brüt Kâr</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {formatCurrency(totalProfit)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Yıldız Ürün</p>
          <h3 className="mt-3 text-2xl font-semibold text-blue-700">
            {starItems}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Zayıf Performans</p>
          <h3 className="mt-3 text-2xl font-semibold text-red-700">
            {weakItems}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Ortalama satış: {averageSales.toFixed(1)} adet
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Ürün Analizi Ekle
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Satış adedi ve kâr oranına göre ürün sınıfı otomatik belirlenir.
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
            name="salesCount"
            value={form.salesCount}
            onChange={handleChange}
            placeholder="Satış adedi"
            type="number"
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
            name="totalCost"
            value={form.totalCost}
            onChange={handleChange}
            placeholder="Birim toplam maliyet"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
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

          <button className="col-span-2 rounded-2xl bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Analize Ekle
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
        <div className="border-b border-[#eadfce] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Menü Performans Listesi
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Ürünler ortalama satış adedi ve kâr oranına göre otomatik
            sınıflandırılır.
          </p>
        </div>

        <table className="w-full text-left">
          <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
            <tr>
              <th className="px-6 py-4">Ürün</th>
              <th className="px-6 py-4">Satış</th>
              <th className="px-6 py-4">Ciro</th>
              <th className="px-6 py-4">Birim Kâr</th>
              <th className="px-6 py-4">Toplam Kâr</th>
              <th className="px-6 py-4">Food Cost</th>
              <th className="px-6 py-4">Sınıf</th>
              <th className="px-6 py-4 text-right">Durum</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => {
              const engineeringStatus = getEngineeringStatus(
                item,
                averageSales
              );

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

                  <td className="px-6 py-4 text-sm text-[#211914]">
                    {item.salesCount} adet
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-[#211914]">
                    {formatCurrency(getRevenue(item))}
                  </td>

                  <td className="px-6 py-4 text-sm text-emerald-700">
                    {formatCurrency(getProfitPerItem(item))}
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
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${engineeringStatus.className}`}
                    >
                      {engineeringStatus.label}
                    </span>

                    <p className="mt-2 max-w-[260px] text-xs leading-5 text-[#8a7560]">
                      {engineeringStatus.advice}
                    </p>
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