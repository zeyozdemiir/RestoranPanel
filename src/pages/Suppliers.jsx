import { useState } from "react";

const initialSuppliers = [
  {
    id: 1,
    companyName: "Ana Et Tedarikçisi",
    contactPerson: "Mehmet Bey",
    phone: "05xx xxx xx xx",
    category: "Et",
    paymentTerm: "7 Gün",
    balance: 42500,
    status: "Aktif",
  },
  {
    id: 2,
    companyName: "Süt Ürünleri Tedarikçisi",
    contactPerson: "Ayşe Hanım",
    phone: "05xx xxx xx xx",
    category: "Süt Ürünleri",
    paymentTerm: "15 Gün",
    balance: 18750,
    status: "Aktif",
  },
  {
    id: 3,
    companyName: "Sebze Hali",
    contactPerson: "Ali Bey",
    phone: "05xx xxx xx xx",
    category: "Sebze & Meyve",
    paymentTerm: "Peşin",
    balance: 0,
    status: "Aktif",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function getBalanceStatus(balance) {
  if (Number(balance) > 30000) {
    return {
      label: "Yüksek Borç",
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }

  if (Number(balance) > 0) {
    return {
      label: "Açık Bakiye",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  return {
    label: "Borç Yok",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState(initialSuppliers);

  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    category: "",
    paymentTerm: "",
    balance: "",
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

    const newSupplier = {
      id: Date.now(),
      companyName: form.companyName,
      contactPerson: form.contactPerson,
      phone: form.phone,
      category: form.category,
      paymentTerm: form.paymentTerm,
      balance: Number(form.balance),
      status: "Aktif",
    };

    setSuppliers((prev) => [newSupplier, ...prev]);

    setForm({
      companyName: "",
      contactPerson: "",
      phone: "",
      category: "",
      paymentTerm: "",
      balance: "",
    });
  }

  const totalSuppliers = suppliers.length;

  const totalDebt = suppliers.reduce(
    (total, supplier) => total + Number(supplier.balance),
    0
  );

  const suppliersWithDebt = suppliers.filter(
    (supplier) => Number(supplier.balance) > 0
  ).length;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Para & Muhasebe
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Tedarikçiler
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Tedarikçi kartlarını, ödeme vadelerini, açık bakiyeleri ve satın
              alma ilişkilerini tek ekrandan takip et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Tedarikçi Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Tedarikçi</p>
          <h3 className="mt-3 text-3xl font-semibold text-[#211914]">
            {totalSuppliers}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Açık Borçlu Tedarikçi</p>
          <h3 className="mt-3 text-3xl font-semibold text-amber-700">
            {suppliersWithDebt}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Açık Bakiye</p>
          <h3 className="mt-3 text-3xl font-semibold text-red-700">
            {formatCurrency(totalDebt)}
          </h3>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Tedarikçi Ekle
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Bu kayıt ileride fatura, satın alma, ticari borç ve ödeme
            modülleriyle ilişkilendirilecek.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <input
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            placeholder="Firma adı"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="contactPerson"
            value={form.contactPerson}
            onChange={handleChange}
            placeholder="Yetkili kişi"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Telefon"
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

          <select
            name="paymentTerm"
            value={form.paymentTerm}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Ödeme vadesi seç</option>
            <option value="Peşin">Peşin</option>
            <option value="7 Gün">7 Gün</option>
            <option value="15 Gün">15 Gün</option>
            <option value="30 Gün">30 Gün</option>
            <option value="45 Gün">45 Gün</option>
          </select>

          <input
            name="balance"
            value={form.balance}
            onChange={handleChange}
            placeholder="Açık bakiye"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Tedarikçi Ekle
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
        <div className="border-b border-[#eadfce] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Tedarikçi Listesi
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Açık bakiyesi olan tedarikçiler ticari borç modülünde takip
            edilecek.
          </p>
        </div>

        <table className="w-full text-left">
          <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
            <tr>
              <th className="px-6 py-4">Firma</th>
              <th className="px-6 py-4">Yetkili</th>
              <th className="px-6 py-4">Telefon</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Vade</th>
              <th className="px-6 py-4">Bakiye</th>
              <th className="px-6 py-4">Durum</th>
              <th className="px-6 py-4 text-right">İşlem</th>
            </tr>
          </thead>

          <tbody>
            {suppliers.map((supplier) => {
              const balanceStatus = getBalanceStatus(supplier.balance);

              return (
                <tr
                  key={supplier.id}
                  className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                >
                  <td className="px-6 py-4 font-medium text-[#211914]">
                    {supplier.companyName}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {supplier.contactPerson}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {supplier.phone}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {supplier.category}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#211914]">
                    {supplier.paymentTerm}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-[#211914]">
                    {formatCurrency(supplier.balance)}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${balanceStatus.className}`}
                    >
                      {balanceStatus.label}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button className="text-sm font-medium text-[#9c7439] hover:text-[#211914]">
                      Detay
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