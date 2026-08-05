import { useState } from "react";

const initialDecisions = [
  {
    id: 1,
    title: "Pazar brunch reklam bütçesi artırılsın mı?",
    area: "Pazarlama",
    urgency: "Yüksek",
    impactScore: 88,
    confidenceScore: 76,
    owner: "Yönetim",
    dueDate: "2026-06-28",
    status: "Karar Bekliyor",
    recommendedAction:
      "Kahvaltı pizzası vurgulu reels ve story reklamına düşük bütçeyle devam edilsin.",
    reason:
      "Mevcut rezervasyon dönüşü olumlu, ancak kapasite tam dolmadığı için son gün reklam desteği mantıklı.",
  },
  {
    id: 2,
    title: "Kritik stok ürünleri için ek satın alma yapılsın mı?",
    area: "Stok",
    urgency: "Yüksek",
    impactScore: 92,
    confidenceScore: 84,
    owner: "Mutfak",
    dueDate: "2026-06-27",
    status: "Aksiyon Alındı",
    recommendedAction:
      "Kritik ürünler için aynı gün satın alma talebi oluşturulsun.",
    reason:
      "Stok kritik seviyeye yakın. Satış kaybı yaşamamak için hızlı aksiyon gerekli.",
  },
  {
    id: 3,
    title: "Bekleme süresi şikayetleri için rezervasyon akışı değişsin mi?",
    area: "Operasyon",
    urgency: "Orta",
    impactScore: 74,
    confidenceScore: 68,
    owner: "Operasyon",
    dueDate: "2026-06-30",
    status: "İnceleniyor",
    recommendedAction:
      "Yoğun saatlerde masa dönüş süresi ve rezervasyon aralığı yeniden planlansın.",
    reason:
      "Geri bildirimlerde bekleme süresi öne çıkıyor. Küçük operasyon düzenlemesi memnuniyeti artırabilir.",
  },
];

function getDecisionScore(decision) {
  return (
    Number(decision.impactScore) * 0.6 +
    Number(decision.confidenceScore) * 0.4
  );
}

function getStatusClass(status) {
  if (status === "Aksiyon Alındı") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "Karar Bekliyor") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (status === "İnceleniyor") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (status === "Ertelendi") {
    return "bg-gray-50 text-gray-700 border-gray-200";
  }

  return "bg-red-50 text-red-700 border-red-200";
}

function getUrgencyClass(urgency) {
  if (urgency === "Yüksek") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (urgency === "Orta") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

function getAreaClass(area) {
  if (area === "Finans") {
    return "bg-[#fff7e7] text-[#9c7439] border-[#c9a45c]/30";
  }

  if (area === "Stok") {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }

  if (area === "Pazarlama") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  if (area === "Operasyon") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (area === "Müşteri") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

function getScoreClass(score) {
  if (score >= 85) {
    return "bg-emerald-500";
  }

  if (score >= 70) {
    return "bg-blue-500";
  }

  if (score >= 55) {
    return "bg-amber-500";
  }

  return "bg-red-500";
}

function getDecisionLabel(score) {
  if (score >= 85) {
    return {
      label: "Güçlü Aksiyon",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  if (score >= 70) {
    return {
      label: "Mantıklı",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    };
  }

  if (score >= 55) {
    return {
      label: "Dikkatli İncele",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  return {
    label: "Riskli",
    className: "bg-red-50 text-red-700 border-red-200",
  };
}

export default function DecisionCenter() {
  const [decisions, setDecisions] = useState(initialDecisions);

  const [form, setForm] = useState({
    title: "",
    area: "",
    urgency: "Orta",
    impactScore: "",
    confidenceScore: "",
    owner: "",
    dueDate: "",
    status: "İnceleniyor",
    recommendedAction: "",
    reason: "",
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

    const newDecision = {
      id: Date.now(),
      title: form.title,
      area: form.area,
      urgency: form.urgency,
      impactScore: Number(form.impactScore || 0),
      confidenceScore: Number(form.confidenceScore || 0),
      owner: form.owner,
      dueDate: form.dueDate,
      status: form.status,
      recommendedAction: form.recommendedAction,
      reason: form.reason,
    };

    setDecisions((prev) => [newDecision, ...prev]);

    setForm({
      title: "",
      area: "",
      urgency: "Orta",
      impactScore: "",
      confidenceScore: "",
      owner: "",
      dueDate: "",
      status: "İnceleniyor",
      recommendedAction: "",
      reason: "",
    });
  }

  function updateStatus(id, nextStatus) {
    setDecisions((prev) =>
      prev.map((decision) =>
        decision.id === id ? { ...decision, status: nextStatus } : decision
      )
    );
  }

  function updateUrgency(id, nextUrgency) {
    setDecisions((prev) =>
      prev.map((decision) =>
        decision.id === id ? { ...decision, urgency: nextUrgency } : decision
      )
    );
  }

  const totalDecisions = decisions.length;

  const waitingDecisions = decisions.filter(
    (decision) => decision.status === "Karar Bekliyor"
  ).length;

  const actionTaken = decisions.filter(
    (decision) => decision.status === "Aksiyon Alındı"
  ).length;

  const highUrgency = decisions.filter(
    (decision) => decision.urgency === "Yüksek"
  ).length;

  const averageDecisionScore =
    decisions.length === 0
      ? 0
      : decisions.reduce(
          (total, decision) => total + getDecisionScore(decision),
          0
        ) / decisions.length;

  const areas = [...new Set(decisions.map((decision) => decision.area))];

  const topDecision = [...decisions].sort(
    (a, b) => getDecisionScore(b) - getDecisionScore(a)
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
              Karar Destek
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Finans, stok, pazarlama, operasyon ve müşteri tarafındaki karar
              başlıklarını etki, güven, aciliyet ve aksiyon durumuyla yönet.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Karar Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Karar</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalDecisions}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Karar Bekliyor</p>
          <h3 className="mt-3 text-2xl font-semibold text-amber-700">
            {waitingDecisions}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Yüksek aciliyet: {highUrgency}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Aksiyon Alındı</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {actionTaken}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Ortalama Skor</p>
          <h3 className="mt-3 text-2xl font-semibold text-blue-700">
            {averageDecisionScore.toFixed(1)}
          </h3>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Karar Başlığı Ekle
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Etki ve güven skoru girildiğinde karar önceliği otomatik
            hesaplanır.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Karar başlığı"
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
            <option value="Stok">Stok</option>
            <option value="Pazarlama">Pazarlama</option>
            <option value="Operasyon">Operasyon</option>
            <option value="Müşteri">Müşteri</option>
            <option value="Ekip">Ekip</option>
          </select>

          <select
            name="urgency"
            value={form.urgency}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Düşük">Düşük</option>
            <option value="Orta">Orta</option>
            <option value="Yüksek">Yüksek</option>
          </select>

          <input
            name="impactScore"
            value={form.impactScore}
            onChange={handleChange}
            placeholder="Etki skoru 0-100"
            type="number"
            min="0"
            max="100"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="confidenceScore"
            value={form.confidenceScore}
            onChange={handleChange}
            placeholder="Güven skoru 0-100"
            type="number"
            min="0"
            max="100"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="owner"
            value={form.owner}
            onChange={handleChange}
            placeholder="Aksiyon sahibi"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            type="date"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="İnceleniyor">İnceleniyor</option>
            <option value="Karar Bekliyor">Karar Bekliyor</option>
            <option value="Aksiyon Alındı">Aksiyon Alındı</option>
            <option value="Ertelendi">Ertelendi</option>
            <option value="İptal">İptal</option>
          </select>

          <input
            name="recommendedAction"
            value={form.recommendedAction}
            onChange={handleChange}
            placeholder="Önerilen aksiyon"
            className="col-span-3 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <textarea
            name="reason"
            value={form.reason}
            onChange={handleChange}
            placeholder="Karar gerekçesi / veri notu"
            rows="3"
            className="col-span-4 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Karar Başlığı Ekle
          </button>
        </div>
      </form>

      <div className="grid grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
          <div className="border-b border-[#eadfce] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#211914]">
              Karar Listesi
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Karar skoru; etki skorunun %60’ı ve güven skorunun %40’ı ile
              hesaplanır.
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
              <tr>
                <th className="px-6 py-4">Karar</th>
                <th className="px-6 py-4">Alan</th>
                <th className="px-6 py-4">Aciliyet</th>
                <th className="px-6 py-4">Skor</th>
                <th className="px-6 py-4">Öneri</th>
                <th className="px-6 py-4 text-right">Durum</th>
              </tr>
            </thead>

            <tbody>
              {decisions.map((decision) => {
                const score = getDecisionScore(decision);
                const decisionLabel = getDecisionLabel(score);

                return (
                  <tr
                    key={decision.id}
                    className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#211914]">
                        {decision.title}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Sorumlu: {decision.owner} / Son tarih:{" "}
                        {decision.dueDate}
                      </p>

                      <p className="mt-2 max-w-[360px] text-xs leading-5 text-[#7d6b5a]">
                        {decision.reason}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getAreaClass(
                          decision.area
                        )}`}
                      >
                        {decision.area}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={decision.urgency}
                        onChange={(event) =>
                          updateUrgency(decision.id, event.target.value)
                        }
                        className={`rounded-xl border px-3 py-2 text-xs outline-none ${getUrgencyClass(
                          decision.urgency
                        )}`}
                      >
                        <option value="Düşük">Düşük</option>
                        <option value="Orta">Orta</option>
                        <option value="Yüksek">Yüksek</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-[#211914]">
                        {score.toFixed(1)}
                      </p>

                      <div className="mt-2 h-2 w-28 overflow-hidden rounded-full bg-[#f0e6d7]">
                        <div
                          className={`h-full rounded-full ${getScoreClass(
                            score
                          )}`}
                          style={{ width: `${Math.min(score, 100)}%` }}
                        />
                      </div>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Etki: {decision.impactScore} / Güven:{" "}
                        {decision.confidenceScore}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${decisionLabel.className}`}
                      >
                        {decisionLabel.label}
                      </span>

                      <p className="mt-3 max-w-[280px] text-xs leading-5 text-[#7d6b5a]">
                        {decision.recommendedAction}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <select
                        value={decision.status}
                        onChange={(event) =>
                          updateStatus(decision.id, event.target.value)
                        }
                        className={`rounded-xl border px-3 py-2 text-xs outline-none ${getStatusClass(
                          decision.status
                        )}`}
                      >
                        <option value="İnceleniyor">İnceleniyor</option>
                        <option value="Karar Bekliyor">Karar Bekliyor</option>
                        <option value="Aksiyon Alındı">Aksiyon Alındı</option>
                        <option value="Ertelendi">Ertelendi</option>
                        <option value="İptal">İptal</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          {topDecision && (
            <div className="rounded-3xl border border-[#c9a45c]/30 bg-[#211914] p-6 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e6c57a]">
                En Öncelikli Karar
              </p>

              <h2 className="mt-3 text-xl font-semibold text-white">
                {topDecision.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#d8c7ad]">
                {topDecision.recommendedAction}
              </p>

              <div className="mt-5 rounded-2xl border border-[#e6c57a]/20 bg-white/5 p-4">
                <p className="text-xs text-[#d8c7ad]">Karar skoru</p>
                <p className="mt-1 text-2xl font-semibold text-[#e6c57a]">
                  {getDecisionScore(topDecision).toFixed(1)}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Alan Özeti
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Karar başlıklarının alan bazlı dağılımı.
            </p>

            <div className="mt-6 space-y-4">
              {areas.map((area) => {
                const areaDecisions = decisions.filter(
                  (decision) => decision.area === area
                );

                const areaAverage =
                  areaDecisions.length === 0
                    ? 0
                    : areaDecisions.reduce(
                        (total, decision) =>
                          total + getDecisionScore(decision),
                        0
                      ) / areaDecisions.length;

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
                        {areaAverage.toFixed(1)}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-[#8a7560]">
                      Karar sayısı: {areaDecisions.length}
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
              Bu ekran ileride KPI, stok, pazarlama, finans ve müşteri
              verilerini birleştirerek karar önerilerini otomatik
              puanlayacak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}