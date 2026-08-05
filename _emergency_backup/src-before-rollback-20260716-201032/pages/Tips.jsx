import { useState } from "react";

const initialTips = [
  {
    id: 1,
    date: "2026-06-27",
    staffName: "Ayşe Yılmaz",
    department: "Servis",
    role: "Servis Sorumlusu",
    totalTipPool: 18500,
    shareRate: 18,
    extraBonus: 750,
    deduction: 0,
    status: "Ödenecek",
    note: "Yoğun rezervasyon akşamı servis liderliği.",
  },
  {
    id: 2,
    date: "2026-06-27",
    staffName: "Mehmet Kaya",
    department: "Bar",
    role: "Bar Sorumlusu",
    totalTipPool: 18500,
    shareRate: 14,
    extraBonus: 500,
    deduction: 0,
    status: "Ödenecek",
    note: "Kokteyl satış katkısı.",
  },
  {
    id: 3,
    date: "2026-06-27",
    staffName: "Elif Demir",
    department: "Mutfak",
    role: "Mutfak Ekibi",
    totalTipPool: 18500,
    shareRate: 10,
    extraBonus: 0,
    deduction: 250,
    status: "Kontrol Edilecek",
    note: "Dağıtım oranı yönetici kontrolünde.",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function getBaseTip(record) {
  return (Number(record.totalTipPool) * Number(record.shareRate)) / 100;
}

function getNetTip(record) {
  return getBaseTip(record) + Number(record.extraBonus) - Number(record.deduction);
}

function getStatusClass(status) {
  if (status === "Ödendi") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "Ödenecek") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (status === "Kontrol Edilecek") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

function getDepartmentClass(department) {
  if (department === "Servis") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (department === "Mutfak") {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }

  if (department === "Bar") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  if (department === "Yönetim") {
    return "bg-[#fff7e7] text-[#9c7439] border-[#c9a45c]/30";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

export default function Tips() {
  const [tips, setTips] = useState(initialTips);

  const [form, setForm] = useState({
    date: "",
    staffName: "",
    department: "",
    role: "",
    totalTipPool: "",
    shareRate: "",
    extraBonus: "",
    deduction: "",
    status: "Ödenecek",
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

    const newTip = {
      id: Date.now(),
      date: form.date,
      staffName: form.staffName,
      department: form.department,
      role: form.role,
      totalTipPool: Number(form.totalTipPool || 0),
      shareRate: Number(form.shareRate || 0),
      extraBonus: Number(form.extraBonus || 0),
      deduction: Number(form.deduction || 0),
      status: form.status,
      note: form.note,
    };

    setTips((prev) => [newTip, ...prev]);

    setForm({
      date: "",
      staffName: "",
      department: "",
      role: "",
      totalTipPool: "",
      shareRate: "",
      extraBonus: "",
      deduction: "",
      status: "Ödenecek",
      note: "",
    });
  }

  function updateStatus(id, nextStatus) {
    setTips((prev) =>
      prev.map((record) =>
        record.id === id ? { ...record, status: nextStatus } : record
      )
    );
  }

  const totalTipPool = tips.reduce(
    (highest, record) => Math.max(highest, Number(record.totalTipPool)),
    0
  );

  const totalDistributed = tips.reduce(
    (total, record) => total + getNetTip(record),
    0
  );

  const totalShareRate = tips.reduce(
    (total, record) => total + Number(record.shareRate),
    0
  );

  const pendingPayments = tips.filter(
    (record) => record.status === "Ödenecek"
  ).length;

  const controlNeeded = tips.filter(
    (record) => record.status === "Kontrol Edilecek"
  ).length;

  const departments = [...new Set(tips.map((record) => record.department))];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Ekip & Müşteri
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Bahşiş Yönetimi
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Günlük bahşiş havuzunu, personel pay oranlarını, ek primleri,
              kesintileri ve net ödeme durumunu takip et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Bahşiş Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Günlük Bahşiş Havuzu</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {formatCurrency(totalTipPool)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Dağıtılan Net Tutar</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {formatCurrency(totalDistributed)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Pay Oranı</p>
          <h3 className="mt-3 text-2xl font-semibold text-blue-700">
            %{totalShareRate}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Ödeme Durumu</p>
          <h3 className="mt-3 text-2xl font-semibold text-amber-700">
            {pendingPayments}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Kontrol edilecek: {controlNeeded}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Bahşiş Kaydı Ekle
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Net bahşiş; havuz payı, ek prim ve kesintiye göre otomatik
            hesaplanır.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="date"
            value={form.date}
            onChange={handleChange}
            type="date"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="staffName"
            value={form.staffName}
            onChange={handleChange}
            placeholder="Personel adı"
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
            <option value="Servis">Servis</option>
            <option value="Mutfak">Mutfak</option>
            <option value="Bar">Bar</option>
            <option value="Operasyon">Operasyon</option>
            <option value="Yönetim">Yönetim</option>
          </select>

          <input
            name="role"
            value={form.role}
            onChange={handleChange}
            placeholder="Pozisyon"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="totalTipPool"
            value={form.totalTipPool}
            onChange={handleChange}
            placeholder="Bahşiş havuzu"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="shareRate"
            value={form.shareRate}
            onChange={handleChange}
            placeholder="Pay oranı %"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="extraBonus"
            value={form.extraBonus}
            onChange={handleChange}
            placeholder="Ek prim"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="deduction"
            value={form.deduction}
            onChange={handleChange}
            placeholder="Kesinti"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Ödenecek">Ödenecek</option>
            <option value="Ödendi">Ödendi</option>
            <option value="Kontrol Edilecek">Kontrol Edilecek</option>
          </select>

          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Bahşiş notu"
            className="col-span-3 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Bahşiş Kaydı Ekle
          </button>
        </div>
      </form>

      <div className="grid grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
          <div className="border-b border-[#eadfce] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#211914]">
              Bahşiş Dağıtım Listesi
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Personel bazlı havuz payı, ek prim, kesinti ve net tutar otomatik
              hesaplanır.
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
              <tr>
                <th className="px-6 py-4">Personel</th>
                <th className="px-6 py-4">Tarih</th>
                <th className="px-6 py-4">Havuz</th>
                <th className="px-6 py-4">Pay</th>
                <th className="px-6 py-4">Ek / Kesinti</th>
                <th className="px-6 py-4">Net</th>
                <th className="px-6 py-4 text-right">Durum</th>
              </tr>
            </thead>

            <tbody>
              {tips.map((record) => (
                <tr
                  key={record.id}
                  className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#211914]">
                      {record.staffName}
                    </p>
                    <p className="mt-1 text-xs text-[#8a7560]">
                      {record.role}
                    </p>
                    <p className="mt-2 max-w-[280px] text-xs leading-5 text-[#7d6b5a]">
                      {record.note}
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getDepartmentClass(
                        record.department
                      )}`}
                    >
                      {record.department}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {record.date}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-[#211914]">
                    {formatCurrency(record.totalTipPool)}
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[#211914]">
                      %{record.shareRate}
                    </p>
                    <p className="mt-1 text-xs text-[#8a7560]">
                      {formatCurrency(getBaseTip(record))}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm text-emerald-700">
                      + {formatCurrency(record.extraBonus)}
                    </p>
                    <p className="mt-1 text-sm text-red-700">
                      - {formatCurrency(record.deduction)}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold text-emerald-700">
                    {formatCurrency(getNetTip(record))}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <select
                      value={record.status}
                      onChange={(event) =>
                        updateStatus(record.id, event.target.value)
                      }
                      className={`rounded-xl border px-3 py-2 text-xs outline-none ${getStatusClass(
                        record.status
                      )}`}
                    >
                      <option value="Ödenecek">Ödenecek</option>
                      <option value="Ödendi">Ödendi</option>
                      <option value="Kontrol Edilecek">Kontrol Edilecek</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Departman Dağıtımı
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Net bahşişin departman bazlı dağılımı.
            </p>

            <div className="mt-6 space-y-4">
              {departments.map((department) => {
                const departmentTotal = tips
                  .filter((record) => record.department === department)
                  .reduce((total, record) => total + getNetTip(record), 0);

                return (
                  <div
                    key={department}
                    className="rounded-2xl bg-[#fbf8f3] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getDepartmentClass(
                          department
                        )}`}
                      >
                        {department}
                      </span>

                      <span className="text-sm font-semibold text-[#211914]">
                        {formatCurrency(departmentTotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Dağıtım Notu
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#7d6b5a]">
              Bahşiş dağıtımı şimdilik manuel oranla hesaplanır. İleride
              vardiya saati, görev, departman ve performans puanına göre
              otomatik dağıtım kuralı eklenebilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}