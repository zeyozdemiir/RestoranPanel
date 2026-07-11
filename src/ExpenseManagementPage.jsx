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

function getDateInputValue(value) {
  if (!value) return "";

  return new Date(value).toISOString().slice(0, 10);
}

function getMonthKey(value) {
  const date = value ? new Date(value) : new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function getMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-");

  const date = new Date(Number(year), Number(month) - 1, 1);

  return date.toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });
}

const statusLabels = {
  WAITING_AI: "AI okuma bekliyor",
  DRAFT: "Taslak",
  APPROVED: "Onaylandı",
  CANCELLED: "İptal",
};

const paymentStatusLabels = {
  UNPAID: "Ödenmedi",
  PAID: "Ödendi",
  PARTIAL: "Kısmi Ödendi",
};

const emptyForm = {
  supplierName: "",
  invoiceNo: "",
  invoiceDate: "",
  category: "Gider Faturası",
  description: "",
  netAmount: "",
  taxAmount: "",
  totalAmount: "",
  paymentStatus: "UNPAID",
  status: "APPROVED",
  note: "",
};

export default function ExpenseManagementPage({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey(new Date()));
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch("http://localhost:4000/api/expenses", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Gider kayıtları alınamadı.");
        return;
      }

      setExpenses(data.expenses || []);
    } catch {
      setError("Backend bağlantısı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }

  function handleNewExpense() {
    setSelectedExpense(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  }

  function handleSelectExpense(expense) {
    setSelectedExpense(expense);
    setMessage("");
    setError("");

    setForm({
      supplierName: expense.supplierName || "",
      invoiceNo: expense.invoiceNo || "",
      invoiceDate: getDateInputValue(expense.invoiceDate || expense.createdAt),
      category: expense.category || "Gider Faturası",
      description: expense.description || "",
      netAmount: String(expense.netAmount || ""),
      taxAmount: String(expense.taxAmount || ""),
      totalAmount: String(expense.totalAmount || ""),
      paymentStatus: expense.paymentStatus || "UNPAID",
      status:
        expense.status === "WAITING_AI"
          ? "APPROVED"
          : expense.status || "APPROVED",
      note: expense.note || "",
    });
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function calculateTotal() {
    const netAmount = Number(form.netAmount || 0);
    const taxAmount = Number(form.taxAmount || 0);

    setForm((currentForm) => ({
      ...currentForm,
      totalAmount: String(netAmount + taxAmount),
    }));
  }

  async function handleSaveExpense(event) {
    event.preventDefault();

    if (!form.supplierName.trim()) {
      setError("Lütfen tedarikçi veya gider adı gir.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("handsoff_token");

      const url = selectedExpense
        ? `http://localhost:4000/api/expenses/${selectedExpense.id}`
        : "http://localhost:4000/api/expenses";

      const method = selectedExpense ? "PUT" : "POST";

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
        setError(data.message || "Gider kaydı kaydedilemedi.");
        return;
      }

      setMessage(
        selectedExpense
          ? "Gider kaydı güncellendi."
          : "Manuel gider kaydı oluşturuldu."
      );

      setSelectedExpense(data.expense || null);
      await fetchExpenses();
    } catch {
      setError("Gider kaydı kaydedilirken backend bağlantısı kurulamadı.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelExpense(expense) {
    const confirmed = window.confirm(
      "Bu gider kaydı iptal edilecek. Aylık toplamdan düşecek ama kayıt listede İptal olarak kalacak. Devam edilsin mi?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(
        `http://localhost:4000/api/expenses/${expense.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            status: "CANCELLED",
            note: expense.note
              ? expense.note + "\nKayıt iptal edildi."
              : "Kayıt iptal edildi.",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Gider kaydı iptal edilemedi.");
        return;
      }

      setMessage("Gider kaydı iptal edildi.");
      setSelectedExpense(null);
      setForm(emptyForm);
      await fetchExpenses();
    } catch {
      setError("Gider kaydı iptal edilirken backend bağlantısı kurulamadı.");
    } finally {
      setSaving(false);
    }
  }

  const monthOptions = useMemo(() => {
    const keys = expenses.map((expense) =>
      getMonthKey(expense.invoiceDate || expense.createdAt)
    );

    const uniqueKeys = Array.from(new Set([...keys, getMonthKey(new Date())]));

    return uniqueKeys.sort().reverse();
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const monthKey = getMonthKey(expense.invoiceDate || expense.createdAt);

      return monthKey === selectedMonth;
    });
  }, [expenses, selectedMonth]);

  const activeExpenses = useMemo(() => {
    return filteredExpenses.filter((expense) => expense.status !== "CANCELLED");
  }, [filteredExpenses]);

  const monthlyTotal = activeExpenses.reduce((total, expense) => {
    return total + Number(expense.totalAmount || 0);
  }, 0);

  const approvedTotal = activeExpenses
    .filter((expense) => expense.status === "APPROVED")
    .reduce((total, expense) => total + Number(expense.totalAmount || 0), 0);

  const waitingAiCount = activeExpenses.filter(
    (expense) => expense.status === "WAITING_AI"
  ).length;

  const unpaidCount = activeExpenses.filter(
    (expense) => expense.paymentStatus === "UNPAID"
  ).length;

  const unpaidTotal = activeExpenses
    .filter((expense) => expense.paymentStatus === "UNPAID")
    .reduce((total, expense) => total + Number(expense.totalAmount || 0), 0);

  const paidTotal = activeExpenses
    .filter((expense) => expense.paymentStatus === "PAID")
    .reduce((total, expense) => total + Number(expense.totalAmount || 0), 0);

  const categorySummary = useMemo(() => {
    const summaryMap = new Map();

    activeExpenses.forEach((expense) => {
      const category = expense.category || "Diğer";
      const current = summaryMap.get(category) || {
        category,
        count: 0,
        totalAmount: 0,
        approvedAmount: 0,
        unpaidAmount: 0,
      };

      const totalAmount = Number(expense.totalAmount || 0);

      current.count += 1;
      current.totalAmount += totalAmount;

      if (expense.status === "APPROVED") {
        current.approvedAmount += totalAmount;
      }

      if (expense.paymentStatus === "UNPAID") {
        current.unpaidAmount += totalAmount;
      }

      summaryMap.set(category, current);
    });

    return Array.from(summaryMap.values()).sort(
      (a, b) => b.totalAmount - a.totalAmount
    );
  }, [activeExpenses]);

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {user.restaurantName}</p>

            <h1>Gider Yönetimi</h1>

            <p>
              Yüklenen faturalar ve manuel giderler bu ekranda aylık olarak
              tutulur. Kategori bazlı özet, ödeme durumu ve onaylı giderler
              buradan takip edilir.
            </p>
          </div>

          <button className="hero-button" type="button" onClick={fetchExpenses}>
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
          <p>Aylık Gider Toplamı</p>
          <h3>{formatMoney(monthlyTotal)}</h3>
          <span>{getMonthLabel(selectedMonth)}</span>
        </div>

        <div className="stat-card">
          <p>Onaylı Gider</p>
          <h3>{formatMoney(approvedTotal)}</h3>
          <span>Aylık onaylanan kayıtlar</span>
        </div>

        <div className="stat-card">
          <p>Ödenmemiş Tutar</p>
          <h3>{formatMoney(unpaidTotal)}</h3>
          <span>{unpaidCount} kayıt ödenmemiş</span>
        </div>

        <div className="stat-card">
          <p>Ödenmiş Tutar</p>
          <h3>{formatMoney(paidTotal)}</h3>
          <span>{waitingAiCount} fatura AI bekliyor</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Kategori Bazlı Aylık Özet</h2>

            <p className="panel-sub">
              Seçili ay içindeki giderlerin kategori kırılımı.
            </p>
          </div>

          <span className="mini-pill">{categorySummary.length} kategori</span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>Kategori</th>
              <th>Kayıt</th>
              <th>Toplam</th>
              <th>Onaylı</th>
              <th>Ödenmemiş</th>
            </tr>
          </thead>

          <tbody>
            {categorySummary.length === 0 ? (
              <tr>
                <td colSpan="5">Bu ay için kategori özeti yok.</td>
              </tr>
            ) : (
              categorySummary.map((item) => (
                <tr key={item.category}>
                  <td>{item.category}</td>
                  <td>{item.count}</td>
                  <td>{formatMoney(item.totalAmount)}</td>
                  <td>{formatMoney(item.approvedAmount)}</td>
                  <td>{formatMoney(item.unpaidAmount)}</td>
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
              {selectedExpense
                ? "Gider Düzenle / Onayla"
                : "Yeni Manuel Gider Ekle"}
            </h2>

            <p className="panel-sub">
              Fatura yüklemeden de kira, personel, elektrik, pazarlama veya
              diğer giderleri manuel ekleyebilirsin.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="mini-pill">
              {selectedExpense ? "Seçili Kayıt" : "Yeni Kayıt"}
            </span>

            <button
              className="hero-button"
              type="button"
              onClick={handleNewExpense}
            >
              Yeni Gider
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveExpense}>
          <table className="module-table">
            <tbody>
              <tr>
                <td>Tedarikçi / Gider Adı</td>
                <td>
                  <input
                    name="supplierName"
                    value={form.supplierName}
                    onChange={handleFormChange}
                    placeholder="Örn: Elektrik faturası, tedarikçi adı, kira"
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
                <td>Fatura No</td>
                <td>
                  <input
                    name="invoiceNo"
                    value={form.invoiceNo}
                    onChange={handleFormChange}
                    placeholder="Varsa fatura numarası"
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
                <td>Fatura / Gider Tarihi</td>
                <td>
                  <input
                    type="date"
                    name="invoiceDate"
                    value={form.invoiceDate}
                    onChange={handleFormChange}
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
                    onChange={handleFormChange}
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    <option value="Gider Faturası">Gider Faturası</option>
                    <option value="Stok / Satın Alma">Stok / Satın Alma</option>
                    <option value="Kira">Kira</option>
                    <option value="Personel">Personel</option>
                    <option value="Elektrik / Su / Doğalgaz">
                      Elektrik / Su / Doğalgaz
                    </option>
                    <option value="Pazarlama">Pazarlama</option>
                    <option value="Bakım / Onarım">Bakım / Onarım</option>
                    <option value="Vergi / Resmi Ödeme">Vergi / Resmi Ödeme</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </td>
              </tr>

              <tr>
                <td>Ara Toplam</td>
                <td>
                  <input
                    type="number"
                    name="netAmount"
                    value={form.netAmount}
                    onChange={handleFormChange}
                    placeholder="KDV hariç tutar"
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
                <td>KDV</td>
                <td>
                  <input
                    type="number"
                    name="taxAmount"
                    value={form.taxAmount}
                    onChange={handleFormChange}
                    placeholder="KDV tutarı"
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
                <td>Genel Toplam</td>
                <td>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      type="number"
                      name="totalAmount"
                      value={form.totalAmount}
                      onChange={handleFormChange}
                      placeholder="Genel toplam"
                      style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 12,
                        border: "1px solid #cbd5e1",
                      }}
                    />

                    <button
                      type="button"
                      className="hero-button"
                      onClick={calculateTotal}
                    >
                      Hesapla
                    </button>
                  </div>
                </td>
              </tr>

              <tr>
                <td>Ödeme Durumu</td>
                <td>
                  <select
                    name="paymentStatus"
                    value={form.paymentStatus}
                    onChange={handleFormChange}
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    <option value="UNPAID">Ödenmedi</option>
                    <option value="PAID">Ödendi</option>
                    <option value="PARTIAL">Kısmi Ödendi</option>
                  </select>
                </td>
              </tr>

              <tr>
                <td>Onay Durumu</td>
                <td>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    <option value="WAITING_AI">AI okuma bekliyor</option>
                    <option value="DRAFT">Taslak</option>
                    <option value="APPROVED">Onaylandı</option>
                    <option value="CANCELLED">İptal</option>
                  </select>
                </td>
              </tr>

              <tr>
                <td>Açıklama</td>
                <td>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    rows="3"
                    placeholder="Gider açıklaması"
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
                    onChange={handleFormChange}
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
              : selectedExpense
                ? "Gider Kaydını Güncelle"
                : "Manuel Gider Ekle"}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Aylık Giderler</h2>

            <p className="panel-sub">
              Faturalar fatura tarihine göre; fatura tarihi yoksa yüklenme
              tarihine göre aylık listelenir.
            </p>
          </div>

          <select
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              minWidth: 180,
            }}
          >
            {monthOptions.map((monthKey) => (
              <option key={monthKey} value={monthKey}>
                {getMonthLabel(monthKey)}
              </option>
            ))}
          </select>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>İşlem</th>
              <th>Tedarikçi / Gider</th>
              <th>Kategori</th>
              <th>Tarih</th>
              <th>Tutar</th>
              <th>Ödeme</th>
              <th>Durum</th>
              <th>Kaynak</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8">Gider kayıtları yükleniyor...</td>
              </tr>
            ) : filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="8">Bu ay için gider kaydı yok.</td>
              </tr>
            ) : (
              filteredExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="hero-button"
                        onClick={() => handleSelectExpense(expense)}
                        style={{ padding: "8px 12px", borderRadius: 12 }}
                      >
                        Düzenle
                      </button>

                      {expense.status !== "CANCELLED" && (
                        <button
                          type="button"
                          className="hero-button"
                          onClick={() => handleCancelExpense(expense)}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 12,
                            background: "#991b1b",
                          }}
                        >
                          İptal Et
                        </button>
                      )}
                    </div>
                  </td>

                  <td>{expense.supplierName}</td>
                  <td>{expense.category}</td>
                  <td>{formatDate(expense.invoiceDate || expense.createdAt)}</td>
                  <td>{formatMoney(expense.totalAmount)}</td>
                  <td>
                    {paymentStatusLabels[expense.paymentStatus] ||
                      expense.paymentStatus}
                  </td>
                  <td>{statusLabels[expense.status] || expense.status}</td>
                  <td>
                    {expense.uploadedDocument
                      ? expense.uploadedDocument.originalName
                      : "Manuel kayıt"}
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