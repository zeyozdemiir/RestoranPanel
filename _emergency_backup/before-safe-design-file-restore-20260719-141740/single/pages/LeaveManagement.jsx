import { useState } from "react";

const initialLeaves = [
  {
    id: 1,
    staffName: "Ayşe Yılmaz",
    department: "Servis",
    leaveType: "Yıllık İzin",
    startDate: "2026-07-01",
    endDate: "2026-07-05",
    totalDays: 5,
    remainingLeave: 9,
    status: "Onaylandı",
    note: "Temmuz başı planlı izin.",
  },
  {
    id: 2,
    staffName: "Mehmet Kaya",
    department: "Bar",
    leaveType: "Haftalık İzin",
    startDate: "2026-06-30",
    endDate: "2026-06-30",
    totalDays: 1,
    remainingLeave: 14,
    status: "Planlandı",
    note: "Bar vardiyası yeniden düzenlenecek.",
  },
  {
    id: 3,
    staffName: "Elif Demir",
    department: "Mutfak",
    leaveType: "Mazeret İzni",
    startDate: "2026-06-28",
    endDate: "2026-06-28",
    totalDays: 1,
    remainingLeave: 11,
    status: "Kontrol Edilecek",
    note: "Mazeret detayı yönetici tarafından kontrol edilecek.",
  },
];

function calculateDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) return 0;

  const difference = end.getTime() - start.getTime();
  const dayMs = 1000 * 60 * 60 * 24;

  return Math.floor(difference / dayMs) + 1;
}

function getStatusClass(status) {
  if (status === "Onaylandı") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "Planlandı") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (status === "Kontrol Edilecek") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (status === "Reddedildi") {
    return "bg-red-50 text-red-700 border-red-200";
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

function getLeaveTypeClass(type) {
  if (type === "Yıllık İzin") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (type === "Haftalık İzin") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (type === "Mazeret İzni") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (type === "Raporlu") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState(initialLeaves);

  const [form, setForm] = useState({
    staffName: "",
    department: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    remainingLeave: "",
    status: "Planlandı",
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

    const totalDays = calculateDays(form.startDate, form.endDate);

    const newLeave = {
      id: Date.now(),
      staffName: form.staffName,
      department: form.department,
      leaveType: form.leaveType,
      startDate: form.startDate,
      endDate: form.endDate,
      totalDays,
      remainingLeave: Number(form.remainingLeave || 0),
      status: form.status,
      note: form.note,
    };

    setLeaves((prev) => [newLeave, ...prev]);

    setForm({
      staffName: "",
      department: "",
      leaveType: "",
      startDate: "",
      endDate: "",
      remainingLeave: "",
      status: "Planlandı",
      note: "",
    });
  }

  function updateStatus(id, nextStatus) {
    setLeaves((prev) =>
      prev.map((leave) =>
        leave.id === id ? { ...leave, status: nextStatus } : leave
      )
    );
  }

  const totalRequests = leaves.length;

  const approvedRequests = leaves.filter(
    (leave) => leave.status === "Onaylandı"
  ).length;

  const plannedRequests = leaves.filter(
    (leave) => leave.status === "Planlandı"
  ).length;

  const controlNeeded = leaves.filter(
    (leave) => leave.status === "Kontrol Edilecek"
  ).length;

  const totalLeaveDays = leaves.reduce(
    (total, leave) => total + Number(leave.totalDays),
    0
  );

  const annualLeaveDays = leaves
    .filter((leave) => leave.leaveType === "Yıllık İzin")
    .reduce((total, leave) => total + Number(leave.totalDays), 0);

  const departments = [...new Set(leaves.map((leave) => leave.department))];

  const selectedTotalDays = calculateDays(form.startDate, form.endDate);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Ekip & Müşteri
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Yıllık İzin
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Personel izin taleplerini, izin türlerini, tarih aralıklarını,
              toplam gün sayısını ve onay durumunu tek ekrandan takip et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            İzin Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Talep</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalRequests}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Onaylanan</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {approvedRequests}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Planlı / Kontrol</p>
          <h3 className="mt-3 text-2xl font-semibold text-amber-700">
            {plannedRequests + controlNeeded}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Kontrol edilecek: {controlNeeded}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam İzin Günü</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalLeaveDays}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Yıllık izin günü: {annualLeaveDays}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni İzin Talebi Ekle
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Başlangıç ve bitiş tarihine göre izin gün sayısı otomatik
            hesaplanır.
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

          <select
            name="leaveType"
            value={form.leaveType}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">İzin türü seç</option>
            <option value="Yıllık İzin">Yıllık İzin</option>
            <option value="Haftalık İzin">Haftalık İzin</option>
            <option value="Mazeret İzni">Mazeret İzni</option>
            <option value="Raporlu">Raporlu</option>
            <option value="Ücretsiz İzin">Ücretsiz İzin</option>
          </select>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Planlandı">Planlandı</option>
            <option value="Onaylandı">Onaylandı</option>
            <option value="Kontrol Edilecek">Kontrol Edilecek</option>
            <option value="Reddedildi">Reddedildi</option>
          </select>

          <input
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            type="date"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            type="date"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="remainingLeave"
            value={form.remainingLeave}
            onChange={handleChange}
            placeholder="Kalan yıllık izin"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <div className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3">
            <p className="text-xs text-[#8a7560]">Hesaplanan gün</p>
            <p className="mt-1 text-sm font-semibold text-[#211914]">
              {selectedTotalDays} gün
            </p>
          </div>

          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="İzin notu"
            className="col-span-4 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            İzin Talebi Ekle
          </button>
        </div>
      </form>

      <div className="grid grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
          <div className="border-b border-[#eadfce] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#211914]">
              İzin Listesi
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Onay durumuna göre vardiya ve bordro modülleri ileride otomatik
              etkilenecek.
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
              <tr>
                <th className="px-6 py-4">Personel</th>
                <th className="px-6 py-4">İzin Türü</th>
                <th className="px-6 py-4">Tarih</th>
                <th className="px-6 py-4">Gün</th>
                <th className="px-6 py-4">Kalan İzin</th>
                <th className="px-6 py-4 text-right">Durum</th>
              </tr>
            </thead>

            <tbody>
              {leaves.map((leave) => (
                <tr
                  key={leave.id}
                  className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#211914]">
                      {leave.staffName}
                    </p>

                    <p className="mt-1 text-xs text-[#8a7560]">{leave.note}</p>

                    <span
                      className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getDepartmentClass(
                        leave.department
                      )}`}
                    >
                      {leave.department}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${getLeaveTypeClass(
                        leave.leaveType
                      )}`}
                    >
                      {leave.leaveType}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    <p>{leave.startDate}</p>
                    <p>{leave.endDate}</p>
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold text-[#211914]">
                    {leave.totalDays} gün
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[#211914]">
                      {leave.remainingLeave} gün
                    </p>

                    <p className="mt-1 text-xs text-[#8a7560]">
                      Bu talep sonrası:{" "}
                      {Math.max(
                        Number(leave.remainingLeave) - Number(leave.totalDays),
                        0
                      )}{" "}
                      gün
                    </p>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <select
                      value={leave.status}
                      onChange={(event) =>
                        updateStatus(leave.id, event.target.value)
                      }
                      className={`rounded-xl border px-3 py-2 text-xs outline-none ${getStatusClass(
                        leave.status
                      )}`}
                    >
                      <option value="Planlandı">Planlandı</option>
                      <option value="Onaylandı">Onaylandı</option>
                      <option value="Kontrol Edilecek">Kontrol Edilecek</option>
                      <option value="Reddedildi">Reddedildi</option>
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
              Departman İzin Özeti
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              İzin taleplerinin departmanlara göre dağılımı.
            </p>

            <div className="mt-6 space-y-4">
              {departments.map((department) => {
                const departmentLeaves = leaves.filter(
                  (leave) => leave.department === department
                );

                const departmentDays = departmentLeaves.reduce(
                  (total, leave) => total + Number(leave.totalDays),
                  0
                );

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
                        {departmentDays} gün
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              İzin Notu
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#7d6b5a]">
              Yıllık izin, haftalık izin, mazeret ve rapor kayıtları ileride
              vardiya, bordro ve ekip performans ekranlarına otomatik
              bağlanacak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}