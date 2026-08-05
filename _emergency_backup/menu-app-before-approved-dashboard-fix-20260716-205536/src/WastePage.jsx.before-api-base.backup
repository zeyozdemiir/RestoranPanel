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
  type: "WASTE",
  recordDate: new Date().toISOString().slice(0, 10),
  inventoryItemId: "",
  itemName: "",
  category: "Genel",
  quantity: "",
  unit: "adet",
  estimatedUnitPrice: "",
  reason: "",
  responsible: "",
  note: "",
  deductFromStock: true,
};

const typeLabels = {
  WASTE: "Zayi",
  BREAKAGE: "Kırılma",
  SPILL: "Dökülme",
  STAFF_MEAL: "Personel Yemeği",
};

export default function WastePage({ user }) {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [wasteRecords, setWasteRecords] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInventoryItems();
    fetchWasteRecords();
    restoreDraft();
  }, []);

  useEffect(() => {
    const hasDraftData =
      form.itemName ||
      form.inventoryItemId ||
      form.quantity ||
      form.estimatedUnitPrice ||
      form.reason ||
      form.responsible ||
      form.note;

    if (hasDraftData) {
      localStorage.setItem("handsoff_waste_form_draft", JSON.stringify(form));
    }
  }, [form]);

  function restoreDraft() {
    try {
      const rawDraft = localStorage.getItem("handsoff_waste_form_draft");

      if (!rawDraft) {
        return;
      }

      const draft = JSON.parse(rawDraft);

      if (!draft || typeof draft !== "object") {
        localStorage.removeItem("handsoff_waste_form_draft");
        return;
      }

      setForm({
        ...emptyForm,
        ...draft,
      });

      setMessage("Kaydedilmemiş zayi / kırılma taslağın geri yüklendi.");
    } catch {
      localStorage.removeItem("handsoff_waste_form_draft");
    }
  }

  async function fetchInventoryItems() {
    try {
      const token = localStorage.getItem("handsoff_token");

      const response = await fetch("http://localhost:4000/api/inventory-items", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setInventoryItems(data.inventoryItems || []);
      }
    } catch {
      setInventoryItems([]);
    }
  }

  async function fetchWasteRecords() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch("http://localhost:4000/api/waste-records", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Zayi / kırılma kayıtları alınamadı.");
        return;
      }

      setWasteRecords(data.wasteRecords || []);
    } catch {
      setError("Backend bağlantısı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleInventorySelect(event) {
    const selectedId = event.target.value;
    const selectedItem = inventoryItems.find(
      (item) => String(item.id) === String(selectedId)
    );

    if (!selectedItem) {
      setForm((currentForm) => ({
        ...currentForm,
        inventoryItemId: "",
        itemName: "",
        category: "Genel",
        unit: "adet",
      }));

      return;
    }

    setForm((currentForm) => ({
      ...currentForm,
      inventoryItemId: String(selectedItem.id),
      itemName: selectedItem.name || "",
      category: selectedItem.category || "Genel",
      unit: selectedItem.unit || "adet",
    }));
  }

  function handleNewRecord() {
    localStorage.removeItem("handsoff_waste_form_draft");
    setForm(emptyForm);
    setMessage("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.itemName && !form.inventoryItemId) {
      setError("Ürün / stok adı zorunlu.");
      return;
    }

    if (Number(form.quantity || 0) <= 0) {
      setError("Miktar 0'dan büyük olmalı.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch("http://localhost:4000/api/waste-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Zayi / kırılma kaydı oluşturulamadı.");
        return;
      }

      localStorage.removeItem("handsoff_waste_form_draft");

      setMessage(data.message || "Zayi / kırılma kaydı oluşturuldu.");
      setForm(emptyForm);

      await fetchWasteRecords();
      await fetchInventoryItems();
    } catch {
      setError("Zayi / kırılma kaydedilirken backend bağlantısı kurulamadı.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelRecord(record) {
    const confirmed = window.confirm(
      "Bu kayıt iptal edilecek. Eğer stoktan düşüldüyse stoğa geri eklenecek. Devam edilsin mi?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(record.id);
      setError("");
      setMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(
        `http://localhost:4000/api/waste-records/${record.id}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Zayi / kırılma kaydı iptal edilemedi.");
        return;
      }

      setMessage(data.message || "Kayıt iptal edildi.");

      await fetchWasteRecords();
      await fetchInventoryItems();
    } catch {
      setError("Kayıt iptal edilirken backend bağlantısı kurulamadı.");
    } finally {
      setCancellingId(null);
    }
  }

  const activeRecords = wasteRecords.filter(
    (record) => record.status !== "CANCELLED"
  );

  const cancelledRecords = wasteRecords.filter(
    (record) => record.status === "CANCELLED"
  );

  const summary = useMemo(() => {
    return activeRecords.reduce(
      (total, record) => {
        const cost = Number(record.estimatedCost || 0);
        const quantity = Number(record.quantity || 0);

        total.totalCost += cost;
        total.totalQuantity += quantity;

        if (record.type === "WASTE") {
          total.wasteCost += cost;
        }

        if (record.type === "BREAKAGE") {
          total.breakageCost += cost;
        }

        if (record.type === "SPILL") {
          total.spillCost += cost;
        }

        if (record.type === "STAFF_MEAL") {
          total.staffMealCost += cost;
        }

        return total;
      },
      {
        totalCost: 0,
        totalQuantity: 0,
        wasteCost: 0,
        breakageCost: 0,
        spillCost: 0,
        staffMealCost: 0,
      }
    );
  }, [activeRecords]);

  const selectedInventoryItem = inventoryItems.find(
    (item) => String(item.id) === String(form.inventoryItemId)
  );

  const estimatedCost =
    Number(form.quantity || 0) * Number(form.estimatedUnitPrice || 0);

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {user.restaurantName}</p>

            <h1>Zayi / Kırılma</h1>

            <p>
              Bozulan, kırılan, dökülen veya personel tüketimine ayrılan
              ürünleri kaydet. Stok kartı seçersen miktar otomatik stoktan düşer.
            </p>
          </div>

          <button
            className="hero-button"
            type="button"
            onClick={() => {
              fetchWasteRecords();
              fetchInventoryItems();
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
          <p>Toplam Fire Maliyeti</p>
          <h3>{formatMoney(summary.totalCost)}</h3>
          <span>İptal kayıtlar hariç</span>
        </div>

        <div className="stat-card">
          <p>Zayi</p>
          <h3>{formatMoney(summary.wasteCost)}</h3>
          <span>Bozulma / kullanılamaz ürün</span>
        </div>

        <div className="stat-card">
          <p>Kırılma</p>
          <h3>{formatMoney(summary.breakageCost)}</h3>
          <span>Kırılan / hasarlı ürün</span>
        </div>

        <div className="stat-card">
          <p>Aktif Kayıt</p>
          <h3>{activeRecords.length}</h3>
          <span>{cancelledRecords.length} iptal kayıt</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Yeni Zayi / Kırılma Kaydı</h2>

            <p className="panel-sub">
              Stok kartı seçersen kayıt oluşturulduğunda miktar stoktan düşer.
              Stok kartı seçmeden de sadece maliyet kaydı girebilirsin.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="mini-pill">
              Tahmini maliyet: {formatMoney(estimatedCost)}
            </span>

            <button
              type="button"
              className="hero-button"
              onClick={handleNewRecord}
            >
              Yeni Kayıt
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <table className="module-table">
            <tbody>
              <tr>
                <td>Kayıt Tipi</td>
                <td>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    <option value="WASTE">Zayi</option>
                    <option value="BREAKAGE">Kırılma</option>
                    <option value="SPILL">Dökülme</option>
                    <option value="STAFF_MEAL">Personel Yemeği</option>
                  </select>
                </td>
              </tr>

              <tr>
                <td>Tarih</td>
                <td>
                  <input
                    type="date"
                    name="recordDate"
                    value={form.recordDate}
                    onChange={handleChange}
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
                <td>Stok Kartı</td>
                <td>
                  <select
                    value={form.inventoryItemId}
                    onChange={handleInventorySelect}
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    <option value="">Stok kartı seçmeden manuel gir</option>

                    {inventoryItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} — Mevcut: {item.currentStock} {item.unit}
                      </option>
                    ))}
                  </select>

                  {selectedInventoryItem && (
                    <p className="panel-sub" style={{ marginTop: 8 }}>
                      Mevcut stok: {selectedInventoryItem.currentStock}{" "}
                      {selectedInventoryItem.unit} / Kategori:{" "}
                      {selectedInventoryItem.category}
                    </p>
                  )}
                </td>
              </tr>

              <tr>
                <td>Ürün Adı</td>
                <td>
                  <input
                    name="itemName"
                    value={form.itemName}
                    onChange={handleChange}
                    placeholder="Örn: Domates, kadeh, kuzu kulağı, bonfile"
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
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Kategori"
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
                <td>Miktar</td>
                <td>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="Zayi / kırılma miktarı"
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
                <td>Tahmini Birim Maliyet</td>
                <td>
                  <input
                    type="number"
                    name="estimatedUnitPrice"
                    value={form.estimatedUnitPrice}
                    onChange={handleChange}
                    placeholder="Örn: 120"
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
                <td>Sebep</td>
                <td>
                  <input
                    name="reason"
                    value={form.reason}
                    onChange={handleChange}
                    placeholder="Örn: Bozuldu, kırıldı, döküldü, fazla üretildi"
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
                <td>Sorumlu / Bölüm</td>
                <td>
                  <input
                    name="responsible"
                    value={form.responsible}
                    onChange={handleChange}
                    placeholder="Örn: Mutfak, bar, servis, personel adı"
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
                    placeholder="Ek açıklama"
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
                <td>Stoktan Düş</td>
                <td>
                  <label
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      fontWeight: 700,
                    }}
                  >
                    <input
                      type="checkbox"
                      name="deductFromStock"
                      checked={form.deductFromStock}
                      onChange={handleChange}
                    />
                    Stok kartı seçildiyse miktarı mevcut stoktan düş
                  </label>
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
            {saving ? "Kaydediliyor..." : "Zayi / Kırılma Kaydı Oluştur"}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Zayi / Kırılma Kayıtları</h2>

            <p className="panel-sub">
              Stoktan düşülen kayıtlar iptal edilirse miktar stoğa geri eklenir.
            </p>
          </div>

          <span className="mini-pill">{wasteRecords.length} kayıt</span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>İşlem</th>
              <th>Tarih</th>
              <th>Tip</th>
              <th>Ürün</th>
              <th>Miktar</th>
              <th>Maliyet</th>
              <th>Sebep</th>
              <th>Sorumlu</th>
              <th>Stok</th>
              <th>Durum</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10">Zayi / kırılma kayıtları yükleniyor...</td>
              </tr>
            ) : wasteRecords.length === 0 ? (
              <tr>
                <td colSpan="10">Henüz zayi / kırılma kaydı yok.</td>
              </tr>
            ) : (
              wasteRecords.map((record) => (
                <tr
                  key={record.id}
                  style={{
                    opacity: record.status === "CANCELLED" ? 0.55 : 1,
                  }}
                >
                  <td>
                    {record.status === "CANCELLED" ? (
                      "İptal"
                    ) : (
                      <button
                        type="button"
                        className="hero-button"
                        onClick={() => handleCancelRecord(record)}
                        disabled={cancellingId === record.id}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 12,
                          background: "#991b1b",
                        }}
                      >
                        {cancellingId === record.id ? "İptal..." : "İptal Et"}
                      </button>
                    )}
                  </td>

                  <td>{formatDate(record.recordDate)}</td>
                  <td>{typeLabels[record.type] || record.type}</td>
                  <td>
                    {record.itemName}
                    {record.inventoryItem && (
                      <p className="panel-sub">
                        Stok kartı: {record.inventoryItem.name}
                      </p>
                    )}
                  </td>
                  <td>
                    {record.quantity} {record.unit}
                  </td>
                  <td>{formatMoney(record.estimatedCost)}</td>
                  <td>{record.reason || "-"}</td>
                  <td>{record.responsible || "-"}</td>
                  <td>
                    {record.stockDeducted
                      ? "Stoktan düşüldü"
                      : "Sadece kayıt"}
                  </td>
                  <td>
                    {record.status === "CANCELLED" ? "İptal" : "Aktif"}
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
