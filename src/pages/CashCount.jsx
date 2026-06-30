import { useState } from "react";

const initialCashCounts = [
  {
    id: 1,
    countDate: "2026-06-27",
    shift: "Tüm Gün",
    openingCash: 5000,
    cashSales: 24500,
    expectedCash: 27800,
    countedCash: 27650,
    posTotal: 82000,
    onlineTotal: 22000,
    expensesPaid: 1200,
    safeTransfer: 500,
    countedBy: "Yönetim",
    status: "Kontrol Edildi",
    note: "Nakit kasa küçük farkla kapandı. POS toplamı Adisyo raporuyla eşleşti.",
  },
  {
    id: 2,
    countDate: "2026-06-26",
    shift: "Akşam",
    openingCash: 3000,
    cashSales: 18600,
    expectedCash: 20800,
    countedCash: 20800,
    posTotal: 64100,
    onlineTotal: 13600,
    expensesPaid: 800,
    safeTransfer: 0,
    countedBy: "Kasa",
    status: "Tam Uyumlu",
    note: "Nakit kasa, POS ve online ödeme toplamları uyumlu.",
  },
  {
    id: 3,
    countDate: "2026-06-25",
    shift: "Tüm Gün",
    openingCash: 4000,
    cashSales: 15400,
    expectedCash: 18800,
    countedCash: 18100,
    posTotal: 50100,
    onlineTotal: 8700,
    expensesPaid: 600,
    safeTransfer: 0,
    countedBy: "Operasyon",
    status: "Fark Var",
    note: "Nakit farkı için servis fişleri ve manuel tahsilatlar kontrol edilecek.",
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

function getDifference(item) {
  return Number(item.countedCash) - Number(item.expectedCash);
}

function getTotalRevenue(item) {
  return (
    Number(item.cashSales) + Number(item.posTotal) + Number(item.onlineTotal)
  );
}

function getCalculatedExpectedCash(item) {
  return (
    Number(item.openingCash) +
    Number(item.cashSales) -
    Number(item.expensesPaid) -
    Number(item.safeTransfer)
  );
}

function getStatusClass(status) {
  if (status === "Tam Uyumlu") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "Kontrol Edildi") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (status === "Kontrol Bekliyor") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (status === "Fark Var") {
    return "bg-red-50 text-red-700 border-red-200";
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

function getDifferenceClass(difference) {
  if (difference === 0) {
    return "text-emerald-700";
  }

  if (Math.abs(difference) <= 250) {
    return "text-amber-700";
  }

  return "text-red-700";
}

export default function CashCount() {
  const [cashCounts, setCashCounts] = useState(initialCashCounts);

  const [form, setForm] = useState({
    countDate: "",
    shift: "Tüm Gün",
    openingCash: "",
    cashSales: "",
    expectedCash: "",
    countedCash: "",
    posTotal: "",
    onlineTotal: "",
    expensesPaid: "",
    safeTransfer: "",
    countedBy: "",
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

  function handleSubmit(event) {
    event.preventDefault();

    const newCashCount = {
      id: Date.now(),
      countDate: form.countDate,
      shift: form.shift,
      openingCash: Number(form.openingCash || 0),
      cashSales: Number(form.cashSales || 0),
      expectedCash: Number(form.expectedCash || 0),
      countedCash: Number(form.countedCash || 0),
      posTotal: Number(form.posTotal || 0),
      onlineTotal: Number(form.onlineTotal || 0),
      expensesPaid: Number(form.expensesPaid || 0),
      safeTransfer: Number(form.safeTransfer || 0),
      countedBy: form.countedBy,
      status: form.status,
      note: form.note,
    };

    setCashCounts((prev) =>
      [newCashCount, ...prev].sort(
        (a, b) => new Date(b.countDate) - new Date(a.countDate)
      )
    );

    setForm({
      countDate: "",
      shift: "Tüm Gün",
      openingCash: "",
      cashSales: "",
      expectedCash: "",
      countedCash: "",
      posTotal: "",
      onlineTotal: "",
      expensesPaid: "",
      safeTransfer: "",
      countedBy: "",
      status: "Kontrol Bekliyor",
      note: "",
    });
  }

  function updateStatus(id, nextStatus) {
    setCashCounts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item
      )
    );
  }

  function updateCountedCash(id, nextCountedCash) {
    setCashCounts((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, countedCash: Number(nextCountedCash) }
          : item
      )
    );
  }

  const sortedCashCounts = [...cashCounts].sort(
    (a, b) => new Date(b.countDate) - new Date(a.countDate)
  );

  const totalCashSales = cashCounts.reduce(
    (total, item) => total + Number(item.cashSales),
    0
  );

  const totalPos = cashCounts.reduce(
    (total, item) => total + Number(item.posTotal),
    0
  );

  const totalOnline = cashCounts.reduce(
    (total, item) => total + Number(item.onlineTotal),
    0
  );

  const totalRevenue = cashCounts.reduce(
    (total, item) => total + getTotalRevenue(item),
    0
  );

  const totalDifference = cashCounts.reduce(
    (total, item) => total + getDifference(item),
    0
  );

  const waitingCount = cashCounts.filter(
    (item) => item.status === "Kontrol Bekliyor" || item.status === "Fark Var"
  ).length;

  const latestCashCount = sortedCashCounts[0];

  const shifts = [...new Set(cashCounts.map((item) => item.shift))];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Her Gün
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Kasa Sayımı
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Günlük nakit kasa, POS, online ödeme, beklenen nakit, sayılan
              nakit ve kasa farkını tek ekranda takip et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Gün Sonu Kapat
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
            Nakit: {formatCurrency(totalCashSales)}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">POS Toplamı</p>
          <h3 className="mt-3 text-2xl font-semibold text-blue-700">
            {formatCurrency(totalPos)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Online Ödeme</p>
          <h3 className="mt-3 text-2xl font-semibold text-purple-700">
            {formatCurrency(totalOnline)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Kasa Farkı</p>
          <h3
            className={`mt-3 text-2xl font-semibold ${getDifferenceClass(
              totalDifference
            )}`}
          >
            {formatCurrency(totalDifference)}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Kontrol bekleyen: {waitingCount}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Kasa Sayımı Ekle
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Açılış nakdi, nakit satış, POS, online ödeme ve sayılan kasa
            tutarını gir.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="countDate"
            value={form.countDate}
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

          <input
            name="countedBy"
            value={form.countedBy}
            onChange={handleChange}
            placeholder="Sayan kişi / ekip"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Kontrol Bekliyor">Kontrol Bekliyor</option>
            <option value="Kontrol Edildi">Kontrol Edildi</option>
            <option value="Tam Uyumlu">Tam Uyumlu</option>
            <option value="Fark Var">Fark Var</option>
          </select>

          <input
            name="openingCash"
            value={form.openingCash}
            onChange={handleChange}
            placeholder="Açılış nakdi"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="cashSales"
            value={form.cashSales}
            onChange={handleChange}
            placeholder="Nakit satış"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="expectedCash"
            value={form.expectedCash}
            onChange={handleChange}
            placeholder="Beklenen nakit"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="countedCash"
            value={form.countedCash}
            onChange={handleChange}
            placeholder="Sayılan nakit"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="posTotal"
            value={form.posTotal}
            onChange={handleChange}
            placeholder="POS toplamı"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="onlineTotal"
            value={form.onlineTotal}
            onChange={handleChange}
            placeholder="Online ödeme"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="expensesPaid"
            value={form.expensesPaid}
            onChange={handleChange}
            placeholder="Kasadan ödenen gider"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="safeTransfer"
            value={form.safeTransfer}
            onChange={handleChange}
            placeholder="Kasadan alınan / kasaya aktarılan"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Kasa notu"
            className="col-span-4 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Kasa Sayımı Ekle
          </button>
        </div>
      </form>

      <div className="grid grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
          <div className="border-b border-[#eadfce] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#211914]">
              Kasa Sayım Listesi
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Beklenen nakit ile sayılan nakit arasındaki fark otomatik
              hesaplanır.
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
              <tr>
                <th className="px-6 py-4">Tarih</th>
                <th className="px-6 py-4">Vardiya</th>
                <th className="px-6 py-4">Nakit</th>
                <th className="px-6 py-4">POS / Online</th>
                <th className="px-6 py-4">Fark</th>
                <th className="px-6 py-4 text-right">Durum</th>
              </tr>
            </thead>

            <tbody>
              {sortedCashCounts.map((item) => {
                const difference = getDifference(item);
                const calculatedExpectedCash = getCalculatedExpectedCash(item);

                return (
                  <tr
                    key={item.id}
                    className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#211914]">
                        {formatDate(item.countDate)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Sayan: {item.countedBy}
                      </p>

                      {item.note && (
                        <p className="mt-2 max-w-[360px] text-xs leading-5 text-[#7d6b5a]">
                          {item.note}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getShiftClass(
                          item.shift
                        )}`}
                      >
                        {item.shift}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs text-[#8a7560]">
                        Açılış: {formatCurrency(item.openingCash)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Nakit satış: {formatCurrency(item.cashSales)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Beklenen: {formatCurrency(item.expectedCash)}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-[#8a7560]">Sayılan:</span>

                        <input
                          type="number"
                          value={item.countedCash}
                          onChange={(event) =>
                            updateCountedCash(item.id, event.target.value)
                          }
                          className="w-28 rounded-xl border border-[#dfd0b8] bg-[#fbf8f3] px-3 py-2 text-xs outline-none focus:border-[#c9a45c]"
                        />
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs text-[#8a7560]">
                        POS: {formatCurrency(item.posTotal)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Online: {formatCurrency(item.onlineTotal)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Gider: {formatCurrency(item.expensesPaid)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Kasa transfer: {formatCurrency(item.safeTransfer)}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p
                        className={`text-sm font-semibold ${getDifferenceClass(
                          difference
                        )}`}
                      >
                        {formatCurrency(difference)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Hesaplanan beklenen:{" "}
                        {formatCurrency(calculatedExpectedCash)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Toplam satış: {formatCurrency(getTotalRevenue(item))}
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
                        <option value="Kontrol Bekliyor">Kontrol Bekliyor</option>
                        <option value="Kontrol Edildi">Kontrol Edildi</option>
                        <option value="Tam Uyumlu">Tam Uyumlu</option>
                        <option value="Fark Var">Fark Var</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          {latestCashCount && (
            <div className="rounded-3xl border border-[#c9a45c]/30 bg-[#211914] p-6 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e6c57a]">
                Son Kasa Sayımı
              </p>

              <h2 className="mt-3 text-xl font-semibold text-white">
                {formatDate(latestCashCount.countDate)}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#d8c7ad]">
                {latestCashCount.note}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#e6c57a]/20 bg-white/5 p-4">
                  <p className="text-xs text-[#d8c7ad]">Kasa Farkı</p>
                  <p className="mt-1 text-lg font-semibold text-[#e6c57a]">
                    {formatCurrency(getDifference(latestCashCount))}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e6c57a]/20 bg-white/5 p-4">
                  <p className="text-xs text-[#d8c7ad]">Durum</p>
                  <p className="mt-1 text-lg font-semibold text-[#e6c57a]">
                    {latestCashCount.status}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Vardiya Özeti
            </h2>

            <div className="mt-6 space-y-4">
              {shifts.map((shift) => {
                const shiftItems = cashCounts.filter(
                  (item) => item.shift === shift
                );

                const shiftRevenue = shiftItems.reduce(
                  (total, item) => total + getTotalRevenue(item),
                  0
                );

                const shiftDifference = shiftItems.reduce(
                  (total, item) => total + getDifference(item),
                  0
                );

                return (
                  <div key={shift} className="rounded-2xl bg-[#fbf8f3] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getShiftClass(
                          shift
                        )}`}
                      >
                        {shift}
                      </span>

                      <span className="text-sm font-semibold text-[#211914]">
                        {shiftItems.length} kayıt
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-[#8a7560]">
                      Ciro: {formatCurrency(shiftRevenue)}
                    </p>

                    <p
                      className={`mt-1 text-xs font-semibold ${getDifferenceClass(
                        shiftDifference
                      )}`}
                    >
                      Fark: {formatCurrency(shiftDifference)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Kasa Notu
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#7d6b5a]">
              Backend bağlandığında bu ekran Adisyo, POS, banka ve online satış
              raporlarından gelen ödeme verileriyle otomatik karşılaştırma
              yapacak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}