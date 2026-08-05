const orders = [
  {
    id: "ORD-001",
    table: "Masa 4",
    customer: "Walk-in",
    total: 0,
    status: "Hazırlanıyor",
    time: "12:40",
  },
  {
    id: "ORD-002",
    table: "Masa 7",
    customer: "Walk-in",
    total: 0,
    status: "Serviste",
    time: "12:55",
  },
  {
    id: "ORD-003",
    table: "Paket",
    customer: "Online Sipariş",
    total: 0,
    status: "Bekliyor",
    time: "13:10",
  },
];

export default function Orders() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Siparişler</h2>
          <p className="text-gray-600 mt-1">
            Masa, paket ve online siparişleri takip et.
          </p>
        </div>

        <button className="rounded-xl bg-[#1f1712] px-5 py-3 text-white text-sm font-medium">
          Yeni Sipariş
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="rounded-2xl bg-white p-5 border shadow-sm">
          <p className="text-sm text-gray-500">Bekleyen</p>
          <h3 className="text-3xl font-bold mt-2">1</h3>
        </div>

        <div className="rounded-2xl bg-white p-5 border shadow-sm">
          <p className="text-sm text-gray-500">Hazırlanan</p>
          <h3 className="text-3xl font-bold mt-2">1</h3>
        </div>

        <div className="rounded-2xl bg-white p-5 border shadow-sm">
          <p className="text-sm text-gray-500">Serviste</p>
          <h3 className="text-3xl font-bold mt-2">1</h3>
        </div>
      </div>

      <div className="rounded-2xl bg-white border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#f2ece5] text-sm text-gray-600">
            <tr>
              <th className="p-4">Sipariş No</th>
              <th className="p-4">Masa / Kanal</th>
              <th className="p-4">Müşteri</th>
              <th className="p-4">Tutar</th>
              <th className="p-4">Durum</th>
              <th className="p-4">Saat</th>
              <th className="p-4 text-right">İşlem</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="p-4 font-medium">{order.id}</td>
                <td className="p-4">{order.table}</td>
                <td className="p-4 text-gray-600">{order.customer}</td>
                <td className="p-4">₺{order.total}</td>
                <td className="p-4">
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{order.time}</td>
                <td className="p-4 text-right">
                  <button className="text-sm font-medium">Detay</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}