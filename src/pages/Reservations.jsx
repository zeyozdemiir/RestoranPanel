const reservations = [
  {
    id: 1,
    customer: "Ayşe Yılmaz",
    phone: "05xx xxx xx xx",
    date: "Bugün",
    time: "19:30",
    people: 4,
    status: "Onaylandı",
  },
  {
    id: 2,
    customer: "Mehmet Demir",
    phone: "05xx xxx xx xx",
    date: "Bugün",
    time: "20:00",
    people: 2,
    status: "Bekliyor",
  },
];

function getStatusClass(status) {
  if (status === "Onaylandı") return "bg-green-100 text-green-700";
  if (status === "Bekliyor") return "bg-yellow-100 text-yellow-700";
  if (status === "İptal") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}

export default function Reservations() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Rezervasyonlar</h2>
          <p className="text-gray-600 mt-1">
            Günlük rezervasyonları ve müşteri bilgilerini takip et.
          </p>
        </div>

        <button className="rounded-xl bg-[#1f1712] px-5 py-3 text-white text-sm font-medium">
          Yeni Rezervasyon
        </button>
      </div>

      <div className="rounded-2xl bg-white border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#f2ece5] text-sm text-gray-600">
            <tr>
              <th className="p-4">Müşteri</th>
              <th className="p-4">Telefon</th>
              <th className="p-4">Tarih</th>
              <th className="p-4">Saat</th>
              <th className="p-4">Kişi</th>
              <th className="p-4">Durum</th>
              <th className="p-4 text-right">İşlem</th>
            </tr>
          </thead>

          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="border-t">
                <td className="p-4 font-medium">{reservation.customer}</td>
                <td className="p-4 text-gray-600">{reservation.phone}</td>
                <td className="p-4">{reservation.date}</td>
                <td className="p-4">{reservation.time}</td>
                <td className="p-4">{reservation.people}</td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${getStatusClass(
                      reservation.status
                    )}`}
                  >
                    {reservation.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-sm font-medium">Düzenle</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}