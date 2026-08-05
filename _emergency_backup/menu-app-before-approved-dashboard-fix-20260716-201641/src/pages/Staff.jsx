import { useState } from "react";

const initialShifts = [
  {
    id: 1,
    staffName: "Ayşe Yılmaz",
    department: "Servis",
    role: "Servis Sorumlusu",
    date: "2026-06-27",
    shiftStart: "11:00",
    shiftEnd: "19:00",
    hourlyRate: 180,
    attendance: "Geldi",
    note: "Salon rezervasyon takibi sorumlu.",
  },
  {
    id: 2,
    staffName: "Mehmet Kaya",
    department: "Bar",
    role: "Bar Sorumlusu",
    date: "2026-06-27",
    shiftStart: "16:00",
    shiftEnd: "00:00",
    hourlyRate: 200,
    attendance: "Geldi",
    note: "Kokteyl hazırlık ve bar stok kontrolü.",
  },
  {
    id: 3,
    staffName: "Elif Demir",
    department: "Mutfak",
    role: "Mutfak Ekibi",
    date: "2026-06-27",
    shiftStart: "10:00",
    shiftEnd: "18:00",
    hourlyRate: 190,
    attendance: "Geç Geldi",
    note: "Hazırlık ve stok sayım desteği.",
  },
  {
    id: 4,
    staffName: "Can Arslan",
    department: "Servis",
    role: "Garson",
    date: "2026-06-27",
    shiftStart: "17:00",
    shiftEnd: "01:00",
    hourlyRate: 160,
    attendance: "Planlandı",
    note: "Akşam servisi.",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function getShiftHours(shift) {
  if (!shift.shiftStart || !shift.shiftEnd) return 0;

  const [startHour, startMinute] = shift.shiftStart.split(":").map(Number);
  const [endHour, endMinute] = shift.shiftEnd.split(":").map(Number);

  const start = startHour + startMinute / 60;
  let end = endHour + endMinute / 60;

  if (end <= start) {
    end += 24;
  }

  return end - start;
}

function getShiftCost(shift) {
  return getShiftHours(shift) * Number(shift.hourlyRate);
}

function getAttendanceClass(attendance) {
  if (attendance === "Geldi") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (attendance === "Geç Geldi") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (attendance === "Gelmedi") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (attendance === "İzinli") {
    return "bg-blue-50 text-blue-700 border-blue-200";
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

export default function Staff() {
  const [shifts, setShifts] = useState(initialShifts);

  const [form, setForm] = useState({
    staffName: "",
    department: "",
    role: "",
    date: "",
    shiftStart: "",
    shiftEnd: "",
    hourlyRate: "",
    attendance: "Planlandı",
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

    const newShift = {
      id: Date.now(),
      staffName: form.staffName,
      department: form.department,
      role: form.role,
      date: form.date,
      shiftStart: form.shiftStart,
      shiftEnd: form.shiftEnd,
      hourlyRate: Number(form.hourlyRate || 0),
      attendance: form.attendance,
      note: form.note,
    };

    setShifts((prev) => [newShift, ...prev]);

    setForm({
      staffName: "",
      department: "",
      role: "",
      date: "",
      shiftStart: "",
      shiftEnd: "",
      hourlyRate: "",
      attendance: "Planlandı",
      note: "",
    });
  }

  function updateAttendance(id, nextAttendance) {
    setShifts((prev) =>
      prev.map((shift) =>
        shift.id === id ? { ...shift, attendance: nextAttendance } : shift
      )
    );
  }

  const totalShifts = shifts.length;

  const presentCount = shifts.filter(
    (shift) => shift.attendance === "Geldi"
  ).length;

  const lateCount = shifts.filter(
    (shift) => shift.attendance === "Geç Geldi"
  ).length;

  const absentCount = shifts.filter(
    (shift) => shift.attendance === "Gelmedi"
  ).length;

  const plannedCount = shifts.filter(
    (shift) => shift.attendance === "Planlandı"
  ).length;

  const totalHours = shifts.reduce(
    (total, shift) => total + getShiftHours(shift),
    0
  );

  const totalLaborCost = shifts.reduce(
    (total, shift) => total + getShiftCost(shift),
    0
  );

  const departments = [...new Set(shifts.map((shift) => shift.department))];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Ekip & Müşteri
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Personel & Vardiya
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Personel vardiyalarını, işe geliş durumunu, günlük çalışma
              saatlerini ve tahmini personel maliyetini takip et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Vardiya Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Vardiya</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalShifts}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Departman: {departments.length}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Gelen Personel</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {presentCount}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Geç gelen: {lateCount}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Eksik / Planlı</p>
          <h3 className="mt-3 text-2xl font-semibold text-amber-700">
            {absentCount + plannedCount}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Gelmedi: {absentCount} / Planlandı: {plannedCount}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Tahmini Maliyet</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {formatCurrency(totalLaborCost)}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Toplam saat: {totalHours.toFixed(1)}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Vardiya Ekle
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Bu kayıt ileride bordro, yıllık izin, görev listesi ve performans
            modülleriyle ilişkilendirilecek.
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
            name="role"
            value={form.role}
            onChange={handleChange}
            placeholder="Pozisyon"
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
            name="shiftStart"
            value={form.shiftStart}
            onChange={handleChange}
            type="time"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="shiftEnd"
            value={form.shiftEnd}
            onChange={handleChange}
            type="time"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="hourlyRate"
            value={form.hourlyRate}
            onChange={handleChange}
            placeholder="Saatlik maliyet"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <select
            name="attendance"
            value={form.attendance}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Planlandı">Planlandı</option>
            <option value="Geldi">Geldi</option>
            <option value="Geç Geldi">Geç Geldi</option>
            <option value="Gelmedi">Gelmedi</option>
            <option value="İzinli">İzinli</option>
          </select>

          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Vardiya notu"
            className="col-span-4 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Vardiya Ekle
          </button>
        </div>
      </form>

      <div className="grid grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
          <div className="border-b border-[#eadfce] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#211914]">
              Vardiya Listesi
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Vardiya süresi ve tahmini maliyet otomatik hesaplanır.
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
              <tr>
                <th className="px-6 py-4">Personel</th>
                <th className="px-6 py-4">Departman</th>
                <th className="px-6 py-4">Tarih</th>
                <th className="px-6 py-4">Vardiya</th>
                <th className="px-6 py-4">Saat</th>
                <th className="px-6 py-4">Maliyet</th>
                <th className="px-6 py-4 text-right">Durum</th>
              </tr>
            </thead>

            <tbody>
              {shifts.map((shift) => {
                const hours = getShiftHours(shift);
                const cost = getShiftCost(shift);

                return (
                  <tr
                    key={shift.id}
                    className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#211914]">
                        {shift.staffName}
                      </p>
                      <p className="mt-1 text-xs text-[#8a7560]">
                        {shift.role}
                      </p>
                      <p className="mt-2 max-w-[280px] text-xs leading-5 text-[#7d6b5a]">
                        {shift.note}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getDepartmentClass(
                          shift.department
                        )}`}
                      >
                        {shift.department}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                      {shift.date}
                    </td>

                    <td className="px-6 py-4 text-sm text-[#211914]">
                      {shift.shiftStart} - {shift.shiftEnd}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-[#211914]">
                      {hours.toFixed(1)} saat
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-[#211914]">
                      {formatCurrency(cost)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <select
                        value={shift.attendance}
                        onChange={(event) =>
                          updateAttendance(shift.id, event.target.value)
                        }
                        className={`rounded-xl border px-3 py-2 text-xs outline-none ${getAttendanceClass(
                          shift.attendance
                        )}`}
                      >
                        <option value="Planlandı">Planlandı</option>
                        <option value="Geldi">Geldi</option>
                        <option value="Geç Geldi">Geç Geldi</option>
                        <option value="Gelmedi">Gelmedi</option>
                        <option value="İzinli">İzinli</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Departman Dağılımı
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Günlük vardiyada departman bazlı personel sayısı.
            </p>

            <div className="mt-6 space-y-4">
              {departments.map((department) => {
                const departmentCount = shifts.filter(
                  (shift) => shift.department === department
                ).length;

                return (
                  <div
                    key={department}
                    className="rounded-2xl bg-[#fbf8f3] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getDepartmentClass(
                          department
                        )}`}
                      >
                        {department}
                      </span>

                      <span className="text-lg font-semibold text-[#211914]">
                        {departmentCount}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Operasyon Notu
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#7d6b5a]">
              Geç gelen, gelmeyen veya izinli personel kayıtları ileride bordro
              ve performans raporlarında otomatik kullanılacak şekilde
              bağlanacak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}