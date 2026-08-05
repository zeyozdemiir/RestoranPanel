import { useState } from "react";

const initialReports = [
  {
    id: 1,
    reportName: "Günlük Ciro Özeti",
    category: "Finans",
    period: "Günlük",
    owner: "Yönetim",
    lastUpdated: "2026-06-27",
    status: "Hazır",
    priority: "Yüksek",
    revenue: 185000,
    cost: 82000,
    insight:
      "Akşam servisi ve kokteyl satışları ciroyu yukarı taşıdı. Brunch rezervasyonu için ayrıca takip önerilir.",
  },
  {
    id: 2,
    reportName: "Stok Kritik Ürünler",
    category: "Stok",
    period: "Günlük",
    owner: "Mutfak",
    lastUpdated: "2026-06-27",
    status: "Aksiyon Gerekli",
    priority: "Yüksek",
    revenue: 0,
    cost: 26500,
    insight:
      "Kritik seviyeye yaklaşan ürünler satın alma talebiyle ilişkilendirilmeli.",
  },
  {
    id: 3,
    reportName: "Müşteri Memnuniyeti",
    category: "Müşteri",
    period: "Haftalık",
    owner: "Operasyon",
    lastUpdated: "2026-06-24",
    status: "İnceleniyor",
    priority: "Orta",
    revenue: 0,
    cost: 0,
    insight:
      "Google ve Instagram yorumlarında servis olumlu, bekleme süresi için operasyon aksiyonu gerekli.",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function getProfit(report) {
  return Number(report.revenue) - Number(report.cost);
}

function getProfitMargin(report) {
  if (Number(report.revenue) === 0) return 0;

  return (getProfit(report) / Number(report.revenue)) * 100;
}

function getStatusClass(status) {
  if (status === "Hazır") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "İnceleniyor") {
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

function getCategoryClass(category) {
  if (category === "Finans") {
    return "bg-[#fff7e7] text-[#9c7439] border-[#c9a45c]/30";
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

function getPriorityClass(priority) {
  if (priority === "Yüksek") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (priority === "Orta") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

export default function ReportsHub() {
  const [reports, setReports] = useState(initialReports);

  const [form, setForm] = useState({
    reportName: "",
    category: "",
    period: "",
    owner: "",
    lastUpdated: "",
    status: "Hazır",
    priority: "Orta",
    revenue: "",
    cost: "",
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

    const newReport = {
      id: Date.now(),
      reportName: form.reportName,
      category: form.category,
      period: form.period,
      owner: form.owner,
      lastUpdated: form.lastUpdated,
      status: form.status,
      priority: form.priority,
      revenue: Number(form.revenue || 0),
      cost: Number(form.cost || 0),
      insight: form.insight,
    };

    setReports((prev) => [newReport, ...prev]);

    setForm({
      reportName: "",
      category: "",
      period: "",
      owner: "",
      lastUpdated: "",
      status: "Hazır",
      priority: "Orta",
      revenue: "",
      cost: "",
      insight: "",
    });
  }

  function updateStatus(id, nextStatus) {
    setReports((prev) =>
      prev.map((report) =>
        report.id === id ? { ...report, status: nextStatus } : report
      )
    );
  }

  function updatePriority(id, nextPriority) {
    setReports((prev) =>
      prev.map((report) =>
        report.id === id ? { ...report, priority: nextPriority } : report
      )
    );
  }

  const totalReports = reports.length;

  const readyReports = reports.filter(
    (report) => report.status === "Hazır"
  ).length;

  const actionNeeded = reports.filter(
    (report) => report.status === "Aksiyon Gerekli"
  ).length;

  const highPriority = reports.filter(
    (report) => report.priority === "Yüksek"
  ).length;

  const totalRevenue = reports.reduce(
    (total, report) => total + Number(report.revenue),
    0
  );

  const totalCost = reports.reduce(
    (total, report) => total + Number(report.cost),
    0
  );

  const totalProfit = totalRevenue - totalCost;

  const categories = [...new Set(reports.map((report) => report.category))];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Strateji & Rapor
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Raporlar Merkezi
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Finans, stok, müşteri, ekip ve operasyon raporlarını tek merkezde
              topla; aksiyon gerektiren başlıkları yönetim ekranında öne çıkar.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Genel Rapor Al
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Rapor</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalReports}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">Hazır: {readyReports}</p>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Aksiyon Gerekli</p>
          <h3 className="mt-3 text-2xl font-semibold text-amber-700">
            {actionNeeded}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Yüksek öncelik: {highPriority}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Raporlanan Ciro</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {formatCurrency(totalRevenue)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Tahmini Kâr</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {formatCurrency(totalProfit)}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Maliyet: {formatCurrency(totalCost)}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Rapor Kaydı Ekle
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Rapor başlığı, kategori, dönem, sorumlu kişi ve yönetim içgörüsünü
            buradan kaydet.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="reportName"
            value={form.reportName}
            onChange={handleChange}
            placeholder="Rapor adı"
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
            <option value="Stok">Stok</option>
            <option value="Müşteri">Müşteri</option>
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
            name="lastUpdated"
            value={form.lastUpdated}
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
            <option value="Hazır">Hazır</option>
            <option value="İnceleniyor">İnceleniyor</option>
            <option value="Aksiyon Gerekli">Aksiyon Gerekli</option>
            <option value="Gecikti">Gecikti</option>
          </select>

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

          <input
            name="revenue"
            value={form.revenue}
            onChange={handleChange}
            placeholder="Ciro"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="cost"
            value={form.cost}
            onChange={handleChange}
            placeholder="Maliyet"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <textarea
            name="insight"
            value={form.insight}
            onChange={handleChange}
            placeholder="Yönetim içgörüsü / rapor notu"
            rows="3"
            className="col-span-3 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Rapor Kaydı Ekle
          </button>
        </div>
      </form>

      <div className="grid grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
          <div className="border-b border-[#eadfce] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#211914]">
              Rapor Listesi
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Rapor durumu ve önceliği yönetim takibi için güncellenebilir.
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
              <tr>
                <th className="px-6 py-4">Rapor</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Dönem</th>
                <th className="px-6 py-4">Finans</th>
                <th className="px-6 py-4">Öncelik</th>
                <th className="px-6 py-4 text-right">Durum</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#211914]">
                      {report.reportName}
                    </p>

                    <p className="mt-1 text-xs text-[#8a7560]">
                      Sorumlu: {report.owner} / Güncelleme:{" "}
                      {report.lastUpdated}
                    </p>

                    <p className="mt-2 max-w-[360px] text-xs leading-5 text-[#7d6b5a]">
                      {report.insight}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${getCategoryClass(
                        report.category
                      )}`}
                    >
                      {report.category}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {report.period}
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-emerald-700">
                      {formatCurrency(report.revenue)}
                    </p>

                    <p className="mt-1 text-xs text-[#8a7560]">
                      Maliyet: {formatCurrency(report.cost)}
                    </p>

                    <p className="mt-1 text-xs text-[#8a7560]">
                      Marj: %{getProfitMargin(report).toFixed(1)}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <select
                      value={report.priority}
                      onChange={(event) =>
                        updatePriority(report.id, event.target.value)
                      }
                      className={`rounded-xl border px-3 py-2 text-xs outline-none ${getPriorityClass(
                        report.priority
                      )}`}
                    >
                      <option value="Düşük">Düşük</option>
                      <option value="Orta">Orta</option>
                      <option value="Yüksek">Yüksek</option>
                    </select>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <select
                      value={report.status}
                      onChange={(event) =>
                        updateStatus(report.id, event.target.value)
                      }
                      className={`rounded-xl border px-3 py-2 text-xs outline-none ${getStatusClass(
                        report.status
                      )}`}
                    >
                      <option value="Hazır">Hazır</option>
                      <option value="İnceleniyor">İnceleniyor</option>
                      <option value="Aksiyon Gerekli">Aksiyon Gerekli</option>
                      <option value="Gecikti">Gecikti</option>
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
              Kategori Özeti
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Raporların kategori bazlı dağılımı.
            </p>

            <div className="mt-6 space-y-4">
              {categories.map((category) => {
                const categoryReports = reports.filter(
                  (report) => report.category === category
                );

                const categoryActionCount = categoryReports.filter(
                  (report) => report.status === "Aksiyon Gerekli"
                ).length;

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
                        {categoryReports.length} rapor
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-[#8a7560]">
                      Aksiyon gerekli: {categoryActionCount}
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
              Bu merkez ileride tüm modüllerden gelen gerçek verileri
              birleştirerek günlük yönetim ekranına ana karar başlıklarını
              taşıyacak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}