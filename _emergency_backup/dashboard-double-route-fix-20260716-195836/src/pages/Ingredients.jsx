import { useState } from "react";

const initialIngredients = [
  {
    id: 1,
    name: "Dana Bonfile",
    category: "Et",
    unit: "kg",
    currentStock: 12,
    minStock: 5,
    supplier: "Ana Et Tedarikçisi",
  },
  {
    id: 2,
    name: "Mozzarella",
    category: "Süt Ürünleri",
    unit: "kg",
    currentStock: 3,
    minStock: 6,
    supplier: "Süt Ürünleri Tedarikçisi",
  },
  {
    id: 3,
    name: "Domates",
    category: "Sebze",
    unit: "kg",
    currentStock: 18,
    minStock: 10,
    supplier: "Sebze Hali",
  },
];

function getStockStatus(item) {
  if (Number(item.currentStock) <= Number(item.minStock)) {
    return {
      label: "Kritik",
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }

  if (Number(item.currentStock) <= Number(item.minStock) * 1.5) {
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

export default function Ingredients() {
  const [ingredients, setIngredients] = useState(initialIngredients);

  const [form, setForm] = useState({
    name: "",
    category: "",
    unit: "kg",
    currentStock: "",
    minStock: "",
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

    const newIngredient = {
      id: Date.now(),
      name: form.name,
      category: form.category,
      unit: form.unit,
      currentStock: Number(form.currentStock),
      minStock: Number(form.minStock),
      supplier: form.supplier,
    };

    setIngredients((prev) => [newIngredient, ...prev]);

    setForm({
      name: "",
      category: "",
      unit: "kg",
      currentStock: "",
      minStock: "",
      supplier: "",
    });
  }

  const totalItems = ingredients.length;

  const criticalItems = ingredients.filter(
    (item) => Number(item.currentStock) <= Number(item.minStock)
  ).length;

  const healthyItems = totalItems - criticalItems;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Mutfak, Bar & Stok
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Hammadde Deposu
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Mutfak ve bar hammaddelerini birim, tedarikçi, mevcut stok ve
              minimum stok seviyesine göre takip et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Stok Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Hammadde</p>
          <h3 className="mt-3 text-3xl font-semibold text-[#211914]">
            {totalItems}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Kritik Stok</p>
          <h3 className="mt-3 text-3xl font-semibold text-red-700">
            {criticalItems}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Yeterli Stok</p>
          <h3 className="mt-3 text-3xl font-semibold text-emerald-700">
            {healthyItems}
          </h3>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Hammadde Ekle
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Bu kayıt ileride satın alma, fatura ve reçete maliyetiyle
            ilişkilendirilecek.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Hammadde adı"
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
            name="currentStock"
            value={form.currentStock}
            onChange={handleChange}
            placeholder="Mevcut stok"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="minStock"
            value={form.minStock}
            onChange={handleChange}
            placeholder="Minimum stok"
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
            Hammadde Ekle
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
        <div className="border-b border-[#eadfce] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Hammadde Listesi
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Minimum stok altına düşen ürünler kritik olarak işaretlenir.
          </p>
        </div>

        <table className="w-full text-left">
          <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
            <tr>
              <th className="px-6 py-4">Hammadde</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Mevcut</th>
              <th className="px-6 py-4">Minimum</th>
              <th className="px-6 py-4">Tedarikçi</th>
              <th className="px-6 py-4">Durum</th>
              <th className="px-6 py-4 text-right">İşlem</th>
            </tr>
          </thead>

          <tbody>
            {ingredients.map((item) => {
              const status = getStockStatus(item);

              return (
                <tr
                  key={item.id}
                  className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                >
                  <td className="px-6 py-4 font-medium text-[#211914]">
                    {item.name}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {item.category}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#211914]">
                    {item.currentStock} {item.unit}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {item.minStock} {item.unit}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {item.supplier}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button className="text-sm font-medium text-[#9c7439] hover:text-[#211914]">
                      Detay
                    </button>
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