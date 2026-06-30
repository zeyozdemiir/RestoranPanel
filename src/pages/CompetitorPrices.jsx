import { useState } from "react";

const initialPrices = [
  {
    id: 1,
    productName: "Kara Od Bonfile",
    category: "Ana Yemek",
    ourPrice: 1450,
    competitorName: "Rakip Steakhouse",
    competitorPrice: 1650,
    platform: "Menü",
    lastChecked: "2026-06-27",
    note: "Benzer porsiyon, daha yüksek fiyat.",
  },
  {
    id: 2,
    productName: "No1 Dana Burger",
    category: "Burger",
    ourPrice: 540,
    competitorName: "Rakip Burger",
    competitorPrice: 490,
    platform: "Yemeksepeti",
    lastChecked: "2026-06-26",
    note: "Rakip fiyat daha düşük, içerik karşılaştırılmalı.",
  },
  {
    id: 3,
    productName: "Gerçek İtalyan Tiramisu",
    category: "Tatlı",
    ourPrice: 360,
    competitorName: "Rakip İtalyan",
    competitorPrice: 390,
    platform: "Instagram Menü",
    lastChecked: "2026-06-25",
    note: "Fiyatımız rekabetçi.",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function getPriceDifference(item) {
  return Number(item.ourPrice) - Number(item.competitorPrice);
}

function getDifferenceRate(item) {
  if (Number(item.competitorPrice) === 0) return 0;

  return (getPriceDifference(item) / Number(item.competitorPrice)) * 100;
}

function getPriceStatus(item) {
  const difference = getPriceDifference(item);

  if (difference > 0) {
    return {
      label: "Biz Daha Pahalıyız",
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }

  if (difference < 0) {
    return {
      label: "Biz Daha Uygunuz",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  return {
    label: "Aynı Fiyat",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  };
}

function getPlatformClass(platform) {
  if (platform === "Yemeksepeti") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (platform === "Instagram Menü") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  if (platform === "Menü") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

export default function CompetitorPrices() {
  const [prices, setPrices] = useState(initialPrices);

  const [form, setForm] = useState({
    productName: "",
    category: "",
    ourPrice: "",
    competitorName: "",
    competitorPrice: "",
    platform: "Menü",
    lastChecked: "",
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

    const newPrice = {
      id: Date.now(),
      productName: form.productName,
      category: form.category,
      ourPrice: Number(form.ourPrice),
      competitorName: form.competitorName,
      competitorPrice: Number(form.competitorPrice),
      platform: form.platform,
      lastChecked: form.lastChecked,
      note: form.note,
    };

    setPrices((prev) => [newPrice, ...prev]);

    setForm({
      productName: "",
      category: "",
      ourPrice: "",
      competitorName: "",
      competitorPrice: "",
      platform: "Menü",
      lastChecked: "",
      note: "",
    });
  }

  const totalRecords = prices.length;

  const cheaperCount = prices.filter(
    (item) => getPriceStatus(item).label === "Biz Daha Uygunuz"
  ).length;

  const expensiveCount = prices.filter(
    (item) => getPriceStatus(item).label === "Biz Daha Pahalıyız"
  ).length;

  const averageDifference =
    prices.length === 0
      ? 0
      : prices.reduce((total, item) => total + getPriceDifference(item), 0) /
        prices.length;

  const averageDifferenceRate =
    prices.length === 0
      ? 0
      : prices.reduce((total, item) => total + getDifferenceRate(item), 0) /
        prices.length;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Menü & Satış
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Rakip Fiyatları
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Rakip restoranlardaki benzer ürün fiyatlarını takip et. Bizim
              fiyatla farkını, oranını ve rekabet durumunu analiz et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Fiyat Analizi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Takip Edilen Ürün</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalRecords}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Biz Daha Uygunuz</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {cheaperCount}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Biz Daha Pahalıyız</p>
          <h3 className="mt-3 text-2xl font-semibold text-red-700">
            {expensiveCount}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Ortalama Fark</p>
          <h3
            className={`mt-3 text-2xl font-semibold ${
              averageDifference > 0 ? "text-red-700" : "text-emerald-700"
            }`}
          >
            {formatCurrency(averageDifference)}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Ortalama oran: %{averageDifferenceRate.toFixed(1)}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Rakip Fiyatı Ekle
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Bu kayıt ileride menü fiyat revizyonu ve karar destek modülüyle
            ilişkilendirilecek.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="productName"
            value={form.productName}
            onChange={handleChange}
            placeholder="Bizdeki ürün adı"
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
            name="ourPrice"
            value={form.ourPrice}
            onChange={handleChange}
            placeholder="Bizim fiyat"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="competitorName"
            value={form.competitorName}
            onChange={handleChange}
            placeholder="Rakip adı"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="competitorPrice"
            value={form.competitorPrice}
            onChange={handleChange}
            placeholder="Rakip fiyat"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="platform"
            value={form.platform}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Menü">Menü</option>
            <option value="Yemeksepeti">Yemeksepeti</option>
            <option value="Instagram Menü">Instagram Menü</option>
            <option value="Web Sitesi">Web Sitesi</option>
          </select>

          <input
            name="lastChecked"
            value={form.lastChecked}
            onChange={handleChange}
            type="date"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <button className="rounded-2xl bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Fiyat Ekle
          </button>

          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Not / karşılaştırma açıklaması"
            className="col-span-4 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />
        </div>
      </form>

      <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
        <div className="border-b border-[#eadfce] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Rakip Fiyat Listesi
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Fiyat farkı bizim fiyat eksi rakip fiyat olarak hesaplanır.
          </p>
        </div>

        <table className="w-full text-left">
          <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
            <tr>
              <th className="px-6 py-4">Ürün</th>
              <th className="px-6 py-4">Rakip</th>
              <th className="px-6 py-4">Bizim Fiyat</th>
              <th className="px-6 py-4">Rakip Fiyat</th>
              <th className="px-6 py-4">Fark</th>
              <th className="px-6 py-4">Platform</th>
              <th className="px-6 py-4">Durum</th>
              <th className="px-6 py-4 text-right">Kontrol</th>
            </tr>
          </thead>

          <tbody>
            {prices.map((item) => {
              const priceStatus = getPriceStatus(item);
              const difference = getPriceDifference(item);
              const differenceRate = getDifferenceRate(item);

              return (
                <tr
                  key={item.id}
                  className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#211914]">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-xs text-[#8a7560]">
                      {item.category}
                    </p>
                    <p className="mt-2 max-w-[320px] text-xs leading-5 text-[#8a7560]">
                      {item.note}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm text-[#211914]">
                    {item.competitorName}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-[#211914]">
                    {formatCurrency(item.ourPrice)}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {formatCurrency(item.competitorPrice)}
                  </td>

                  <td
                    className={`px-6 py-4 text-sm font-medium ${
                      difference > 0
                        ? "text-red-700"
                        : difference < 0
                        ? "text-emerald-700"
                        : "text-blue-700"
                    }`}
                  >
                    <p>{formatCurrency(difference)}</p>
                    <p className="mt-1 text-xs">
                      %{differenceRate.toFixed(1)}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${getPlatformClass(
                        item.platform
                      )}`}
                    >
                      {item.platform}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${priceStatus.className}`}
                    >
                      {priceStatus.label}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right text-sm text-[#7d6b5a]">
                    {item.lastChecked}
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