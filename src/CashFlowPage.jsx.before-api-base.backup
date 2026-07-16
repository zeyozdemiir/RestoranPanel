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

function getNumericValue(item, keys) {
  for (const key of keys) {
    if (item && item[key] !== undefined && item[key] !== null && item[key] !== "") {
      return Number(item[key] || 0);
    }
  }

  return 0;
}

function getRecordDate(item) {
  return (
    item.movementDate ||
    item.paymentDate ||
    item.expenseDate ||
    item.recordDate ||
    item.date ||
    item.createdAt ||
    item.updatedAt ||
    null
  );
}

function getMonthKey(value) {
  if (!value) return "Tarihsiz";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tarihsiz";
  }

  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
  });
}

const emptyCashForm = {
  movementDate: new Date().toISOString().slice(0, 10),
  direction: "IN",
  title: "",
  category: "Genel",
  amount: "",
  method: "CASH",
  note: "",
};

const methodLabels = {
  CASH: "Nakit",
  BANK_TRANSFER: "Havale / EFT",
  CREDIT_CARD: "Kredi Kartı",
  CHECK: "Çek",
  OTHER: "Diğer",
};

const wasteTypeLabels = {
  WASTE: "Zayi",
  BREAKAGE: "Kırılma",
  SPILL: "Dökülme",
  STAFF_MEAL: "Personel Yemeği",
};

export default function CashFlowPage({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [supplierPayments, setSupplierPayments] = useState([]);
  const [wasteRecords, setWasteRecords] = useState([]);
  const [salesRecords, setSalesRecords] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [cashMovements, setCashMovements] = useState([]);
  const [cashForm, setCashForm] = useState(emptyCashForm);
  const [selectedMonth, setSelectedMonth] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [savingCashMovement, setSavingCashMovement] = useState(false);
  const [cancellingCashMovementId, setCancellingCashMovementId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCashFlowData();
    restoreCashMovementDraft();
  }, []);

  useEffect(() => {
    const hasDraftData =
      cashForm.title ||
      cashForm.amount ||
      cashForm.note ||
      cashForm.category !== "Genel";

    if (hasDraftData) {
      localStorage.setItem(
        "handsoff_cash_movement_form_draft",
        JSON.stringify(cashForm)
      );
    }
  }, [cashForm]);

  function restoreCashMovementDraft() {
    try {
      const rawDraft = localStorage.getItem("handsoff_cash_movement_form_draft");

      if (!rawDraft) {
        return;
      }

      const draft = JSON.parse(rawDraft);

      if (!draft || typeof draft !== "object") {
        localStorage.removeItem("handsoff_cash_movement_form_draft");
        return;
      }

      setCashForm({
        ...emptyCashForm,
        ...draft,
      });
    } catch {
      localStorage.removeItem("handsoff_cash_movement_form_draft");
    }
  }

  async function safeFetchArray(url, rootKey) {
    try {
      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(url, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return [];
      }

      if (Array.isArray(data)) {
        return data;
      }

      if (Array.isArray(data[rootKey])) {
        return data[rootKey];
      }

      return [];
    } catch {
      return [];
    }
  }

  async function fetchCashFlowData() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [
        expenseList,
        paymentList,
        wasteList,
        salesList,
        reportList,
        cashMovementList,
      ] = await Promise.all([
        safeFetchArray("http://localhost:4000/api/expenses", "expenses"),
        safeFetchArray(
          "http://localhost:4000/api/supplier-payments",
          "supplierPayments"
        ),
        safeFetchArray("http://localhost:4000/api/waste-records", "wasteRecords"),
        safeFetchArray("http://localhost:4000/api/sales", "sales"),
        safeFetchArray("http://localhost:4000/api/daily-reports", "dailyReports"),
        safeFetchArray("http://localhost:4000/api/cash-movements", "cashMovements"),
      ]);

      setExpenses(expenseList);
      setSupplierPayments(paymentList);
      setWasteRecords(wasteList);
      setSalesRecords(salesList);
      setDailyReports(reportList);
      setCashMovements(cashMovementList);

      setMessage("Nakit akışı verileri güncellendi.");
    } catch {
      setError("Nakit akışı verileri alınırken backend bağlantısı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }

  function handleCashFormChange(event) {
    const { name, value } = event.target;

    setCashForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleNewCashMovement() {
    localStorage.removeItem("handsoff_cash_movement_form_draft");
    setCashForm(emptyCashForm);
    setMessage("");
    setError("");
  }

  async function handleCashMovementSubmit(event) {
    event.preventDefault();

    if (!cashForm.title.trim()) {
      setError("Kasa hareketi açıklaması zorunlu.");
      return;
    }

    if (Number(cashForm.amount || 0) <= 0) {
      setError("Kasa hareketi tutarı 0'dan büyük olmalı.");
      return;
    }

    try {
      setSavingCashMovement(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch("http://localhost:4000/api/cash-movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(cashForm),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Kasa hareketi kaydedilemedi.");
        return;
      }

      localStorage.removeItem("handsoff_cash_movement_form_draft");

      setMessage(data.message || "Kasa hareketi kaydedildi.");
      setCashForm(emptyCashForm);

      await fetchCashFlowData();
    } catch {
      setError("Kasa hareketi kaydedilirken backend bağlantısı kurulamadı.");
    } finally {
      setSavingCashMovement(false);
    }
  }

  async function handleCancelCashMovement(row) {
    const confirmed = window.confirm(
      "Bu manuel kasa hareketi iptal edilecek. Nakit toplamından çıkarılacak. Devam edilsin mi?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingCashMovementId(row.sourceId);
      setError("");
      setMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(
        `http://localhost:4000/api/cash-movements/${row.sourceId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Kasa hareketi iptal edilemedi.");
        return;
      }

      setMessage(data.message || "Kasa hareketi iptal edildi.");
      await fetchCashFlowData();
    } catch {
      setError("Kasa hareketi iptal edilirken backend bağlantısı kurulamadı.");
    } finally {
      setCancellingCashMovementId(null);
    }
  }

  const monthOptions = useMemo(() => {
    const monthSet = new Set();

    expenses.forEach((item) => monthSet.add(getMonthKey(getRecordDate(item))));
    supplierPayments.forEach((item) =>
      monthSet.add(getMonthKey(getRecordDate(item)))
    );
    wasteRecords.forEach((item) => monthSet.add(getMonthKey(getRecordDate(item))));
    salesRecords.forEach((item) => monthSet.add(getMonthKey(getRecordDate(item))));
    dailyReports.forEach((item) => monthSet.add(getMonthKey(getRecordDate(item))));
    cashMovements.forEach((item) => monthSet.add(getMonthKey(getRecordDate(item))));

    return Array.from(monthSet)
      .filter((month) => month && month !== "Tarihsiz")
      .sort((a, b) => a.localeCompare(b, "tr-TR"));
  }, [
    expenses,
    supplierPayments,
    wasteRecords,
    salesRecords,
    dailyReports,
    cashMovements,
  ]);

  function filterByMonth(records) {
    if (selectedMonth === "ALL") {
      return records;
    }

    return records.filter(
      (record) => getMonthKey(getRecordDate(record)) === selectedMonth
    );
  }

  const filteredExpenses = useMemo(() => {
    return filterByMonth(expenses).filter((expense) => {
      const status = String(expense.status || "").toUpperCase();
      return status !== "CANCELLED" && status !== "IPTAL";
    });
  }, [expenses, selectedMonth]);

  const filteredPayments = useMemo(() => {
    return filterByMonth(supplierPayments).filter((payment) => {
      const status = String(payment.status || "").toUpperCase();
      return status !== "CANCELLED" && status !== "IPTAL";
    });
  }, [supplierPayments, selectedMonth]);

  const filteredWasteRecords = useMemo(() => {
    return filterByMonth(wasteRecords).filter((record) => {
      const status = String(record.status || "").toUpperCase();
      return status !== "CANCELLED" && status !== "IPTAL";
    });
  }, [wasteRecords, selectedMonth]);

  const filteredCashMovements = useMemo(() => {
    return filterByMonth(cashMovements);
  }, [cashMovements, selectedMonth]);

  const filteredSalesRecords = useMemo(() => filterByMonth(salesRecords), [
    salesRecords,
    selectedMonth,
  ]);

  const filteredDailyReports = useMemo(() => filterByMonth(dailyReports), [
    dailyReports,
    selectedMonth,
  ]);

  const cashRows = useMemo(() => {
    const incomeRowsFromSales = filteredSalesRecords.map((sale) => ({
      id: "sale-" + sale.id,
      sourceType: "SALE",
      sourceId: sale.id,
      date: getRecordDate(sale),
      direction: "IN",
      type: "Gelir",
      method: sale.method || sale.paymentMethod || "-",
      title: sale.title || sale.description || "Satış geliri",
      amount: getNumericValue(sale, [
        "totalRevenue",
        "totalSales",
        "revenue",
        "amount",
        "totalAmount",
      ]),
      status: "Aktif",
      isCancelled: false,
    }));

    const incomeRowsFromDailyReports = filteredDailyReports.map((report) => {
      const explicitTotal = getNumericValue(report, [
        "totalRevenue",
        "totalSales",
        "revenue",
        "amount",
        "totalAmount",
      ]);

      const calculatedTotal =
        explicitTotal ||
        getNumericValue(report, ["cashAmount", "cash"]) +
          getNumericValue(report, ["cardAmount", "card"]) +
          getNumericValue(report, ["onlineAmount", "online"]) +
          getNumericValue(report, ["deliveryAmount", "delivery"]);

      return {
        id: "daily-report-" + report.id,
        sourceType: "DAILY_REPORT",
        sourceId: report.id,
        date: getRecordDate(report),
        direction: "IN",
        type: "Günlük Gelir",
        method: "Rapor",
        title: report.title || report.note || "Günlük rapor geliri",
        amount: calculatedTotal,
        status: "Aktif",
        isCancelled: false,
      };
    });

    const paidExpenseRows = filteredExpenses
      .filter((expense) => {
        const paymentStatus = String(expense.paymentStatus || "").toUpperCase();

        return (
          paymentStatus === "PAID" ||
          paymentStatus === "ODENDI" ||
          paymentStatus === "ÖDENDI" ||
          paymentStatus === "ÖDENDİ"
        );
      })
      .map((expense) => ({
        id: "expense-" + expense.id,
        sourceType: "EXPENSE",
        sourceId: expense.id,
        date: getRecordDate(expense),
        direction: "OUT",
        type: "Ödenmiş Gider",
        method: expense.paymentMethod || "-",
        title:
          expense.title ||
          expense.description ||
          expense.supplierName ||
          expense.category ||
          "Gider kaydı",
        amount: getNumericValue(expense, [
          "totalAmount",
          "amount",
          "price",
          "cost",
          "paidAmount",
        ]),
        status: expense.paymentStatus || "Ödendi",
        isCancelled: false,
      }));

    const supplierPaymentRows = filteredPayments.map((payment) => ({
      id: "supplier-payment-" + payment.id,
      sourceType: "SUPPLIER_PAYMENT",
      sourceId: payment.id,
      date: getRecordDate(payment),
      direction: "OUT",
      type: "Tedarikçi Ödemesi",
      method: methodLabels[payment.method] || payment.method || "-",
      title: payment.supplierName || payment.supplier?.name || "Tedarikçi ödemesi",
      amount: Number(payment.amount || 0),
      status: payment.status === "CANCELLED" ? "İptal" : "Aktif",
      isCancelled: payment.status === "CANCELLED",
    }));

    const wasteRows = filteredWasteRecords.map((record) => ({
      id: "waste-" + record.id,
      sourceType: "WASTE_RECORD",
      sourceId: record.id,
      date: getRecordDate(record),
      direction: "OUT",
      type: "Fire Maliyeti",
      method: "Stok",
      title:
        (wasteTypeLabels[record.type] || record.type || "Zayi") +
        " - " +
        (record.itemName || record.inventoryItem?.name || "Ürün"),
      amount: getNumericValue(record, [
        "estimatedCost",
        "totalAmount",
        "amount",
        "cost",
      ]),
      status: record.stockDeducted ? "Stoktan düşüldü" : "Sadece kayıt",
      isCancelled: false,
    }));

    const manualCashRows = filteredCashMovements.map((movement) => ({
      id: "cash-movement-" + movement.id,
      sourceType: "CASH_MOVEMENT",
      sourceId: movement.id,
      date: getRecordDate(movement),
      direction: movement.direction === "OUT" ? "OUT" : "IN",
      type:
        movement.direction === "OUT"
          ? "Manuel Kasa Çıkışı"
          : "Manuel Kasa Girişi",
      method: methodLabels[movement.method] || movement.method || "-",
      title: movement.title || "Manuel kasa hareketi",
      amount: Number(movement.amount || 0),
      status: movement.status === "CANCELLED" ? "İptal" : "Aktif",
      isCancelled: movement.status === "CANCELLED",
      category: movement.category || "Genel",
      note: movement.note || "",
    }));

    return [
      ...manualCashRows,
      ...incomeRowsFromSales,
      ...incomeRowsFromDailyReports,
      ...paidExpenseRows,
      ...supplierPaymentRows,
      ...wasteRows,
    ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [
    filteredSalesRecords,
    filteredDailyReports,
    filteredExpenses,
    filteredPayments,
    filteredWasteRecords,
    filteredCashMovements,
  ]);

  const activeCashRows = cashRows.filter((row) => !row.isCancelled);

  const summary = useMemo(() => {
    return activeCashRows.reduce(
      (total, row) => {
        const amount = Number(row.amount || 0);

        if (row.direction === "IN") {
          total.inflow += amount;
        } else {
          total.outflow += amount;
        }

        total.net = total.inflow - total.outflow;

        if (row.type === "Tedarikçi Ödemesi") {
          total.supplierPaymentOutflow += amount;
        }

        if (row.type === "Ödenmiş Gider") {
          total.expenseOutflow += amount;
        }

        if (row.type === "Fire Maliyeti") {
          total.wasteOutflow += amount;
        }

        if (row.type === "Manuel Kasa Girişi") {
          total.manualInflow += amount;
        }

        if (row.type === "Manuel Kasa Çıkışı") {
          total.manualOutflow += amount;
        }

        return total;
      },
      {
        inflow: 0,
        outflow: 0,
        net: 0,
        supplierPaymentOutflow: 0,
        expenseOutflow: 0,
        wasteOutflow: 0,
        manualInflow: 0,
        manualOutflow: 0,
      }
    );
  }, [activeCashRows]);

  const outflowByType = useMemo(() => {
    const map = new Map();

    activeCashRows
      .filter((row) => row.direction === "OUT")
      .forEach((row) => {
        const current = map.get(row.type) || {
          type: row.type,
          amount: 0,
          count: 0,
        };

        current.amount += Number(row.amount || 0);
        current.count += 1;

        map.set(row.type, current);
      });

    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [activeCashRows]);

  const inflowByType = useMemo(() => {
    const map = new Map();

    activeCashRows
      .filter((row) => row.direction === "IN")
      .forEach((row) => {
        const current = map.get(row.type) || {
          type: row.type,
          amount: 0,
          count: 0,
        };

        current.amount += Number(row.amount || 0);
        current.count += 1;

        map.set(row.type, current);
      });

    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [activeCashRows]);

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {user.restaurantName}</p>

            <h1>Nakit Akışı / Kasa Banka</h1>

            <p>
              Gelirleri, ödenmiş giderleri, tedarikçi ödemelerini, fire
              maliyetlerini ve manuel kasa hareketlerini tek ekranda toplar.
            </p>
          </div>

          <button className="hero-button" type="button" onClick={fetchCashFlowData}>
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

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Manuel Kasa Hareketi Gir</h2>

            <p className="panel-sub">
              Elden gelen para, kasa çıkışı, banka hareketi veya düzeltme
              kayıtlarını buradan ekleyebilirsin.
            </p>
          </div>

          <button
            className="hero-button"
            type="button"
            onClick={handleNewCashMovement}
          >
            Yeni Hareket
          </button>
        </div>

        <form onSubmit={handleCashMovementSubmit}>
          <table className="module-table">
            <tbody>
              <tr>
                <td>Hareket Yönü</td>
                <td>
                  <select
                    name="direction"
                    value={cashForm.direction}
                    onChange={handleCashFormChange}
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    <option value="IN">Kasa Girişi</option>
                    <option value="OUT">Kasa Çıkışı</option>
                  </select>
                </td>
              </tr>

              <tr>
                <td>Tarih</td>
                <td>
                  <input
                    type="date"
                    name="movementDate"
                    value={cashForm.movementDate}
                    onChange={handleCashFormChange}
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
                <td>Açıklama</td>
                <td>
                  <input
                    name="title"
                    value={cashForm.title}
                    onChange={handleCashFormChange}
                    placeholder="Örn: Kasaya elden giriş, banka düzeltmesi, ekstra ödeme"
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
                    value={cashForm.category}
                    onChange={handleCashFormChange}
                    placeholder="Örn: Kasa, Banka, Düzeltme, Avans"
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
                    value={cashForm.amount}
                    onChange={handleCashFormChange}
                    placeholder="Tutar"
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
                <td>Yöntem</td>
                <td>
                  <select
                    name="method"
                    value={cashForm.method}
                    onChange={handleCashFormChange}
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    <option value="CASH">Nakit</option>
                    <option value="BANK_TRANSFER">Havale / EFT</option>
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
                    value={cashForm.note}
                    onChange={handleCashFormChange}
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
            </tbody>
          </table>

          <button
            className="hero-button"
            type="submit"
            disabled={savingCashMovement}
            style={{ marginTop: 18 }}
          >
            {savingCashMovement
              ? "Kaydediliyor..."
              : cashForm.direction === "IN"
                ? "Kasa Girişi Kaydet"
                : "Kasa Çıkışı Kaydet"}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Dönem Filtresi</h2>

            <p className="panel-sub">
              Tüm dönemleri veya seçili ayın nakit hareketlerini görüntüle.
            </p>
          </div>

          <select
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              minWidth: 220,
            }}
          >
            <option value="ALL">Tüm dönemler</option>

            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
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
          <p>Nakit Girişi</p>
          <h3>{formatMoney(summary.inflow)}</h3>
          <span>Gelir + manuel giriş</span>
        </div>

        <div className="stat-card">
          <p>Nakit Çıkışı</p>
          <h3>{formatMoney(summary.outflow)}</h3>
          <span>Gider, ödeme, fire ve manuel çıkış</span>
        </div>

        <div className="stat-card">
          <p>Net Nakit</p>
          <h3>{formatMoney(summary.net)}</h3>
          <span>{summary.net >= 0 ? "Pozitif akış" : "Negatif akış"}</span>
        </div>

        <div className="stat-card">
          <p>Manuel Hareket</p>
          <h3>
            {formatMoney(summary.manualInflow - summary.manualOutflow)}
          </h3>
          <span>
            Giriş {formatMoney(summary.manualInflow)} / Çıkış{" "}
            {formatMoney(summary.manualOutflow)}
          </span>
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
          <p>Tedarikçi Ödemesi</p>
          <h3>{formatMoney(summary.supplierPaymentOutflow)}</h3>
          <span>Cari ödeme çıkışları</span>
        </div>

        <div className="stat-card">
          <p>Ödenmiş Gider</p>
          <h3>{formatMoney(summary.expenseOutflow)}</h3>
          <span>Ödeme durumu ödenmiş olan giderler</span>
        </div>

        <div className="stat-card">
          <p>Fire Maliyeti</p>
          <h3>{formatMoney(summary.wasteOutflow)}</h3>
          <span>Zayi / kırılma kayıtları</span>
        </div>

        <div className="stat-card">
          <p>Hareket Sayısı</p>
          <h3>{cashRows.length}</h3>
          <span>{cashRows.filter((row) => row.isCancelled).length} iptal</span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 18,
        }}
      >
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Giriş Özeti</h2>

              <p className="panel-sub">Gelir hareketlerinin kırılımı.</p>
            </div>
          </div>

          <table className="module-table">
            <thead>
              <tr>
                <th>Tip</th>
                <th>Kayıt</th>
                <th>Tutar</th>
              </tr>
            </thead>

            <tbody>
              {inflowByType.length === 0 ? (
                <tr>
                  <td colSpan="3">Henüz nakit girişi yok.</td>
                </tr>
              ) : (
                inflowByType.map((item) => (
                  <tr key={item.type}>
                    <td>{item.type}</td>
                    <td>{item.count}</td>
                    <td>{formatMoney(item.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Çıkış Özeti</h2>

              <p className="panel-sub">Ödeme ve maliyet hareketlerinin kırılımı.</p>
            </div>
          </div>

          <table className="module-table">
            <thead>
              <tr>
                <th>Tip</th>
                <th>Kayıt</th>
                <th>Tutar</th>
              </tr>
            </thead>

            <tbody>
              {outflowByType.length === 0 ? (
                <tr>
                  <td colSpan="3">Henüz nakit çıkışı yok.</td>
                </tr>
              ) : (
                outflowByType.map((item) => (
                  <tr key={item.type}>
                    <td>{item.type}</td>
                    <td>{item.count}</td>
                    <td>{formatMoney(item.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Nakit Hareketleri</h2>

            <p className="panel-sub">
              Manuel kasa hareketleri iptal edilebilir. İptal edilenler toplamdan
              düşülür.
            </p>
          </div>

          <span className="mini-pill">{cashRows.length} hareket</span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>İşlem</th>
              <th>Tarih</th>
              <th>Yön</th>
              <th>Tip</th>
              <th>Açıklama</th>
              <th>Yöntem</th>
              <th>Tutar</th>
              <th>Durum</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8">Nakit akışı yükleniyor...</td>
              </tr>
            ) : cashRows.length === 0 ? (
              <tr>
                <td colSpan="8">Henüz nakit hareketi yok.</td>
              </tr>
            ) : (
              cashRows.map((row) => (
                <tr
                  key={row.id}
                  style={{
                    opacity: row.isCancelled ? 0.55 : 1,
                  }}
                >
                  <td>
                    {row.sourceType === "CASH_MOVEMENT" && !row.isCancelled ? (
                      <button
                        type="button"
                        className="hero-button"
                        onClick={() => handleCancelCashMovement(row)}
                        disabled={cancellingCashMovementId === row.sourceId}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 12,
                          background: "#991b1b",
                        }}
                      >
                        {cancellingCashMovementId === row.sourceId
                          ? "İptal..."
                          : "İptal Et"}
                      </button>
                    ) : row.isCancelled ? (
                      "İptal"
                    ) : (
                      "-"
                    )}
                  </td>

                  <td>{formatDate(row.date)}</td>
                  <td>{row.direction === "IN" ? "Giriş" : "Çıkış"}</td>
                  <td>{row.type}</td>
                  <td>
                    {row.title}
                    {row.category && (
                      <p className="panel-sub">Kategori: {row.category}</p>
                    )}
                    {row.note && <p className="panel-sub">Not: {row.note}</p>}
                  </td>
                  <td>{row.method}</td>
                  <td>{formatMoney(row.amount)}</td>
                  <td>{row.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
