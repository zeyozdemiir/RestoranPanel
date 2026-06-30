import { useState } from "react";

const initialCampaigns = [
  {
    id: 1,
    campaignName: "Pazar Brunch Duyurusu",
    channel: "Instagram",
    targetSegment: "Brunch Müşterisi",
    startDate: "2026-06-27",
    endDate: "2026-06-28",
    budget: 2500,
    expectedReach: 18000,
    reservations: 22,
    status: "Aktif",
    contentIdea:
      "Kahvaltı pizzasını öne çıkaran reels ve story serisi hazırlanacak.",
    note: "Rezervasyon numarası story sonunda net gösterilecek.",
  },
  {
    id: 2,
    campaignName: "Yunan Gecesi",
    channel: "Instagram",
    targetSegment: "Akşam Yemeği",
    startDate: "2026-07-01",
    endDate: "2026-07-04",
    budget: 4000,
    expectedReach: 25000,
    reservations: 18,
    status: "Planlandı",
    contentIdea:
      "Mavi beyaz konsept, canlı müzik ve Ege esintisi vurgulanacak.",
    note: "Story ve post ayrı hazırlanacak.",
  },
  {
    id: 3,
    campaignName: "VIP Müşteri Geri Çağırma",
    channel: "WhatsApp",
    targetSegment: "VIP",
    startDate: "2026-06-25",
    endDate: "2026-06-30",
    budget: 0,
    expectedReach: 80,
    reservations: 9,
    status: "Aktif",
    contentIdea:
      "Özel masa, şarap önerisi ve yeni menü hatırlatma mesajı gönderilecek.",
    note: "CRM listesindeki VIP müşteriler hedeflenecek.",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function getCostPerReservation(campaign) {
  if (Number(campaign.reservations) === 0) return 0;

  return Number(campaign.budget) / Number(campaign.reservations);
}

function getConversionRate(campaign) {
  if (Number(campaign.expectedReach) === 0) return 0;

  return (Number(campaign.reservations) / Number(campaign.expectedReach)) * 100;
}

function getStatusClass(status) {
  if (status === "Aktif") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "Planlandı") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (status === "Tamamlandı") {
    return "bg-gray-50 text-gray-700 border-gray-200";
  }

  if (status === "Durduruldu") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-amber-50 text-amber-700 border-amber-200";
}

function getChannelClass(channel) {
  if (channel === "Instagram") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  if (channel === "WhatsApp") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (channel === "Google") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (channel === "Yemeksepeti") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-[#fff7e7] text-[#9c7439] border-[#c9a45c]/30";
}

function getPerformanceLabel(campaign) {
  const conversionRate = getConversionRate(campaign);

  if (conversionRate >= 0.15) {
    return {
      label: "Çok İyi",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  if (conversionRate >= 0.08) {
    return {
      label: "İyi",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    };
  }

  if (conversionRate >= 0.03) {
    return {
      label: "Takip Et",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  return {
    label: "Zayıf",
    className: "bg-red-50 text-red-700 border-red-200",
  };
}

export default function MarketingCenter() {
  const [campaigns, setCampaigns] = useState(initialCampaigns);

  const [form, setForm] = useState({
    campaignName: "",
    channel: "",
    targetSegment: "",
    startDate: "",
    endDate: "",
    budget: "",
    expectedReach: "",
    reservations: "",
    status: "Planlandı",
    contentIdea: "",
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
      campaignName: form.campaignName,
      channel: form.channel,
      targetSegment: form.targetSegment,
      startDate: form.startDate,
      endDate: form.endDate,
      budget: Number(form.budget || 0),
      expectedReach: Number(form.expectedReach || 0),
      reservations: Number(form.reservations || 0),
      status: form.status,
      contentIdea: form.contentIdea,
      note: form.note,
    };

    setCampaigns((prev) => [newCampaign, ...prev]);

    setForm({
      campaignName: "",
      channel: "",
      targetSegment: "",
      startDate: "",
      endDate: "",
      budget: "",
      expectedReach: "",
      reservations: "",
      status: "Planlandı",
      contentIdea: "",
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
    (campaign) => campaign.status === "Aktif"
  ).length;

  const totalBudget = campaigns.reduce(
    (total, campaign) => total + Number(campaign.budget),
    0
  );

  const totalReach = campaigns.reduce(
    (total, campaign) => total + Number(campaign.expectedReach),
    0
  );

  const totalReservations = campaigns.reduce(
    (total, campaign) => total + Number(campaign.reservations),
    0
  );

  const averageCostPerReservation =
    totalReservations === 0 ? 0 : totalBudget / totalReservations;

  const channels = [...new Set(campaigns.map((campaign) => campaign.channel))];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Ekip & Müşteri
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Pazarlama Merkezi
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Instagram, WhatsApp, Google, Yemeksepeti ve restoran içi
              kampanyaları; bütçe, hedef kitle, erişim, rezervasyon ve dönüşüm
              oranıyla takip et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Pazarlama Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Kampanya</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalCampaigns}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Aktif: {activeCampaigns}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Bütçe</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {formatCurrency(totalBudget)}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Erişim</p>
          <h3 className="mt-3 text-2xl font-semibold text-blue-700">
            {totalReach.toLocaleString("tr-TR")}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Rezervasyon</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {totalReservations}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Rezervasyon başı: {formatCurrency(averageCostPerReservation)}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Pazarlama Kampanyası Ekle
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Kampanya fikrini, hedef segmenti, kanalı ve dönüşüm beklentisini
            buradan kaydet.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="campaignName"
            value={form.campaignName}
            onChange={handleChange}
            placeholder="Kampanya adı"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="channel"
            value={form.channel}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Kanal seç</option>
            <option value="Instagram">Instagram</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Google">Google</option>
            <option value="Yemeksepeti">Yemeksepeti</option>
            <option value="Restoran İçi">Restoran İçi</option>
          </select>

          <select
            name="targetSegment"
            value={form.targetSegment}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Hedef segment seç</option>
            <option value="Brunch Müşterisi">Brunch Müşterisi</option>
            <option value="VIP">VIP</option>
            <option value="Akşam Yemeği">Akşam Yemeği</option>
            <option value="Yeni Müşteri">Yeni Müşteri</option>
            <option value="Kurumsal">Kurumsal</option>
          </select>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Planlandı">Planlandı</option>
            <option value="Aktif">Aktif</option>
            <option value="Tamamlandı">Tamamlandı</option>
            <option value="Durduruldu">Durduruldu</option>
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
            name="budget"
            value={form.budget}
            onChange={handleChange}
            placeholder="Bütçe"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="expectedReach"
            value={form.expectedReach}
            onChange={handleChange}
            placeholder="Tahmini erişim"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="reservations"
            value={form.reservations}
            onChange={handleChange}
            placeholder="Rezervasyon dönüşü"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Kampanya notu"
            className="col-span-3 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <textarea
            name="contentIdea"
            value={form.contentIdea}
            onChange={handleChange}
            placeholder="İçerik fikri / paylaşım metni / reklam notu"
            rows="3"
            className="col-span-4 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Kampanya Ekle
          </button>
        </div>
      </form>

      <div className="grid grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
          <div className="border-b border-[#eadfce] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#211914]">
              Kampanya Listesi
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Rezervasyon dönüşü ve erişime göre kampanya performansı otomatik
              yorumlanır.
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
              <tr>
                <th className="px-6 py-4">Kampanya</th>
                <th className="px-6 py-4">Kanal</th>
                <th className="px-6 py-4">Tarih</th>
                <th className="px-6 py-4">Bütçe</th>
                <th className="px-6 py-4">Dönüşüm</th>
                <th className="px-6 py-4">Performans</th>
                <th className="px-6 py-4 text-right">Durum</th>
              </tr>
            </thead>

            <tbody>
              {campaigns.map((campaign) => {
                const performance = getPerformanceLabel(campaign);
                const conversionRate = getConversionRate(campaign);

                return (
                  <tr
                    key={campaign.id}
                    className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#211914]">
                        {campaign.campaignName}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Hedef: {campaign.targetSegment}
                      </p>

                      <p className="mt-2 max-w-[360px] text-xs leading-5 text-[#7d6b5a]">
                        {campaign.contentIdea}
                      </p>

                      {campaign.note && (
                        <p className="mt-2 max-w-[360px] text-xs font-medium leading-5 text-[#9c7439]">
                          Not: {campaign.note}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getChannelClass(
                          campaign.channel
                        )}`}
                      >
                        {campaign.channel}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                      <p>{campaign.startDate}</p>
                      <p>{campaign.endDate}</p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-[#211914]">
                        {formatCurrency(campaign.budget)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Rezervasyon başı:{" "}
                        {formatCurrency(getCostPerReservation(campaign))}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-emerald-700">
                        {campaign.reservations} rezervasyon
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Erişim:{" "}
                        {Number(campaign.expectedReach).toLocaleString("tr-TR")}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7560]">
                        Dönüşüm: %{conversionRate.toFixed(2)}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${performance.className}`}
                      >
                        {performance.label}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <select
                        value={campaign.status}
                        onChange={(event) =>
                          updateStatus(campaign.id, event.target.value)
                        }
                        className={`rounded-xl border px-3 py-2 text-xs outline-none ${getStatusClass(
                          campaign.status
                        )}`}
                      >
                        <option value="Planlandı">Planlandı</option>
                        <option value="Aktif">Aktif</option>
                        <option value="Tamamlandı">Tamamlandı</option>
                        <option value="Durduruldu">Durduruldu</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Kanal Özeti
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Kampanyaların kanal bazlı rezervasyon dönüşü.
            </p>

            <div className="mt-6 space-y-4">
              {channels.map((channel) => {
                const channelCampaigns = campaigns.filter(
                  (campaign) => campaign.channel === channel
                );

                const channelBudget = channelCampaigns.reduce(
                  (total, campaign) => total + Number(campaign.budget),
                  0
                );

                const channelReservations = channelCampaigns.reduce(
                  (total, campaign) => total + Number(campaign.reservations),
                  0
                );

                return (
                  <div key={channel} className="rounded-2xl bg-[#fbf8f3] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getChannelClass(
                          channel
                        )}`}
                      >
                        {channel}
                      </span>

                      <span className="text-sm font-semibold text-[#211914]">
                        {channelReservations} rezervasyon
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-[#8a7560]">
                      Bütçe: {formatCurrency(channelBudget)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Pazarlama Notu
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#7d6b5a]">
              Bu ekran ileride CRM, kampanya, geri bildirim ve rezervasyon
              modülleriyle bağlanarak hangi içeriğin gerçekten rezervasyona
              döndüğünü gösterecek.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}