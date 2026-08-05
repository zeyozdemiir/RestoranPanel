import { useState } from "react";

const initialReports = [
  {
    id: 1,
    reportDate: "2026-06-27",
    shift: "Tüm Gün",
    source: "Adisyo",
    totalRevenue: 128500,
    cashRevenue: 24500,
    cardRevenue: 82000,
    onlineRevenue: 22000,
    discountTotal: 4500,
    refundTotal: 1200,
    guestCount: 164,
    orderCount: 98,
    uploadedBy: "Yönetim",
    fileName: "adisyo-27-06-2026.pdf",
    status: "Kontrol Edildi",
    note: "Gün sonu cirosu kasa ve POS toplamlarıyla eşleştirildi.",
  },
  {
    id: 2,
    reportDate: "2026-06-26",
    shift: "Akşam",
    source: "POS",
    totalRevenue: 96300,
    cashRevenue: 18600,
    cardRevenue: 64100,
    onlineRevenue: 13600,
    discountTotal: 2800,
    refundTotal: 0,
    guestCount: 112,
    orderCount: 74,
    uploadedBy: "Operasyon",
    fileName: "pos-aksam-26-06.xlsx",
    status: "Kontrol Bekliyor",
    note: "Kart toplamı banka hareketleriyle karşılaştırılacak.",
  },
  {
    id: 3,
    reportDate: "2026-06-25",
    shift: "Tüm Gün",
    source: "Manuel",
    totalRevenue: 74200,
    cashRevenue: 15400,
    cardRevenue: 50100,
    onlineRevenue: 8700,
    discountTotal: 1500,
    refundTotal: 600,
    guestCount: 96,
    orderCount: 63,
    uploadedBy: "Kasa",
    fileName: "manuel-gun-sonu",
    status: "Eksik Bilgi",
    note: "Online satış detayı sonradan girilecek.",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function getNetRevenue(report) {
  return (
    Number(report.totalRevenue) -
    Number(report.discountTotal) -
    Number(report.refundTotal)
  );
}

function getAverageBasket(report) {
  if (Number(report.orderCount) === 0) return 0;

  return Number(report.totalRevenue) / Number(report.orderCount);
}

function getPaymentTotal(report) {
  return (
    Number(report.cashRevenue) +
    Number(report.cardRevenue) +
    Number(report.onlineRevenue)
  );
}

function getPaymentDifference(report) {
  return Number(report.totalRevenue) - getPaymentTotal(report);
}

function getStatusClass(status) {
  if (status === "Kontrol Edildi") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "Kontrol Bekliyor") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (status === "Eksik Bilgi") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-blue-50 text-blue-700 border-blue-200";
}

function getSourceClass(source) {
  if (source === "Adisyo") {
    return "bg-[#fff7e7] text-[#9c7439] border-[#c9a45c]/30";
  }

  if (source === "POS") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (source === "Yemeksepeti") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (source === "Getir") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

function getShiftClass(shift) {
  if (shift === "Sabah") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (shift === "Öğlen") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (shift === "Akşam") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  return "bg-[#fff7e7] text-[#9c7439] border-[#c9a45c]/30";
}

export default function AdisyoImport() {
  const [reports, setReports] = useState(initialReports);

  const [form, setForm] = useState({
    reportDate: "",
    shift: "Tüm Gün",
    source: "Adisyo",
    totalRevenue: "",
    cashRevenue: "",
    cardRevenue: "",
    onlineRevenue: "",
    discountTotal: "",
    refundTotal: "",
    guestCount: "",
    orderCount: "",
    uploadedBy: "",
    fileName: "",
    status: "Kontrol Bekliyor",
    note: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setForm((prev) => ({
      ...prev,
      fileName: file.name,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const newReport = {
      id: Date.now(),
      reportDate: form.reportDate,
      shift: form.shift,
      source: form.source,
      totalRevenue: Number(form.totalRevenue || 0),
      cashRevenue: Number(form.cashRevenue || 0),
      cardRevenue: Number(form.cardRevenue || 0),
      onlineRevenue: Number(form.onlineRevenue || 0),
      discountTotal: Number(form.discountTotal || 0),
      refundTotal: Number(form.refundTotal || 0),
      guestCount: Number(form.guestCount || 0),
      orderCount: Number(form.orderCount || 0),
      uploadedBy: form.uploadedBy,
      fileName: form.fileName || "Dosya seçilmedi",
      status: form.status,
      note: form.note,
    };

    setReports((prev) =>
      [newReport, ...prev].sort(
        (a, b) => new Date(b.reportDate) - new Date(a.reportDate)
      )
    );

    setForm({
      reportDate: "",
      shift: "Tüm Gün",
      source: "Adisyo",
      totalRevenue: "",
      cashRevenue: "",
      cardRevenue: "",
      onlineRevenue: "",
      discountTotal: "",
      refundTotal: "",
      guestCount: "",
      orderCount: "",
      uploadedBy: "",
      fileName: "",
      status: "Kontrol Bekliyor",
      note: "",
    });
  }

  function updateStatus(id, nextStatus) {
    setReports((prev) =>
      prev.map((report) =>
        report.id === id ? { ...report, status: nextStatus } : report
      )
    );
  }

  const sortedReports = [...reports].sort(
    (a, b) => new Date(b.reportDate) - new Date(a.reportDate)
  );

  const totalRevenue = reports.reduce(
    (total, report) => total + Number(report.totalRevenue),
    0
  );

  const totalNetRevenue = reports.reduce(
    (total, report) => total + getNetRevenue(report),
    0
  );

  const totalCash = reports.reduce(
    (total, report) => total + Number(report.cashRevenue),
    0
  );

  const totalCard = reports.reduce(
    (total, report) => total + Number(report.cardRevenue),
    0
  );

  const totalOnline = reports.reduce(
    (total, report) => total + Number(report.onlineRevenue),
    0
  );

  const totalOrders = reports.reduce(
    (total, report) => total + Number(report.orderCount),
    0
  );

  const averageBasket = totalOrders === 0 ? 0 : totalRevenue / totalOrders;

  const waitingReports = reports.filter(
    (report) =>
      report.status === "Kontrol Bekliyor" || report.status === "Eksik Bilgi"
  ).length;

  const latestReport = sortedReports[0];

  const sources = [...new Set(reports.map((report) => report.source))];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Her Gün
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Adisyo Rapor Yükle
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Günlük satış raporlarını, ödeme kırılımlarını, toplam ciroyu,
              indirimleri, iadeleri ve sipariş sayılarını tek ekranda takip et.
              Gerçek dosya okuma işlemi backend tarafında bağlanacak.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Gün Sonu Kontrolü
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Ciro</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {formatCurrency(totalRevenue)}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Net: {formatCurrency(totalNetRevenue)}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Nakit</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {formatCurrency(totalCash)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Kart</p>
          <h3 className="mt-3 text-2xl font-semibold text-blue-700">
            {formatCurrency(totalCard)}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Online: {formatCurrency(totalOnline)}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Ortalama Sepet</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#9c7439]">
            {formatCurrency(averageBasket)}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Kontrol bekleyen: {waitingReports}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Satış Raporu Ekle
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Şimdilik rapor bilgilerini manuel giriyoruz. Backend bağlanınca
            dosya yüklendiğinde bu alanlar otomatik dolacak.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="reportDate"
            value={form.reportDate}
            onChange={handleChange}
            type="date"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="shift"
            value={form.shift}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Sabah">Sabah</option>
            <option value="Öğlen">Öğlen</option>
            <option value="Akşam">Akşam</option>
            <option value="Tüm Gün">Tüm Gün</option>
          </select>

          <select
            name="source"
            value={form.source}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Adisyo">Adisyo</option>
            <option value="POS">POS</option>
            <option value="Yemeksepeti">Yemeksepeti</option>
            <option value="Getir">Getir</option>
            <option value="Manuel">Manuel</option>
          </select>

          <input
            name="uploadedBy"
            value={form.uploadedBy}
            onChange={handleChange}
            placeholder="Yükleyen kişi / ekip"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="totalRevenue"
            value={form.totalRevenue}
            onChange={handleChange}
            placeholder="Toplam ciro"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="cashRevenue"
            value={form.cashRevenue}
            onChange={handleChange}
            placeholder="Nakit"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="cardRevenue"
            value={form.cardRevenue}
            onChange={handleChange}
            placeholder="Kart"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="onlineRevenue"
            value={form.onlineRevenue}
            onChange={handleChange}
            placeholder="Online satış"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="discountTotal"
            value={form.discountTotal}
            onChange={handleChange}
            placeholder="İndirim toplamı"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="refundTotal"
            value={form.refundTotal}
            onChange={handleChange}
            placeholder="İade toplamı"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="guestCount"
            value={form.guestCount}
            onChange={handleChange}
            placeholder="Misafir sayısı"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="orderCount"
            value={form.orderCount}
            onChange={handleChange}
            placeholder="Sipariş sayısı"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Kontrol Bekliyor">Kontrol Bekliyor</option>
            <option value="Kontrol Edildi">Kontrol Edildi</option>
            <option value="Eksik Bilgi">Eksik Bilgi</option>
            <option value="Aktarıldı">Aktarıldı</option>
          </select>

          <label className="col-span-2 flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-[#c9a45c]/50 bg-[#fffaf1] px-4 py-3 text-sm text-[#7d6b5a] transition hover:bg-[#fff4df]">
            <span>{form.fileName || "PDF / Excel / CSV dosyası seç"}</span>

            <input
              type="file"
              accept=".pdf,.xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Rapor notu"
            className="col-span-2 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Satış Raporu Ekle
          </button>
        </div>
      </form>

      <div className="grid grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
          <div className="border-b border-[#eadfce] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#211914]">
              Yüklenen Satış Raporları
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Toplam ciro, ödeme kırılımı, net ciro ve ödeme farkı buradan
              kontrol edilir.
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
              <tr>
                <th className="px-6 py-4">Rapor</th>
                <th className="px-6 py-4">Kaynak</th>
                <th className="px-6 py-4">Ciro</th>
                <th className="px-6 py-4">Ödeme</th>
                <th className="px-6 py-4">Sipariş</th>
                <th className="px-6 py-4 text-right">Durum</th>
              </tr>
            </thead>

            <tbody>
              {sortedReports.map((report) => {
                const netRevenue = getNetRevenue(report);
                const paymentDifference = getPaymentDifference(report);
                const averageReportBasket = getAverageBasket(report);

                return (
                  <tr
                    key={report.id}
                    className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#211914]">
                        {formatDate(report.reportDate)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Dosya: {report.fileName}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Yükleyen: {report.uploadedBy}
                      </p>

                      {report.note && (
                        <p className="mt-2 max-w-[360px] text-xs leading-5 text-[#7d6b5a]">
                          {report.note}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getSourceClass(
                          report.source
                        )}`}
                      >
                        {report.source}
                      </span>

                      <span
                        className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getShiftClass(
                          report.shift
                        )}`}
                      >
                        {report.shift}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-[#211914]">
                        {formatCurrency(report.totalRevenue)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Net: {formatCurrency(netRevenue)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        İndirim: {formatCurrency(report.discountTotal)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        İade: {formatCurrency(report.refundTotal)}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs text-[#8a7560]">
                        Nakit: {formatCurrency(report.cashRevenue)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Kart: {formatCurrency(report.cardRevenue)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Online: {formatCurrency(report.onlineRevenue)}
                      </p>

                      <p
                        className={`mt-2 text-xs font-semibold ${
                          paymentDifference === 0
                            ? "text-emerald-700"
                            : "text-red-700"
                        }`}
                      >
                        Fark: {formatCurrency(paymentDifference)}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-[#211914]">
                        {report.orderCount} sipariş
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Misafir: {report.guestCount}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Ortalama: {formatCurrency(averageReportBasket)}
                      </p>
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
                        <option value="Kontrol Bekliyor">Kontrol Bekliyor</option>
                        <option value="Kontrol Edildi">Kontrol Edildi</option>
                        <option value="Eksik Bilgi">Eksik Bilgi</option>
                        <option value="Aktarıldı">Aktarıldı</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          {latestReport && (
            <div className="rounded-3xl border border-[#c9a45c]/30 bg-[#211914] p-6 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e6c57a]">
                Son Yüklenen Rapor
              </p>

              <h2 className="mt-3 text-xl font-semibold text-white">
                {formatDate(latestReport.reportDate)}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#d8c7ad]">
                {latestReport.note}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#e6c57a]/20 bg-white/5 p-4">
                  <p className="text-xs text-[#d8c7ad]">Ciro</p>
                  <p className="mt-1 text-lg font-semibold text-[#e6c57a]">
                    {formatCurrency(latestReport.totalRevenue)}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e6c57a]/20 bg-white/5 p-4">
                  <p className="text-xs text-[#d8c7ad]">Durum</p>
                  <p className="mt-1 text-lg font-semibold text-[#e6c57a]">
                    {latestReport.status}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Ödeme Kırılımı
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Tüm raporlardaki ödeme tipleri toplamı.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-[#fbf8f3] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#8a7560]">Nakit</p>
                  <p className="font-semibold text-emerald-700">
                    {formatCurrency(totalCash)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#fbf8f3] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#8a7560]">Kart</p>
                  <p className="font-semibold text-blue-700">
                    {formatCurrency(totalCard)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#fbf8f3] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#8a7560]">Online</p>
                  <p className="font-semibold text-purple-700">
                    {formatCurrency(totalOnline)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Kaynak Özeti
            </h2>

            <div className="mt-6 space-y-4">
              {sources.map((source) => {
                const sourceReports = reports.filter(
                  (report) => report.source === source
                );

                const sourceRevenue = sourceReports.reduce(
                  (total, report) => total + Number(report.totalRevenue),
                  0
                );

                return (
                  <div key={source} className="rounded-2xl bg-[#fbf8f3] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getSourceClass(
                          source
                        )}`}
                      >
                        {source}
                      </span>

                      <span className="text-sm font-semibold text-[#211914]">
                        {sourceReports.length} rapor
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-[#8a7560]">
                      Ciro: {formatCurrency(sourceRevenue)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Backend Notu
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#7d6b5a]">
              Şimdilik dosya adı frontend’de tutuluyor. Backend bağlandığında
              PDF, Excel veya CSV dosyası okunup ciro, ödeme tipi ve sipariş
              bilgileri otomatik doldurulacak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}