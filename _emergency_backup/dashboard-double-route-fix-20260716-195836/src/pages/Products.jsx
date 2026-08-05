import { useState } from "react";

const initialProducts = [
  {
    id: 1,
    name: "No1 Dana Burger",
    category: "Burger",
    price: 0,
    status: "Aktif",
  },
  {
    id: 2,
    name: "Margarita Pizza",
    category: "Pizza",
    price: 0,
    status: "Aktif",
  },
];

export default function Products() {
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const newProduct = {
      id: Date.now(),
      name: form.name,
      category: form.category,
      price: Number(form.price),
      status: "Aktif",
    };

    setProducts([...products, newProduct]);

    setForm({
      name: "",
      category: "",
      price: "",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Ürünler</h2>
        <p className="text-gray-600 mt-1">
          Menü ürünlerini ve fiyatlarını yönet.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white p-5 border shadow-sm grid grid-cols-4 gap-4"
      >
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Ürün adı"
          className="rounded-xl border px-4 py-3"
          required
        />

        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Kategori"
          className="rounded-xl border px-4 py-3"
          required
        />

        <input
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Fiyat"
          type="number"
          className="rounded-xl border px-4 py-3"
          required
        />

        <button className="rounded-xl bg-[#1f1712] px-5 py-3 text-white text-sm font-medium">
          Ürün Ekle
        </button>
      </form>

      <div className="rounded-2xl bg-white border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#f2ece5] text-sm text-gray-600">
            <tr>
              <th className="p-4">Ürün Adı</th>
              <th className="p-4">Kategori</th>
              <th className="p-4">Fiyat</th>
              <th className="p-4">Durum</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="p-4 font-medium">{product.name}</td>
                <td className="p-4 text-gray-600">{product.category}</td>
                <td className="p-4">₺{product.price}</td>
                <td className="p-4">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                    {product.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}