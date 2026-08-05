const stats = [
  { title: "Bugünkü Ciro", value: "₺0" },
  { title: "Açık Masa", value: "0" },
  { title: "Aktif Sipariş", value: "0" },
  { title: "Rezervasyon", value: "0" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-gray-600 mt-1">
          Restoran operasyonlarını tek ekrandan takip et.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {stats.map((item) => (
          <div key={item.title} className="rounded-2xl bg-white p-5 shadow-sm border">
            <p className="text-sm text-gray-500">{item.title}</p>
            <h3 className="text-3xl font-bold mt-3">{item.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-2xl bg-white p-5 shadow-sm border">
          <h3 className="font-semibold mb-4">Son Siparişler</h3>
          <p className="text-gray-500 text-sm">Henüz sipariş yok.</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm border">
          <h3 className="font-semibold mb-4">Bugünkü Rezervasyonlar</h3>
          <p className="text-gray-500 text-sm">Henüz rezervasyon yok.</p>
        </div>
      </div>
    </div>
  );
}