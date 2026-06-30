import { useState } from "react";

const initialTeam = [
  {
    id: 1,
    name: "Ayşe Yılmaz",
    role: "Servis Sorumlusu",
    department: "Servis",
    shift: "11:00 - 19:00",
    tasksDone: 8,
    tasksTotal: 10,
    performanceScore: 92,
    status: "Aktif",
    note: "Rezervasyon yoğunluğunda güçlü.",
  },
  {
    id: 2,
    name: "Mehmet Kaya",
    role: "Bar Sorumlusu",
    department: "Bar",
    shift: "16:00 - 00:00",
    tasksDone: 6,
    tasksTotal: 8,
    performanceScore: 86,
    status: "Aktif",
    note: "Kokteyl reçeteleri ve bar stok takibi sorumlu.",
  },
  {
    id: 3,
    name: "Elif Demir",
    role: "Mutfak Ekibi",
    department: "Mutfak",
    shift: "10:00 - 18:00",
    tasksDone: 5,
    tasksTotal: 9,
    performanceScore: 74,
    status: "Takip Edilecek",
    note: "Stok sayım girişleri kontrol edilmeli.",
  },
];

function getCompletionRate(member) {
  if (Number(member.tasksTotal) === 0) return 0;

  return (Number(member.tasksDone) / Number(member.tasksTotal)) * 100;
}

function getPerformanceClass(score) {
  if (Number(score) >= 90) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (Number(score) >= 75) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (Number(score) >= 60) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-red-50 text-red-700 border-red-200";
}

function getStatusClass(status) {
  if (status === "Aktif") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "İzinli") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (status === "Takip Edilecek") {
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

  return "bg-gray-50 text-gray-700 border-gray-200";
}

export default function TeamCenter() {
  const [team, setTeam] = useState(initialTeam);

  const [form, setForm] = useState({
    name: "",
    role: "",
    department: "",
    shift: "",
    tasksDone: "",
    tasksTotal: "",
    performanceScore: "",
    status: "Aktif",
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

    const newMember = {
      id: Date.now(),
      name: form.name,
      role: form.role,
      department: form.department,
      shift: form.shift,
      tasksDone: Number(form.tasksDone || 0),
      tasksTotal: Number(form.tasksTotal || 0),
      performanceScore: Number(form.performanceScore || 0),
      status: form.status,
      note: form.note,
    };

    setTeam((prev) => [newMember, ...prev]);

    setForm({
      name: "",
      role: "",
      department: "",
      shift: "",
      tasksDone: "",
      tasksTotal: "",
      performanceScore: "",
      status: "Aktif",
      note: "",
    });
  }

  function updateStatus(id, nextStatus) {
    setTeam((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, status: nextStatus } : member
      )
    );
  }

  const totalMembers = team.length;

  const activeMembers = team.filter((member) => member.status === "Aktif").length;

  const followUpMembers = team.filter(
    (member) => member.status === "Takip Edilecek"
  ).length;

  const averagePerformance =
    team.length === 0
      ? 0
      : team.reduce(
          (total, member) => total + Number(member.performanceScore),
          0
        ) / team.length;

  const totalTasks = team.reduce(
    (total, member) => total + Number(member.tasksTotal),
    0
  );

  const completedTasks = team.reduce(
    (total, member) => total + Number(member.tasksDone),
    0
  );

  const generalCompletionRate =
    totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Ekip & Müşteri
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Ekip Merkezi
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Personel durumunu, vardiya saatlerini, görev tamamlama oranlarını,
              performans notlarını ve takip edilmesi gereken ekip konularını tek
              ekrandan yönet.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Ekip Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Personel</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalMembers}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Aktif Personel</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {activeMembers}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Takip Edilecek</p>
          <h3 className="mt-3 text-2xl font-semibold text-amber-700">
            {followUpMembers}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Ortalama Performans</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            %{averagePerformance.toFixed(1)}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Görev tamamlama: %{generalCompletionRate.toFixed(1)}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Ekip Kaydı Ekle
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Bu kayıt ileride personel, vardiya, bordro ve görev listesi
            modülleriyle ilişkilendirilecek.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Personel adı"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="role"
            value={form.role}
            onChange={handleChange}
            placeholder="Görev / pozisyon"
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
            name="shift"
            value={form.shift}
            onChange={handleChange}
            placeholder="Vardiya örn. 11:00 - 19:00"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="tasksDone"
            value={form.tasksDone}
            onChange={handleChange}
            placeholder="Tamamlanan görev"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="tasksTotal"
            value={form.tasksTotal}
            onChange={handleChange}
            placeholder="Toplam görev"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="performanceScore"
            value={form.performanceScore}
            onChange={handleChange}
            placeholder="Performans puanı"
            type="number"
            max="100"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Aktif">Aktif</option>
            <option value="İzinli">İzinli</option>
            <option value="Takip Edilecek">Takip Edilecek</option>
            <option value="Pasif">Pasif</option>
          </select>

          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Ekip notu"
            className="col-span-4 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Ekip Kaydı Ekle
          </button>
        </div>
      </form>

      <div className="grid grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
          <div className="border-b border-[#eadfce] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#211914]">
              Ekip Listesi
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Görev tamamlama oranı ve performans puanı ekip durumunu hızlıca
              gösterir.
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
              <tr>
                <th className="px-6 py-4">Personel</th>
                <th className="px-6 py-4">Departman</th>
                <th className="px-6 py-4">Vardiya</th>
                <th className="px-6 py-4">Görev</th>
                <th className="px-6 py-4">Performans</th>
                <th className="px-6 py-4 text-right">Durum</th>
              </tr>
            </thead>

            <tbody>
              {team.map((member) => {
                const completionRate = getCompletionRate(member);

                return (
                  <tr
                    key={member.id}
                    className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#211914]">
                        {member.name}
                      </p>
                      <p className="mt-1 text-xs text-[#8a7560]">
                        {member.role}
                      </p>
                      <p className="mt-2 max-w-[300px] text-xs leading-5 text-[#7d6b5a]">
                        {member.note}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getDepartmentClass(
                          member.department
                        )}`}
                      >
                        {member.department}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-[#211914]">
                      {member.shift}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#211914]">
                        {member.tasksDone} / {member.tasksTotal}
                      </p>

                      <div className="mt-2 h-2 w-28 overflow-hidden rounded-full bg-[#f0e6d7]">
                        <div
                          className="h-full rounded-full bg-[#c9a45c]"
                          style={{
                            width: `${Math.min(completionRate, 100)}%`,
                          }}
                        />
                      </div>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        %{completionRate.toFixed(1)}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getPerformanceClass(
                          member.performanceScore
                        )}`}
                      >
                        %{member.performanceScore}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <select
                        value={member.status}
                        onChange={(event) =>
                          updateStatus(member.id, event.target.value)
                        }
                        className={`rounded-xl border px-3 py-2 text-xs outline-none ${getStatusClass(
                          member.status
                        )}`}
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="İzinli">İzinli</option>
                        <option value="Takip Edilecek">Takip Edilecek</option>
                        <option value="Pasif">Pasif</option>
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
              Bugünkü Ekip Özeti
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Operasyon öncesi hızlı kontrol alanı.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-[#fbf8f3] p-4">
                <p className="text-sm text-[#8a7560]">Servis</p>
                <p className="mt-1 text-xl font-semibold text-[#211914]">
                  {team.filter((member) => member.department === "Servis").length} kişi
                </p>
              </div>

              <div className="rounded-2xl bg-[#fbf8f3] p-4">
                <p className="text-sm text-[#8a7560]">Mutfak</p>
                <p className="mt-1 text-xl font-semibold text-[#211914]">
                  {team.filter((member) => member.department === "Mutfak").length} kişi
                </p>
              </div>

              <div className="rounded-2xl bg-[#fbf8f3] p-4">
                <p className="text-sm text-[#8a7560]">Bar</p>
                <p className="mt-1 text-xl font-semibold text-[#211914]">
                  {team.filter((member) => member.department === "Bar").length} kişi
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Yönetici Notu
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#7d6b5a]">
              Takip edilecek personele ait notlar vardiya planı, görev listesi
              ve performans raporlarında tekrar gösterilecek şekilde
              tasarlanacak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}