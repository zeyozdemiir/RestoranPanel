import { useState } from "react";

const initialCards = [
  {
    id: 1,
    tableNo: "Masa 1",
    area: "Salon",
    menuUrl: "https://no1culinaria.com/menu?table=1",
    status: "Aktif",
    printStatus: "Basılı",
    scanCount: 248,
    lastPrinted: "2026-06-20",
  },
  {
    id: 2,
    tableNo: "Masa 2",
    area: "Salon",
    menuUrl: "https://no1culinaria.com/menu?table=2",
    status: "Aktif",
    printStatus: "Basılı",
    scanCount: 192,
    lastPrinted: "2026-06-20",
  },
  {
    id: 3,
    tableNo: "Bahçe 1",
    area: "Bahçe",
    menuUrl: "https://no1culinaria.com/menu?table=garden-1",
    status: "Aktif",
    printStatus: "Yeniden Basılacak",
    scanCount: 311,
    lastPrinted: "2026-06-12",
  },
  {
    id: 4,
    tableNo: "Bar 1",
    area: "Bar",
    menuUrl: "https://no1culinaria.com/menu?table=bar-1",
    status: "Pasif",
    printStatus: "Taslak",
    scanCount: 0,
    lastPrinted: "-",
  },
];

function getStatusClass(status) {
  if (status === "Aktif") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

function getPrintStatusClass(status) {
  if (status === "Basılı") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "Yeniden Basılacak") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-blue-50 text-blue-700 border-blue-200";
}

function createTableSlug(tableNo) {
  return tableNo
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c");
}

export default function TableQR() {
  const [cards, setCards] = useState(initialCards);

  const [form, setForm] = useState({
    tableNo: "",
    area: "",
    status: "Aktif",
    printStatus: "Taslak",
    lastPrinted: "",
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

    const slug = createTableSlug(form.tableNo);

    const newCard = {
      id: Date.now(),
      tableNo: form.tableNo,
      area: form.area,
      menuUrl: `https://no1culinaria.com/menu?table=${slug}`,
      status: form.status,
      printStatus: form.printStatus,
      scanCount: 0,
      lastPrinted: form.lastPrinted || "-",
    };

    setCards((prev) => [newCard, ...prev]);

    setForm({
      tableNo: "",
      area: "",
      status: "Aktif",
      printStatus: "Taslak",
      lastPrinted: "",
    });
  }

  function updateStatus(id, nextStatus) {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, status: nextStatus } : card
      )
    );
  }

  function updatePrintStatus(id, nextStatus) {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, printStatus: nextStatus } : card
      )
    );
  }

  function increaseScanCount(id) {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id
          ? { ...card, scanCount: Number(card.scanCount) + 1 }
          : card
      )
    );
  }

  const totalCards = cards.length;

  const activeCards = cards.filter((card) => card.status === "Aktif").length;

  const needsPrint = cards.filter(
    (card) => card.printStatus === "Yeniden Basılacak"
  ).length;

  const totalScans = cards.reduce(
    (total, card) => total + Number(card.scanCount),
    0
  );

  const areas = [...new Set(cards.map((card) => card.area))];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Menü & Satış
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Masa QR Kartları
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Masalara özel QR menü linklerini, baskı durumunu, aktif-pasif
              durumunu ve taranma sayılarını takip et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            QR Kartlarını Hazırla
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam QR Kart</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalCards}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Aktif Kart</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {activeCards}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Yeniden Basılacak</p>
          <h3 className="mt-3 text-2xl font-semibold text-amber-700">
            {needsPrint}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Tarama</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalScans}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Alan sayısı: {areas.length}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Masa QR Kartı Oluştur
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Masa adına göre otomatik QR menü linki oluşturulur. Gerçek QR görsel
            üretimi ileride backend tarafında bağlanacak.
          </p>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <input
            name="tableNo"
            value={form.tableNo}
            onChange={handleChange}
            placeholder="Masa adı / no"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="area"
            value={form.area}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Alan seç</option>
            <option value="Salon">Salon</option>
            <option value="Bahçe">Bahçe</option>
            <option value="Bar">Bar</option>
            <option value="Teras">Teras</option>
            <option value="Özel Alan">Özel Alan</option>
          </select>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Aktif">Aktif</option>
            <option value="Pasif">Pasif</option>
          </select>

          <select
            name="printStatus"
            value={form.printStatus}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Taslak">Taslak</option>
            <option value="Basılı">Basılı</option>
            <option value="Yeniden Basılacak">Yeniden Basılacak</option>
          </select>

          <input
            name="lastPrinted"
            value={form.lastPrinted}
            onChange={handleChange}
            type="date"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            QR Kart Ekle
          </button>
        </div>
      </form>

      <div className="grid grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
          <div className="border-b border-[#eadfce] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#211914]">
              Masa QR Listesi
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              QR kartların aktiflik ve baskı durumunu buradan güncelle.
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
              <tr>
                <th className="px-6 py-4">Masa</th>
                <th className="px-6 py-4">QR Link</th>
                <th className="px-6 py-4">Tarama</th>
                <th className="px-6 py-4">Baskı</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4 text-right">İşlem</th>
              </tr>
            </thead>

            <tbody>
              {cards.map((card) => (
                <tr
                  key={card.id}
                  className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#211914]">
                      {card.tableNo}
                    </p>
                    <p className="mt-1 text-xs text-[#8a7560]">{card.area}</p>
                  </td>

                  <td className="px-6 py-4">
                    <p className="max-w-[280px] truncate text-sm text-[#211914]">
                      {card.menuUrl}
                    </p>
                    <p className="mt-1 text-xs text-[#8a7560]">
                      Son baskı: {card.lastPrinted}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-[#211914]">
                    {card.scanCount}
                  </td>

                  <td className="px-6 py-4">
                    <select
                      value={card.printStatus}
                      onChange={(event) =>
                        updatePrintStatus(card.id, event.target.value)
                      }
                      className={`rounded-xl border px-3 py-2 text-xs outline-none ${getPrintStatusClass(
                        card.printStatus
                      )}`}
                    >
                      <option value="Taslak">Taslak</option>
                      <option value="Basılı">Basılı</option>
                      <option value="Yeniden Basılacak">
                        Yeniden Basılacak
                      </option>
                    </select>
                  </td>

                  <td className="px-6 py-4">
                    <select
                      value={card.status}
                      onChange={(event) =>
                        updateStatus(card.id, event.target.value)
                      }
                      className={`rounded-xl border px-3 py-2 text-xs outline-none ${getStatusClass(
                        card.status
                      )}`}
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Pasif">Pasif</option>
                    </select>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => increaseScanCount(card.id)}
                      className="rounded-full border border-[#c9a45c]/30 px-4 py-2 text-xs font-medium text-[#9c7439] transition hover:bg-[#fff7e7]"
                    >
                      Test Tara
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#211914]">
            QR Kart Önizleme
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Basılacak kartların sade görsel önizlemesi.
          </p>

          <div className="mt-6 space-y-5">
            {cards.slice(0, 3).map((card) => (
              <div
                key={card.id}
                className="rounded-3xl border border-[#d8c7ad] bg-[#fbf8f3] p-5 text-center"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
                  No1 Culinaria
                </p>

                <div className="mx-auto mt-4 flex h-32 w-32 items-center justify-center rounded-2xl border border-[#211914] bg-white">
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: 25 }).map((_, index) => (
                      <span
                        key={index}
                        className={`h-4 w-4 rounded-sm ${
                          index % 2 === 0 ||
                          index === 7 ||
                          index === 13 ||
                          index === 19
                            ? "bg-[#211914]"
                            : "bg-[#f5efe6]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="mt-4 text-xl font-semibold text-[#211914]">
                  {card.tableNo}
                </h3>

                <p className="mt-1 text-sm text-[#8a7560]">{card.area}</p>

                <p className="mt-3 break-all text-xs leading-5 text-[#7d6b5a]">
                  {card.menuUrl}
                </p>

                <span
                  className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getPrintStatusClass(
                    card.printStatus
                  )}`}
                >
                  {card.printStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}