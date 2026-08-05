import { useState } from "react";

const initialPayrolls = [
  {
    id: 1,
    staffName: "Ayşe Yılmaz",
    department: "Servis",
    month: "2026-06",
    baseSalary: 32000,
    overtimePay: 4500,
    bonus: 2500,
    advance: 3000,
    deduction: 1200,
    status: "Ödenecek",
    note: "Haziran servis yoğunluğu primi eklendi.",
  },
  {
    id: 2,
    staffName: "Mehmet Kaya",
    department: "Bar",
    month: "2026-06",
    baseSalary: 35000,
    overtimePay: 5200,
    bonus: 3000,
    advance: 0,
    deduction: 900,
    status: "Ödenecek",
    note: "Bar satış performans primi eklendi.",
  },
  {
    id: 3,
    staffName: "Elif Demir",
    department: "Mutfak",
    month: "2026-06",
    baseSalary: 33000,
    overtimePay: 2800,
    bonus: 0,
    advance: 2500,
    deduction: 750,
    status: "Kontrol Edilecek",
    note: "Geç geliş kayıtları kontrol edilecek.",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function getGrossPay(record) {
  return (
    Number(record.baseSalary) +
    Number(record.overtimePay) +
    Number(record.bonus)
  );
}

function getTotalDeductions(record) {
  return Number(record.advance) + Number(record.deduction);
}

function getNetPay(record) {
  return getGrossPay(record) - getTotalDeductions(record);
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

export default function Payroll() {
  const [payrolls, setPayrolls] = useState(initialPayrolls);

  const [form, setForm] = useState({
    staffName: "",
    department: "",
    month: "",
    baseSalary: "",
    overtimePay: "",
    bonus: "",
    advance: "",
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

    const newPayroll = {
      id: Date.now(),
      staffName: form.staffName,
      department: form.department,
      month: form.month,
      baseSalary: Number(form.baseSalary || 0),
      overtimePay: Number(form.overtimePay || 0),
      bonus: Number(form.bonus || 0),
      advance: Number(form.advance || 0),
      deduction: Number(form.deduction || 0),
      status: form.status,
      note: form.note,
    };

    setPayrolls((prev) => [newPayroll, ...prev]);

    setForm({
      staffName: "",
      department: "",
      month: "",
      baseSalary: "",
      overtimePay: "",
      bonus: "",
      advance: "",
      deduction: "",
      status: "Ödenecek",
      note: "",
    });
  }

  function updateStatus(id, nextStatus) {
    setPayrolls((prev) =>
      prev.map((record) =>
        record.id === id ? { ...record, status: nextStatus } : record
      )
    );
  }

  const totalGrossPay = payrolls.reduce(
    (total, record) => total + getGrossPay(record),
    0
  );

  const totalNetPay = payrolls.reduce(
    (total, record) => total + getNetPay(record),
    0
  );

  const totalAdvances = payrolls.reduce(
    (total, record) => total + Number(record.advance),
    0
  );

  const pendingPayments = payrolls.filter(
    (record) => record.status === "Ödenecek"
  ).length;

  const controlNeeded = payrolls.filter(
    (record) => record.status === "Kontrol Edilecek"
  ).length;

  const departments = [...new Set(payrolls.map((record) => record.department))];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Ekip & Müşteri
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">Bordro</h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Personel maaşı, mesai, prim, avans, kesinti ve net ödeme
              tutarlarını aylık olarak takip et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Bordro Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Brüt Toplam</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {formatCurrency(totalGrossPay)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Net Ödenecek</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {formatCurrency(totalNetPay)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Avans</p>
          <h3 className="mt-3 text-2xl font-semibold text-amber-700">
            {formatCurrency(totalAdvances)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Ödeme Durumu</p>
          <h3 className="mt-3 text-2xl font-semibold text-blue-700">
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
            Yeni Bordro Kaydı Ekle
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Net ödeme; maaş, mesai ve prim toplamından avans ve kesintiler
            düşülerek otomatik hesaplanır.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
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
            name="month"
            value={form.month}
            onChange={handleChange}
            type="month"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
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
            name="baseSalary"
            value={form.baseSalary}
            onChange={handleChange}
            placeholder="Ana maaş"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="overtimePay"
            value={form.overtimePay}
            onChange={handleChange}
            placeholder="Mesai"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="bonus"
            value={form.bonus}
            onChange={handleChange}
            placeholder="Prim"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="advance"
            value={form.advance}
            onChange={handleChange}
            placeholder="Avans"
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

          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Bordro notu"
            className="col-span-3 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Bordro Kaydı Ekle
          </button>
        </div>
      </form>

      <div className="grid grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
          <div className="border-b border-[#eadfce] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#211914]">
              Bordro Listesi
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Brüt ödeme, kesintiler ve net ödeme otomatik hesaplanır.
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
              <tr>
                <th className="px-6 py-4">Personel</th>
                <th className="px-6 py-4">Ay</th>
                <th className="px-6 py-4">Brüt</th>
                <th className="px-6 py-4">Avans</th>
                <th className="px-6 py-4">Kesinti</th>
                <th className="px-6 py-4">Net</th>
                <th className="px-6 py-4 text-right">Durum</th>
              </tr>
            </thead>

            <tbody>
              {payrolls.map((record) => (
                <tr
                  key={record.id}
                  className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#211914]">
                      {record.staffName}
                    </p>
                    <p className="mt-1 text-xs text-[#8a7560]">
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
                    {record.month}
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[#211914]">
                      {formatCurrency(getGrossPay(record))}
                    </p>
                    <p className="mt-1 text-xs text-[#8a7560]">
                      Maaş: {formatCurrency(record.baseSalary)}
                    </p>
                    <p className="mt-1 text-xs text-[#8a7560]">
                      Mesai + Prim:{" "}
                      {formatCurrency(
                        Number(record.overtimePay) + Number(record.bonus)
                      )}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm text-amber-700">
                    {formatCurrency(record.advance)}
                  </td>

                  <td className="px-6 py-4 text-sm text-red-700">
                    {formatCurrency(record.deduction)}
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold text-emerald-700">
                    {formatCurrency(getNetPay(record))}
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
              Departman Bordro Özeti
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Net ödeme tutarının departman bazlı dağılımı.
            </p>

            <div className="mt-6 space-y-4">
              {departments.map((department) => {
                const departmentTotal = payrolls
                  .filter((record) => record.department === department)
                  .reduce((total, record) => total + getNetPay(record), 0);

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
              Bordro Notu
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#7d6b5a]">
              Bu ekran şimdilik operasyonel takip içindir. Resmi bordro,
              sigorta, vergi ve yasal hesaplamalar ileride mali müşavir paketi
              ve yasal parametreler modülüyle ayrıca bağlanacak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}