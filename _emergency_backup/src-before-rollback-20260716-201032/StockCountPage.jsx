import { API_BASE_URL } from "./apiConfig";
﻿import { useEffect, useMemo, useState } from "react";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("tr-TR");
}

function formatNumber(value) {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

const emptyForm = {
  countNo: "",
  countDate: new Date().toISOString().slice(0, 10),
  note: "",
};

export default function StockCountPage({ user }) {
  const [stockCounts, setStockCounts] = useState([]);
  const [selectedCount, setSelectedCount] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [lineDrafts, setLineDrafts] = useState({});
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [savingLineId, setSavingLineId] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStockCounts();
    restoreDraft();
  }, []);

  useEffect(() => {
    const hasDraftData = form.countNo || form.note;

    if (hasDraftData) {
      localStorage.setItem("handsoff_stock_count_form_draft", JSON.stringify(form));
    }
  }, [form]);

  function restoreDraft() {
    try {
      const rawDraft = localStorage.getItem("handsoff_stock_count_form_draft");

      if (!rawDraft) {
        return;
      }

      const draft = JSON.parse(rawDraft);

      if (!draft || typeof draft !== "object") {
        localStorage.removeItem("handsoff_stock_count_form_draft");
        return;
      }

      setForm({
        ...emptyForm,
        ...draft,
      });
    } catch {
      localStorage.removeItem("handsoff_stock_count_form_draft");
    }
  }

  async function fetchStockCounts() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/stock-counts", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Stok sayımları alınamadı.");
        return;
      }

      const counts = data.stockCounts || [];
      setStockCounts(counts);

      if (!selectedCount && counts.length > 0) {
        openCount(counts[0]);
      } else if (selectedCount) {
        const refreshed = counts.find((count) => count.id === selectedCount.id);

        if (refreshed) {
          openCount(refreshed);
        }
      }
    } catch {
      setError("Backend bağlantısı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function openCount(count) {
    setSelectedCount(count);
    setMessage("");
    setError("");

    const drafts = {};

    (count.lines || []).forEach((line) => {
      drafts[line.id] = {
        countedStock:
          line.countedStock === null || line.countedStock === undefined
            ? ""
            : String(line.countedStock),
        note: line.note || "",
      };
    });

    setLineDrafts(drafts);
  }

  async function handleCreateCount(event) {
    event.preventDefault();

    try {
      setCreating(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/stock-counts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Stok sayımı oluşturulamadı.");
        return;
      }

      localStorage.removeItem("handsoff_stock_count_form_draft");

      setMessage("Stok sayımı oluşturuldu.");
      setForm(emptyForm);
      setSelectedCount(data.stockCount || null);

      if (data.stockCount) {
        openCount(data.stockCount);
      }

      await fetchStockCounts();
    } catch {
      setError("Stok sayımı oluşturulurken backend bağlantısı kurulamadı.");
    } finally {
      setCreating(false);
    }
  }

  function handleLineDraftChange(lineId, field, value) {
    setLineDrafts((currentDrafts) => ({
      ...currentDrafts,
      [lineId]: {
        ...(currentDrafts[lineId] || {}),
        [field]: value,
      },
    }));
  }

  async function handleSaveLine(line) {
    if (!selectedCount) {
      return;
    }

    try {
      setSavingLineId(line.id);
      setError("");
      setMessage("");

      const token = localStorage.getItem("handsoff_token");
      const draft = lineDrafts[line.id] || {};

      const response = await fetch(
        API_BASE_URL + `/api/stock-counts/${selectedCount.id}/lines/${line.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            countedStock: draft.countedStock,
            note: draft.note,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Sayım satırı güncellenemedi.");
        return;
      }

      const updatedLine = data.line;

      const updatedSelectedCount = {
        ...selectedCount,
        lines: selectedCount.lines.map((currentLine) =>
          currentLine.id === updatedLine.id ? updatedLine : currentLine
        ),
      };

      setSelectedCount(updatedSelectedCount);

      setStockCounts((currentCounts) =>
        currentCounts.map((count) =>
          count.id === updatedSelectedCount.id ? updatedSelectedCount : count
        )
      );

      setMessage("Sayım satırı kaydedildi.");
    } catch {
      setError("Sayım satırı kaydedilirken backend bağlantısı kurulamadı.");
    } finally {
      setSavingLineId(null);
    }
  }

  async function handleCompleteCount() {
    if (!selectedCount) {
      return;
    }

    const confirmed = window.confirm(
      "Bu sayım tamamlanınca stok miktarları gerçek sayım miktarlarına göre güncellenecek. Devam edilsin mi?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCompleting(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(
        API_BASE_URL + `/api/stock-counts/${selectedCount.id}/complete`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Stok sayımı tamamlanamadı.");
        return;
      }

      setMessage("Stok sayımı tamamlandı ve stoklar güncellendi.");

      if (data.stockCount) {
        openCount(data.stockCount);
      }

      await fetchStockCounts();
    } catch {
      setError("Stok sayımı tamamlanırken backend bağlantısı kurulamadı.");
    } finally {
      setCompleting(false);
    }
  }

  const summary = useMemo(() => {
    const lines = selectedCount?.lines || [];

    return lines.reduce(
      (total, line) => {
        total.totalLines += 1;

        if (line.countedStock !== null && line.countedStock !== undefined) {
          total.countedLines += 1;
        }

        const difference = Number(line.difference || 0);

        if (difference > 0) {
          total.positiveDifference += difference;
        }

        if (difference < 0) {
          total.negativeDifference += difference;
        }

        return total;
      },
      {
        totalLines: 0,
        countedLines: 0,
        positiveDifference: 0,
        negativeDifference: 0,
      }
    );
  }, [selectedCount]);

  const draftSummary = useMemo(() => {
    const draftCounts = stockCounts.filter((count) => count.status === "DRAFT");
    const completedCounts = stockCounts.filter(
      (count) => count.status === "COMPLETED"
    );

    return {
      draft: draftCounts.length,
      completed: completedCounts.length,
      total: stockCounts.length,
    };
  }, [stockCounts]);

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {user.restaurantName}</p>

            <h1>Stok Sayımı</h1>

            <p>
              Sistem stoğunu gör, gerçek sayımı gir, farkı hesapla ve sayımı
              tamamlayınca stok miktarlarını otomatik güncelle.
            </p>
          </div>

          <button
            className="hero-button"
            type="button"
            onClick={fetchStockCounts}
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
          <p>Toplam Sayım</p>
          <h3>{draftSummary.total}</h3>
          <span>Oluşturulan stok sayımı</span>
        </div>

        <div className="stat-card">
          <p>Açık Sayım</p>
          <h3>{draftSummary.draft}</h3>
          <span>Tamamlanmayı bekleyen</span>
        </div>

        <div className="stat-card">
          <p>Tamamlanan</p>
          <h3>{draftSummary.completed}</h3>
          <span>Stoklara işlenmiş sayım</span>
        </div>

        <div className="stat-card">
          <p>Seçili Sayım</p>
          <h3>{selectedCount ? selectedCount.status : "-"}</h3>
          <span>{selectedCount ? selectedCount.countNo : "Sayım seçilmedi"}</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Yeni Stok Sayımı Oluştur</h2>

            <p className="panel-sub">
              Yeni sayım oluşturunca aktif stok kartları otomatik satırlara
              eklenir.
            </p>
          </div>

          <span className="mini-pill">Sayım başlangıcı</span>
        </div>

        <form onSubmit={handleCreateCount}>
          <table className="module-table">
            <tbody>
              <tr>
                <td>Sayım No</td>
                <td>
                  <input
                    name="countNo"
                    value={form.countNo}
                    onChange={handleFormChange}
                    placeholder="Boş bırakırsan otomatik oluşur"
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
                <td>Sayım Tarihi</td>
                <td>
                  <input
                    type="date"
                    name="countDate"
                    value={form.countDate}
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
                <td>Not</td>
                <td>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleFormChange}
                    rows="3"
                    placeholder="Örn: Ay sonu genel depo sayımı"
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
            disabled={creating}
            style={{ marginTop: 18 }}
          >
            {creating ? "Oluşturuluyor..." : "Stok Sayımı Oluştur"}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Stok Sayımları</h2>

            <p className="panel-sub">
              Açık veya tamamlanmış sayımları buradan seçebilirsin.
            </p>
          </div>

          <span className="mini-pill">{stockCounts.length} kayıt</span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>İşlem</th>
              <th>Sayım No</th>
              <th>Tarih</th>
              <th>Durum</th>
              <th>Satır</th>
              <th>Not</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">Stok sayımları yükleniyor...</td>
              </tr>
            ) : stockCounts.length === 0 ? (
              <tr>
                <td colSpan="6">
                  Henüz stok sayımı yok. Önce Stok Yönetimi’nde stok kartı
                  olmalı.
                </td>
              </tr>
            ) : (
              stockCounts.map((count) => (
                <tr key={count.id}>
                  <td>
                    <button
                      type="button"
                      className="hero-button"
                      onClick={() => openCount(count)}
                      style={{ padding: "8px 12px", borderRadius: 12 }}
                    >
                      Aç
                    </button>
                  </td>

                  <td>{count.countNo}</td>
                  <td>{formatDate(count.countDate)}</td>
                  <td>{count.status === "COMPLETED" ? "Tamamlandı" : "Açık"}</td>
                  <td>{count.lines?.length || 0}</td>
                  <td>{count.note || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedCount && (
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Seçili Sayım: {selectedCount.countNo}</h2>

              <p className="panel-sub">
                Sistem stoğu ile gerçek sayım arasındaki fark burada hesaplanır.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span className="mini-pill">
                {summary.countedLines} / {summary.totalLines} sayıldı
              </span>

              {selectedCount.status !== "COMPLETED" && (
                <button
                  className="hero-button"
                  type="button"
                  onClick={handleCompleteCount}
                  disabled={completing}
                  style={{ background: "#166534" }}
                >
                  {completing ? "Tamamlanıyor..." : "Sayımı Tamamla"}
                </button>
              )}
            </div>
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
              <p>Sayım Satırı</p>
              <h3>{summary.totalLines}</h3>
              <span>Toplam stok kalemi</span>
            </div>

            <div className="stat-card">
              <p>Sayılan</p>
              <h3>{summary.countedLines}</h3>
              <span>Gerçek stok girilmiş</span>
            </div>

            <div className="stat-card">
              <p>Fazla</p>
              <h3>{formatNumber(summary.positiveDifference)}</h3>
              <span>Sistemden fazla çıkan</span>
            </div>

            <div className="stat-card">
              <p>Eksik</p>
              <h3>{formatNumber(summary.negativeDifference)}</h3>
              <span>Sistemden eksik çıkan</span>
            </div>
          </div>

          <table className="module-table">
            <thead>
              <tr>
                <th>İşlem</th>
                <th>Stok</th>
                <th>Kategori</th>
                <th>Sistem Stoğu</th>
                <th>Gerçek Sayım</th>
                <th>Fark</th>
                <th>Birim</th>
                <th>Not</th>
              </tr>
            </thead>

            <tbody>
              {(selectedCount.lines || []).length === 0 ? (
                <tr>
                  <td colSpan="8">
                    Bu sayımda satır yok. Önce Stok Yönetimi’nde stok kartı
                    oluştur.
                  </td>
                </tr>
              ) : (
                selectedCount.lines.map((line) => {
                  const draft = lineDrafts[line.id] || {
                    countedStock: "",
                    note: "",
                  };

                  const draftCounted =
                    draft.countedStock === "" ? null : Number(draft.countedStock);

                  const visualDifference =
                    draftCounted === null
                      ? Number(line.difference || 0)
                      : draftCounted - Number(line.systemStock || 0);

                  return (
                    <tr key={line.id}>
                      <td>
                        {selectedCount.status === "COMPLETED" ? (
                          "Kilitli"
                        ) : (
                          <button
                            type="button"
                            className="hero-button"
                            onClick={() => handleSaveLine(line)}
                            disabled={savingLineId === line.id}
                            style={{ padding: "8px 12px", borderRadius: 12 }}
                          >
                            {savingLineId === line.id ? "Kaydediliyor" : "Kaydet"}
                          </button>
                        )}
                      </td>

                      <td>{line.inventoryItem?.name || "-"}</td>
                      <td>{line.inventoryItem?.category || "-"}</td>
                      <td>{formatNumber(line.systemStock)}</td>

                      <td>
                        <input
                          type="number"
                          value={draft.countedStock}
                          disabled={selectedCount.status === "COMPLETED"}
                          onChange={(event) =>
                            handleLineDraftChange(
                              line.id,
                              "countedStock",
                              event.target.value
                            )
                          }
                          placeholder="Gerçek sayım"
                          style={{
                            width: "100%",
                            padding: 10,
                            borderRadius: 12,
                            border: "1px solid #cbd5e1",
                          }}
                        />
                      </td>

                      <td>{formatNumber(visualDifference)}</td>
                      <td>{line.unit}</td>

                      <td>
                        <input
                          value={draft.note}
                          disabled={selectedCount.status === "COMPLETED"}
                          onChange={(event) =>
                            handleLineDraftChange(line.id, "note", event.target.value)
                          }
                          placeholder="Satır notu"
                          style={{
                            width: "100%",
                            padding: 10,
                            borderRadius: 12,
                            border: "1px solid #cbd5e1",
                          }}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
