import { useState } from "react";

const initialMenuItems = [
  {
    id: 1,
    name: "Kara Od Bonfile",
    category: "Ana Yemek",
    description:
      "İyi bir kadeh, iyi bir sohbet ve paylaşmaya değer özel bir tabak.",
    price: 1450,
    tags: "Şef önerisi",
    allergens: "Süt ürünü",
    channel: "QR Menü",
    status: "Yayında",
  },
  {
    id: 2,
    name: "Brunch Kahvaltı Pizzası",
    category: "Brunch",
    description:
      "Odun fırınında hazırlanan, brunch deneyiminin yıldızı olan özel kahvaltı pizzası.",
    price: 620,
    tags: "Brunch özel",
    allergens: "Gluten, süt ürünü, yumurta",
    channel: "QR Menü",
    status: "Yayında",
  },
  {
    id: 3,
    name: "Gerçek İtalyan Tiramisu",
    category: "Tatlı",
    description:
      "Espresso ve kahve likörüyle hazırlanan klasik İtalyan tiramisu.",
    price: 360,
    tags: "Tatlı",
    allergens: "Süt ürünü, yumurta, gluten",
    channel: "QR Menü",
    status: "Yayında",
  },
  {
    id: 4,
    name: "No1 Dana Burger",
    category: "Burger",
    description:
      "180 gr dana köftesi, cheddar peyniri, karamelize soğan ve No1 özel sos.",
    price: 540,
    tags: "Popüler",
    allergens: "Gluten, süt ürünü",
    channel: "QR Menü",
    status: "Taslak",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusClass(status) {
  if (status === "Yayında") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "Taslak") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-gray-50 text-gray-700 border-gray-200";
}

function getChannelClass(channel) {
  if (channel === "QR Menü") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (channel === "Baskı Menü") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  return "bg-[#f5efe6] text-[#7d6b5a] border-[#e3d6c4]";
}

export default function PrintMenu() {
  const [menuItems, setMenuItems] = useState(initialMenuItems);

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    tags: "",
    allergens: "",
    channel: "QR Menü",
    status: "Yayında",
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

    const newMenuItem = {
      id: Date.now(),
      name: form.name,
      category: form.category,
      description: form.description,
      price: Number(form.price),
      tags: form.tags,
      allergens: form.allergens,
      channel: form.channel,
      status: form.status,
    };

    setMenuItems((prev) => [newMenuItem, ...prev]);

    setForm({
      name: "",
      category: "",
      description: "",
      price: "",
      tags: "",
      allergens: "",
      channel: "QR Menü",
      status: "Yayında",
    });
  }

  function updateStatus(id, nextStatus) {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item
      )
    );
  }

  const totalItems = menuItems.length;

  const publishedItems = menuItems.filter(
    (item) => item.status === "Yayında"
  ).length;

  const draftItems = menuItems.filter((item) => item.status === "Taslak").length;

  const categories = [...new Set(menuItems.map((item) => item.category))];

  const averagePrice =
    menuItems.length === 0
      ? 0
      : menuItems.reduce((total, item) => total + Number(item.price), 0) /
        menuItems.length;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Menü & Satış
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Müşteri Menüsü
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              QR menü, baskı menü ve müşteri tarafında görünecek ürün adlarını,
              açıklamaları, fiyatları, alerjenleri ve yayın durumunu yönet.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Menü Önizleme
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Ürün</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalItems}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Yayında</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {publishedItems}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Taslak</p>
          <h3 className="mt-3 text-2xl font-semibold text-amber-700">
            {draftItems}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Ortalama Fiyat</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {formatCurrency(averagePrice)}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Kategori: {categories.length}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Menü Ürünü Yayına Al
          </h2>
          <p className="mt-1 text-sm text-[#8a7560]">
            Bu alan müşterinin göreceği ürün metnini yönetir. Maliyet ekranı
            iç kullanım, bu ekran ise müşteri tarafı içindir.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ürün adı"
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

          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Fiyat"
            type="number"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="channel"
            value={form.channel}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="QR Menü">QR Menü</option>
            <option value="Baskı Menü">Baskı Menü</option>
            <option value="QR + Baskı">QR + Baskı</option>
          </select>

          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="Etiket / öne çıkan bilgi"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <input
            name="allergens"
            value={form.allergens}
            onChange={handleChange}
            placeholder="Alerjen bilgisi"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="Yayında">Yayında</option>
            <option value="Taslak">Taslak</option>
            <option value="Pasif">Pasif</option>
          </select>

          <button className="rounded-2xl bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Menüye Ekle
          </button>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Müşterinin göreceği ürün açıklaması"
            rows="3"
            className="col-span-4 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />
        </div>
      </form>

      <div className="grid grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
          <div className="border-b border-[#eadfce] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#211914]">
              Müşteri Menü Listesi
            </h2>
            <p className="mt-1 text-sm text-[#8a7560]">
              Yayında olan ürünler QR menü ve baskı menüye aktarılacak.
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
              <tr>
                <th className="px-6 py-4">Ürün</th>
                <th className="px-6 py-4">Fiyat</th>
                <th className="px-6 py-4">Kanal</th>
                <th className="px-6 py-4">Alerjen</th>
                <th className="px-6 py-4 text-right">Yayın</th>
              </tr>
            </thead>

            <tbody>
              {menuItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#211914]">{item.name}</p>
                    <p className="mt-1 text-xs text-[#8a7560]">
                      {item.category}
                    </p>
                    <p className="mt-2 max-w-[420px] text-xs leading-5 text-[#7d6b5a]">
                      {item.description}
                    </p>
                    {item.tags && (
                      <span className="mt-2 inline-flex rounded-full border border-[#c9a45c]/30 bg-[#fff7e7] px-3 py-1 text-xs text-[#9c7439]">
                        {item.tags}
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-[#211914]">
                    {formatCurrency(item.price)}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${getChannelClass(
                        item.channel
                      )}`}
                    >
                      {item.channel}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-[#7d6b5a]">
                    {item.allergens || "-"}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <select
                      value={item.status}
                      onChange={(event) =>
                        updateStatus(item.id, event.target.value)
                      }
                      className={`rounded-xl border px-3 py-2 text-xs outline-none ${getStatusClass(
                        item.status
                      )}`}
                    >
                      <option value="Yayında">Yayında</option>
                      <option value="Taslak">Taslak</option>
                      <option value="Pasif">Pasif</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#211914]">
            Menü Önizleme
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Yayında olan ürünlerin müşteriye nasıl görüneceğinin basit
            önizlemesi.
          </p>

          <div className="mt-6 space-y-4">
            {categories.map((category) => {
              const publishedCategoryItems = menuItems.filter(
                (item) =>
                  item.category === category && item.status === "Yayında"
              );

              if (publishedCategoryItems.length === 0) {
                return null;
              }

              return (
                <div key={category}>
                  <h3 className="border-b border-[#eadfce] pb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#9c7439]">
                    {category}
                  </h3>

                  <div className="mt-3 space-y-4">
                    {publishedCategoryItems.map((item) => (
                      <div key={item.id}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-[#211914]">
                              {item.name}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-[#7d6b5a]">
                              {item.description}
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-semibold text-[#211914]">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}