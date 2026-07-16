import { API_BASE_URL } from "./apiConfig";
﻿import { useEffect, useMemo, useState } from "react";

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
  saleDate: new Date().toISOString().slice(0, 10),
  title: "Günlük Ciro",
  cashAmount: "",
  cardAmount: "",
  onlineAmount: "",
  yemeksepetiAmount: "",
  getirAmount: "",
  trendyolAmount: "",
  otherAmount: "",
  guestCount: "",
  orderCount: "",
  note: "",
};

export default function DailySalesPage({ user }) {
  const [dailySales, setDailySales] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDailySales();
    restoreDraft();
  }, []);

  useEffect(() => {
    const hasDraftData =
      form.cashAmount ||
      form.cardAmount ||
      form.onlineAmount ||
      form.yemeksepetiAmount ||
      form.getirAmount ||
      form.trendyolAmount ||
      form.otherAmount ||
      form.guestCount ||
      form.orderCount ||
      form.note;

    if (hasDraftData) {
      localStorage.setItem("handsoff_daily_sales_form_draft", JSON.stringify(form));
    }
  }, [form]);

  function restoreDraft() {
    try {
      const rawDraft = localStorage.getItem("handsoff_daily_sales_form_draft");

      if (!rawDraft) {
        return;
      }

      const draft = JSON.parse(rawDraft);

      if (!draft || typeof draft !== "object") {
        localStorage.removeItem("handsoff_daily_sales_form_draft");
        return;
      }

      setForm({
        ...emptyForm,
        ...draft,
      });

      setMessage("Kaydedilmemiş günlük ciro taslağın geri yüklendi.");
    } catch {
      localStorage.removeItem("handsoff_daily_sales_form_draft");
    }
  }

  async function fetchDailySales() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/daily-sales", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Günlük ciro kayıtları alınamadı.");
        return;
      }

      setDailySales(data.dailySales || []);
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

  function handleNewRecord() {
    localStorage.removeItem("handsoff_daily_sales_form_draft");
    setForm(emptyForm);
    setMessage("");
    setError("");
  }

  function calculateTotal(currentForm = form) {
    return (
      Number(currentForm.cashAmount || 0) +
      Number(currentForm.cardAmount || 0) +
      Number(currentForm.onlineAmount || 0) +
      Number(currentForm.yemeksepetiAmount || 0) +
      Number(currentForm.getirAmount || 0) +
      Number(currentForm.trendyolAmount || 0) +
      Number(currentForm.otherAmount || 0)
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (calculateTotal() <= 0) {
      setError("Günlük ciro toplamı 0'dan büyük olmalı.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/daily-sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Günlük ciro kaydı oluşturulamadı.");
        return;
      }

      localStorage.removeItem("handsoff_daily_sales_form_draft");

      setMessage("Günlük ciro kaydı oluşturuldu.");
      setForm(emptyForm);

      await fetchDailySales();
    } catch {
      setError("Günlük ciro kaydedilirken backend bağlantısı kurulamadı.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelSale(sale) {
    const confirmed = window.confirm(
      "Bu günlük ciro kaydı iptal edilecek. Nakit Akışı ve Kâr Zarar gelir toplamından düşecek. Devam edilsin mi?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(sale.id);
      setError("");
      setMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(
        API_BASE_URL + `/api/daily-sales/${sale.id}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Günlük ciro kaydı iptal edilemedi.");
        return;
      }

      setMessage("Günlük ciro kaydı iptal edildi.");
      await fetchDailySales();
    } catch {
      setError("Günlük ciro iptal edilirken backend bağlantısı kurulamadı.");
    } finally {
      setCancellingId(null);
    }
  }

  const activeSales = dailySales.filter((sale) => sale.status !== "CANCELLED");
  const cancelledSales = dailySales.filter((sale) => sale.status === "CANCELLED");

  const summary = useMemo(() => {
    return activeSales.reduce(
      (total, sale) => {
        total.cashAmount += Number(sale.cashAmount || 0);
        total.cardAmount += Number(sale.cardAmount || 0);
        total.onlineAmount += Number(sale.onlineAmount || 0);
        total.yemeksepetiAmount += Number(sale.yemeksepetiAmount || 0);
        total.getirAmount += Number(sale.getirAmount || 0);
        total.trendyolAmount += Number(sale.trendyolAmount || 0);
        total.otherAmount += Number(sale.otherAmount || 0);
        total.totalAmount += Number(sale.totalAmount || 0);
        total.guestCount += Number(sale.guestCount || 0);
        total.orderCount += Number(sale.orderCount || 0);

        return total;
      },
      {
        cashAmount: 0,
        cardAmount: 0,
        onlineAmount: 0,
        yemeksepetiAmount: 0,
        getirAmount: 0,
        trendyolAmount: 0,
        otherAmount: 0,
        totalAmount: 0,
        guestCount: 0,
        orderCount: 0,
      }
    );
  }, [activeSales]);

  const averageGuestSpend =
    summary.guestCount > 0 ? summary.totalAmount / summary.guestCount : 0;

  const averageOrderSpend =
    summary.orderCount > 0 ? summary.totalAmount / summary.orderCount : 0;

  const currentTotal = calculateTotal();

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {user.restaurantName}</p>

            <h1>Günlük Ciro / Gelir Girişi</h1>

            <p>
              Günlük nakit, kart, online ve paket servis gelirlerini gir. Bu
              kayıtlar Nakit Akışı ve Kâr Zarar ekranlarına gelir olarak yansır.
            </p>
          </div>

          <button className="hero-button" type="button" onClick={fetchDailySales}>
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
          <p>Toplam Ciro</p>
          <h3>{formatMoney(summary.totalAmount)}</h3>
          <span>İptal kayıtlar hariç</span>
        </div>

        <div className="stat-card">
          <p>Nakit</p>
          <h3>{formatMoney(summary.cashAmount)}</h3>
          <span>Kasaya giren nakit</span>
        </div>

        <div className="stat-card">
          <p>Kart</p>
          <h3>{formatMoney(summary.cardAmount)}</h3>
          <span>POS / kredi kartı</span>
        </div>

        <div className="stat-card">
          <p>Online + Paket</p>
          <h3>
            {formatMoney(
              summary.onlineAmount +
                summary.yemeksepetiAmount +
                summary.getirAmount +
                summary.trendyolAmount
            )}
          </h3>
          <span>Online, Yemeksepeti, Getir, Trendyol</span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 18,
        }}
      >
        <div className="stat-card">
          <p>Misafir Sayısı</p>
          <h3>{summary.guestCount}</h3>
          <span>Girilen toplam misafir</span>
        </div>

        <div className="stat-card">
          <p>Sipariş Sayısı</p>
          <h3>{summary.orderCount}</h3>
          <span>Girilen toplam sipariş</span>
        </div>

        <div className="stat-card">
          <p>Kişi Başı Ortalama</p>
          <h3>{formatMoney(averageGuestSpend)}</h3>
          <span>Ciro / misafir</span>
        </div>

        <div className="stat-card">
          <p>Fiş Ortalaması</p>
          <h3>{formatMoney(averageOrderSpend)}</h3>
          <span>Ciro / sipariş</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Yeni Günlük Ciro Kaydı</h2>

            <p className="panel-sub">
              Tutar alanlarının toplamı otomatik günlük ciroyu oluşturur.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="mini-pill">Toplam: {formatMoney(currentTotal)}</span>

            <button className="hero-button" type="button" onClick={handleNewRecord}>
              Yeni Kayıt
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <table className="module-table">
            <tbody>
              <tr>
                <td>Tarih</td>
                <td>
                  <input
                    type="date"
                    name="saleDate"
                    value={form.saleDate}
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
                <td>Başlık</td>
                <td>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Örn: Günlük Ciro, Cumartesi Cirosu, Brunch Günü"
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
                <td>Nakit</td>
                <td>
                  <input
                    type="number"
                    name="cashAmount"
                    value={form.cashAmount}
                    onChange={handleChange}
                    placeholder="Nakit ciro"
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
                <td>Kart / POS</td>
                <td>
                  <input
                    type="number"
                    name="cardAmount"
                    value={form.cardAmount}
                    onChange={handleChange}
                    placeholder="Kart ciro"
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
                <td>Online</td>
                <td>
                  <input
                    type="number"
                    name="onlineAmount"
                    value={form.onlineAmount}
                    onChange={handleChange}
                    placeholder="Online ödeme / web"
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
                <td>Yemeksepeti</td>
                <td>
                  <input
                    type="number"
                    name="yemeksepetiAmount"
                    value={form.yemeksepetiAmount}
                    onChange={handleChange}
                    placeholder="Yemeksepeti ciro"
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
                <td>Getir</td>
                <td>
                  <input
                    type="number"
                    name="getirAmount"
                    value={form.getirAmount}
                    onChange={handleChange}
                    placeholder="Getir ciro"
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
                <td>Trendyol</td>
                <td>
                  <input
                    type="number"
                    name="trendyolAmount"
                    value={form.trendyolAmount}
                    onChange={handleChange}
                    placeholder="Trendyol ciro"
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
                <td>Diğer</td>
                <td>
                  <input
                    type="number"
                    name="otherAmount"
                    value={form.otherAmount}
                    onChange={handleChange}
                    placeholder="Diğer gelir"
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
                <td>Misafir Sayısı</td>
                <td>
                  <input
                    type="number"
                    name="guestCount"
                    value={form.guestCount}
                    onChange={handleChange}
                    placeholder="Misafir sayısı"
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
                <td>Sipariş Sayısı</td>
                <td>
                  <input
                    type="number"
                    name="orderCount"
                    value={form.orderCount}
                    onChange={handleChange}
                    placeholder="Fiş / sipariş sayısı"
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
                    placeholder="Örn: Brunch günü, etkinlik gecesi, düşük hava koşulu, özel grup"
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
            {saving ? "Kaydediliyor..." : "Günlük Ciro Kaydet"}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Günlük Ciro Kayıtları</h2>

            <p className="panel-sub">
              İptal edilen kayıtlar Nakit Akışı ve Kâr Zarar toplamlarından düşer.
            </p>
          </div>

          <span className="mini-pill">
            {activeSales.length} aktif / {cancelledSales.length} iptal
          </span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>İşlem</th>
              <th>Tarih</th>
              <th>Başlık</th>
              <th>Nakit</th>
              <th>Kart</th>
              <th>Paket / Online</th>
              <th>Toplam</th>
              <th>Misafir</th>
              <th>Fiş</th>
              <th>Durum</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10">Günlük ciro kayıtları yükleniyor...</td>
              </tr>
            ) : dailySales.length === 0 ? (
              <tr>
                <td colSpan="10">Henüz günlük ciro kaydı yok.</td>
              </tr>
            ) : (
              dailySales.map((sale) => {
                const onlineTotal =
                  Number(sale.onlineAmount || 0) +
                  Number(sale.yemeksepetiAmount || 0) +
                  Number(sale.getirAmount || 0) +
                  Number(sale.trendyolAmount || 0);

                return (
                  <tr
                    key={sale.id}
                    style={{
                      opacity: sale.status === "CANCELLED" ? 0.55 : 1,
                    }}
                  >
                    <td>
                      {sale.status === "CANCELLED" ? (
                        "İptal"
                      ) : (
                        <button
                          type="button"
                          className="hero-button"
                          onClick={() => handleCancelSale(sale)}
                          disabled={cancellingId === sale.id}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 12,
                            background: "#991b1b",
                          }}
                        >
                          {cancellingId === sale.id ? "İptal..." : "İptal Et"}
                        </button>
                      )}
                    </td>

                    <td>{formatDate(sale.saleDate)}</td>
                    <td>
                      {sale.title}
                      {sale.note && <p className="panel-sub">Not: {sale.note}</p>}
                    </td>
                    <td>{formatMoney(sale.cashAmount)}</td>
                    <td>{formatMoney(sale.cardAmount)}</td>
                    <td>{formatMoney(onlineTotal)}</td>
                    <td>{formatMoney(sale.totalAmount)}</td>
                    <td>{sale.guestCount || 0}</td>
                    <td>{sale.orderCount || 0}</td>
                    <td>{sale.status === "CANCELLED" ? "İptal" : "Aktif"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
