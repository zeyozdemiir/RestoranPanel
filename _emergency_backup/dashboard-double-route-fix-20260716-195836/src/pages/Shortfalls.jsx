import { useState } from "react";

const initialShortfalls = [
  {
    id: 1,
    itemName: "Mozzarella",
    department: "Mutfak",
    category: "Süt Ürünleri",
    unit: "kg",
    currentStock: 3,
    minStock: 8,
    supplier: "Süt Ürünleri Tedarikçisi",
    requestStatus: "Talep Açılmadı",
  },
  {
    id: 2,
    itemName: "Lime",
    department: "Bar",
    category: "Meyve",
    unit: "kg",
    currentStock: 2,
    minStock: 7,
    supplier: "Sebze Hali",
    requestStatus: "Talep Açıldı",
  },
  {
    id: 3,
    itemName: "Dana Bonfile",
    department: "Mutfak",
    category: "Et",
    unit: "kg",
    currentStock: 4,
    minStock: 10,
    supplier: "Ana Et Tedarikçisi",
    requestStatus: "Sipariş Verildi",
  },
];

function getShortageAmount(item) {
  return Math.max(Number(item.minStock) - Number(item.currentStock), 0);
}

function getRiskStatus(item) {
  const currentStock = Number(item.currentStock);
  const minStock = Number(item.minStock);

  if (currentStock === 0) {
    return {
      label: "Stok Yok",
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }

  if (currentStock <= minStock / 2) {
    return {
      label: "Kritik",
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }

  return {
    label: "Azaldı",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  };
}

function getRequestStatusClass(status) {
  if (status === "Talep Açılmadı") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (status === "Talep Açıldı") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (status === "Sipariş Verildi") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (status === "Tamamlandı") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

export default function Shortfalls() {
  const [shortfalls, setShortfalls] = useState(initialShortfalls);

  const [form, setForm] = useState({
    itemName: "",
    department: "",
    category: "",
    unit: "kg",
    currentStock: "",
    minStock: "",
    supplier: "",
    requestStatus: "Talep Açılmadı",
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

    const newShortfall = {
      id: Date.now(),
      itemName: form.itemName,
      department: form.department,
      category: form.category,
      unit: form.unit,
      currentStock: Number(form.currentStock),
      minStock: Number(form.minStock),
      supplier: form.supplier,
      requestStatus: form.requestStatus,
    };

    setShortfalls((prev) => [newShortfall, ...prev]);

    setForm({
      itemName: "",
      department: "",
      category: "",
      unit: "kg",
      currentStock: "",
      minStock: "",
      supplier: "",
      requestStatus: "Talep Açılmadı",
    });
  }

  function updateRequestStatus(id, nextStatus) {
    setShortfalls((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, requestStatus: nextStatus } : item
      )
    );
  }

  const totalShortfalls = shortfalls.length;

  const criticalCount = shortfalls.filter((item) => {
    const status = getRiskStatus(item);
    return status.label === "Kritik" || status.label === "Stok Yok";
  }).length;

  const notRequestedCount = shortfalls.filter(
    (item) => item.requestStatus === "Talep Açılmadı"
  ).length;

  const orderedCount = shortfalls.filter(
    (item) => item.requestStatus === "Sipariş Verildi"
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
              Stoksuzluk
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Minimum stok seviyesinin altına düşen ürünleri, kritik riskleri ve
              satın alma talebi durumlarını takip et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Stoksuzluk Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Stok Eksiği Olan Ürün</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalShortfalls}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Kritik Ürün</p>
          <h3 className="mt-3 text-2xl font-semibold text-red-700">
            {criticalCount}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Talep Açılmamış</p>
          <h3 className="mt-3 text-2xl font-semibold text-amber-700">
            {notRequestedCount}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Sipariş Verilmiş</p>
          <h3 className="mt-3 text-2xl font-semibold text-blue-700">
            {orderedCount}
          </h3>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Stoksuzluk Kaydı
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Bu kayıt ileride hammadde deposu ve satın alma talebiyle otomatik
            ilişkilendirilecek.
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

          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Departman seç</option>
            <option value="Mutfak">Mutfak</option>
            <option value="Bar">Bar</option>
            <option value="Servis">Servis</option>
            <option value="Operasyon">Operasyon</option>
          </select>

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

          <select
            name="requestStatus"
            value={form.requestStatus}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Talep Açılmadı">Talep Açılmadı</option>
            <option value="Talep Açıldı">Talep Açıldı</option>
            <option value="Sipariş Verildi">Sipariş Verildi</option>
            <option value="Tamamlandı">Tamamlandı</option>
          </select>
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Stoksuzluk Kaydı Ekle
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
        <div className="border-b border-[#eadfce] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Stoksuzluk Listesi
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Eksik miktar minimum stok seviyesine göre otomatik hesaplanır.
          </p>
        </div>

        <table className="w-full text-left">
          <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
            <tr>
              <th className="px-6 py-4">Ürün</th>
              <th className="px-6 py-4">Departman</th>
              <th className="px-6 py-4">Mevcut</th>
              <th className="px-6 py-4">Minimum</th>
              <th className="px-6 py-4">Eksik</th>
              <th className="px-6 py-4">Tedarikçi</th>
              <th className="px-6 py-4">Risk</th>
              <th className="px-6 py-4 text-right">Talep Durumu</th>
            </tr>
          </thead>

          <tbody>
            {shortfalls.map((item) => {
              const risk = getRiskStatus(item);
              const shortageAmount = getShortageAmount(item);

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

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {item.department}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#211914]">
                    {item.currentStock} {item.unit}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {item.minStock} {item.unit}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-red-700">
                    {shortageAmount} {item.unit}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {item.supplier}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${risk.className}`}
                    >
                      {risk.label}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <select
                      value={item.requestStatus}
                      onChange={(event) =>
                        updateRequestStatus(item.id, event.target.value)
                      }
                      className={`rounded-xl border px-3 py-2 text-xs outline-none ${getRequestStatusClass(
                        item.requestStatus
                      )}`}
                    >
                      <option value="Talep Açılmadı">Talep Açılmadı</option>
                      <option value="Talep Açıldı">Talep Açıldı</option>
                      <option value="Sipariş Verildi">Sipariş Verildi</option>
                      <option value="Tamamlandı">Tamamlandı</option>
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