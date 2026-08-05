import { useEffect, useMemo, useState } from "react";

function formatMoney(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("tr-TR");
}

const emptyForm = {
  name: "",
  category: "Genel",
  unit: "adet",
  currentStock: "",
  minStock: "",
  note: "",
};

export default function InventoryPage({ user }) {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInventory();
    fetchStockMovements();
  }, []);

  async function fetchInventory() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch("http://localhost:4000/api/inventory-items", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Stok kartları alınamadı.");
        return;
      }

      setInventoryItems(data.inventoryItems || []);
    } catch {
      setError("Backend bağlantısı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchStockMovements() {
    try {
      const token = localStorage.getItem("handsoff_token");

      const response = await fetch("http://localhost:4000/api/stock-movements", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStockMovements(data.stockMovements || []);
      }
    } catch {
      setStockMovements([]);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleNewItem() {
    setSelectedItem(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  }

  function handleSelectItem(item) {
    setSelectedItem(item);
    setMessage("");
    setError("");

    setForm({
      name: item.name || "",
      category: item.category || "Genel",
      unit: item.unit || "adet",
      currentStock: String(item.currentStock || ""),
      minStock: String(item.minStock || ""),
      note: item.note || "",
    });
  }

  async function handleSaveItem(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Stok adı zorunlu.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch("http://localhost:4000/api/inventory-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Stok kartı kaydedilemedi.");
        return;
      }

      setMessage("Stok kartı kaydedildi.");
      setSelectedItem(data.inventoryItem || null);

      await fetchInventory();
      await fetchStockMovements();
    } catch {
      setError("Stok kartı kaydedilirken backend bağlantısı kurulamadı.");
    } finally {
      setSaving(false);
    }
  }

  const lowStockItems = inventoryItems.filter((item) => {
    return (
      Number(item.minStock || 0) > 0 &&
      Number(item.currentStock || 0) <= Number(item.minStock || 0)
    );
  });

  const totalStockValue = inventoryItems.reduce((total, item) => {
    const relatedMovements = stockMovements.filter(
      (movement) => movement.inventoryItem?.id === item.id
    );

    const lastMovement = relatedMovements[0];
    const estimatedUnitPrice = lastMovement
      ? Number(lastMovement.unitPrice || 0)
      : 0;

    return total + Number(item.currentStock || 0) * estimatedUnitPrice;
  }, 0);

  const categorySummary = useMemo(() => {
    const summaryMap = new Map();

    inventoryItems.forEach((item) => {
      const category = item.category || "Genel";
      const current = summaryMap.get(category) || {
        category,
        count: 0,
        totalStock: 0,
        lowStockCount: 0,
      };

      current.count += 1;
      current.totalStock += Number(item.currentStock || 0);

      if (
        Number(item.minStock || 0) > 0 &&
        Number(item.currentStock || 0) <= Number(item.minStock || 0)
      ) {
        current.lowStockCount += 1;
      }

      summaryMap.set(category, current);
    });

    return Array.from(summaryMap.values()).sort((a, b) => b.count - a.count);
  }, [inventoryItems]);

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {user.restaurantName}</p>

            <h1>Stok Yönetimi</h1>

            <p>
              Satın alma taleplerinden gelen stok girişlerini, stok kartlarını,
              mevcut miktarları ve minimum stok uyarılarını buradan takip
              edebilirsin.
            </p>
          </div>

          <button
            className="hero-button"
            type="button"
            onClick={() => {
              fetchInventory();
              fetchStockMovements();
            }}
          >
            Yenile
          </button>
        </div>
      </div>

      {message && (
        <div
          className="error-box"
          style={{
            color: "#166534",
            background: "#f0fdf4",
            borderColor: "#bbf7d0",
          }}
        >
          {message}
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 18,
        }}
      >
        <div className="stat-card">
          <p>Toplam Stok Kartı</p>
          <h3>{inventoryItems.length}</h3>
          <span>Kayıtlı stok kalemi</span>
        </div>

        <div className="stat-card">
          <p>Düşük Stok</p>
          <h3>{lowStockItems.length}</h3>
          <span>Minimum seviyeye gelenler</span>
        </div>

        <div className="stat-card">
          <p>Stok Hareketi</p>
          <h3>{stockMovements.length}</h3>
          <span>Giriş / çıkış hareketleri</span>
        </div>

        <div className="stat-card">
          <p>Tahmini Stok Değeri</p>
          <h3>{formatMoney(totalStockValue)}</h3>
          <span>Son alış fiyatına göre yaklaşık</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Kategori Özeti</h2>

            <p className="panel-sub">
              Stok kartlarının kategori bazlı dağılımı.
            </p>
          </div>

          <span className="mini-pill">{categorySummary.length} kategori</span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>Kategori</th>
              <th>Ürün Sayısı</th>
              <th>Toplam Miktar</th>
              <th>Düşük Stok</th>
            </tr>
          </thead>

          <tbody>
            {categorySummary.length === 0 ? (
              <tr>
                <td colSpan="4">Henüz kategori özeti yok.</td>
              </tr>
            ) : (
              categorySummary.map((item) => (
                <tr key={item.category}>
                  <td>{item.category}</td>
                  <td>{item.count}</td>
                  <td>{item.totalStock}</td>
                  <td>{item.lowStockCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>{selectedItem ? "Stok Kartı Düzenle" : "Yeni Stok Kartı"}</h2>

            <p className="panel-sub">
              Satın alma talebinden otomatik gelen ürünleri burada
              düzenleyebilir veya manuel stok kartı oluşturabilirsin.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="mini-pill">
              {selectedItem ? "Seçili Kayıt" : "Yeni Kayıt"}
            </span>

            <button
              className="hero-button"
              type="button"
              onClick={handleNewItem}
            >
              Yeni Stok Kartı
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveItem}>
          <table className="module-table">
            <tbody>
              <tr>
                <td>Stok Adı</td>
                <td>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Örn: Dana bonfile, domates, şarap, temizlik ürünü"
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                    }}
                  />
                </td>
              </tr>

              <tr>
                <td>Kategori</td>
                <td>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    <option value="Genel">Genel</option>
                    <option value="Et / Tavuk">Et / Tavuk</option>
                    <option value="Balık">Balık</option>
                    <option value="Sebze / Meyve">Sebze / Meyve</option>
                    <option value="İçecek">İçecek</option>
                    <option value="Alkol">Alkol</option>
                    <option value="Kuru Gıda">Kuru Gıda</option>
                    <option value="Temizlik">Temizlik</option>
                    <option value="Bakım / Onarım">Bakım / Onarım</option>
                    <option value="Pazarlama">Pazarlama</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </td>
              </tr>

              <tr>
                <td>Birim</td>
                <td>
                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    <option value="adet">adet</option>
                    <option value="kg">kg</option>
                    <option value="gr">gr</option>
                    <option value="lt">lt</option>
                    <option value="ml">ml</option>
                    <option value="koli">koli</option>
                    <option value="şişe">şişe</option>
                    <option value="paket">paket</option>
                  </select>
                </td>
              </tr>

              <tr>
                <td>Mevcut Stok</td>
                <td>
                  <input
                    type="number"
                    name="currentStock"
                    value={form.currentStock}
                    onChange={handleChange}
                    placeholder="Mevcut miktar"
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                    }}
                  />
                </td>
              </tr>

              <tr>
                <td>Minimum Stok</td>
                <td>
                  <input
                    type="number"
                    name="minStock"
                    value={form.minStock}
                    onChange={handleChange}
                    placeholder="Bu seviyeye düşünce uyarı"
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                    }}
                  />
                </td>
              </tr>

              <tr>
                <td>Not</td>
                <td>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    rows="3"
                    placeholder="İç not"
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <button
            className="hero-button"
            type="submit"
            disabled={saving}
            style={{ marginTop: 18 }}
          >
            {saving
              ? "Kaydediliyor..."
              : selectedItem
                ? "Stok Kartını Güncelle"
                : "Stok Kartı Oluştur"}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Stok Kartları</h2>

            <p className="panel-sub">
              Mevcut stok miktarlarını ve düşük stok uyarılarını buradan
              görebilirsin.
            </p>
          </div>

          <span className="mini-pill">{inventoryItems.length} kayıt</span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>İşlem</th>
              <th>Stok</th>
              <th>Kategori</th>
              <th>Mevcut</th>
              <th>Minimum</th>
              <th>Durum</th>
              <th>Güncelleme</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">Stok kartları yükleniyor...</td>
              </tr>
            ) : inventoryItems.length === 0 ? (
              <tr>
                <td colSpan="7">Henüz stok kartı yok.</td>
              </tr>
            ) : (
              inventoryItems.map((item) => {
                const isLowStock =
                  Number(item.minStock || 0) > 0 &&
                  Number(item.currentStock || 0) <= Number(item.minStock || 0);

                return (
                  <tr key={item.id}>
                    <td>
                      <button
                        type="button"
                        className="hero-button"
                        onClick={() => handleSelectItem(item)}
                        style={{ padding: "8px 12px", borderRadius: 12 }}
                      >
                        Düzenle
                      </button>
                    </td>

                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>
                      {item.currentStock} {item.unit}
                    </td>
                    <td>
                      {item.minStock} {item.unit}
                    </td>
                    <td>{isLowStock ? "Düşük stok" : "Yeterli"}</td>
                    <td>{formatDate(item.updatedAt || item.createdAt)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Stok Hareketleri</h2>

            <p className="panel-sub">
              Satın alma taleplerinden gelen stok girişleri burada görünür.
            </p>
          </div>

          <span className="mini-pill">{stockMovements.length} hareket</span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Stok</th>
              <th>Tip</th>
              <th>Miktar</th>
              <th>Birim Fiyat</th>
              <th>Toplam</th>
              <th>Kaynak</th>
            </tr>
          </thead>

          <tbody>
            {stockMovements.length === 0 ? (
              <tr>
                <td colSpan="7">Henüz stok hareketi yok.</td>
              </tr>
            ) : (
              stockMovements.map((movement) => (
                <tr key={movement.id}>
                  <td>{formatDate(movement.movementDate)}</td>
                  <td>{movement.inventoryItem?.name || "-"}</td>
                  <td>
                    {movement.type === "PURCHASE_IN"
                      ? "Satın alma girişi"
                      : movement.type}
                  </td>
                  <td>
                    {movement.quantity} {movement.unit}
                  </td>
                  <td>{formatMoney(movement.unitPrice)}</td>
                  <td>{formatMoney(movement.totalAmount)}</td>
                  <td>
                    {movement.purchaseOrder
                      ? movement.purchaseOrder.supplierName
                      : movement.source}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
