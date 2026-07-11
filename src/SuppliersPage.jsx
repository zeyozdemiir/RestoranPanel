import { useEffect, useMemo, useState } from "react";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("tr-TR");
}

const emptyForm = {
  name: "",
  taxNumber: "",
  iban: "",
  phone: "",
  email: "",
  address: "",
  category: "Genel",
  contactName: "",
  note: "",
};

export default function SuppliersPage({ user }) {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  async function fetchSuppliers() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch("http://localhost:4000/api/suppliers", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Tedarikçiler alınamadı.");
        return;
      }

      setSuppliers(data.suppliers || []);
    } catch {
      setError("Backend bağlantısı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleNewSupplier() {
    setSelectedSupplier(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  }

  function handleSelectSupplier(supplier) {
    setSelectedSupplier(supplier);
    setMessage("");
    setError("");

    setForm({
      name: supplier.name || "",
      taxNumber: supplier.taxNumber || "",
      iban: supplier.iban || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      category: supplier.category || "Genel",
      contactName: supplier.contactName || "",
      note: supplier.note || "",
    });
  }

  async function handleSaveSupplier(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Tedarikçi adı zorunlu.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("handsoff_token");

      const url = selectedSupplier
        ? `http://localhost:4000/api/suppliers/${selectedSupplier.id}`
        : "http://localhost:4000/api/suppliers";

      const method = selectedSupplier ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Tedarikçi kaydı kaydedilemedi.");
        return;
      }

      setMessage(
        selectedSupplier
          ? "Tedarikçi kaydı güncellendi."
          : "Tedarikçi kaydı oluşturuldu."
      );

      setSelectedSupplier(data.supplier || null);
      await fetchSuppliers();
    } catch {
      setError("Tedarikçi kaydedilirken backend bağlantısı kurulamadı.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleSupplier(supplier) {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(
        `http://localhost:4000/api/suppliers/${supplier.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            isActive: !supplier.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Tedarikçi durumu güncellenemedi.");
        return;
      }

      setMessage(
        supplier.isActive
          ? "Tedarikçi pasife alındı."
          : "Tedarikçi aktife alındı."
      );

      await fetchSuppliers();
    } catch {
      setError("Tedarikçi durumu güncellenirken backend bağlantısı kurulamadı.");
    } finally {
      setSaving(false);
    }
  }

  const activeCount = suppliers.filter((supplier) => supplier.isActive).length;
  const passiveCount = suppliers.filter((supplier) => !supplier.isActive).length;
  const ibanCount = suppliers.filter((supplier) => supplier.iban).length;

  const categorySummary = useMemo(() => {
    const summaryMap = new Map();

    suppliers.forEach((supplier) => {
      const category = supplier.category || "Genel";
      const current = summaryMap.get(category) || {
        category,
        count: 0,
      };

      current.count += 1;
      summaryMap.set(category, current);
    });

    return Array.from(summaryMap.values()).sort((a, b) => b.count - a.count);
  }, [suppliers]);

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {user.restaurantName}</p>
            <h1>Tedarikçiler</h1>
            <p>
              Restoranın çalıştığı tedarikçileri, vergi bilgilerini, IBAN
              bilgilerini, iletişim kişilerini ve kategorilerini buradan
              yönetebilirsin.
            </p>
          </div>

          <button className="hero-button" type="button" onClick={fetchSuppliers}>
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
          <p>Toplam Tedarikçi</p>
          <h3>{suppliers.length}</h3>
          <span>Kayıtlı firma / kişi</span>
        </div>

        <div className="stat-card">
          <p>Aktif Tedarikçi</p>
          <h3>{activeCount}</h3>
          <span>Kullanımda olanlar</span>
        </div>

        <div className="stat-card">
          <p>Pasif Tedarikçi</p>
          <h3>{passiveCount}</h3>
          <span>Geçici olarak kullanılmayanlar</span>
        </div>

        <div className="stat-card">
          <p>IBAN Kayıtlı</p>
          <h3>{ibanCount}</h3>
          <span>Ödeme bilgisi girilenler</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Kategori Özeti</h2>
            <p className="panel-sub">
              Tedarikçilerin kategori bazlı dağılımı.
            </p>
          </div>

          <span className="mini-pill">{categorySummary.length} kategori</span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>Kategori</th>
              <th>Tedarikçi Sayısı</th>
            </tr>
          </thead>

          <tbody>
            {categorySummary.length === 0 ? (
              <tr>
                <td colSpan="2">Henüz kategori kaydı yok.</td>
              </tr>
            ) : (
              categorySummary.map((item) => (
                <tr key={item.category}>
                  <td>{item.category}</td>
                  <td>{item.count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>
              {selectedSupplier
                ? "Tedarikçi Düzenle"
                : "Yeni Tedarikçi Ekle"}
            </h2>
            <p className="panel-sub">
              Bu bilgiler fatura, satın alma, gider ve ödeme ekranlarıyla
              bağlanacak.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="mini-pill">
              {selectedSupplier ? "Seçili Kayıt" : "Yeni Kayıt"}
            </span>

            <button
              className="hero-button"
              type="button"
              onClick={handleNewSupplier}
            >
              Yeni Tedarikçi
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveSupplier}>
          <table className="module-table">
            <tbody>
              <tr>
                <td>Tedarikçi Adı</td>
                <td>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Örn: Sebze tedarikçisi, et firması, içecek firması"
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
                <td>Vergi No</td>
                <td>
                  <input
                    name="taxNumber"
                    value={form.taxNumber}
                    onChange={handleChange}
                    placeholder="Vergi numarası"
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
                <td>IBAN</td>
                <td>
                  <input
                    name="iban"
                    value={form.iban}
                    onChange={handleChange}
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
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
                    <option value="Teknik Servis">Teknik Servis</option>
                    <option value="Pazarlama">Pazarlama</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </td>
              </tr>

              <tr>
                <td>Yetkili Kişi</td>
                <td>
                  <input
                    name="contactName"
                    value={form.contactName}
                    onChange={handleChange}
                    placeholder="Yetkili kişi adı"
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
                <td>Telefon</td>
                <td>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Telefon"
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
                <td>E-posta</td>
                <td>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="E-posta"
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
                <td>Adres</td>
                <td>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Adres"
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
              : selectedSupplier
                ? "Tedarikçiyi Güncelle"
                : "Tedarikçi Ekle"}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Tedarikçi Listesi</h2>
            <p className="panel-sub">
              Kayıtlı tedarikçileri düzenleyebilir veya pasife alabilirsin.
            </p>
          </div>

          <span className="mini-pill">{suppliers.length} kayıt</span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>İşlem</th>
              <th>Durum</th>
              <th>Tedarikçi</th>
              <th>Kategori</th>
              <th>Vergi No</th>
              <th>IBAN</th>
              <th>Yetkili</th>
              <th>Telefon</th>
              <th>Kayıt Tarihi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9">Tedarikçiler yükleniyor...</td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan="9">Henüz tedarikçi kaydı yok.</td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="hero-button"
                        onClick={() => handleSelectSupplier(supplier)}
                        style={{ padding: "8px 12px", borderRadius: 12 }}
                      >
                        Düzenle
                      </button>

                      <button
                        type="button"
                        className="hero-button"
                        onClick={() => handleToggleSupplier(supplier)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 12,
                          background: supplier.isActive ? "#991b1b" : "#166534",
                        }}
                      >
                        {supplier.isActive ? "Pasife Al" : "Aktife Al"}
                      </button>
                    </div>
                  </td>

                  <td>{supplier.isActive ? "Aktif" : "Pasif"}</td>
                  <td>{supplier.name}</td>
                  <td>{supplier.category}</td>
                  <td>{supplier.taxNumber || "-"}</td>
                  <td>{supplier.iban || "-"}</td>
                  <td>{supplier.contactName || "-"}</td>
                  <td>{supplier.phone || "-"}</td>
                  <td>{formatDate(supplier.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
