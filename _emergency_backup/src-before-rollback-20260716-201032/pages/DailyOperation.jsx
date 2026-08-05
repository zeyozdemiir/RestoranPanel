import { useState } from "react";

const initialOperations = [
  {
    id: 1,
    title: "Kasa açılışı ve POS kontrolü",
    area: "Kasa",
    shift: "Sabah",
    owner: "Yönetim",
    time: "10:00",
    priority: "Yüksek",
    status: "Tamamlandı",
    progress: 100,
    note: "Nakit, POS cihazları ve gün sonu rapor şablonu kontrol edildi.",
  },
  {
    id: 2,
    title: "Rezervasyon ve masa planı kontrolü",
    area: "Servis",
    shift: "Sabah",
    owner: "Servis Ekibi",
    time: "10:30",
    priority: "Yüksek",
    status: "Devam Ediyor",
    progress: 72,
    note: "Brunch ve akşam rezervasyonları masa planıyla eşleştirilecek.",
  },
  {
    id: 3,
    title: "Kritik stok ve eksik ürün kontrolü",
    area: "Mutfak",
    shift: "Sabah",
    owner: "Mutfak",
    time: "11:00",
    priority: "Yüksek",
    status: "Aksiyon Gerekli",
    progress: 45,
    note: "Eksik ürünler satın alma talepleriyle karşılaştırılacak.",
  },
  {
    id: 4,
    title: "Bar hazırlık ve kokteyl reçeteleri",
    area: "Bar",
    shift: "Akşam",
    owner: "Bar Ekibi",
    time: "16:00",
    priority: "Orta",
    status: "Planlandı",
    progress: 30,
    note: "Kuzu Kulağı, Basil Kiss ve özel kokteyl reçeteleri kontrol edilecek.",
  },
];

function getStatusClass(status) {
  if (status === "Tamamlandı") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "Devam Ediyor") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (status === "Aksiyon Gerekli") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (status === "Gecikti") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

function getAreaClass(area) {
  if (area === "Kasa") {
    return "bg-[#fff7e7] text-[#9c7439] border-[#c9a45c]/30";
  }

  if (area === "Servis") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (area === "Mutfak") {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }

  if (area === "Bar") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  if (area === "Rezervasyon") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
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

function getProgressClass(progress) {
  if (Number(progress) >= 90) {
    return "bg-emerald-500";
  }

  if (Number(progress) >= 60) {
    return "bg-blue-500";
  }

  if (Number(progress) >= 35) {
    return "bg-amber-500";
  }

  return "bg-red-500";
}

export default function DailyOperation() {
  const [operations, setOperations] = useState(initialOperations);

  const [form, setForm] = useState({
    title: "",
    area: "",
    shift: "",
    owner: "",
    time: "",
    priority: "Orta",
    status: "Planlandı",
    progress: "",
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

    const newOperation = {
      id: Date.now(),
      title: form.title,
      area: form.area,
      shift: form.shift,
      owner: form.owner,
      time: form.time,
      priority: form.priority,
      status: form.status,
      progress: Number(form.progress || 0),
      note: form.note,
    };

    setOperations((prev) =>
      [newOperation, ...prev].sort((a, b) => a.time.localeCompare(b.time))
    );

    setForm({
      title: "",
      area: "",
      shift: "",
      owner: "",
      time: "",
      priority: "Orta",
      status: "Planlandı",
      progress: "",
      note: "",
    });
  }

  function updateStatus(id, nextStatus) {
    setOperations((prev) =>
      prev.map((operation) =>
        operation.id === id ? { ...operation, status: nextStatus } : operation
      )
    );
  }

  function updateProgress(id, nextProgress) {
    setOperations((prev) =>
      prev.map((operation) =>
        operation.id === id
          ? { ...operation, progress: Number(nextProgress) }
          : operation
      )
    );
  }

  const sortedOperations = [...operations].sort((a, b) =>
    a.time.localeCompare(b.time)
  );

  const totalOperations = operations.length;

  const completedOperations = operations.filter(
    (operation) => operation.status === "Tamamlandı"
  ).length;

  const actionNeeded = operations.filter(
    (operation) =>
      operation.status === "Aksiyon Gerekli" || operation.status === "Gecikti"
  ).length;

  const highPriority = operations.filter(
    (operation) => operation.priority === "Yüksek"
  ).length;

  const averageProgress =
    operations.length === 0
      ? 0
      : operations.reduce(
          (total, operation) => total + Number(operation.progress),
          0
        ) / operations.length;

  const areas = [...new Set(operations.map((operation) => operation.area))];

  const criticalOperation = [...operations].sort((a, b) => {
    const priorityWeight = { Yüksek: 3, Orta: 2, Düşük: 1 };

    const statusWeight = {
      Gecikti: 4,
      "Aksiyon Gerekli": 3,
      "Devam Ediyor": 2,
      Planlandı: 1,
      Tamamlandı: 0,
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
          Her Gün
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Günlük Operasyon
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Restoranın günlük kasa, servis, mutfak, bar, rezervasyon ve stok
              akışını tek ekranda takip et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Günlük Rapor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam İş</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalOperations}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Tamamlanan: {completedOperations}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Aksiyon / Gecikme</p>
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
          <p className="text-sm text-[#8a7560]">Ortalama İlerleme</p>
          <h3 className="mt-3 text-2xl font-semibold text-blue-700">
            %{averageProgress.toFixed(1)}
          </h3>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Günlük İş Ekle
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Gün içindeki operasyon adımlarını saat, ekip, öncelik ve durumla
            birlikte kaydet.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="İş başlığı"
            className="col-span-2 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="area"
            value={form.area}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Alan seç</option>
            <option value="Kasa">Kasa</option>
            <option value="Servis">Servis</option>
            <option value="Mutfak">Mutfak</option>
            <option value="Bar">Bar</option>
            <option value="Rezervasyon">Rezervasyon</option>
            <option value="Yönetim">Yönetim</option>
          </select>

          <select
            name="shift"
            value={form.shift}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Vardiya seç</option>
            <option value="Sabah">Sabah</option>
            <option value="Öğlen">Öğlen</option>
            <option value="Akşam">Akşam</option>
            <option value="Tüm Gün">Tüm Gün</option>
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
            name="time"
            value={form.time}
            onChange={handleChange}
            type="time"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
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
            <option value="Planlandı">Planlandı</option>
            <option value="Devam Ediyor">Devam Ediyor</option>
            <option value="Aksiyon Gerekli">Aksiyon Gerekli</option>
            <option value="Tamamlandı">Tamamlandı</option>
            <option value="Gecikti">Gecikti</option>
          </select>

          <input
            name="progress"
            value={form.progress}
            onChange={handleChange}
            placeholder="İlerleme %"
            type="number"
            min="0"
            max="100"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Operasyon notu"
            className="col-span-3 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Günlük İş Ekle
          </button>
        </div>
      </form>

      <div className="grid grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
          <div className="border-b border-[#eadfce] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#211914]">
              Günlük Akış Listesi
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Gün içindeki işler saat sırasına göre listelenir.
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
              <tr>
                <th className="px-6 py-4">İş</th>
                <th className="px-6 py-4">Alan</th>
                <th className="px-6 py-4">Saat</th>
                <th className="px-6 py-4">Öncelik</th>
                <th className="px-6 py-4">İlerleme</th>
                <th className="px-6 py-4 text-right">Durum</th>
              </tr>
            </thead>

            <tbody>
              {sortedOperations.map((operation) => (
                <tr
                  key={operation.id}
                  className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#211914]">
                      {operation.title}
                    </p>

                    <p className="mt-1 text-xs text-[#8a7560]">
                      Sorumlu: {operation.owner} / Vardiya: {operation.shift}
                    </p>

                    {operation.note && (
                      <p className="mt-2 max-w-[360px] text-xs leading-5 text-[#7d6b5a]">
                        {operation.note}
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${getAreaClass(
                        operation.area
                      )}`}
                    >
                      {operation.area}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-[#211914]">
                    {operation.time}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${getPriorityClass(
                        operation.priority
                      )}`}
                    >
                      {operation.priority}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={operation.progress}
                      onChange={(event) =>
                        updateProgress(operation.id, event.target.value)
                      }
                      className="w-20 rounded-xl border border-[#dfd0b8] bg-[#fbf8f3] px-3 py-2 text-xs outline-none focus:border-[#c9a45c]"
                    />

                    <div className="mt-2 h-2 w-28 overflow-hidden rounded-full bg-[#f0e6d7]">
                      <div
                        className={`h-full rounded-full ${getProgressClass(
                          operation.progress
                        )}`}
                        style={{
                          width: `${Math.min(Number(operation.progress), 100)}%`,
                        }}
                      />
                    </div>

                    <p className="mt-1 text-xs text-[#8a7560]">
                      %{operation.progress}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <select
                      value={operation.status}
                      onChange={(event) =>
                        updateStatus(operation.id, event.target.value)
                      }
                      className={`rounded-xl border px-3 py-2 text-xs outline-none ${getStatusClass(
                        operation.status
                      )}`}
                    >
                      <option value="Planlandı">Planlandı</option>
                      <option value="Devam Ediyor">Devam Ediyor</option>
                      <option value="Aksiyon Gerekli">Aksiyon Gerekli</option>
                      <option value="Tamamlandı">Tamamlandı</option>
                      <option value="Gecikti">Gecikti</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          {criticalOperation && (
            <div className="rounded-3xl border border-[#c9a45c]/30 bg-[#211914] p-6 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e6c57a]">
                Kritik Günlük İş
              </p>

              <h2 className="mt-3 text-xl font-semibold text-white">
                {criticalOperation.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#d8c7ad]">
                {criticalOperation.note}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#e6c57a]/20 bg-white/5 p-4">
                  <p className="text-xs text-[#d8c7ad]">Öncelik</p>
                  <p className="mt-1 text-lg font-semibold text-[#e6c57a]">
                    {criticalOperation.priority}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e6c57a]/20 bg-white/5 p-4">
                  <p className="text-xs text-[#d8c7ad]">Durum</p>
                  <p className="mt-1 text-lg font-semibold text-[#e6c57a]">
                    {criticalOperation.status}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Alan Özeti
            </h2>

            <div className="mt-6 space-y-4">
              {areas.map((area) => {
                const areaOperations = operations.filter(
                  (operation) => operation.area === area
                );

                const areaCompleted = areaOperations.filter(
                  (operation) => operation.status === "Tamamlandı"
                ).length;

                return (
                  <div key={area} className="rounded-2xl bg-[#fbf8f3] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getAreaClass(
                          area
                        )}`}
                      >
                        {area}
                      </span>

                      <span className="text-sm font-semibold text-[#211914]">
                        {areaOperations.length} iş
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-[#8a7560]">
                      Tamamlanan: {areaCompleted}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Günlük Not
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#7d6b5a]">
              Bu ekran ileride masa, rezervasyon, kasa sayımı, stok, görev
              listesi ve çeklist modüllerinden otomatik veri alacak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}