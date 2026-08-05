const tables = [
  { id: 1, name: "Masa 1", capacity: 2, status: "Boş" },
  { id: 2, name: "Masa 2", capacity: 4, status: "Dolu" },
  { id: 3, name: "Masa 3", capacity: 4, status: "Rezerve" },
  { id: 4, name: "Masa 4", capacity: 6, status: "Dolu" },
  { id: 5, name: "Masa 5", capacity: 2, status: "Boş" },
  { id: 6, name: "Masa 6", capacity: 8, status: "Boş" },
];

function getStatusClass(status) {
  if (status === "Boş") return "bg-green-100 text-green-700";
  if (status === "Dolu") return "bg-red-100 text-red-700";
  if (status === "Rezerve") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-700";
}

export default function Tables() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Masalar</h2>
        <p className="text-gray-600 mt-1">
          Masa durumlarını ve kapasite bilgilerini takip et.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {tables.map((table) => (
          <div
            key={table.id}
            className="rounded-2xl bg-white p-5 border shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{table.name}</h3>

              <span
                className={`rounded-full px-3 py-1 text-xs ${getStatusClass(
                  table.status
                )}`}
              >
                {table.status}
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Kapasite: {table.capacity} kişi
            </p>

            <button className="mt-5 w-full rounded-xl border px-4 py-2 text-sm font-medium hover:bg-[#f2ece5]">
              Masa Detayı
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}