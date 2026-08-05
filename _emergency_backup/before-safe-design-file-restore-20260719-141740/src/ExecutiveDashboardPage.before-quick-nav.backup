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

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("tr-TR");
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
    item.saleDate ||
    item.movementDate ||
    item.paymentDate ||
    item.expenseDate ||
    item.recordDate ||
    item.orderDate ||
    item.date ||
    item.createdAt ||
    item.updatedAt ||
    null
  );
}

function isSameDay(value, targetDate = new Date()) {
  if (!value) return false;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return false;

  return (
    date.getFullYear() === targetDate.getFullYear() &&
    date.getMonth() === targetDate.getMonth() &&
    date.getDate() === targetDate.getDate()
  );
}

function isActive(record) {
  const status = String(record?.status || "").toUpperCase();
  return status !== "CANCELLED" && status !== "IPTAL";
}

const quickModules = [
  {
    title: "Günlük Ciro",
    description: "Nakit, kart, paket servis ve günlük gelir girişi",
    page: "Günlük Ciro / Gelir Girişi",
  },
  {
    title: "Nakit Akışı",
    description: "Kasa, banka, tedarikçi ödemesi ve nakit hareketleri",
    page: "Nakit Akışı / Kasa Banka",
  },
  {
    title: "Kâr Zarar",
    description: "Gelir, gider ve fire maliyeti sonucunu gösterir",
    page: "Kâr Zarar",
  },
  {
    title: "Tedarikçiler",
    description: "Tedarikçi kartları ve iletişim bilgileri",
    page: "Tedarikçiler",
  },
  {
    title: "Tedarikçi Cari",
    description: "Borç, ödeme ve kalan cari bakiye takibi",
    page: "Tedarikçi Cari / Borç Takibi",
  },
  {
    title: "Satın Alma",
    description: "Satın alma talepleri, gidere ve stoğa aktarım",
    page: "Satın Alma Talepleri",
  },
  {
    title: "Stok Yönetimi",
    description: "Stok kartları, mevcut stok ve minimum stok uyarısı",
    page: "Stok Yönetimi",
  },
  {
    title: "Stok Sayımı",
    description: "Fiili sayım, fark hesaplama ve stok düzeltme",
    page: "Stok Sayımı",
  },
  {
    title: "Zayi / Kırılma",
    description: "Fire, kırılma, dökülme ve personel tüketimi",
    page: "Zayi / Kırılma",
  },
  {
    title: "Veri Yedekleme",
    description: "Tüm verileri JSON dosyası olarak dışa aktar",
    page: "Veri Yedekleme / Dışa Aktarma",
  },
  {
    title: "Sistem Kontrol",
    description: "Backend ve modül API sağlık kontrolü",
    page: "Sistem Sağlık Kontrolü",
  },
];

export default function ExecutiveDashboardPage({ user }) {
  const [dailySales, setDailySales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [supplierStatements, setSupplierStatements] = useState([]);
  const [supplierPayments, setSupplierPayments] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [wasteRecords, setWasteRecords] = useState([]);
  const [cashMovements, setCashMovements] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  function goToModule(page) {
    window.dispatchEvent(
      new CustomEvent("handsoff:navigate", {
        detail: page,
      })
    );
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

      if (!rootKey) {
        return data;
      }

      if (Array.isArray(data)) {
        return data;
      }

      if (Array.isArray(data[rootKey])) {
        return data[rootKey];
      }

      return [];
    } catch {
      return rootKey ? [] : null;
    }
  }

  async function fetchDashboardData() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [
        salesList,
        expenseList,
        statementData,
        paymentList,
        inventoryList,
        purchaseOrderList,
        wasteList,
        cashMovementList,
        stockMovementList,
      ] = await Promise.all([
        safeFetch("http://localhost:4000/api/daily-sales", "dailySales"),
        safeFetch("http://localhost:4000/api/expenses", "expenses"),
        safeFetch("http://localhost:4000/api/supplier-statements", null),
        safeFetch("http://localhost:4000/api/supplier-payments", "supplierPayments"),
        safeFetch("http://localhost:4000/api/inventory-items", "inventoryItems"),
        safeFetch("http://localhost:4000/api/purchase-orders", "purchaseOrders"),
        safeFetch("http://localhost:4000/api/waste-records", "wasteRecords"),
        safeFetch("http://localhost:4000/api/cash-movements", "cashMovements"),
        safeFetch("http://localhost:4000/api/stock-movements", "stockMovements"),
      ]);

      setDailySales(salesList || []);
      setExpenses(expenseList || []);
      setSupplierStatements(statementData?.supplierStatements || []);
      setSupplierPayments(paymentList || []);
      setInventoryItems(inventoryList || []);
      setPurchaseOrders(purchaseOrderList || []);
      setWasteRecords(wasteList || []);
      setCashMovements(cashMovementList || []);
      setStockMovements(stockMovementList || []);

      setMessage("Yönetim özeti güncellendi.");
    } catch {
      setError("Yönetim özeti verileri alınırken backend bağlantısı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }

  const activeDailySales = dailySales.filter(isActive);
  const activeExpenses = expenses.filter(isActive);
  const activeWasteRecords = wasteRecords.filter(isActive);
  const activeCashMovements = cashMovements.filter(isActive);
  const activeSupplierPayments = supplierPayments.filter(isActive);

  const todaySales = activeDailySales.filter((sale) => isSameDay(sale.saleDate || sale.date));
  const todayExpenses = activeExpenses.filter((expense) => isSameDay(getRecordDate(expense)));
  const todayWasteRecords = activeWasteRecords.filter((record) => isSameDay(getRecordDate(record)));
  const todayCashMovements = activeCashMovements.filter((movement) => isSameDay(getRecordDate(movement)));
  const todaySupplierPayments = activeSupplierPayments.filter((payment) => isSameDay(getRecordDate(payment)));

  const report = useMemo(() => {
    const todayRevenue = todaySales.reduce((total, sale) => {
      return total + getNumericValue(sale, ["totalAmount", "totalRevenue", "totalSales", "revenue", "amount"]);
    }, 0);

    const totalRevenue = activeDailySales.reduce((total, sale) => {
      return total + getNumericValue(sale, ["totalAmount", "totalRevenue", "totalSales", "revenue", "amount"]);
    }, 0);

    const totalExpense = activeExpenses.reduce((total, expense) => {
      return total + getNumericValue(expense, ["totalAmount", "amount", "price", "cost", "paidAmount"]);
    }, 0);

    const todayExpense = todayExpenses.reduce((total, expense) => {
      return total + getNumericValue(expense, ["totalAmount", "amount", "price", "cost", "paidAmount"]);
    }, 0);

    const fireCost = activeWasteRecords.reduce((total, record) => {
      return total + getNumericValue(record, ["estimatedCost", "totalAmount", "amount", "cost"]);
    }, 0);

    const todayFireCost = todayWasteRecords.reduce((total, record) => {
      return total + getNumericValue(record, ["estimatedCost", "totalAmount", "amount", "cost"]);
    }, 0);

    const supplierDebt = supplierStatements.reduce((total, statement) => {
      const remainingDebt = Number(statement.remainingDebt || 0);
      return remainingDebt > 0 ? total + remainingDebt : total;
    }, 0);

    const cashManualIn = activeCashMovements
      .filter((movement) => movement.direction === "IN")
      .reduce((total, movement) => total + Number(movement.amount || 0), 0);

    const cashManualOut = activeCashMovements
      .filter((movement) => movement.direction === "OUT")
      .reduce((total, movement) => total + Number(movement.amount || 0), 0);

    const supplierPaymentOut = activeSupplierPayments.reduce((total, payment) => {
      return total + Number(payment.amount || 0);
    }, 0);

    const paidExpenseOut = activeExpenses
      .filter((expense) => {
        const paymentStatus = String(expense.paymentStatus || "").toUpperCase();

        return (
          paymentStatus === "PAID" ||
          paymentStatus === "ODENDI" ||
          paymentStatus === "ÖDENDI" ||
          paymentStatus === "ÖDENDİ"
        );
      })
      .reduce((total, expense) => {
        return total + getNumericValue(expense, ["totalAmount", "amount", "price", "cost", "paidAmount"]);
      }, 0);

    const cashIn = totalRevenue + cashManualIn;
    const cashOut = cashManualOut + supplierPaymentOut + paidExpenseOut + fireCost;
    const netCash = cashIn - cashOut;

    const profit = totalRevenue - totalExpense - fireCost;

    return {
      todayRevenue,
      todayExpense,
      todayFireCost,
      totalRevenue,
      totalExpense,
      fireCost,
      supplierDebt,
      cashIn,
      cashOut,
      netCash,
      profit,
    };
  }, [
    activeDailySales,
    activeExpenses,
    activeWasteRecords,
    activeCashMovements,
    activeSupplierPayments,
    supplierStatements,
    todaySales,
    todayExpenses,
    todayWasteRecords,
  ]);

  const lowStockItems = useMemo(() => {
    return inventoryItems
      .filter((item) => {
        return (
          Number(item.minStock || 0) > 0 &&
          Number(item.currentStock || 0) <= Number(item.minStock || 0)
        );
      })
      .sort((a, b) => Number(a.currentStock || 0) - Number(b.currentStock || 0));
  }, [inventoryItems]);

  const pendingPurchaseOrders = useMemo(() => {
    return purchaseOrders
      .filter((order) => {
        const status = String(order.status || "").toUpperCase();

        return (
          status !== "CANCELLED" &&
          status !== "APPROVED" &&
          (!order.expenseCreated || !order.stockMovementCreated)
        );
      })
      .sort((a, b) => new Date(b.orderDate || b.createdAt || 0) - new Date(a.orderDate || a.createdAt || 0));
  }, [purchaseOrders]);

  const topSupplierDebts = useMemo(() => {
    return supplierStatements
      .filter((statement) => Number(statement.remainingDebt || 0) > 0)
      .sort((a, b) => Number(b.remainingDebt || 0) - Number(a.remainingDebt || 0))
      .slice(0, 5);
  }, [supplierStatements]);

  const latestCashRows = useMemo(() => {
    const manualRows = activeCashMovements.map((movement) => ({
      id: "cash-" + movement.id,
      date: getRecordDate(movement),
      type: movement.direction === "IN" ? "Manuel Giriş" : "Manuel Çıkış",
      title: movement.title || "Kasa hareketi",
      amount: Number(movement.amount || 0),
      direction: movement.direction === "OUT" ? "OUT" : "IN",
    }));

    const paymentRows = activeSupplierPayments.map((payment) => ({
      id: "payment-" + payment.id,
      date: getRecordDate(payment),
      type: "Tedarikçi Ödemesi",
      title: payment.supplierName || payment.supplier?.name || "Tedarikçi",
      amount: Number(payment.amount || 0),
      direction: "OUT",
    }));

    const saleRows = activeDailySales.map((sale) => ({
      id: "sale-" + sale.id,
      date: getRecordDate(sale),
      type: "Günlük Ciro",
      title: sale.title || "Günlük Ciro",
      amount: getNumericValue(sale, ["totalAmount", "totalRevenue", "totalSales", "revenue", "amount"]),
      direction: "IN",
    }));

    return [...manualRows, ...paymentRows, ...saleRows]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 10);
  }, [activeCashMovements, activeSupplierPayments, activeDailySales]);

  const latestStockRows = useMemo(() => {
    return stockMovements
      .slice()
      .sort((a, b) => new Date(b.movementDate || b.createdAt || 0) - new Date(a.movementDate || a.createdAt || 0))
      .slice(0, 8);
  }, [stockMovements]);

  const alerts = useMemo(() => {
    const list = [];

    if (lowStockItems.length > 0) {
      list.push({
        title: "Düşük stok var",
        description: `${lowStockItems.length} stok kartı minimum seviyede veya altında.`,
        level: "Kritik",
      });
    }

    if (pendingPurchaseOrders.length > 0) {
      list.push({
        title: "Bekleyen satın alma talebi var",
        description: `${pendingPurchaseOrders.length} talep gider veya stok aktarımı bekliyor.`,
        level: "Uyarı",
      });
    }

    if (report.supplierDebt > 0) {
      list.push({
        title: "Açık tedarikçi borcu var",
        description: `Toplam açık borç: ${formatMoney(report.supplierDebt)}.`,
        level: "Finans",
      });
    }

    if (report.todayRevenue === 0) {
      list.push({
        title: "Bugünkü ciro girilmemiş olabilir",
        description: "Günlük Ciro / Gelir Girişi ekranından bugünün cirosunu ekle.",
        level: "Hatırlatma",
      });
    }

    if (report.netCash < 0) {
      list.push({
        title: "Net nakit negatif",
        description: `Net nakit: ${formatMoney(report.netCash)}.`,
        level: "Kritik",
      });
    }

    return list;
  }, [lowStockItems, pendingPurchaseOrders, report]);

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {user.restaurantName}</p>

            <h1>Yönetim Özeti / Dashboard</h1>

            <p>
              Ciro, gider, nakit, tedarikçi borcu, stok uyarıları ve bekleyen
              satın alma taleplerini tek ekranda gösterir.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="hero-button" type="button" onClick={fetchDashboardData}>
              Yenile
            </button>

            <button
              className="hero-button"
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("handsoff:navigate", {
                    detail: "Veri Yedekleme / Dışa Aktarma",
                  })
                )
              }
              style={{ background: "#166534" }}
            >
              Veri Yedekle
            </button>

            <button
              className="hero-button"
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("handsoff:navigate", {
                    detail: "Sistem Sağlık Kontrolü",
                  })
                )
              }
              style={{ background: "#1d4ed8" }}
            >
              Sistem Kontrol
            </button>
          </div>
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
          <p>Bugünkü Ciro</p>
          <h3>{formatMoney(report.todayRevenue)}</h3>
          <span>{todaySales.length} ciro kaydı</span>
        </div>

        <div className="stat-card">
          <p>Net Nakit</p>
          <h3>{formatMoney(report.netCash)}</h3>
          <span>Giriş {formatMoney(report.cashIn)} / Çıkış {formatMoney(report.cashOut)}</span>
        </div>

        <div className="stat-card">
          <p>Kâr / Zarar</p>
          <h3>{formatMoney(report.profit)}</h3>
          <span>Gelir - gider - fire</span>
        </div>

        <div className="stat-card">
          <p>Açık Tedarikçi Borcu</p>
          <h3>{formatMoney(report.supplierDebt)}</h3>
          <span>{topSupplierDebts.length} öncelikli tedarikçi</span>
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
          <p>Toplam Gelir</p>
          <h3>{formatMoney(report.totalRevenue)}</h3>
          <span>Aktif ciro kayıtları</span>
        </div>

        <div className="stat-card">
          <p>Toplam Gider</p>
          <h3>{formatMoney(report.totalExpense)}</h3>
          <span>İptal kayıtlar hariç</span>
        </div>

        <div className="stat-card">
          <p>Fire Maliyeti</p>
          <h3>{formatMoney(report.fireCost)}</h3>
          <span>Bugün: {formatMoney(report.todayFireCost)}</span>
        </div>

        <div className="stat-card">
          <p>Düşük Stok</p>
          <h3>{lowStockItems.length}</h3>
          <span>{inventoryItems.length} stok kartı içinde</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Hızlı Modül Geçişleri</h2>

            <p className="panel-sub">
              Yeni eklenen operasyon, finans, stok ve sistem ekranlarına buradan geç.
            </p>
          </div>

          <span className="mini-pill">{quickModules.length} modül</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          {quickModules.map((module) => (
            <button
              key={module.page}
              type="button"
              onClick={() => goToModule(module.page)}
              style={{
                textAlign: "left",
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                borderRadius: 18,
                padding: 18,
                cursor: "pointer",
                boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
              }}
            >
              <strong
                style={{
                  display: "block",
                  color: "#111827",
                  fontSize: 15,
                  marginBottom: 8,
                }}
              >
                {module.title}
              </strong>

              <span
                style={{
                  display: "block",
                  color: "#6b7280",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {module.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Uyarılar</h2>

            <p className="panel-sub">
              Yönetimde önce bakılması gereken kritik başlıklar.
            </p>
          </div>

          <span className="mini-pill">{alerts.length} uyarı</span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>Seviye</th>
              <th>Başlık</th>
              <th>Açıklama</th>
            </tr>
          </thead>

          <tbody>
            {alerts.length === 0 ? (
              <tr>
                <td colSpan="3">Şu an kritik uyarı yok.</td>
              </tr>
            ) : (
              alerts.map((alert, index) => (
                <tr key={index}>
                  <td>{alert.level}</td>
                  <td>{alert.title}</td>
                  <td>{alert.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
              <h2>Düşük Stoklar</h2>

              <p className="panel-sub">
                Minimum stok seviyesine gelen ürünler.
              </p>
            </div>

            <span className="mini-pill">{lowStockItems.length} ürün</span>
          </div>

          <table className="module-table">
            <thead>
              <tr>
                <th>Stok</th>
                <th>Mevcut</th>
                <th>Minimum</th>
                <th>Kategori</th>
              </tr>
            </thead>

            <tbody>
              {lowStockItems.length === 0 ? (
                <tr>
                  <td colSpan="4">Düşük stok yok.</td>
                </tr>
              ) : (
                lowStockItems.slice(0, 8).map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>
                      {item.currentStock} {item.unit}
                    </td>
                    <td>
                      {item.minStock} {item.unit}
                    </td>
                    <td>{item.category}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Bekleyen Satın Alma Talepleri</h2>

              <p className="panel-sub">
                Gider veya stok aktarımı tamamlanmamış talepler.
              </p>
            </div>

            <span className="mini-pill">{pendingPurchaseOrders.length} talep</span>
          </div>

          <table className="module-table">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Tedarikçi</th>
                <th>Ürün</th>
                <th>Tutar</th>
              </tr>
            </thead>

            <tbody>
              {pendingPurchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan="4">Bekleyen talep yok.</td>
                </tr>
              ) : (
                pendingPurchaseOrders.slice(0, 8).map((order) => (
                  <tr key={order.id}>
                    <td>{formatDate(order.orderDate || order.createdAt)}</td>
                    <td>{order.supplierName || "-"}</td>
                    <td>{order.itemName || "-"}</td>
                    <td>{formatMoney(order.totalAmount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
              <h2>En Yüksek Tedarikçi Borçları</h2>

              <p className="panel-sub">
                Ödeme önceliği verebileceğin açık cari bakiyeler.
              </p>
            </div>
          </div>

          <table className="module-table">
            <thead>
              <tr>
                <th>Tedarikçi</th>
                <th>Toplam Gider</th>
                <th>Kalan Borç</th>
              </tr>
            </thead>

            <tbody>
              {topSupplierDebts.length === 0 ? (
                <tr>
                  <td colSpan="3">Açık tedarikçi borcu yok.</td>
                </tr>
              ) : (
                topSupplierDebts.map((statement) => (
                  <tr key={statement.key}>
                    <td>{statement.supplierName}</td>
                    <td>{formatMoney(statement.totalExpense)}</td>
                    <td>{formatMoney(statement.remainingDebt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Son Nakit Hareketleri</h2>

              <p className="panel-sub">
                Ciro, kasa hareketi ve tedarikçi ödemelerinden oluşur.
              </p>
            </div>
          </div>

          <table className="module-table">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Tip</th>
                <th>Açıklama</th>
                <th>Tutar</th>
              </tr>
            </thead>

            <tbody>
              {latestCashRows.length === 0 ? (
                <tr>
                  <td colSpan="4">Henüz nakit hareketi yok.</td>
                </tr>
              ) : (
                latestCashRows.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDateTime(row.date)}</td>
                    <td>{row.type}</td>
                    <td>{row.title}</td>
                    <td>
                      {row.direction === "OUT" ? "-" : "+"}
                      {formatMoney(row.amount)}
                    </td>
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
            <h2>Son Stok Hareketleri</h2>

            <p className="panel-sub">
              Satın alma, stok sayımı ve zayi/kırılma hareketleri.
            </p>
          </div>

          <span className="mini-pill">{latestStockRows.length} hareket</span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Stok</th>
              <th>Tip</th>
              <th>Miktar</th>
              <th>Kaynak</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5">Dashboard yükleniyor...</td>
              </tr>
            ) : latestStockRows.length === 0 ? (
              <tr>
                <td colSpan="5">Henüz stok hareketi yok.</td>
              </tr>
            ) : (
              latestStockRows.map((movement) => (
                <tr key={movement.id}>
                  <td>{formatDateTime(movement.movementDate || movement.createdAt)}</td>
                  <td>{movement.inventoryItem?.name || "-"}</td>
                  <td>{movement.type}</td>
                  <td>
                    {movement.quantity} {movement.unit}
                  </td>
                  <td>{movement.source}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
