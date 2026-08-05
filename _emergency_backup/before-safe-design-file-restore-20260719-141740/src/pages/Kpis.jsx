import { useState } from "react";

const initialKpis = [
  {
    id: 1,
    title: "Günlük Ciro Hedefi",
    category: "Finans",
    period: "Günlük",
    targetValue: 200000,
    currentValue: 185000,
    unit: "TL",
    owner: "Yönetim",
    status: "Takipte",
    note: "Akşam servisiyle hedefe yaklaşılmış durumda.",
  },
  {
    id: 2,
    title: "Brunch Rezervasyon Hedefi",
    category: "Satış",
    period: "Haftalık",
    targetValue: 80,
    currentValue: 46,
    unit: "Kişi",
    owner: "Pazarlama",
    status: "Aksiyon Gerekli",
    note: "Kahvaltı pizzası vurgulu story ve reels paylaşımı önerilir.",
  },
  {
    id: 3,
    title: "Müşteri Memnuniyeti",
    category: "Müşteri",
    period: "Haftalık",
    targetValue: 4.7,
    currentValue: 4.2,
    unit: "Puan",
    owner: "Operasyon",
    status: "Takipte",
    note: "Bekleme süresiyle ilgili yorumlar kontrol edilmeli.",
  },
  {
    id: 4,
    title: "Stok Fire Oranı",
    category: "Stok",
    period: "Aylık",
    targetValue: 5,
    currentValue: 7,
    unit: "%",
    owner: "Mutfak",
    status: "Riskli",
    note: "Kırılma, zayi ve fire kayıtları stok modülüyle karşılaştırılmalı.",
  },
];

function formatValue(value, unit) {
  if (unit === "TL") {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (unit === "%") {
    return `%${Number(value).toFixed(1)}`;
  }

  if (unit === "Puan") {
    return `${Number(value).toFixed(1)} / 5`;
  }

  return `${Number(value).toLocaleString("tr-TR")} ${unit}`;
}

function getProgress(kpi) {
  if (Number(kpi.targetValue) === 0) return 0;

  if (kpi.title.toLowerCase().includes("fire")) {
    return (Number(kpi.targetValue) / Number(kpi.currentValue)) * 100;
  }

  return (Number(kpi.currentValue) / Number(kpi.targetValue)) * 100;
}

function getGap(kpi) {
  return Number(kpi.targetValue) - Number(kpi.currentValue);
}

function getStatusClass(status) {
  if (status === "Tamamlandı") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "Takipte") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (status === "Aksiyon Gerekli") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (status === "Riskli") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

function getCategoryClass(category) {
  if (category === "Finans") {
    return "bg-[#fff7e7] text-[#9c7439] border-[#c9a45c]/30";
  }

  if (category === "Satış") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (category === "Müşteri") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  if (category === "Stok") {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }

  if (category === "Ekip") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

function getProgressClass(progress) {
  if (progress >= 100) {
    return "bg-emerald-500";
  }

  if (progress >= 75) {
    return "bg-blue-500";
  }

  if (progress >= 50) {
    return "bg-amber-500";
  }

  return "bg-red-500";
}

export default function Kpis() {
  const [kpis, setKpis] = useState(initialKpis);

  const [form, setForm] = useState({
    title: "",
    category: "",
    period: "",
    targetValue: "",
    currentValue: "",
    unit: "",
    owner: "",
    status: "Takipte",
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

    const newKpi = {
      id: Date.now(),
      title: form.title,
      category: form.category,
      period: form.period,
      targetValue: Number(form.targetValue || 0),
      currentValue: Number(form.currentValue || 0),
      unit: form.unit,
      owner: form.owner,
      status: form.status,
      note: form.note,
    };

    setKpis((prev) => [newKpi, ...prev]);

    setForm({
      title: "",
      category: "",
      period: "",
      targetValue: "",
      currentValue: "",
      unit: "",
      owner: "",
      status: "Takipte",
      note: "",
    });
  }

  function updateStatus(id, nextStatus) {
    setKpis((prev) =>
      prev.map((kpi) =>
        kpi.id === id ? { ...kpi, status: nextStatus } : kpi
      )
    );
  }

  const totalKpis = kpis.length;

  const completedKpis = kpis.filter((kpi) => getProgress(kpi) >= 100).length;

  const riskyKpis = kpis.filter(
    (kpi) => kpi.status === "Riskli" || kpi.status === "Aksiyon Gerekli"
  ).length;

  const averageProgress =
    kpis.length === 0
      ? 0
      : kpis.reduce((total, kpi) => total + Math.min(getProgress(kpi), 100), 0) /
        kpis.length;

  const categories = [...new Set(kpis.map((kpi) => kpi.category))];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Strateji & Rapor
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Hedef & KPI
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Ciro, satış, stok, müşteri, ekip ve operasyon hedeflerini tek
              ekranda takip et. Hedefe yaklaşma oranı otomatik hesaplanır.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            KPI Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam KPI</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalKpis}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Tamamlanan</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {completedKpis}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Risk / Aksiyon</p>
          <h3 className="mt-3 text-2xl font-semibold text-amber-700">
            {riskyKpis}
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
            Yeni KPI Ekle
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Hedef değer ve mevcut değer girildiğinde ilerleme oranı otomatik
            hesaplanır.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="KPI adı"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Kategori seç</option>
            <option value="Finans">Finans</option>
            <option value="Satış">Satış</option>
            <option value="Müşteri">Müşteri</option>
            <option value="Stok">Stok</option>
            <option value="Ekip">Ekip</option>
            <option value="Operasyon">Operasyon</option>
          </select>

          <select
            name="period"
            value={form.period}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Dönem seç</option>
            <option value="Günlük">Günlük</option>
            <option value="Haftalık">Haftalık</option>
            <option value="Aylık">Aylık</option>
            <option value="Çeyreklik">Çeyreklik</option>
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
            name="targetValue"
            value={form.targetValue}
            onChange={handleChange}
            placeholder="Hedef değer"
            type="number"
            step="0.01"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="currentValue"
            value={form.currentValue}
            onChange={handleChange}
            placeholder="Mevcut değer"
            type="number"
            step="0.01"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Birim seç</option>
            <option value="TL">TL</option>
            <option value="%">%</option>
            <option value="Kişi">Kişi</option>
            <option value="Adet">Adet</option>
            <option value="Puan">Puan</option>
          </select>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Takipte">Takipte</option>
            <option value="Tamamlandı">Tamamlandı</option>
            <option value="Aksiyon Gerekli">Aksiyon Gerekli</option>
            <option value="Riskli">Riskli</option>
          </select>

          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="KPI notu"
            className="col-span-4 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            KPI Ekle
          </button>
        </div>
      </form>

      <div className="grid grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
          <div className="border-b border-[#eadfce] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#211914]">
              KPI Listesi
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Hedefe ulaşma oranı ve kalan fark otomatik gösterilir.
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
              <tr>
                <th className="px-6 py-4">KPI</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Hedef</th>
                <th className="px-6 py-4">Mevcut</th>
                <th className="px-6 py-4">İlerleme</th>
                <th className="px-6 py-4 text-right">Durum</th>
              </tr>
            </thead>

            <tbody>
              {kpis.map((kpi) => {
                const progress = getProgress(kpi);
                const gap = getGap(kpi);

                return (
                  <tr
                    key={kpi.id}
                    className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#211914]">{kpi.title}</p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        {kpi.period} / Sorumlu: {kpi.owner}
                      </p>

                      {kpi.note && (
                        <p className="mt-2 max-w-[340px] text-xs leading-5 text-[#7d6b5a]">
                          {kpi.note}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getCategoryClass(
                          kpi.category
                        )}`}
                      >
                        {kpi.category}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-[#211914]">
                      {formatValue(kpi.targetValue, kpi.unit)}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-emerald-700">
                        {formatValue(kpi.currentValue, kpi.unit)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Fark: {formatValue(gap, kpi.unit)}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-[#211914]">
                        %{progress.toFixed(1)}
                      </p>

                      <div className="mt-2 h-2 w-28 overflow-hidden rounded-full bg-[#f0e6d7]">
                        <div
                          className={`h-full rounded-full ${getProgressClass(
                            progress
                          )}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <select
                        value={kpi.status}
                        onChange={(event) =>
                          updateStatus(kpi.id, event.target.value)
                        }
                        className={`rounded-xl border px-3 py-2 text-xs outline-none ${getStatusClass(
                          kpi.status
                        )}`}
                      >
                        <option value="Takipte">Takipte</option>
                        <option value="Tamamlandı">Tamamlandı</option>
                        <option value="Aksiyon Gerekli">Aksiyon Gerekli</option>
                        <option value="Riskli">Riskli</option>
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
              Kategori Özeti
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              KPI kayıtlarının kategori bazlı dağılımı.
            </p>

            <div className="mt-6 space-y-4">
              {categories.map((category) => {
                const categoryKpis = kpis.filter(
                  (kpi) => kpi.category === category
                );

                const categoryAverage =
                  categoryKpis.length === 0
                    ? 0
                    : categoryKpis.reduce(
                        (total, kpi) => total + Math.min(getProgress(kpi), 100),
                        0
                      ) / categoryKpis.length;

                return (
                  <div key={category} className="rounded-2xl bg-[#fbf8f3] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getCategoryClass(
                          category
                        )}`}
                      >
                        {category}
                      </span>

                      <span className="text-sm font-semibold text-[#211914]">
                        %{categoryAverage.toFixed(1)}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-[#8a7560]">
                      KPI sayısı: {categoryKpis.length}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Yönetim Notu
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#7d6b5a]">
              Bu ekran ileride satış, stok, ekip, müşteri ve finans
              modüllerinden gerçek verileri alarak KPI değerlerini otomatik
              güncelleyecek.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}