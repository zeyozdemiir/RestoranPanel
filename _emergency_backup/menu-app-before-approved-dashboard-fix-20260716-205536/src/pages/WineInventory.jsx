import { useState } from "react";

const initialWines = [
  {
    id: 1,
    name: "Chateau No1 Reserve",
    type: "Kırmızı",
    origin: "Fransa",
    vintage: "2019",
    bottleCount: 18,
    minBottleCount: 6,
    purchasePrice: 850,
    salePrice: 2400,
    supplier: "Premium Şarap Tedarikçisi",
  },
  {
    id: 2,
    name: "Ege Beyaz",
    type: "Beyaz",
    origin: "Türkiye",
    vintage: "2022",
    bottleCount: 5,
    minBottleCount: 8,
    purchasePrice: 420,
    salePrice: 1250,
    supplier: "Yerel Şarap Tedarikçisi",
  },
  {
    id: 3,
    name: "Rose Selection",
    type: "Rose",
    origin: "İtalya",
    vintage: "2021",
    bottleCount: 12,
    minBottleCount: 5,
    purchasePrice: 520,
    salePrice: 1500,
    supplier: "Premium Şarap Tedarikçisi",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function getStockValue(wine) {
  return Number(wine.bottleCount) * Number(wine.purchasePrice);
}

function getPotentialRevenue(wine) {
  return Number(wine.bottleCount) * Number(wine.salePrice);
}

function getProfitMargin(wine) {
  const purchasePrice = Number(wine.purchasePrice);
  const salePrice = Number(wine.salePrice);

  if (salePrice === 0) return 0;

  return ((salePrice - purchasePrice) / salePrice) * 100;
}

function getStockStatus(wine) {
  if (Number(wine.bottleCount) <= Number(wine.minBottleCount)) {
    return {
      label: "Kritik",
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }

  if (Number(wine.bottleCount) <= Number(wine.minBottleCount) * 1.5) {
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

export default function WineInventory() {
  const [wines, setWines] = useState(initialWines);

  const [form, setForm] = useState({
    name: "",
    type: "",
    origin: "",
    vintage: "",
    bottleCount: "",
    minBottleCount: "",
    purchasePrice: "",
    salePrice: "",
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

    const newWine = {
      id: Date.now(),
      name: form.name,
      type: form.type,
      origin: form.origin,
      vintage: form.vintage,
      bottleCount: Number(form.bottleCount),
      minBottleCount: Number(form.minBottleCount),
      purchasePrice: Number(form.purchasePrice),
      salePrice: Number(form.salePrice),
      supplier: form.supplier,
    };

    setWines((prev) => [newWine, ...prev]);

    setForm({
      name: "",
      type: "",
      origin: "",
      vintage: "",
      bottleCount: "",
      minBottleCount: "",
      purchasePrice: "",
      salePrice: "",
      supplier: "",
    });
  }

  const totalBottles = wines.reduce(
    (total, wine) => total + Number(wine.bottleCount),
    0
  );

  const totalStockValue = wines.reduce(
    (total, wine) => total + getStockValue(wine),
    0
  );

  const totalPotentialRevenue = wines.reduce(
    (total, wine) => total + getPotentialRevenue(wine),
    0
  );

  const criticalWines = wines.filter(
    (wine) => getStockStatus(wine).label === "Kritik"
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
              Şarap Envanteri
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Şarap stoklarını rekolte, menşei, şişe adedi, alış maliyeti,
              satış fiyatı ve tedarikçi bilgisiyle takip et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Şarap Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Şişe</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalBottles}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Stok Maliyeti</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {formatCurrency(totalStockValue)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Potansiyel Satış</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {formatCurrency(totalPotentialRevenue)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Kritik Şarap</p>
          <h3 className="mt-3 text-2xl font-semibold text-red-700">
            {criticalWines}
          </h3>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Şarap Ekle
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Şarap kartı ileride satış, reçete, pairing ve stok hareketleriyle
            ilişkilendirilecek.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Şarap adı"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Tür seç</option>
            <option value="Kırmızı">Kırmızı</option>
            <option value="Beyaz">Beyaz</option>
            <option value="Rose">Rose</option>
            <option value="Köpüklü">Köpüklü</option>
            <option value="Tatlı">Tatlı</option>
          </select>

          <input
            name="origin"
            value={form.origin}
            onChange={handleChange}
            placeholder="Menşei"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="vintage"
            value={form.vintage}
            onChange={handleChange}
            placeholder="Rekolte"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="bottleCount"
            value={form.bottleCount}
            onChange={handleChange}
            placeholder="Şişe adedi"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
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
            name="salePrice"
            value={form.salePrice}
            onChange={handleChange}
            placeholder="Satış fiyatı"
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
            Şarap Ekle
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
        <div className="border-b border-[#eadfce] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Şarap Listesi
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Kritik stok seviyesine düşen şaraplar otomatik işaretlenir.
          </p>
        </div>

        <table className="w-full text-left">
          <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
            <tr>
              <th className="px-6 py-4">Şarap</th>
              <th className="px-6 py-4">Tür</th>
              <th className="px-6 py-4">Şişe</th>
              <th className="px-6 py-4">Alış</th>
              <th className="px-6 py-4">Satış</th>
              <th className="px-6 py-4">Marj</th>
              <th className="px-6 py-4">Stok Değeri</th>
              <th className="px-6 py-4 text-right">Durum</th>
            </tr>
          </thead>

          <tbody>
            {wines.map((wine) => {
              const status = getStockStatus(wine);

              return (
                <tr
                  key={wine.id}
                  className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#211914]">{wine.name}</p>
                    <p className="mt-1 text-xs text-[#8a7560]">
                      {wine.origin} / {wine.vintage}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {wine.type}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#211914]">
                    {wine.bottleCount} şişe
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {formatCurrency(wine.purchasePrice)}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#211914]">
                    {formatCurrency(wine.salePrice)}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-emerald-700">
                    %{getProfitMargin(wine).toFixed(1)}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-[#211914]">
                    {formatCurrency(getStockValue(wine))}
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