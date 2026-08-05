import { useState } from "react";

const initialAnalyses = [
  {
    id: 1,
    analysisName: "Brunch Rezervasyon Tahmini",
    area: "Satış",
    metric: "Rezervasyon",
    currentValue: 46,
    forecastValue: 72,
    targetValue: 80,
    unit: "Kişi",
    confidence: 78,
    riskLevel: "Orta",
    trend: "Yükseliyor",
    status: "Takipte",
    insight:
      "Kahvaltı pizzası vurgulu içerik ve son gün story reklamı ile hedefe yaklaşılabilir.",
  },
  {
    id: 2,
    analysisName: "Kritik Stok Riski",
    area: "Stok",
    metric: "Eksik Ürün",
    currentValue: 9,
    forecastValue: 13,
    targetValue: 5,
    unit: "Adet",
    confidence: 84,
    riskLevel: "Yüksek",
    trend: "Yükseliyor",
    status: "Aksiyon Gerekli",
    insight:
      "Eksik ürün sayısı artma eğiliminde. Satın alma talepleri aynı gün kontrol edilmeli.",
  },
  {
    id: 3,
    analysisName: "Müşteri Memnuniyeti Eğilimi",
    area: "Müşteri",
    metric: "Puan",
    currentValue: 4.2,
    forecastValue: 4.4,
    targetValue: 4.7,
    unit: "Puan",
    confidence: 69,
    riskLevel: "Orta",
    trend: "Yatay",
    status: "İnceleniyor",
    insight:
      "Servis yorumları olumlu, bekleme süresiyle ilgili geri bildirimler operasyon tarafında izlenmeli.",
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

function getForecastGap(analysis) {
  return Number(analysis.forecastValue) - Number(analysis.targetValue);
}

function getForecastAccuracy(analysis) {
  if (Number(analysis.targetValue) === 0) return 0;

  if (
    analysis.metric.toLowerCase().includes("risk") ||
    analysis.metric.toLowerCase().includes("eksik")
  ) {
    return (Number(analysis.targetValue) / Number(analysis.forecastValue)) * 100;
  }

  return (Number(analysis.forecastValue) / Number(analysis.targetValue)) * 100;
}

function getDeviationRate(analysis) {
  if (Number(analysis.currentValue) === 0) return 0;

  return (
    ((Number(analysis.forecastValue) - Number(analysis.currentValue)) /
      Number(analysis.currentValue)) *
    100
  );
}

function getAreaClass(area) {
  if (area === "Finans") {
    return "bg-[#fff7e7] text-[#9c7439] border-[#c9a45c]/30";
  }

  if (area === "Satış") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (area === "Stok") {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }

  if (area === "Müşteri") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  if (area === "Operasyon") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

function getRiskClass(riskLevel) {
  if (riskLevel === "Yüksek") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (riskLevel === "Orta") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

function getTrendClass(trend) {
  if (trend === "Yükseliyor") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (trend === "Düşüyor") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (trend === "Yatay") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

function getStatusClass(status) {
  if (status === "İyi") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "Takipte") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (status === "İnceleniyor") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (status === "Aksiyon Gerekli") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

function getConfidenceClass(confidence) {
  if (Number(confidence) >= 80) {
    return "bg-emerald-500";
  }

  if (Number(confidence) >= 65) {
    return "bg-blue-500";
  }

  if (Number(confidence) >= 50) {
    return "bg-amber-500";
  }

  return "bg-red-500";
}

function getAnalysisLabel(analysis) {
  const accuracy = getForecastAccuracy(analysis);

  if (analysis.riskLevel === "Yüksek") {
    return {
      label: "Riskli",
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }

  if (accuracy >= 95) {
    return {
      label: "Hedefe Yakın",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  if (accuracy >= 75) {
    return {
      label: "Takip Et",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    };
  }

  return {
    label: "Aksiyon Gerekli",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  };
}

export default function Analytics() {
  const [analyses, setAnalyses] = useState(initialAnalyses);

  const [form, setForm] = useState({
    analysisName: "",
    area: "",
    metric: "",
    currentValue: "",
    forecastValue: "",
    targetValue: "",
    unit: "",
    confidence: "",
    riskLevel: "Orta",
    trend: "Yatay",
    status: "Takipte",
    insight: "",
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

    const newAnalysis = {
      id: Date.now(),
      analysisName: form.analysisName,
      area: form.area,
      metric: form.metric,
      currentValue: Number(form.currentValue || 0),
      forecastValue: Number(form.forecastValue || 0),
      targetValue: Number(form.targetValue || 0),
      unit: form.unit,
      confidence: Number(form.confidence || 0),
      riskLevel: form.riskLevel,
      trend: form.trend,
      status: form.status,
      insight: form.insight,
    };

    setAnalyses((prev) => [newAnalysis, ...prev]);

    setForm({
      analysisName: "",
      area: "",
      metric: "",
      currentValue: "",
      forecastValue: "",
      targetValue: "",
      unit: "",
      confidence: "",
      riskLevel: "Orta",
      trend: "Yatay",
      status: "Takipte",
      insight: "",
    });
  }

  function updateStatus(id, nextStatus) {
    setAnalyses((prev) =>
      prev.map((analysis) =>
        analysis.id === id ? { ...analysis, status: nextStatus } : analysis
      )
    );
  }

  function updateRisk(id, nextRiskLevel) {
    setAnalyses((prev) =>
      prev.map((analysis) =>
        analysis.id === id
          ? { ...analysis, riskLevel: nextRiskLevel }
          : analysis
      )
    );
  }

  const totalAnalyses = analyses.length;

  const highRiskCount = analyses.filter(
    (analysis) => analysis.riskLevel === "Yüksek"
  ).length;

  const actionNeededCount = analyses.filter(
    (analysis) => analysis.status === "Aksiyon Gerekli"
  ).length;

  const averageConfidence =
    analyses.length === 0
      ? 0
      : analyses.reduce(
          (total, analysis) => total + Number(analysis.confidence),
          0
        ) / analyses.length;

  const averageForecastAccuracy =
    analyses.length === 0
      ? 0
      : analyses.reduce(
          (total, analysis) => total + Math.min(getForecastAccuracy(analysis), 100),
          0
        ) / analyses.length;

  const areas = [...new Set(analyses.map((analysis) => analysis.area))];

  const mostCriticalAnalysis = [...analyses].sort((a, b) => {
    const riskWeight = { Yüksek: 3, Orta: 2, Düşük: 1 };

    return (
      riskWeight[b.riskLevel] * 100 +
      Number(b.confidence) -
      (riskWeight[a.riskLevel] * 100 + Number(a.confidence))
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
              İleri Analiz
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Satış, stok, müşteri, finans ve operasyon verilerini tahmin,
              trend, güven skoru ve risk seviyesine göre analiz et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Analiz Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Analiz</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalAnalyses}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Yüksek Risk</p>
          <h3 className="mt-3 text-2xl font-semibold text-red-700">
            {highRiskCount}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Aksiyon gerekli: {actionNeededCount}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Ortalama Güven</p>
          <h3 className="mt-3 text-2xl font-semibold text-blue-700">
            %{averageConfidence.toFixed(1)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Tahmin Başarısı</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            %{averageForecastAccuracy.toFixed(1)}
          </h3>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Analiz Ekle
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Mevcut değer, tahmin, hedef ve güven skoru girildiğinde analiz
            sonucu otomatik yorumlanır.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="analysisName"
            value={form.analysisName}
            onChange={handleChange}
            placeholder="Analiz adı"
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
            <option value="Finans">Finans</option>
            <option value="Satış">Satış</option>
            <option value="Stok">Stok</option>
            <option value="Müşteri">Müşteri</option>
            <option value="Operasyon">Operasyon</option>
            <option value="Ekip">Ekip</option>
          </select>

          <input
            name="metric"
            value={form.metric}
            onChange={handleChange}
            placeholder="Metrik adı"
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
            name="forecastValue"
            value={form.forecastValue}
            onChange={handleChange}
            placeholder="Tahmin"
            type="number"
            step="0.01"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="targetValue"
            value={form.targetValue}
            onChange={handleChange}
            placeholder="Hedef"
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

          <input
            name="confidence"
            value={form.confidence}
            onChange={handleChange}
            placeholder="Güven skoru %"
            type="number"
            min="0"
            max="100"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="riskLevel"
            value={form.riskLevel}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Düşük">Düşük Risk</option>
            <option value="Orta">Orta Risk</option>
            <option value="Yüksek">Yüksek Risk</option>
          </select>

          <select
            name="trend"
            value={form.trend}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Yükseliyor">Yükseliyor</option>
            <option value="Yatay">Yatay</option>
            <option value="Düşüyor">Düşüyor</option>
          </select>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Takipte">Takipte</option>
            <option value="İyi">İyi</option>
            <option value="İnceleniyor">İnceleniyor</option>
            <option value="Aksiyon Gerekli">Aksiyon Gerekli</option>
          </select>

          <textarea
            name="insight"
            value={form.insight}
            onChange={handleChange}
            placeholder="Analiz içgörüsü / öneri"
            rows="3"
            className="col-span-4 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Analiz Ekle
          </button>
        </div>
      </form>

      <div className="grid grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
          <div className="border-b border-[#eadfce] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#211914]">
              Analiz Listesi
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Tahmin farkı, sapma oranı ve hedefe yakınlık otomatik hesaplanır.
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
              <tr>
                <th className="px-6 py-4">Analiz</th>
                <th className="px-6 py-4">Alan</th>
                <th className="px-6 py-4">Değerler</th>
                <th className="px-6 py-4">Tahmin</th>
                <th className="px-6 py-4">Risk</th>
                <th className="px-6 py-4 text-right">Durum</th>
              </tr>
            </thead>

            <tbody>
              {analyses.map((analysis) => {
                const forecastGap = getForecastGap(analysis);
                const deviationRate = getDeviationRate(analysis);
                const accuracy = getForecastAccuracy(analysis);
                const label = getAnalysisLabel(analysis);

                return (
                  <tr
                    key={analysis.id}
                    className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#211914]">
                        {analysis.analysisName}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Metrik: {analysis.metric}
                      </p>

                      <p className="mt-2 max-w-[360px] text-xs leading-5 text-[#7d6b5a]">
                        {analysis.insight}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getAreaClass(
                          analysis.area
                        )}`}
                      >
                        {analysis.area}
                      </span>

                      <span
                        className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getTrendClass(
                          analysis.trend
                        )}`}
                      >
                        {analysis.trend}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs text-[#8a7560]">Mevcut</p>
                      <p className="mt-1 text-sm font-medium text-[#211914]">
                        {formatValue(analysis.currentValue, analysis.unit)}
                      </p>

                      <p className="mt-3 text-xs text-[#8a7560]">Hedef</p>
                      <p className="mt-1 text-sm font-semibold text-emerald-700">
                        {formatValue(analysis.targetValue, analysis.unit)}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${label.className}`}
                      >
                        {label.label}
                      </span>

                      <p className="mt-2 text-sm font-semibold text-[#211914]">
                        {formatValue(analysis.forecastValue, analysis.unit)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Hedef farkı: {formatValue(forecastGap, analysis.unit)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Sapma: %{deviationRate.toFixed(1)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Hedefe yakınlık: %{accuracy.toFixed(1)}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={analysis.riskLevel}
                        onChange={(event) =>
                          updateRisk(analysis.id, event.target.value)
                        }
                        className={`rounded-xl border px-3 py-2 text-xs outline-none ${getRiskClass(
                          analysis.riskLevel
                        )}`}
                      >
                        <option value="Düşük">Düşük</option>
                        <option value="Orta">Orta</option>
                        <option value="Yüksek">Yüksek</option>
                      </select>

                      <div className="mt-3 h-2 w-28 overflow-hidden rounded-full bg-[#f0e6d7]">
                        <div
                          className={`h-full rounded-full ${getConfidenceClass(
                            analysis.confidence
                          )}`}
                          style={{
                            width: `${Math.min(
                              Number(analysis.confidence),
                              100
                            )}%`,
                          }}
                        />
                      </div>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Güven: %{analysis.confidence}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <select
                        value={analysis.status}
                        onChange={(event) =>
                          updateStatus(analysis.id, event.target.value)
                        }
                        className={`rounded-xl border px-3 py-2 text-xs outline-none ${getStatusClass(
                          analysis.status
                        )}`}
                      >
                        <option value="Takipte">Takipte</option>
                        <option value="İyi">İyi</option>
                        <option value="İnceleniyor">İnceleniyor</option>
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
          {mostCriticalAnalysis && (
            <div className="rounded-3xl border border-[#c9a45c]/30 bg-[#211914] p-6 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e6c57a]">
                En Kritik Analiz
              </p>

              <h2 className="mt-3 text-xl font-semibold text-white">
                {mostCriticalAnalysis.analysisName}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#d8c7ad]">
                {mostCriticalAnalysis.insight}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#e6c57a]/20 bg-white/5 p-4">
                  <p className="text-xs text-[#d8c7ad]">Risk</p>
                  <p className="mt-1 text-lg font-semibold text-[#e6c57a]">
                    {mostCriticalAnalysis.riskLevel}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e6c57a]/20 bg-white/5 p-4">
                  <p className="text-xs text-[#d8c7ad]">Güven</p>
                  <p className="mt-1 text-lg font-semibold text-[#e6c57a]">
                    %{mostCriticalAnalysis.confidence}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Alan Özeti
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Analizlerin alan bazlı dağılımı.
            </p>

            <div className="mt-6 space-y-4">
              {areas.map((area) => {
                const areaAnalyses = analyses.filter(
                  (analysis) => analysis.area === area
                );

                const areaConfidence =
                  areaAnalyses.length === 0
                    ? 0
                    : areaAnalyses.reduce(
                        (total, analysis) =>
                          total + Number(analysis.confidence),
                        0
                      ) / areaAnalyses.length;

                const areaRiskCount = areaAnalyses.filter(
                  (analysis) => analysis.riskLevel === "Yüksek"
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
                        %{areaConfidence.toFixed(1)}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-[#8a7560]">
                      Kayıt: {areaAnalyses.length} / Yüksek risk:{" "}
                      {areaRiskCount}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Analiz Notu
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#7d6b5a]">
              Bu ekran ileride satış, stok, müşteri, operasyon ve finans
              modüllerinden gerçek veri alarak tahminleri otomatik
              hesaplayacak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}