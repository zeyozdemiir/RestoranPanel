import { useState } from "react";

const initialExports = [
  {
    id: 1,
    reportName: "Haftalık Finans Özeti",
    moduleName: "Finans",
    reportType: "Özet Rapor",
    format: "PDF",
    startDate: "2026-06-20",
    endDate: "2026-06-27",
    owner: "Yönetim",
    frequency: "Haftalık",
    status: "Hazır",
    fileSize: 4.8,
    lastExported: "2026-06-27",
    note: "Ciro, maliyet, kâr ve nakit akışı özetini içerir.",
  },
  {
    id: 2,
    reportName: "Stok Kritik Ürünler",
    moduleName: "Stok",
    reportType: "Detay Rapor",
    format: "Excel",
    startDate: "2026-06-01",
    endDate: "2026-06-27",
    owner: "Mutfak",
    frequency: "Günlük",
    status: "Oluşturuluyor",
    fileSize: 2.1,
    lastExported: "2026-06-27",
    note: "Kritik stok, eksik ürün, zayi ve satın alma talebi karşılaştırması.",
  },
  {
    id: 3,
    reportName: "Müşteri Geri Bildirimleri",
    moduleName: "Müşteri",
    reportType: "Analiz Raporu",
    format: "PDF",
    startDate: "2026-06-01",
    endDate: "2026-06-27",
    owner: "Operasyon",
    frequency: "Aylık",
    status: "Kontrol Bekliyor",
    fileSize: 3.4,
    lastExported: "2026-06-26",
    note: "Google, Instagram, Yemeksepeti ve restoran içi yorumları içerir.",
  },
];

function getStatusClass(status) {
  if (status === "Hazır") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "Oluşturuluyor") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (status === "Kontrol Bekliyor") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (status === "Hata") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

function getModuleClass(moduleName) {
  if (moduleName === "Finans") {
    return "bg-[#fff7e7] text-[#9c7439] border-[#c9a45c]/30";
  }

  if (moduleName === "Stok") {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }

  if (moduleName === "Müşteri") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  if (moduleName === "Ekip") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (moduleName === "Operasyon") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

function getFormatClass(format) {
  if (format === "PDF") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (format === "Excel") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (format === "CSV") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

function getFrequencyClass(frequency) {
  if (frequency === "Günlük") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (frequency === "Haftalık") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  if (frequency === "Aylık") {
    return "bg-[#fff7e7] text-[#9c7439] border-[#c9a45c]/30";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

export default function Reports() {
  const [exportsList, setExportsList] = useState(initialExports);

  const [form, setForm] = useState({
    reportName: "",
    moduleName: "",
    reportType: "",
    format: "",
    startDate: "",
    endDate: "",
    owner: "",
    frequency: "Tek Seferlik",
    status: "Oluşturuluyor",
    fileSize: "",
    lastExported: "",
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

    const newExport = {
      id: Date.now(),
      reportName: form.reportName,
      moduleName: form.moduleName,
      reportType: form.reportType,
      format: form.format,
      startDate: form.startDate,
      endDate: form.endDate,
      owner: form.owner,
      frequency: form.frequency,
      status: form.status,
      fileSize: Number(form.fileSize || 0),
      lastExported: form.lastExported,
      note: form.note,
    };

    setExportsList((prev) => [newExport, ...prev]);

    setForm({
      reportName: "",
      moduleName: "",
      reportType: "",
      format: "",
      startDate: "",
      endDate: "",
      owner: "",
      frequency: "Tek Seferlik",
      status: "Oluşturuluyor",
      fileSize: "",
      lastExported: "",
      note: "",
    });
  }

  function updateStatus(id, nextStatus) {
    setExportsList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item
      )
    );
  }

  function updateFormat(id, nextFormat) {
    setExportsList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, format: nextFormat } : item
      )
    );
  }

  const totalExports = exportsList.length;

  const readyExports = exportsList.filter(
    (item) => item.status === "Hazır"
  ).length;

  const pendingExports = exportsList.filter(
    (item) =>
      item.status === "Oluşturuluyor" || item.status === "Kontrol Bekliyor"
  ).length;

  const errorExports = exportsList.filter(
    (item) => item.status === "Hata"
  ).length;

  const totalFileSize = exportsList.reduce(
    (total, item) => total + Number(item.fileSize),
    0
  );

  const modules = [...new Set(exportsList.map((item) => item.moduleName))];

  const latestExport = [...exportsList].sort(
    (a, b) => new Date(b.lastExported) - new Date(a.lastExported)
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
              Raporlar & Export
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Finans, stok, ekip, müşteri ve operasyon raporlarını PDF, Excel
              veya CSV formatında dışa aktarmak için rapor kayıtlarını buradan
              yönet.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Yeni Export Paketi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Rapor</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalExports}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Hazır: {readyExports}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Bekleyen Export</p>
          <h3 className="mt-3 text-2xl font-semibold text-amber-700">
            {pendingExports}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Hatalı Rapor</p>
          <h3 className="mt-3 text-2xl font-semibold text-red-700">
            {errorExports}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Dosya Boyutu</p>
          <h3 className="mt-3 text-2xl font-semibold text-blue-700">
            {totalFileSize.toFixed(1)} MB
          </h3>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Rapor Export Kaydı Ekle
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Hangi modülün, hangi tarih aralığında ve hangi formatta dışa
            aktarılacağını buradan kaydet.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="reportName"
            value={form.reportName}
            onChange={handleChange}
            placeholder="Rapor adı"
            className="col-span-2 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="moduleName"
            value={form.moduleName}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Modül seç</option>
            <option value="Finans">Finans</option>
            <option value="Stok">Stok</option>
            <option value="Müşteri">Müşteri</option>
            <option value="Ekip">Ekip</option>
            <option value="Operasyon">Operasyon</option>
            <option value="Menü">Menü</option>
          </select>

          <select
            name="reportType"
            value={form.reportType}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Rapor tipi seç</option>
            <option value="Özet Rapor">Özet Rapor</option>
            <option value="Detay Rapor">Detay Rapor</option>
            <option value="Analiz Raporu">Analiz Raporu</option>
            <option value="Muhasebe Paketi">Muhasebe Paketi</option>
          </select>

          <select
            name="format"
            value={form.format}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Format seç</option>
            <option value="PDF">PDF</option>
            <option value="Excel">Excel</option>
            <option value="CSV">CSV</option>
          </select>

          <select
            name="frequency"
            value={form.frequency}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Tek Seferlik">Tek Seferlik</option>
            <option value="Günlük">Günlük</option>
            <option value="Haftalık">Haftalık</option>
            <option value="Aylık">Aylık</option>
          </select>

          <input
            name="owner"
            value={form.owner}
            onChange={handleChange}
            placeholder="Sorumlu kişi / ekip"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Oluşturuluyor">Oluşturuluyor</option>
            <option value="Kontrol Bekliyor">Kontrol Bekliyor</option>
            <option value="Hazır">Hazır</option>
            <option value="Hata">Hata</option>
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
            name="lastExported"
            value={form.lastExported}
            onChange={handleChange}
            type="date"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="fileSize"
            value={form.fileSize}
            onChange={handleChange}
            placeholder="Dosya boyutu MB"
            type="number"
            step="0.1"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Rapor notu"
            className="col-span-4 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Export Kaydı Ekle
          </button>
        </div>
      </form>

      <div className="grid grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
          <div className="border-b border-[#eadfce] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#211914]">
              Export Listesi
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Rapor formatı, durumu ve tarih aralığı buradan kontrol edilir.
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
              <tr>
                <th className="px-6 py-4">Rapor</th>
                <th className="px-6 py-4">Modül</th>
                <th className="px-6 py-4">Format</th>
                <th className="px-6 py-4">Tarih</th>
                <th className="px-6 py-4">Dosya</th>
                <th className="px-6 py-4 text-right">Durum</th>
              </tr>
            </thead>

            <tbody>
              {exportsList.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#211914]">
                      {item.reportName}
                    </p>

                    <p className="mt-1 text-xs text-[#8a7560]">
                      {item.reportType} / Sorumlu: {item.owner}
                    </p>

                    {item.note && (
                      <p className="mt-2 max-w-[360px] text-xs leading-5 text-[#7d6b5a]">
                        {item.note}
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${getModuleClass(
                        item.moduleName
                      )}`}
                    >
                      {item.moduleName}
                    </span>

                    <span
                      className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getFrequencyClass(
                        item.frequency
                      )}`}
                    >
                      {item.frequency}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <select
                      value={item.format}
                      onChange={(event) =>
                        updateFormat(item.id, event.target.value)
                      }
                      className={`rounded-xl border px-3 py-2 text-xs outline-none ${getFormatClass(
                        item.format
                      )}`}
                    >
                      <option value="PDF">PDF</option>
                      <option value="Excel">Excel</option>
                      <option value="CSV">CSV</option>
                    </select>
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    <p>{item.startDate}</p>
                    <p>{item.endDate}</p>
                    <p className="mt-1 text-xs text-[#8a7560]">
                      Son export: {item.lastExported}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-[#211914]">
                      {Number(item.fileSize).toFixed(1)} MB
                    </p>

                    <button className="mt-2 rounded-full border border-[#dfd0b8] px-3 py-1 text-xs font-medium text-[#9c7439] transition hover:border-[#c9a45c] hover:bg-[#fff7e7]">
                      Dosya Oluştur
                    </button>
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
                      <option value="Oluşturuluyor">Oluşturuluyor</option>
                      <option value="Kontrol Bekliyor">Kontrol Bekliyor</option>
                      <option value="Hazır">Hazır</option>
                      <option value="Hata">Hata</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          {latestExport && (
            <div className="rounded-3xl border border-[#c9a45c]/30 bg-[#211914] p-6 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e6c57a]">
                Son Export
              </p>

              <h2 className="mt-3 text-xl font-semibold text-white">
                {latestExport.reportName}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#d8c7ad]">
                {latestExport.note}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#e6c57a]/20 bg-white/5 p-4">
                  <p className="text-xs text-[#d8c7ad]">Format</p>
                  <p className="mt-1 text-lg font-semibold text-[#e6c57a]">
                    {latestExport.format}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e6c57a]/20 bg-white/5 p-4">
                  <p className="text-xs text-[#d8c7ad]">Durum</p>
                  <p className="mt-1 text-lg font-semibold text-[#e6c57a]">
                    {latestExport.status}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Modül Özeti
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Raporların modül bazlı dağılımı.
            </p>

            <div className="mt-6 space-y-4">
              {modules.map((moduleName) => {
                const moduleReports = exportsList.filter(
                  (item) => item.moduleName === moduleName
                );

                const moduleReady = moduleReports.filter(
                  (item) => item.status === "Hazır"
                ).length;

                return (
                  <div key={moduleName} className="rounded-2xl bg-[#fbf8f3] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getModuleClass(
                          moduleName
                        )}`}
                      >
                        {moduleName}
                      </span>

                      <span className="text-sm font-semibold text-[#211914]">
                        {moduleReports.length} rapor
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-[#8a7560]">
                      Hazır rapor: {moduleReady}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Export Notu
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#7d6b5a]">
              Bu ekran ileride gerçek backend bağlantısıyla PDF, Excel ve CSV
              dosyalarını otomatik oluşturup indirme bağlantısı verecek.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}