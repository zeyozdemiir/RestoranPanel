import { useState } from "react";

const initialPairings = [
  {
    id: 1,
    dishName: "Kara Od Bonfile",
    dishCategory: "Ana Yemek",
    wineName: "Chateau No1 Reserve",
    wineType: "Kırmızı",
    pairingLevel: "Çok Uyumlu",
    serviceNote: "Yoğun et aromasıyla gövdeli kırmızı şarap uyumu.",
    glassPrice: 650,
    bottlePrice: 2400,
    status: "Aktif",
  },
  {
    id: 2,
    dishName: "Deniz Ürünlü Linguine",
    dishCategory: "Makarna",
    wineName: "Ege Beyaz",
    wineType: "Beyaz",
    pairingLevel: "Uyumlu",
    serviceNote: "Deniz ürünleriyle ferah ve asiditesi dengeli beyaz şarap.",
    glassPrice: 380,
    bottlePrice: 1250,
    status: "Aktif",
  },
  {
    id: 3,
    dishName: "Brunch Kahvaltı Pizzası",
    dishCategory: "Brunch",
    wineName: "Rose Selection",
    wineType: "Rose",
    pairingLevel: "Önerilir",
    serviceNote: "Hafif, aromatik ve brunch servisine uygun rose eşleşmesi.",
    glassPrice: 420,
    bottlePrice: 1500,
    status: "Pasif",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function getPairingClass(level) {
  if (level === "Çok Uyumlu") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (level === "Uyumlu") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (level === "Önerilir") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

function getStatusClass(status) {
  if (status === "Aktif") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

export default function WinePairing() {
  const [pairings, setPairings] = useState(initialPairings);

  const [form, setForm] = useState({
    dishName: "",
    dishCategory: "",
    wineName: "",
    wineType: "",
    pairingLevel: "Uyumlu",
    serviceNote: "",
    glassPrice: "",
    bottlePrice: "",
    status: "Aktif",
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

    const newPairing = {
      id: Date.now(),
      dishName: form.dishName,
      dishCategory: form.dishCategory,
      wineName: form.wineName,
      wineType: form.wineType,
      pairingLevel: form.pairingLevel,
      serviceNote: form.serviceNote,
      glassPrice: Number(form.glassPrice),
      bottlePrice: Number(form.bottlePrice),
      status: form.status,
    };

    setPairings((prev) => [newPairing, ...prev]);

    setForm({
      dishName: "",
      dishCategory: "",
      wineName: "",
      wineType: "",
      pairingLevel: "Uyumlu",
      serviceNote: "",
      glassPrice: "",
      bottlePrice: "",
      status: "Aktif",
    });
  }

  function updateStatus(id, nextStatus) {
    setPairings((prev) =>
      prev.map((pairing) =>
        pairing.id === id ? { ...pairing, status: nextStatus } : pairing
      )
    );
  }

  const totalPairings = pairings.length;

  const activePairings = pairings.filter(
    (pairing) => pairing.status === "Aktif"
  ).length;

  const strongPairings = pairings.filter(
    (pairing) => pairing.pairingLevel === "Çok Uyumlu"
  ).length;

  const averageBottlePrice =
    pairings.length === 0
      ? 0
      : pairings.reduce(
          (total, pairing) => total + Number(pairing.bottlePrice),
          0
        ) / pairings.length;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Mutfak, Bar & Stok
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Şarap Pairing
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Menü ürünleriyle önerilen şarapları eşleştir, servis notlarını ve
              bardak/şişe satış fiyatlarını takip et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Pairing Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Eşleşme</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalPairings}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Aktif Pairing</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {activePairings}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Çok Uyumlu</p>
          <h3 className="mt-3 text-2xl font-semibold text-blue-700">
            {strongPairings}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Ort. Şişe Fiyatı</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {formatCurrency(averageBottlePrice)}
          </h3>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Pairing Ekle
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Bu kayıt ileride müşteri menüsü, garson önerileri ve satış
            raporlarıyla ilişkilendirilecek.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="dishName"
            value={form.dishName}
            onChange={handleChange}
            placeholder="Yemek adı"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="dishCategory"
            value={form.dishCategory}
            onChange={handleChange}
            placeholder="Yemek kategorisi"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="wineName"
            value={form.wineName}
            onChange={handleChange}
            placeholder="Şarap adı"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="wineType"
            value={form.wineType}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Şarap türü seç</option>
            <option value="Kırmızı">Kırmızı</option>
            <option value="Beyaz">Beyaz</option>
            <option value="Rose">Rose</option>
            <option value="Köpüklü">Köpüklü</option>
            <option value="Tatlı">Tatlı</option>
          </select>

          <select
            name="pairingLevel"
            value={form.pairingLevel}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Çok Uyumlu">Çok Uyumlu</option>
            <option value="Uyumlu">Uyumlu</option>
            <option value="Önerilir">Önerilir</option>
            <option value="Alternatif">Alternatif</option>
          </select>

          <input
            name="glassPrice"
            value={form.glassPrice}
            onChange={handleChange}
            placeholder="Kadeh fiyatı"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <input
            name="bottlePrice"
            value={form.bottlePrice}
            onChange={handleChange}
            placeholder="Şişe fiyatı"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
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
            name="serviceNote"
            value={form.serviceNote}
            onChange={handleChange}
            placeholder="Servis notu"
            className="col-span-4 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Pairing Ekle
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
        <div className="border-b border-[#eadfce] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Pairing Listesi
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Aktif eşleşmeler servis ekibi ve müşteri menüsü için öneri olarak
            kullanılacak.
          </p>
        </div>

        <table className="w-full text-left">
          <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
            <tr>
              <th className="px-6 py-4">Yemek</th>
              <th className="px-6 py-4">Şarap</th>
              <th className="px-6 py-4">Tür</th>
              <th className="px-6 py-4">Uyum</th>
              <th className="px-6 py-4">Kadeh</th>
              <th className="px-6 py-4">Şişe</th>
              <th className="px-6 py-4">Durum</th>
              <th className="px-6 py-4 text-right">Yayın</th>
            </tr>
          </thead>

          <tbody>
            {pairings.map((pairing) => (
              <tr
                key={pairing.id}
                className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
              >
                <td className="px-6 py-4">
                  <p className="font-medium text-[#211914]">
                    {pairing.dishName}
                  </p>
                  <p className="mt-1 text-xs text-[#8a7560]">
                    {pairing.dishCategory}
                  </p>
                </td>

                <td className="px-6 py-4">
                  <p className="font-medium text-[#211914]">
                    {pairing.wineName}
                  </p>
                  <p className="mt-1 max-w-[260px] text-xs text-[#8a7560]">
                    {pairing.serviceNote}
                  </p>
                </td>

                <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                  {pairing.wineType}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${getPairingClass(
                      pairing.pairingLevel
                    )}`}
                  >
                    {pairing.pairingLevel}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-[#211914]">
                  {formatCurrency(pairing.glassPrice)}
                </td>

                <td className="px-6 py-4 text-sm text-[#211914]">
                  {formatCurrency(pairing.bottlePrice)}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                      pairing.status
                    )}`}
                  >
                    {pairing.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <select
                    value={pairing.status}
                    onChange={(event) =>
                      updateStatus(pairing.id, event.target.value)
                    }
                    className="rounded-xl border border-[#dfd0b8] bg-[#fbf8f3] px-3 py-2 text-xs outline-none focus:border-[#c9a45c]"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Pasif">Pasif</option>
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