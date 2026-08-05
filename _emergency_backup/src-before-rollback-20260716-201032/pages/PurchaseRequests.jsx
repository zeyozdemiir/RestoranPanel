import { useState } from "react";

const initialRequests = [
  {
    id: 1,
    itemName: "Mozzarella",
    department: "Mutfak",
    quantity: 10,
    unit: "kg",
    requestedBy: "Mutfak Şefi",
    priority: "Yüksek",
    status: "Bekliyor",
    supplier: "Süt Ürünleri Tedarikçisi",
    note: "Minimum stok altına düştü.",
  },
  {
    id: 2,
    itemName: "Lime",
    department: "Bar",
    quantity: 5,
    unit: "kg",
    requestedBy: "Bar Sorumlusu",
    priority: "Orta",
    status: "Onaylandı",
    supplier: "Sebze Hali",
    note: "Kokteyl üretimi için gerekli.",
  },
  {
    id: 3,
    itemName: "Dana Bonfile",
    department: "Mutfak",
    quantity: 8,
    unit: "kg",
    requestedBy: "Mutfak Şefi",
    priority: "Yüksek",
    status: "Sipariş Verildi",
    supplier: "Ana Et Tedarikçisi",
    note: "Hafta sonu yoğunluğu için.",
  },
];

function getPriorityClass(priority) {
  if (priority === "Yüksek") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (priority === "Orta") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

function getStatusClass(status) {
  if (status === "Bekliyor") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (status === "Onaylandı") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (status === "Sipariş Verildi") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  if (status === "Tamamlandı") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

export default function PurchaseRequests() {
  const [requests, setRequests] = useState(initialRequests);

  const [form, setForm] = useState({
    itemName: "",
    department: "",
    quantity: "",
    unit: "kg",
    requestedBy: "",
    priority: "Orta",
    supplier: "",
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

    const newRequest = {
      id: Date.now(),
      itemName: form.itemName,
      department: form.department,
      quantity: Number(form.quantity),
      unit: form.unit,
      requestedBy: form.requestedBy,
      priority: form.priority,
      status: "Bekliyor",
      supplier: form.supplier,
      note: form.note,
    };

    setRequests((prev) => [newRequest, ...prev]);

    setForm({
      itemName: "",
      department: "",
      quantity: "",
      unit: "kg",
      requestedBy: "",
      priority: "Orta",
      supplier: "",
      note: "",
    });
  }

  function updateStatus(id, nextStatus) {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === id ? { ...request, status: nextStatus } : request
      )
    );
  }

  const totalRequests = requests.length;
  const pendingRequests = requests.filter(
    (request) => request.status === "Bekliyor"
  ).length;
  const approvedRequests = requests.filter(
    (request) => request.status === "Onaylandı"
  ).length;
  const orderedRequests = requests.filter(
    (request) => request.status === "Sipariş Verildi"
  ).length;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Mutfak, Bar & Stok
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Satın Alma Talepleri
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Mutfak, bar ve servis ekiplerinden gelen satın alma ihtiyaçlarını
              onayla, siparişe çevir ve tedarikçilerle ilişkilendir.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Talep Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Talep</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalRequests}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Bekleyen</p>
          <h3 className="mt-3 text-2xl font-semibold text-amber-700">
            {pendingRequests}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Onaylanan</p>
          <h3 className="mt-3 text-2xl font-semibold text-blue-700">
            {approvedRequests}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Sipariş Verilen</p>
          <h3 className="mt-3 text-2xl font-semibold text-purple-700">
            {orderedRequests}
          </h3>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Satın Alma Talebi
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Talep onaylandığında ileride otomatik olarak tedarikçi, fatura ve
            ticari borç süreçlerine bağlanacak.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="itemName"
            value={form.itemName}
            onChange={handleChange}
            placeholder="Ürün / hammadde adı"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Departman seç</option>
            <option value="Mutfak">Mutfak</option>
            <option value="Bar">Bar</option>
            <option value="Servis">Servis</option>
            <option value="Operasyon">Operasyon</option>
          </select>

          <input
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Miktar"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="kg">kg</option>
            <option value="gr">gr</option>
            <option value="lt">lt</option>
            <option value="ml">ml</option>
            <option value="adet">adet</option>
            <option value="şişe">şişe</option>
            <option value="paket">paket</option>
            <option value="koli">koli</option>
          </select>

          <input
            name="requestedBy"
            value={form.requestedBy}
            onChange={handleChange}
            placeholder="Talep eden"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

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
            name="supplier"
            value={form.supplier}
            onChange={handleChange}
            placeholder="Önerilen tedarikçi"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Not"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Talep Oluştur
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
        <div className="border-b border-[#eadfce] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Talep Listesi
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Bekleyen talepler onaylandıktan sonra satın alma sürecine alınır.
          </p>
        </div>

        <table className="w-full text-left">
          <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
            <tr>
              <th className="px-6 py-4">Ürün</th>
              <th className="px-6 py-4">Departman</th>
              <th className="px-6 py-4">Miktar</th>
              <th className="px-6 py-4">Talep Eden</th>
              <th className="px-6 py-4">Öncelik</th>
              <th className="px-6 py-4">Tedarikçi</th>
              <th className="px-6 py-4">Durum</th>
              <th className="px-6 py-4 text-right">İşlem</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((request) => (
              <tr
                key={request.id}
                className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
              >
                <td className="px-6 py-4">
                  <p className="font-medium text-[#211914]">
                    {request.itemName}
                  </p>
                  <p className="mt-1 text-xs text-[#8a7560]">{request.note}</p>
                </td>

                <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                  {request.department}
                </td>

                <td className="px-6 py-4 text-sm text-[#211914]">
                  {request.quantity} {request.unit}
                </td>

                <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                  {request.requestedBy}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${getPriorityClass(
                      request.priority
                    )}`}
                  >
                    {request.priority}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                  {request.supplier}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <select
                    value={request.status}
                    onChange={(event) =>
                      updateStatus(request.id, event.target.value)
                    }
                    className="rounded-xl border border-[#dfd0b8] bg-[#fbf8f3] px-3 py-2 text-xs outline-none focus:border-[#c9a45c]"
                  >
                    <option value="Bekliyor">Bekliyor</option>
                    <option value="Onaylandı">Onaylandı</option>
                    <option value="Sipariş Verildi">Sipariş Verildi</option>
                    <option value="Tamamlandı">Tamamlandı</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}