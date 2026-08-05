import { useState } from "react";

const initialBeverages = [
  {
    id: 1,
    name: "Gin",
    category: "Spirit",
    bottleSizeMl: 700,
    fullBottleCount: 8,
    openBottleMl: 350,
    minBottleCount: 3,
    purchasePrice: 620,
    supplier: "Bar Tedarikçisi",
  },
  {
    id: 2,
    name: "Vodka",
    category: "Spirit",
    bottleSizeMl: 700,
    fullBottleCount: 4,
    openBottleMl: 120,
    minBottleCount: 5,
    purchasePrice: 540,
    supplier: "Bar Tedarikçisi",
  },
  {
    id: 3,
    name: "Passion Puree",
    category: "Püre",
    bottleSizeMl: 1000,
    fullBottleCount: 6,
    openBottleMl: 500,
    minBottleCount: 2,
    purchasePrice: 390,
    supplier: "Kokteyl Ürünleri",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function getTotalMl(item) {
  return Number(item.fullBottleCount) * Number(item.bottleSizeMl) + Number(item.openBottleMl);
}

function getStockValue(item) {
  const fullValue = Number(item.fullBottleCount) * Number(item.purchasePrice);
  const openValue =
    (Number(item.openBottleMl) / Number(item.bottleSizeMl)) *
    Number(item.purchasePrice);

  return fullValue + openValue;
}

function getStatus(item) {
  if (Number(item.fullBottleCount) <= Number(item.minBottleCount)) {
    return {
      label: "Kritik",
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }

  if (Number(item.fullBottleCount) <= Number(item.minBottleCount) * 1.5) {
    return {
      label: "Azalıyor",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  return {
    label: "Yeterli",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
}

export default function BeverageInventory() {
  const [beverages, setBeverages] = useState(initialBeverages);

  const [form, setForm] = useState({
    name: "",
    category: "",
    bottleSizeMl: "700",
    fullBottleCount: "",
    openBottleMl: "",
    minBottleCount: "",
    purchasePrice: "",
    supplier: "",
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

    const newBeverage = {
      id: Date.now(),
      name: form.name,
      category: form.category,
      bottleSizeMl: Number(form.bottleSizeMl),
      fullBottleCount: Number(form.fullBottleCount),
      openBottleMl: Number(form.openBottleMl || 0),
      minBottleCount: Number(form.minBottleCount),
      purchasePrice: Number(form.purchasePrice),
      supplier: form.supplier,
    };

    setBeverages((prev) => [newBeverage, ...prev]);

    setForm({
      name: "",
      category: "",
      bottleSizeMl: "700",
      fullBottleCount: "",
      openBottleMl: "",
      minBottleCount: "",
      purchasePrice: "",
      supplier: "",
    });
  }

  const totalBottles = beverages.reduce(
    (total, item) => total + Number(item.fullBottleCount),
    0
  );

  const totalOpenMl = beverages.reduce(
    (total, item) => total + Number(item.openBottleMl),
    0
  );

  const totalStockValue = beverages.reduce(
    (total, item) => total + getStockValue(item),
    0
  );

  const criticalCount = beverages.filter(
    (item) => getStatus(item).label === "Kritik"
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
              İçki & Bar Envanteri
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Bar ürünlerini tam şişe, açık şişe, minimum stok, tedarikçi ve
              stok değeriyle takip et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Bar Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Tam Şişe</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalBottles}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Açık Şişe Toplamı</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalOpenMl} ml
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Bar Stok Değeri</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {formatCurrency(totalStockValue)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Kritik Ürün</p>
          <h3 className="mt-3 text-2xl font-semibold text-red-700">
            {criticalCount}
          </h3>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Bar Ürünü Ekle
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Bu kayıt ileride kokteyl reçeteleri, bar fireleri ve satın alma
            modülleriyle ilişkilendirilecek.
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
            name="bottleSizeMl"
            value={form.bottleSizeMl}
            onChange={handleChange}
            placeholder="Şişe ml"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="fullBottleCount"
            value={form.fullBottleCount}
            onChange={handleChange}
            placeholder="Tam şişe"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="openBottleMl"
            value={form.openBottleMl}
            onChange={handleChange}
            placeholder="Açık şişe ml"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="minBottleCount"
            value={form.minBottleCount}
            onChange={handleChange}
            placeholder="Minimum şişe"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="purchasePrice"
            value={form.purchasePrice}
            onChange={handleChange}
            placeholder="Alış fiyatı"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="supplier"
            value={form.supplier}
            onChange={handleChange}
            placeholder="Tedarikçi"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Bar Ürünü Ekle
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
        <div className="border-b border-[#eadfce] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Bar Ürün Listesi
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Açık şişe miktarı ve tam şişe sayısına göre stok değeri hesaplanır.
          </p>
        </div>

        <table className="w-full text-left">
          <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
            <tr>
              <th className="px-6 py-4">Ürün</th>
              <th className="px-6 py-4">Tam Şişe</th>
              <th className="px-6 py-4">Açık Şişe</th>
              <th className="px-6 py-4">Toplam ML</th>
              <th className="px-6 py-4">Alış</th>
              <th className="px-6 py-4">Stok Değeri</th>
              <th className="px-6 py-4">Tedarikçi</th>
              <th className="px-6 py-4 text-right">Durum</th>
            </tr>
          </thead>

          <tbody>
            {beverages.map((item) => {
              const status = getStatus(item);

              return (
                <tr
                  key={item.id}
                  className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#211914]">{item.name}</p>
                    <p className="mt-1 text-xs text-[#8a7560]">
                      {item.category} / {item.bottleSizeMl} ml
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm text-[#211914]">
                    {item.fullBottleCount}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {item.openBottleMl} ml
                  </td>

                  <td className="px-6 py-4 text-sm text-[#211914]">
                    {getTotalMl(item)} ml
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {formatCurrency(item.purchasePrice)}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-[#211914]">
                    {formatCurrency(getStockValue(item))}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {item.supplier}
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