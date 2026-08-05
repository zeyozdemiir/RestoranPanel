import { useState } from "react";

const initialRecords = [
  {
    id: 1,
    itemName: "Şarap Kadehi",
    type: "Kırılma",
    department: "Servis",
    quantity: 6,
    unit: "adet",
    unitCost: 180,
    responsible: "Servis Ekibi",
    date: "2026-06-27",
    note: "Yoğun servis sırasında kırıldı.",
  },
  {
    id: 2,
    itemName: "Lime",
    type: "Zayi",
    department: "Bar",
    quantity: 2,
    unit: "kg",
    unitCost: 120,
    responsible: "Bar",
    date: "2026-06-27",
    note: "Kullanılamayacak duruma geldi.",
  },
  {
    id: 3,
    itemName: "Tabak",
    type: "Kırılma",
    department: "Mutfak",
    quantity: 4,
    unit: "adet",
    unitCost: 220,
    responsible: "Mutfak Ekibi",
    date: "2026-06-26",
    note: "Bulaşık alanında kırıldı.",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function getTypeClass(type) {
  if (type === "Kırılma") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (type === "Zayi") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (type === "Fire") {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

export default function Breakage() {
  const [records, setRecords] = useState(initialRecords);

  const [form, setForm] = useState({
    itemName: "",
    type: "Kırılma",
    department: "",
    quantity: "",
    unit: "adet",
    unitCost: "",
    responsible: "",
    date: "",
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

    const newRecord = {
      id: Date.now(),
      itemName: form.itemName,
      type: form.type,
      department: form.department,
      quantity: Number(form.quantity),
      unit: form.unit,
      unitCost: Number(form.unitCost),
      responsible: form.responsible,
      date: form.date,
      note: form.note,
    };

    setRecords((prev) => [newRecord, ...prev]);

    setForm({
      itemName: "",
      type: "Kırılma",
      department: "",
      quantity: "",
      unit: "adet",
      unitCost: "",
      responsible: "",
      date: "",
      note: "",
    });
  }

  const totalRecords = records.length;

  const totalLossCost = records.reduce(
    (total, record) =>
      total + Number(record.quantity) * Number(record.unitCost),
    0
  );

  const breakageCount = records.filter(
    (record) => record.type === "Kırılma"
  ).length;

  const wasteCount = records.filter(
    (record) => record.type === "Zayi" || record.type === "Fire"
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
              Kırılma & Zayi
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Kırılan ekipmanları, zayi olan ürünleri, fireleri ve kayıp
              maliyetlerini kayıt altına al.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Kayıp Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Kayıt</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalRecords}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Kırılma Kaydı</p>
          <h3 className="mt-3 text-2xl font-semibold text-red-700">
            {breakageCount}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Zayi / Fire Kaydı</p>
          <h3 className="mt-3 text-2xl font-semibold text-amber-700">
            {wasteCount}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Kayıp Maliyeti</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {formatCurrency(totalLossCost)}
          </h3>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Kırılma / Zayi Kaydı
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Bu kayıt ileride stok hareketleri, personel notları ve maliyet
            raporlarıyla ilişkilendirilecek.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="itemName"
            value={form.itemName}
            onChange={handleChange}
            placeholder="Ürün / ekipman adı"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Kırılma">Kırılma</option>
            <option value="Zayi">Zayi</option>
            <option value="Fire">Fire</option>
          </select>

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
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Miktar"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="adet">adet</option>
            <option value="kg">kg</option>
            <option value="gr">gr</option>
            <option value="lt">lt</option>
            <option value="ml">ml</option>
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
            name="responsible"
            value={form.responsible}
            onChange={handleChange}
            placeholder="Sorumlu kişi / ekip"
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

          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Açıklama"
            className="col-span-4 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Kayıt Ekle
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
        <div className="border-b border-[#eadfce] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Kırılma & Zayi Listesi
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Kayıp maliyetleri otomatik hesaplanır ve raporlara yansıtılır.
          </p>
        </div>

        <table className="w-full text-left">
          <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
            <tr>
              <th className="px-6 py-4">Ürün / Ekipman</th>
              <th className="px-6 py-4">Tip</th>
              <th className="px-6 py-4">Departman</th>
              <th className="px-6 py-4">Miktar</th>
              <th className="px-6 py-4">Birim Maliyet</th>
              <th className="px-6 py-4">Toplam Kayıp</th>
              <th className="px-6 py-4">Sorumlu</th>
              <th className="px-6 py-4 text-right">Tarih</th>
            </tr>
          </thead>

          <tbody>
            {records.map((record) => {
              const totalCost =
                Number(record.quantity) * Number(record.unitCost);

              return (
                <tr
                  key={record.id}
                  className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#211914]">
                      {record.itemName}
                    </p>
                    <p className="mt-1 text-xs text-[#8a7560]">
                      {record.note}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${getTypeClass(
                        record.type
                      )}`}
                    >
                      {record.type}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {record.department}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#211914]">
                    {record.quantity} {record.unit}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {formatCurrency(record.unitCost)}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-red-700">
                    {formatCurrency(totalCost)}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {record.responsible}
                  </td>

                  <td className="px-6 py-4 text-right text-sm text-[#7d6b5a]">
                    {record.date}
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