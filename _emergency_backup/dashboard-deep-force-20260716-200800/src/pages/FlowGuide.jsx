import { useState } from "react";

const initialFlows = [
  {
    id: 1,
    flowName: "Pazar Brunch Operasyon Akışı",
    department: "Operasyon",
    trigger: "Pazar brunch öncesi",
    owner: "Operasyon",
    priority: "Yüksek",
    status: "Aktif",
    completion: 78,
    relatedModule: "Etkinlik Takvimi",
    steps:
      "Rezervasyon listesi kontrol edilir. Masa planı hazırlanır. Açık büfe kurulumu yapılır. Kahvaltı pizzası ve sıcak ürün hazırlığı kontrol edilir.",
    riskNote:
      "Kapasite doluluğu ve sıcak servis akışı yakından takip edilmeli.",
  },
  {
    id: 2,
    flowName: "Kritik Stok Satın Alma Akışı",
    department: "Mutfak",
    trigger: "Stok kritik seviyeye düşünce",
    owner: "Mutfak",
    priority: "Yüksek",
    status: "Aksiyon Gerekli",
    completion: 45,
    relatedModule: "Satın Alma Talepleri",
    steps:
      "Eksik ürün tespit edilir. Tedarikçi fiyatı kontrol edilir. Satın alma talebi oluşturulur. Teslimat sonrası stok girişi yapılır.",
    riskNote:
      "Geç aksiyon alınırsa ürün satış dışı kalabilir.",
  },
  {
    id: 3,
    flowName: "Müşteri Şikayet Çözüm Akışı",
    department: "Müşteri",
    trigger: "Olumsuz yorum geldiğinde",
    owner: "Operasyon",
    priority: "Orta",
    status: "Takipte",
    completion: 62,
    relatedModule: "Geri Bildirim",
    steps:
      "Yorum kaydedilir. Şikayet kategorisi belirlenir. Sorumlu ekip atanır. Müşteriye dönüş yapılır. Sonuç kapatılır.",
    riskNote:
      "Yanıtsız kalan yorumlar marka algısını olumsuz etkileyebilir.",
  },
];

function getStatusClass(status) {
  if (status === "Tamamlandı") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "Aktif") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (status === "Takipte") {
    return "bg-[#fff7e7] text-[#9c7439] border-[#c9a45c]/30";
  }

  if (status === "Aksiyon Gerekli") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (status === "Pasif") {
    return "bg-gray-50 text-gray-700 border-gray-200";
  }

  return "bg-red-50 text-red-700 border-red-200";
}

function getDepartmentClass(department) {
  if (department === "Operasyon") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (department === "Mutfak") {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }

  if (department === "Bar") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  if (department === "Müşteri") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (department === "Finans") {
    return "bg-[#fff7e7] text-[#9c7439] border-[#c9a45c]/30";
  }

  if (department === "Ekip") {
    return "bg-indigo-50 text-indigo-700 border-indigo-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

function getPriorityClass(priority) {
  if (priority === "Yüksek") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (priority === "Orta") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

function getProgressClass(completion) {
  if (Number(completion) >= 90) {
    return "bg-emerald-500";
  }

  if (Number(completion) >= 65) {
    return "bg-blue-500";
  }

  if (Number(completion) >= 40) {
    return "bg-amber-500";
  }

  return "bg-red-500";
}

export default function FlowGuide() {
  const [flows, setFlows] = useState(initialFlows);

  const [form, setForm] = useState({
    flowName: "",
    department: "",
    trigger: "",
    owner: "",
    priority: "Orta",
    status: "Aktif",
    completion: "",
    relatedModule: "",
    steps: "",
    riskNote: "",
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

    const newFlow = {
      id: Date.now(),
      flowName: form.flowName,
      department: form.department,
      trigger: form.trigger,
      owner: form.owner,
      priority: form.priority,
      status: form.status,
      completion: Number(form.completion || 0),
      relatedModule: form.relatedModule,
      steps: form.steps,
      riskNote: form.riskNote,
    };

    setFlows((prev) => [newFlow, ...prev]);

    setForm({
      flowName: "",
      department: "",
      trigger: "",
      owner: "",
      priority: "Orta",
      status: "Aktif",
      completion: "",
      relatedModule: "",
      steps: "",
      riskNote: "",
    });
  }

  function updateStatus(id, nextStatus) {
    setFlows((prev) =>
      prev.map((flow) =>
        flow.id === id ? { ...flow, status: nextStatus } : flow
      )
    );
  }

  function updateCompletion(id, nextCompletion) {
    setFlows((prev) =>
      prev.map((flow) =>
        flow.id === id
          ? { ...flow, completion: Number(nextCompletion) }
          : flow
      )
    );
  }

  const totalFlows = flows.length;

  const activeFlows = flows.filter(
    (flow) => flow.status === "Aktif" || flow.status === "Takipte"
  ).length;

  const actionNeeded = flows.filter(
    (flow) => flow.status === "Aksiyon Gerekli"
  ).length;

  const highPriority = flows.filter(
    (flow) => flow.priority === "Yüksek"
  ).length;

  const averageCompletion =
    flows.length === 0
      ? 0
      : flows.reduce((total, flow) => total + Number(flow.completion), 0) /
        flows.length;

  const departments = [...new Set(flows.map((flow) => flow.department))];

  const criticalFlow = [...flows].sort((a, b) => {
    const priorityWeight = { Yüksek: 3, Orta: 2, Düşük: 1 };
    const statusWeight = {
      "Aksiyon Gerekli": 3,
      Aktif: 2,
      Takipte: 2,
      Tamamlandı: 1,
      Pasif: 1,
    };

    return (
      priorityWeight[b.priority] +
      statusWeight[b.status] -
      (priorityWeight[a.priority] + statusWeight[a.status])
    );
  })[0];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Strateji & Rapor
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Akış Rehberi
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Brunch, satın alma, stok, müşteri şikayeti, etkinlik hazırlığı ve
              finans süreçlerini adım adım takip et. Hangi işin hangi sırayla
              yapılacağını netleştir.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Akış Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Akış</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalFlows}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Aktif / takipte: {activeFlows}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Aksiyon Gerekli</p>
          <h3 className="mt-3 text-2xl font-semibold text-amber-700">
            {actionNeeded}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Yüksek Öncelik</p>
          <h3 className="mt-3 text-2xl font-semibold text-red-700">
            {highPriority}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Ortalama Tamamlanma</p>
          <h3 className="mt-3 text-2xl font-semibold text-blue-700">
            %{averageCompletion.toFixed(1)}
          </h3>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Akış Ekle
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Sürecin ne zaman başladığını, sorumlusunu, adımlarını ve risk notunu
            buradan kaydet.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="flowName"
            value={form.flowName}
            onChange={handleChange}
            placeholder="Akış adı"
            className="col-span-2 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
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
            <option value="Operasyon">Operasyon</option>
            <option value="Mutfak">Mutfak</option>
            <option value="Bar">Bar</option>
            <option value="Müşteri">Müşteri</option>
            <option value="Finans">Finans</option>
            <option value="Ekip">Ekip</option>
          </select>

          <input
            name="owner"
            value={form.owner}
            onChange={handleChange}
            placeholder="Sorumlu kişi / ekip"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="trigger"
            value={form.trigger}
            onChange={handleChange}
            placeholder="Bu akış ne zaman başlar?"
            className="col-span-2 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="relatedModule"
            value={form.relatedModule}
            onChange={handleChange}
            placeholder="Bağlı modül"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="completion"
            value={form.completion}
            onChange={handleChange}
            placeholder="Tamamlanma %"
            type="number"
            min="0"
            max="100"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Düşük">Düşük</option>
            <option value="Orta">Orta</option>
            <option value="Yüksek">Yüksek</option>
          </select>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Aktif">Aktif</option>
            <option value="Takipte">Takipte</option>
            <option value="Aksiyon Gerekli">Aksiyon Gerekli</option>
            <option value="Tamamlandı">Tamamlandı</option>
            <option value="Pasif">Pasif</option>
          </select>

          <textarea
            name="steps"
            value={form.steps}
            onChange={handleChange}
            placeholder="Akış adımları"
            rows="3"
            className="col-span-2 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <textarea
            name="riskNote"
            value={form.riskNote}
            onChange={handleChange}
            placeholder="Risk notu"
            rows="3"
            className="col-span-2 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Akış Ekle
          </button>
        </div>
      </form>

      <div className="grid grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
          <div className="border-b border-[#eadfce] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#211914]">
              Akış Listesi
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Süreçlerin adımları, bağlı modülü, tamamlanma oranı ve risk notu
              buradan takip edilir.
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
              <tr>
                <th className="px-6 py-4">Akış</th>
                <th className="px-6 py-4">Departman</th>
                <th className="px-6 py-4">Başlangıç</th>
                <th className="px-6 py-4">Öncelik</th>
                <th className="px-6 py-4">Tamamlanma</th>
                <th className="px-6 py-4 text-right">Durum</th>
              </tr>
            </thead>

            <tbody>
              {flows.map((flow) => (
                <tr
                  key={flow.id}
                  className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#211914]">
                      {flow.flowName}
                    </p>

                    <p className="mt-1 text-xs text-[#8a7560]">
                      Sorumlu: {flow.owner} / Bağlı modül:{" "}
                      {flow.relatedModule || "Belirtilmedi"}
                    </p>

                    <p className="mt-2 max-w-[380px] text-xs leading-5 text-[#7d6b5a]">
                      {flow.steps}
                    </p>

                    {flow.riskNote && (
                      <p className="mt-2 max-w-[380px] text-xs font-medium leading-5 text-[#9c7439]">
                        Risk: {flow.riskNote}
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${getDepartmentClass(
                        flow.department
                      )}`}
                    >
                      {flow.department}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {flow.trigger}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${getPriorityClass(
                        flow.priority
                      )}`}
                    >
                      {flow.priority}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={flow.completion}
                      onChange={(event) =>
                        updateCompletion(flow.id, event.target.value)
                      }
                      className="w-20 rounded-xl border border-[#dfd0b8] bg-[#fbf8f3] px-3 py-2 text-xs outline-none focus:border-[#c9a45c]"
                    />

                    <div className="mt-2 h-2 w-28 overflow-hidden rounded-full bg-[#f0e6d7]">
                      <div
                        className={`h-full rounded-full ${getProgressClass(
                          flow.completion
                        )}`}
                        style={{
                          width: `${Math.min(Number(flow.completion), 100)}%`,
                        }}
                      />
                    </div>

                    <p className="mt-1 text-xs text-[#8a7560]">
                      %{flow.completion}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <select
                      value={flow.status}
                      onChange={(event) =>
                        updateStatus(flow.id, event.target.value)
                      }
                      className={`rounded-xl border px-3 py-2 text-xs outline-none ${getStatusClass(
                        flow.status
                      )}`}
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Takipte">Takipte</option>
                      <option value="Aksiyon Gerekli">Aksiyon Gerekli</option>
                      <option value="Tamamlandı">Tamamlandı</option>
                      <option value="Pasif">Pasif</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          {criticalFlow && (
            <div className="rounded-3xl border border-[#c9a45c]/30 bg-[#211914] p-6 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e6c57a]">
                Kritik Akış
              </p>

              <h2 className="mt-3 text-xl font-semibold text-white">
                {criticalFlow.flowName}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#d8c7ad]">
                {criticalFlow.riskNote}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#e6c57a]/20 bg-white/5 p-4">
                  <p className="text-xs text-[#d8c7ad]">Öncelik</p>
                  <p className="mt-1 text-lg font-semibold text-[#e6c57a]">
                    {criticalFlow.priority}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e6c57a]/20 bg-white/5 p-4">
                  <p className="text-xs text-[#d8c7ad]">Durum</p>
                  <p className="mt-1 text-lg font-semibold text-[#e6c57a]">
                    {criticalFlow.status}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Departman Özeti
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Akışların departman bazlı dağılımı.
            </p>

            <div className="mt-6 space-y-4">
              {departments.map((department) => {
                const departmentFlows = flows.filter(
                  (flow) => flow.department === department
                );

                const departmentCompletion =
                  departmentFlows.length === 0
                    ? 0
                    : departmentFlows.reduce(
                        (total, flow) => total + Number(flow.completion),
                        0
                      ) / departmentFlows.length;

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
                        %{departmentCompletion.toFixed(1)}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-[#8a7560]">
                      Akış sayısı: {departmentFlows.length}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Akış Notu
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#7d6b5a]">
              Bu ekran ileride görev listesi, günlük çeklist, stok, etkinlik,
              müşteri ve finans modülleriyle bağlanarak süreçleri otomatik
              başlatacak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}