import { useState } from "react";

const initialCampaigns = [
  {
    id: 1,
    name: "Pazar Brunch Rezervasyon",
    type: "Brunch",
    discountType: "Sabit Tutar",
    discountValue: 150,
    startDate: "2026-06-20",
    endDate: "2026-07-20",
    target: "Rezervasyon",
    budget: 12000,
    status: "Aktif",
    note: "Pazar brunch rezervasyonlarını artırmak için.",
  },
  {
    id: 2,
    name: "Happy Hour Kokteyl",
    type: "Bar",
    discountType: "Yüzde",
    discountValue: 20,
    startDate: "2026-06-15",
    endDate: "2026-06-30",
    target: "Kokteyl satışı",
    budget: 8500,
    status: "Aktif",
    note: "Hafta içi erken saatlerde bar satışını artırmak için.",
  },
  {
    id: 3,
    name: "Tatlı Menü Eklemesi",
    type: "Menü",
    discountType: "Yüzde",
    discountValue: 10,
    startDate: "2026-06-01",
    endDate: "2026-06-18",
    target: "Tatlı satışı",
    budget: 3500,
    status: "Pasif",
    note: "Ana yemek sonrası tatlı satışını desteklemek için.",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function getCampaignStatus(campaign) {
  const today = new Date();
  const startDate = new Date(campaign.startDate);
  const endDate = new Date(campaign.endDate);

  today.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  if (campaign.status === "Pasif") {
    return {
      label: "Pasif",
      className: "bg-gray-50 text-gray-700 border-gray-200",
    };
  }

  if (today < startDate) {
    return {
      label: "Planlandı",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    };
  }

  if (today > endDate) {
    return {
      label: "Süresi Bitti",
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }

  return {
    label: "Aktif",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
}

function getDiscountText(campaign) {
  if (campaign.discountType === "Yüzde") {
    return `%${campaign.discountValue}`;
  }

  return formatCurrency(campaign.discountValue);
}

function getTypeClass(type) {
  if (type === "Brunch") {
    return "bg-[#fff7e7] text-[#9c7439] border-[#c9a45c]/30";
  }

  if (type === "Bar") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  if (type === "Menü") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (type === "Etkinlik") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState(initialCampaigns);

  const [form, setForm] = useState({
    name: "",
    type: "",
    discountType: "Yüzde",
    discountValue: "",
    startDate: "",
    endDate: "",
    target: "",
    budget: "",
    status: "Aktif",
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

    const newCampaign = {
      id: Date.now(),
      name: form.name,
      type: form.type,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      startDate: form.startDate,
      endDate: form.endDate,
      target: form.target,
      budget: Number(form.budget || 0),
      status: form.status,
      note: form.note,
    };

    setCampaigns((prev) => [newCampaign, ...prev]);

    setForm({
      name: "",
      type: "",
      discountType: "Yüzde",
      discountValue: "",
      startDate: "",
      endDate: "",
      target: "",
      budget: "",
      status: "Aktif",
      note: "",
    });
  }

  function updateStatus(id, nextStatus) {
    setCampaigns((prev) =>
      prev.map((campaign) =>
        campaign.id === id ? { ...campaign, status: nextStatus } : campaign
      )
    );
  }

  const totalCampaigns = campaigns.length;

  const activeCampaigns = campaigns.filter(
    (campaign) => getCampaignStatus(campaign).label === "Aktif"
  ).length;

  const plannedCampaigns = campaigns.filter(
    (campaign) => getCampaignStatus(campaign).label === "Planlandı"
  ).length;

  const totalBudget = campaigns.reduce(
    (total, campaign) => total + Number(campaign.budget),
    0
  );

  const averageDiscount =
    campaigns.length === 0
      ? 0
      : campaigns.reduce(
          (total, campaign) => total + Number(campaign.discountValue),
          0
        ) / campaigns.length;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Menü & Satış
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Kampanya & İndirim
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Brunch, bar, etkinlik ve menü ürünleri için kampanya dönemlerini,
              indirim tiplerini, bütçeyi ve yayın durumunu yönet.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Kampanya Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Kampanya</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalCampaigns}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Aktif Kampanya</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {activeCampaigns}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Planlanan</p>
          <h3 className="mt-3 text-2xl font-semibold text-blue-700">
            {plannedCampaigns}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Bütçe</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {formatCurrency(totalBudget)}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Ort. indirim değeri: {averageDiscount.toFixed(1)}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Kampanya Oluştur
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Kampanyalar ileride satış raporları, QR menü ve rezervasyon
            ekranlarıyla ilişkilendirilecek.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Kampanya adı"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Kampanya türü seç</option>
            <option value="Brunch">Brunch</option>
            <option value="Bar">Bar</option>
            <option value="Menü">Menü</option>
            <option value="Etkinlik">Etkinlik</option>
            <option value="Rezervasyon">Rezervasyon</option>
          </select>

          <select
            name="discountType"
            value={form.discountType}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Yüzde">Yüzde</option>
            <option value="Sabit Tutar">Sabit Tutar</option>
          </select>

          <input
            name="discountValue"
            value={form.discountValue}
            onChange={handleChange}
            placeholder="İndirim değeri"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

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
            name="target"
            value={form.target}
            onChange={handleChange}
            placeholder="Hedef"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="budget"
            value={form.budget}
            onChange={handleChange}
            placeholder="Bütçe"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Aktif">Aktif</option>
            <option value="Pasif">Pasif</option>
          </select>

          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Kampanya notu"
            className="col-span-3 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Kampanya Ekle
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
        <div className="border-b border-[#eadfce] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Kampanya Listesi
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Tarih aralığına göre kampanya durumu otomatik hesaplanır.
          </p>
        </div>

        <table className="w-full text-left">
          <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
            <tr>
              <th className="px-6 py-4">Kampanya</th>
              <th className="px-6 py-4">Tür</th>
              <th className="px-6 py-4">İndirim</th>
              <th className="px-6 py-4">Tarih</th>
              <th className="px-6 py-4">Hedef</th>
              <th className="px-6 py-4">Bütçe</th>
              <th className="px-6 py-4">Durum</th>
              <th className="px-6 py-4 text-right">Yayın</th>
            </tr>
          </thead>

          <tbody>
            {campaigns.map((campaign) => {
              const campaignStatus = getCampaignStatus(campaign);

              return (
                <tr
                  key={campaign.id}
                  className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#211914]">
                      {campaign.name}
                    </p>
                    <p className="mt-1 max-w-[320px] text-xs leading-5 text-[#8a7560]">
                      {campaign.note}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${getTypeClass(
                        campaign.type
                      )}`}
                    >
                      {campaign.type}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[#211914]">
                      {getDiscountText(campaign)}
                    </p>
                    <p className="mt-1 text-xs text-[#8a7560]">
                      {campaign.discountType}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    <p>{campaign.startDate}</p>
                    <p>{campaign.endDate}</p>
                  </td>

                  <td className="px-6 py-4 text-sm text-[#211914]">
                    {campaign.target}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-[#211914]">
                    {formatCurrency(campaign.budget)}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${campaignStatus.className}`}
                    >
                      {campaignStatus.label}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <select
                      value={campaign.status}
                      onChange={(event) =>
                        updateStatus(campaign.id, event.target.value)
                      }
                      className="rounded-xl border border-[#dfd0b8] bg-[#fbf8f3] px-3 py-2 text-xs outline-none focus:border-[#c9a45c]"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Pasif">Pasif</option>
                    </select>
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