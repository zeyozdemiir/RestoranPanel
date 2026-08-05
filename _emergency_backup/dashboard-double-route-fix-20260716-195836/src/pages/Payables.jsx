import { useState } from "react";

const initialPayables = [
  {
    id: 1,
    supplier: "Ana Et Tedarikçisi",
    invoiceNo: "FTR-2026-001",
    issueDate: "2026-06-20",
    dueDate: "2026-06-27",
    totalAmount: 42500,
    paidAmount: 15000,
    category: "Et",
  },
  {
    id: 2,
    supplier: "Süt Ürünleri Tedarikçisi",
    invoiceNo: "FTR-2026-002",
    issueDate: "2026-06-18",
    dueDate: "2026-07-03",
    totalAmount: 18750,
    paidAmount: 0,
    category: "Süt Ürünleri",
  },
  {
    id: 3,
    supplier: "Sebze Hali",
    invoiceNo: "FTR-2026-003",
    issueDate: "2026-06-24",
    dueDate: "2026-06-24",
    totalAmount: 9200,
    paidAmount: 9200,
    category: "Sebze & Meyve",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function getRemainingAmount(item) {
  return Number(item.totalAmount) - Number(item.paidAmount);
}

function getPaymentStatus(item) {
  const remaining = getRemainingAmount(item);

  if (remaining <= 0) {
    return {
      label: "Ödendi",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  const today = new Date();
  const dueDate = new Date(item.dueDate);
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  if (dueDate < today) {
    return {
      label: "Vadesi Geçti",
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }

  return {
    label: "Ödenecek",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  };
}

export default function Payables() {
  const [payables, setPayables] = useState(initialPayables);

  const [form, setForm] = useState({
    supplier: "",
    invoiceNo: "",
    issueDate: "",
    dueDate: "",
    totalAmount: "",
    paidAmount: "",
    category: "",
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

    const newPayable = {
      id: Date.now(),
      supplier: form.supplier,
      invoiceNo: form.invoiceNo,
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      totalAmount: Number(form.totalAmount),
      paidAmount: Number(form.paidAmount || 0),
      category: form.category,
    };

    setPayables((prev) => [newPayable, ...prev]);

    setForm({
      supplier: "",
      invoiceNo: "",
      issueDate: "",
      dueDate: "",
      totalAmount: "",
      paidAmount: "",
      category: "",
    });
  }

  const totalDebt = payables.reduce(
    (total, item) => total + Number(item.totalAmount),
    0
  );

  const totalPaid = payables.reduce(
    (total, item) => total + Number(item.paidAmount),
    0
  );

  const totalRemaining = payables.reduce(
    (total, item) => total + getRemainingAmount(item),
    0
  );

  const overdueCount = payables.filter((item) => {
    const status = getPaymentStatus(item);
    return status.label === "Vadesi Geçti";
  }).length;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Para & Muhasebe
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Ticari Borçlar
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Tedarikçi faturalarını, vade tarihlerini, ödenen ve kalan
              tutarları takip et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Borç Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Fatura</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {formatCurrency(totalDebt)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Ödenen</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {formatCurrency(totalPaid)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Kalan Borç</p>
          <h3 className="mt-3 text-2xl font-semibold text-red-700">
            {formatCurrency(totalRemaining)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Vadesi Geçen</p>
          <h3 className="mt-3 text-2xl font-semibold text-amber-700">
            {overdueCount}
          </h3>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Borç Kaydı Ekle
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Bu kayıt ileride fatura yükleme, tedarikçi ve ödeme modülleriyle
            otomatik ilişkilendirilecek.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="supplier"
            value={form.supplier}
            onChange={handleChange}
            placeholder="Tedarikçi"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="invoiceNo"
            value={form.invoiceNo}
            onChange={handleChange}
            placeholder="Fatura no"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Kategori"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="issueDate"
            value={form.issueDate}
            onChange={handleChange}
            type="date"
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

          <input
            name="totalAmount"
            value={form.totalAmount}
            onChange={handleChange}
            placeholder="Toplam tutar"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="paidAmount"
            value={form.paidAmount}
            onChange={handleChange}
            placeholder="Ödenen tutar"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <button className="rounded-2xl bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Borç Kaydı Ekle
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
        <div className="border-b border-[#eadfce] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Borç Listesi
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Kalan tutar ve vade durumuna göre borçlar otomatik etiketlenir.
          </p>
        </div>

        <table className="w-full text-left">
          <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
            <tr>
              <th className="px-6 py-4">Tedarikçi</th>
              <th className="px-6 py-4">Fatura No</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Vade</th>
              <th className="px-6 py-4">Toplam</th>
              <th className="px-6 py-4">Ödenen</th>
              <th className="px-6 py-4">Kalan</th>
              <th className="px-6 py-4">Durum</th>
              <th className="px-6 py-4 text-right">İşlem</th>
            </tr>
          </thead>

          <tbody>
            {payables.map((item) => {
              const status = getPaymentStatus(item);
              const remaining = getRemainingAmount(item);

              return (
                <tr
                  key={item.id}
                  className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                >
                  <td className="px-6 py-4 font-medium text-[#211914]">
                    {item.supplier}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {item.invoiceNo}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {item.category}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#211914]">
                    {item.dueDate}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#211914]">
                    {formatCurrency(item.totalAmount)}
                  </td>

                  <td className="px-6 py-4 text-sm text-emerald-700">
                    {formatCurrency(item.paidAmount)}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-red-700">
                    {formatCurrency(remaining)}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button className="text-sm font-medium text-[#9c7439] hover:text-[#211914]">
                      Ödeme Gir
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}