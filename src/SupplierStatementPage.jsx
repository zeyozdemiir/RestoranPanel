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

const emptyPaymentForm = {
  supplierId: "",
  supplierName: "",
  paymentDate: new Date().toISOString().slice(0, 10),
  amount: "",
  method: "BANK_TRANSFER",
  note: "",
};

const methodLabels = {
  CASH: "Nakit",
  BANK_TRANSFER: "Havale / EFT",
  CREDIT_CARD: "Kredi Kartı",
  CHECK: "Çek",
  OTHER: "Diğer",
};

export default function SupplierStatementPage({ user }) {
  const [supplierStatements, setSupplierStatements] = useState([]);
  const [supplierPayments, setSupplierPayments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);
  const [loading, setLoading] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
    restoreDraft();
  }, []);

  useEffect(() => {
    const hasDraftData =
      paymentForm.supplierId ||
      paymentForm.supplierName ||
      paymentForm.amount ||
      paymentForm.note;

    if (hasDraftData) {
      localStorage.setItem(
        "handsoff_supplier_payment_form_draft",
        JSON.stringify(paymentForm)
      );
    }
  }, [paymentForm]);

  function restoreDraft() {
    try {
      const rawDraft = localStorage.getItem(
        "handsoff_supplier_payment_form_draft"
      );

      if (!rawDraft) {
        return;
      }

      const draft = JSON.parse(rawDraft);

      if (!draft || typeof draft !== "object") {
        localStorage.removeItem("handsoff_supplier_payment_form_draft");
        return;
      }

      setPaymentForm({
        ...emptyPaymentForm,
        ...draft,
      });
    } catch {
      localStorage.removeItem("handsoff_supplier_payment_form_draft");
    }
  }

  async function safeFetch(url, rootKey) {
    try {
      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(url, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rootKey ? [] : null;
      }

      if (rootKey) {
        return data[rootKey] || [];
      }

      return data;
    } catch {
      return rootKey ? [] : null;
    }
  }

  async function fetchData() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [statementData, paymentList, supplierList] = await Promise.all([
        safeFetch(API_BASE_URL + "/api/supplier-statements", null),
        safeFetch(API_BASE_URL + "/api/supplier-payments", "supplierPayments"),
        safeFetch(API_BASE_URL + "/api/suppliers", "suppliers"),
      ]);

      const statements = statementData?.supplierStatements || [];

      setSupplierStatements(statements);
      setSummary(statementData?.summary || null);
      setSupplierPayments(paymentList || []);
      setSuppliers(supplierList || []);

      if (selectedStatement) {
        const refreshed = statements.find(
          (statement) => statement.key === selectedStatement.key
        );

        if (refreshed) {
          openStatement(refreshed);
        }
      }
    } catch {
      setError("Tedarikçi cari verileri alınırken backend bağlantısı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }

  function handlePaymentChange(event) {
    const { name, value } = event.target;

    setPaymentForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleSupplierSelect(event) {
    const supplierId = event.target.value;
    const supplier = suppliers.find(
      (item) => String(item.id) === String(supplierId)
    );

    if (!supplier) {
      setPaymentForm((currentForm) => ({
        ...currentForm,
        supplierId: "",
        supplierName: "",
      }));

      return;
    }

    setPaymentForm((currentForm) => ({
      ...currentForm,
      supplierId: String(supplier.id),
      supplierName: supplier.name || "",
    }));
  }

  function openStatement(statement) {
    setSelectedStatement(statement);
    setMessage("");
    setError("");

    setPaymentForm((currentForm) => ({
      ...currentForm,
      supplierId: statement.supplierId ? String(statement.supplierId) : "",
      supplierName: statement.supplierName || "",
      amount:
        statement.remainingDebt > 0
          ? String(Math.round(Number(statement.remainingDebt || 0)))
          : currentForm.amount,
    }));
  }

  function handleNewPayment() {
    localStorage.removeItem("handsoff_supplier_payment_form_draft");
    setPaymentForm(emptyPaymentForm);
    setMessage("");
    setError("");
  }

  async function handlePaymentSubmit(event) {
    event.preventDefault();

    if (!paymentForm.supplierName && !paymentForm.supplierId) {
      setError("Tedarikçi seç veya tedarikçi adı gir.");
      return;
    }

    if (Number(paymentForm.amount || 0) <= 0) {
      setError("Ödeme tutarı 0'dan büyük olmalı.");
      return;
    }

    try {
      setSavingPayment(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/supplier-payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(paymentForm),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Tedarikçi ödemesi kaydedilemedi.");
        return;
      }

      localStorage.removeItem("handsoff_supplier_payment_form_draft");

      setMessage("Tedarikçi ödemesi kaydedildi.");
      setPaymentForm(emptyPaymentForm);

      await fetchData();
    } catch {
      setError("Tedarikçi ödemesi kaydedilirken backend bağlantısı kurulamadı.");
    } finally {
      setSavingPayment(false);
    }
  }

  async function handleCancelPayment(payment) {
    const confirmed = window.confirm(
      "Bu ödeme iptal edilecek. Cari bakiye tekrar yükselecek. Devam edilsin mi?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(payment.id);
      setError("");
      setMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(
        API_BASE_URL + `/api/supplier-payments/${payment.id}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Tedarikçi ödemesi iptal edilemedi.");
        return;
      }

      setMessage("Tedarikçi ödemesi iptal edildi.");
      await fetchData();
    } catch {
      setError("Ödeme iptal edilirken backend bağlantısı kurulamadı.");
    } finally {
      setCancellingId(null);
    }
  }

  const debtStatements = supplierStatements.filter(
    (statement) => Number(statement.remainingDebt || 0) > 0
  );

  const closedStatements = supplierStatements.filter(
    (statement) => Number(statement.remainingDebt || 0) === 0
  );

  const advanceStatements = supplierStatements.filter(
    (statement) => Number(statement.remainingDebt || 0) < 0
  );

  const activePayments = supplierPayments.filter(
    (payment) => payment.status !== "CANCELLED"
  );

  const cancelledPayments = supplierPayments.filter(
    (payment) => payment.status === "CANCELLED"
  );

  const selectedPayments = useMemo(() => {
    if (!selectedStatement) {
      return [];
    }

    return supplierPayments.filter((payment) => {
      if (selectedStatement.supplierId && payment.supplierId) {
        return Number(payment.supplierId) === Number(selectedStatement.supplierId);
      }

      return (
        String(payment.supplierName || "").trim().toLocaleLowerCase("tr-TR") ===
        String(selectedStatement.supplierName || "")
          .trim()
          .toLocaleLowerCase("tr-TR")
      );
    });
  }, [supplierPayments, selectedStatement]);

  const selectedExpenses = selectedStatement?.expenses || [];

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {user.restaurantName}</p>

            <h1>Tedarikçi Cari / Borç Takibi</h1>

            <p>
              Gider Yönetimi’nden gelen tedarikçi borçlarını ve yapılan
              ödemeleri tek ekranda takip eder.
            </p>
          </div>

          <button className="hero-button" type="button" onClick={fetchData}>
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
          <p>Toplam Tedarikçi Gideri</p>
          <h3>{formatMoney(summary?.totalExpense || 0)}</h3>
          <span>Gider kayıtlarından gelir</span>
        </div>

        <div className="stat-card">
          <p>Açık Borç</p>
          <h3>{formatMoney(summary?.remainingDebt || 0)}</h3>
          <span>{summary?.debtSupplierCount || 0} borçlu tedarikçi</span>
        </div>

        <div className="stat-card">
          <p>Kaydedilen Ödeme</p>
          <h3>{formatMoney(summary?.paidBySupplierPayments || 0)}</h3>
          <span>{activePayments.length} aktif ödeme</span>
        </div>

        <div className="stat-card">
          <p>Cari Durum</p>
          <h3>{debtStatements.length}</h3>
          <span>
            {closedStatements.length} kapalı / {advanceStatements.length} avans
          </span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Tedarikçi Ödemesi Gir</h2>

            <p className="panel-sub">
              Ödeme girince ilgili tedarikçinin açık cari bakiyesi düşer.
            </p>
          </div>

          <button className="hero-button" type="button" onClick={handleNewPayment}>
            Yeni Ödeme
          </button>
        </div>

        <form onSubmit={handlePaymentSubmit}>
          <table className="module-table">
            <tbody>
              <tr>
                <td>Tedarikçi</td>
                <td>
                  <select
                    value={paymentForm.supplierId}
                    onChange={handleSupplierSelect}
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    <option value="">Tedarikçi seçmeden manuel gir</option>

                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>

              <tr>
                <td>Tedarikçi Adı</td>
                <td>
                  <input
                    name="supplierName"
                    value={paymentForm.supplierName}
                    onChange={handlePaymentChange}
                    placeholder="Tedarikçi adı"
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
                <td>Ödeme Tarihi</td>
                <td>
                  <input
                    type="date"
                    name="paymentDate"
                    value={paymentForm.paymentDate}
                    onChange={handlePaymentChange}
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
                <td>Tutar</td>
                <td>
                  <input
                    type="number"
                    name="amount"
                    value={paymentForm.amount}
                    onChange={handlePaymentChange}
                    placeholder="Ödeme tutarı"
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
                <td>Ödeme Yöntemi</td>
                <td>
                  <select
                    name="method"
                    value={paymentForm.method}
                    onChange={handlePaymentChange}
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    <option value="BANK_TRANSFER">Havale / EFT</option>
                    <option value="CASH">Nakit</option>
                    <option value="CREDIT_CARD">Kredi Kartı</option>
                    <option value="CHECK">Çek</option>
                    <option value="OTHER">Diğer</option>
                  </select>
                </td>
              </tr>

              <tr>
                <td>Not</td>
                <td>
                  <textarea
                    name="note"
                    value={paymentForm.note}
                    onChange={handlePaymentChange}
                    rows="3"
                    placeholder="Örn: Temmuz et ödemesi, kısmi ödeme, IBAN transfer"
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
            disabled={savingPayment}
            style={{ marginTop: 18 }}
          >
            {savingPayment ? "Kaydediliyor..." : "Ödeme Kaydet"}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Tedarikçi Cari Bakiyeleri</h2>

            <p className="panel-sub">
              Açık borç, giderlerden gelen borçtan kayıtlı ödemeler düşülerek
              hesaplanır.
            </p>
          </div>

          <span className="mini-pill">{supplierStatements.length} tedarikçi</span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>İşlem</th>
              <th>Tedarikçi</th>
              <th>Toplam Gider</th>
              <th>Giderden Borç</th>
              <th>Ödeme</th>
              <th>Kalan Bakiye</th>
              <th>Durum</th>
              <th>Kayıt</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8">Tedarikçi cari kayıtları yükleniyor...</td>
              </tr>
            ) : supplierStatements.length === 0 ? (
              <tr>
                <td colSpan="8">Henüz tedarikçi cari kaydı yok.</td>
              </tr>
            ) : (
              supplierStatements.map((statement) => (
                <tr key={statement.key}>
                  <td>
                    <button
                      type="button"
                      className="hero-button"
                      onClick={() => openStatement(statement)}
                      style={{ padding: "8px 12px", borderRadius: 12 }}
                    >
                      Aç / Öde
                    </button>
                  </td>

                  <td>
                    {statement.supplierName}

                    {statement.supplier && (
                      <p className="panel-sub">
                        Vergi No: {statement.supplier.taxNumber || "-"} / IBAN:{" "}
                        {statement.supplier.iban || "-"}
                      </p>
                    )}
                  </td>

                  <td>{formatMoney(statement.totalExpense)}</td>
                  <td>{formatMoney(statement.debtFromExpenses)}</td>
                  <td>{formatMoney(statement.paidBySupplierPayments)}</td>
                  <td>{formatMoney(statement.remainingDebt)}</td>
                  <td>{statement.status}</td>
                  <td>
                    {statement.expenseCount} gider / {statement.paymentCount} ödeme
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedStatement && (
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Seçili Cari: {selectedStatement.supplierName}</h2>

              <p className="panel-sub">
                Bu tedarikçiye ait gider ve ödeme hareketleri.
              </p>
            </div>

            <span className="mini-pill">
              Kalan: {formatMoney(selectedStatement.remainingDebt)}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 18,
              marginBottom: 18,
            }}
          >
            <div className="stat-card">
              <p>Toplam Gider</p>
              <h3>{formatMoney(selectedStatement.totalExpense)}</h3>
              <span>{selectedExpenses.length} gider hareketi</span>
            </div>

            <div className="stat-card">
              <p>Açık Borç</p>
              <h3>{formatMoney(selectedStatement.debtFromExpenses)}</h3>
              <span>Giderlerden hesaplandı</span>
            </div>

            <div className="stat-card">
              <p>Ödeme</p>
              <h3>{formatMoney(selectedStatement.paidBySupplierPayments)}</h3>
              <span>{selectedPayments.length} ödeme hareketi</span>
            </div>

            <div className="stat-card">
              <p>Kalan</p>
              <h3>{formatMoney(selectedStatement.remainingDebt)}</h3>
              <span>{selectedStatement.status}</span>
            </div>
          </div>

          <h3 style={{ marginTop: 0 }}>Gider Hareketleri</h3>

          <table className="module-table">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Açıklama</th>
                <th>Kategori</th>
                <th>Toplam</th>
                <th>Açık Borç</th>
                <th>Ödeme Durumu</th>
              </tr>
            </thead>

            <tbody>
              {selectedExpenses.length === 0 ? (
                <tr>
                  <td colSpan="6">Bu tedarikçiye ait gider hareketi yok.</td>
                </tr>
              ) : (
                selectedExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{formatDate(expense.date)}</td>
                    <td>{expense.title}</td>
                    <td>{expense.category}</td>
                    <td>{formatMoney(expense.totalAmount)}</td>
                    <td>{formatMoney(expense.debtAmount)}</td>
                    <td>{expense.paymentStatus}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <h3>Ödeme Hareketleri</h3>

          <table className="module-table">
            <thead>
              <tr>
                <th>İşlem</th>
                <th>Tarih</th>
                <th>Tutar</th>
                <th>Yöntem</th>
                <th>Not</th>
                <th>Durum</th>
              </tr>
            </thead>

            <tbody>
              {selectedPayments.length === 0 ? (
                <tr>
                  <td colSpan="6">Bu tedarikçiye ait ödeme hareketi yok.</td>
                </tr>
              ) : (
                selectedPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    style={{
                      opacity: payment.status === "CANCELLED" ? 0.55 : 1,
                    }}
                  >
                    <td>
                      {payment.status === "CANCELLED" ? (
                        "İptal"
                      ) : (
                        <button
                          type="button"
                          className="hero-button"
                          onClick={() => handleCancelPayment(payment)}
                          disabled={cancellingId === payment.id}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 12,
                            background: "#991b1b",
                          }}
                        >
                          {cancellingId === payment.id ? "İptal..." : "İptal Et"}
                        </button>
                      )}
                    </td>

                    <td>{formatDate(payment.paymentDate)}</td>
                    <td>{formatMoney(payment.amount)}</td>
                    <td>{methodLabels[payment.method] || payment.method}</td>
                    <td>{payment.note || "-"}</td>
                    <td>{payment.status === "CANCELLED" ? "İptal" : "Aktif"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
