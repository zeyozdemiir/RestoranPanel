import { useState } from "react";

const initialComparisons = [
  {
    id: 1,
    comparisonName: "Haftalık Ciro Karşılaştırması",
    category: "Finans",
    metricName: "Ciro",
    currentPeriod: "Bu Hafta",
    previousPeriod: "Geçen Hafta",
    currentValue: 1285000,
    previousValue: 1120000,
    unit: "TL",
    owner: "Yönetim",
    status: "Pozitif",
    note: "Brunch ve akşam servisindeki artış ciroyu yukarı taşıdı.",
  },
  {
    id: 2,
    comparisonName: "Rezervasyon Karşılaştırması",
    category: "Satış",
    metricName: "Rezervasyon",
    currentPeriod: "Bu Hafta",
    previousPeriod: "Geçen Hafta",
    currentValue: 214,
    previousValue: 186,
    unit: "Adet",
    owner: "Operasyon",
    status: "Pozitif",
    note: "Instagram kampanyaları rezervasyon dönüşünü artırdı.",
  },
  {
    id: 3,
    comparisonName: "Fire Oranı Karşılaştırması",
    category: "Stok",
    metricName: "Fire Oranı",
    currentPeriod: "Bu Ay",
    previousPeriod: "Geçen Ay",
    currentValue: 7.2,
    previousValue: 5.8,
    unit: "%",
    owner: "Mutfak",
    status: "Riskli",
    note: "Fire oranındaki artış stok ve kırılma kayıtlarıyla incelenmeli.",
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

function getDifference(item) {
  return Number(item.currentValue) - Number(item.previousValue);
}

function getChangeRate(item) {
  if (Number(item.previousValue) === 0) return 0;

  return (getDifference(item) / Number(item.previousValue)) * 100;
}

function getTrend(item) {
  const difference = getDifference(item);

  if (difference > 0) {
    return {
      label: "Artış",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      textClassName: "text-emerald-700",
    };
  }

  if (difference < 0) {
    return {
      label: "Düşüş",
      className: "bg-red-50 text-red-700 border-red-200",
      textClassName: "text-red-700",
    };
  }

  return {
    label: "Değişmedi",
    className: "bg-gray-50 text-gray-700 border-gray-200",
    textClassName: "text-gray-700",
  };
}

function getStatusClass(status) {
  if (status === "Pozitif") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "Takipte") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (status === "Riskli") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (status === "Aksiyon Gerekli") {
    return "bg-amber-50 text-amber-700 border-amber-200";
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

  if (category === "Stok") {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }

  if (category === "Müşteri") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  if (category === "Ekip") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

export default function CompareReports() {
  const [comparisons, setComparisons] = useState(initialComparisons);

  const [form, setForm] = useState({
    comparisonName: "",
    category: "",
    metricName: "",
    currentPeriod: "",
    previousPeriod: "",
    currentValue: "",
    previousValue: "",
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

    const newComparison = {
      id: Date.now(),
      comparisonName: form.comparisonName,
      category: form.category,
      metricName: form.metricName,
      currentPeriod: form.currentPeriod,
      previousPeriod: form.previousPeriod,
      currentValue: Number(form.currentValue || 0),
      previousValue: Number(form.previousValue || 0),
      unit: form.unit,
      owner: form.owner,
      status: form.status,
      note: form.note,
    };

    setComparisons((prev) => [newComparison, ...prev]);

    setForm({
      comparisonName: "",
      category: "",
      metricName: "",
      currentPeriod: "",
      previousPeriod: "",
      currentValue: "",
      previousValue: "",
      unit: "",
      owner: "",
      status: "Takipte",
      note: "",
    });
  }

  function updateStatus(id, nextStatus) {
    setComparisons((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item
      )
    );
  }

  const totalComparisons = comparisons.length;

  const positiveComparisons = comparisons.filter(
    (item) => item.status === "Pozitif"
  ).length;

  const riskyComparisons = comparisons.filter(
    (item) => item.status === "Riskli" || item.status === "Aksiyon Gerekli"
  ).length;

  const averageChangeRate =
    comparisons.length === 0
      ? 0
      : comparisons.reduce((total, item) => total + getChangeRate(item), 0) /
        comparisons.length;

  const categories = [...new Set(comparisons.map((item) => item.category))];

  const biggestIncrease = [...comparisons].sort(
    (a, b) => getChangeRate(b) - getChangeRate(a)
  )[0];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Strateji & Rapor
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Karşılaştırma
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Ciro, rezervasyon, stok, müşteri, ekip ve operasyon metriklerini
              önceki dönemle karşılaştır. Artış, düşüş ve değişim oranlarını
              otomatik takip et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Karşılaştırma Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Karşılaştırma</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalComparisons}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Pozitif Sonuç</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {positiveComparisons}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Risk / Aksiyon</p>
          <h3 className="mt-3 text-2xl font-semibold text-red-700">
            {riskyComparisons}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Ortalama Değişim</p>
          <h3
            className={`mt-3 text-2xl font-semibold ${
              averageChangeRate >= 0 ? "text-emerald-700" : "text-red-700"
            }`}
          >
            %{averageChangeRate.toFixed(1)}
          </h3>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Karşılaştırma Ekle
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Mevcut dönem ve önceki dönem değerlerini gir. Fark ve değişim oranı
            otomatik hesaplanır.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="comparisonName"
            value={form.comparisonName}
            onChange={handleChange}
            placeholder="Karşılaştırma adı"
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
            <option value="Stok">Stok</option>
            <option value="Müşteri">Müşteri</option>
            <option value="Ekip">Ekip</option>
            <option value="Operasyon">Operasyon</option>
          </select>

          <input
            name="metricName"
            value={form.metricName}
            onChange={handleChange}
            placeholder="Metrik adı"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="owner"
            value={form.owner}
            onChange={handleChange}
            placeholder="Sorumlu kişi / ekip"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="currentPeriod"
            value={form.currentPeriod}
            onChange={handleChange}
            placeholder="Mevcut dönem"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="previousPeriod"
            value={form.previousPeriod}
            onChange={handleChange}
            placeholder="Önceki dönem"
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

          <input
            name="previousValue"
            value={form.previousValue}
            onChange={handleChange}
            placeholder="Önceki değer"
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
            <option value="Adet">Adet</option>
            <option value="Kişi">Kişi</option>
            <option value="Puan">Puan</option>
          </select>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Takipte">Takipte</option>
            <option value="Pozitif">Pozitif</option>
            <option value="Riskli">Riskli</option>
            <option value="Aksiyon Gerekli">Aksiyon Gerekli</option>
          </select>

          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Karşılaştırma notu"
            className="col-span-2 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Karşılaştırma Ekle
          </button>
        </div>
      </form>

      <div className="grid grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
          <div className="border-b border-[#eadfce] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#211914]">
              Karşılaştırma Listesi
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Artış, düşüş, fark ve değişim oranı otomatik hesaplanır.
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
              <tr>
                <th className="px-6 py-4">Başlık</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Önceki</th>
                <th className="px-6 py-4">Mevcut</th>
                <th className="px-6 py-4">Değişim</th>
                <th className="px-6 py-4 text-right">Durum</th>
              </tr>
            </thead>

            <tbody>
              {comparisons.map((item) => {
                const difference = getDifference(item);
                const changeRate = getChangeRate(item);
                const trend = getTrend(item);

                return (
                  <tr
                    key={item.id}
                    className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#211914]">
                        {item.comparisonName}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Metrik: {item.metricName} / Sorumlu: {item.owner}
                      </p>

                      {item.note && (
                        <p className="mt-2 max-w-[340px] text-xs leading-5 text-[#7d6b5a]">
                          {item.note}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getCategoryClass(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs text-[#8a7560]">
                        {item.previousPeriod}
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#211914]">
                        {formatValue(item.previousValue, item.unit)}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs text-[#8a7560]">
                        {item.currentPeriod}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-emerald-700">
                        {formatValue(item.currentValue, item.unit)}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${trend.className}`}
                      >
                        {trend.label}
                      </span>

                      <p className={`mt-2 text-sm font-semibold ${trend.textClassName}`}>
                        {formatValue(difference, item.unit)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        %{changeRate.toFixed(1)}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <select
                        value={item.status}
                        onChange={(event) =>
                          updateStatus(item.id, event.target.value)
                        }
                        className={`rounded-xl border px-3 py-2 text-xs outline-none ${getStatusClass(
                          item.status
                        )}`}
                      >
                        <option value="Takipte">Takipte</option>
                        <option value="Pozitif">Pozitif</option>
                        <option value="Riskli">Riskli</option>
                        <option value="Aksiyon Gerekli">Aksiyon Gerekli</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          {biggestIncrease && (
            <div className="rounded-3xl border border-[#c9a45c]/30 bg-[#211914] p-6 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e6c57a]">
                En Güçlü Artış
              </p>

              <h2 className="mt-3 text-xl font-semibold text-white">
                {biggestIncrease.comparisonName}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#d8c7ad]">
                {biggestIncrease.metricName} metriğinde önceki döneme göre
                %{getChangeRate(biggestIncrease).toFixed(1)} değişim var.
              </p>

              <div className="mt-5 rounded-2xl border border-[#e6c57a]/20 bg-white/5 p-4">
                <p className="text-xs text-[#d8c7ad]">Fark</p>
                <p className="mt-1 text-2xl font-semibold text-[#e6c57a]">
                  {formatValue(
                    getDifference(biggestIncrease),
                    biggestIncrease.unit
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Kategori Özeti
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Karşılaştırmaların kategori bazlı dağılımı.
            </p>

            <div className="mt-6 space-y-4">
              {categories.map((category) => {
                const categoryItems = comparisons.filter(
                  (item) => item.category === category
                );

                const categoryAverage =
                  categoryItems.length === 0
                    ? 0
                    : categoryItems.reduce(
                        (total, item) => total + getChangeRate(item),
                        0
                      ) / categoryItems.length;

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

                      <span
                        className={`text-sm font-semibold ${
                          categoryAverage >= 0
                            ? "text-emerald-700"
                            : "text-red-700"
                        }`}
                      >
                        %{categoryAverage.toFixed(1)}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-[#8a7560]">
                      Kayıt sayısı: {categoryItems.length}
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
              Bu ekran ileride gerçek raporlardan gelen dönemsel verileri
              otomatik karşılaştırarak ciro, maliyet, stok ve müşteri
              tarafındaki değişimleri gösterecek.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}