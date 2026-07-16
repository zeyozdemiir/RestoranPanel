import { API_BASE_URL } from "./apiConfig";
﻿import { useEffect, useRef, useState } from "react";

const documentTypeLabels = {
  ADISYON_REPORT: "Adisyon Raporu",
  EXPENSE_INVOICE: "Gider Faturası",
  STOCK_INVOICE: "Stok / Satın Alma Faturası",
  PERSONNEL_DOCUMENT: "Personel Evrakı",
  OTHER: "Diğer",
};

export default function ReportUploadPage({ user }) {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState("ADISYON_REPORT");
  const [uploading, setUploading] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  function openFileSelector() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  function handleFileChange(event) {
    const file = event.target.files && event.target.files[0];

    setSelectedFile(file || null);
    setMessage("");
    setError("");
    setUploadedFile(null);
  }

  async function fetchDocuments() {
    try {
      setLoadingDocuments(true);

      const token = localStorage.getItem("handsoff_token");

      const response = await fetch(API_BASE_URL + "/api/report-uploads", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Yüklenen dosyalar alınamadı.");
        return;
      }

      setDocuments(data.documents || []);
    } catch {
      setError("Yüklenen dosyalar için backend bağlantısı kurulamadı.");
    } finally {
      setLoadingDocuments(false);
    }
  }

  async function handleUpload(event) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Lütfen önce Dosya Seç butonuna basıp bir PDF, Excel veya CSV dosyası seç.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");
      setError("");

      const token = localStorage.getItem("handsoff_token");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("documentType", documentType);

      const response = await fetch(API_BASE_URL + "/api/report-uploads", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Dosya yüklenemedi.");
        return;
      }

      setMessage("Dosya başarıyla yüklendi ve veritabanına kaydedildi.");
      setUploadedFile(data.file);
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchDocuments();
    } catch {
      setError("Backend bağlantısı kurulamadı.");
    } finally {
      setUploading(false);
    }
  }

  function formatFileSize(sizeBytes) {
    if (!sizeBytes) return "-";

    if (sizeBytes < 1024) {
      return sizeBytes + " byte";
    }

    if (sizeBytes < 1024 * 1024) {
      return Math.round(sizeBytes / 1024) + " KB";
    }

    return (sizeBytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function formatDate(value) {
    if (!value) return "-";

    return new Date(value).toLocaleString("tr-TR");
  }

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div>
            <p className="eyebrow">HandsOff / {user.restaurantName}</p>

            <h1>Belge ve Rapor Yükle</h1>

            <p>
              Adisyon raporu, gider faturası, stok faturası veya personel evraklarını
              bu ekrandan sisteme yükleyebilirsin. Sonraki adımda AI bu belgeleri
              okuyup ilgili modüle işleyecek.
            </p>
          </div>

          <button className="hero-button" type="button">
            AI Okuma Yakında
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Dosya Yükle</h2>

            <p className="panel-sub">
              Önce belge türünü seç. Sonra PDF, Excel veya CSV dosyasını yükle.
            </p>
          </div>

          <span className="mini-pill">Upload</span>
        </div>

        {message && (
          <div
            className="error-box"
            style={{
              marginBottom: 18,
              color: "#166534",
              background: "#f0fdf4",
              borderColor: "#bbf7d0",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div className="error-box" style={{ marginBottom: 18 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleUpload}>
          <table className="module-table">
            <tbody>
              <tr>
                <td>Belge Türü</td>
                <td>
                  <select
                    value={documentType}
                    onChange={(event) => setDocumentType(event.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                    }}
                  >
                    <option value="ADISYON_REPORT">Adisyon Raporu</option>
                    <option value="EXPENSE_INVOICE">Gider Faturası</option>
                    <option value="STOCK_INVOICE">Stok / Satın Alma Faturası</option>
                    <option value="PERSONNEL_DOCUMENT">Personel Evrakı</option>
                    <option value="OTHER">Diğer</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.xls,.xlsx,.csv"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <div
            style={{
              border: "1px dashed #cbd5e1",
              borderRadius: 18,
              padding: 24,
              background: "#f8fafc",
              marginTop: 18,
              marginBottom: 18,
            }}
          >
            <p style={{ marginTop: 0, fontWeight: 700 }}>
              Seçilecek dosya türleri:
            </p>

            <p style={{ marginBottom: 18 }}>
              PDF, Excel veya CSV dosyası yükleyebilirsin.
            </p>

            <button
              className="hero-button"
              type="button"
              onClick={openFileSelector}
            >
              Dosya Seç
            </button>

            <div style={{ marginTop: 18 }}>
              <strong>Seçilen Dosya: </strong>
              {selectedFile ? selectedFile.name : "Henüz dosya seçilmedi"}
            </div>
          </div>

          <button
            className="hero-button"
            type="submit"
            disabled={uploading}
            style={{ marginTop: 6 }}
          >
            {uploading ? "Yükleniyor..." : "Dosyayı Yükle"}
          </button>
        </form>
      </div>

      {uploadedFile && (
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Son Yüklenen Dosya</h2>

              <p className="panel-sub">
                Dosya backend/uploads klasörüne kaydedildi ve veritabanına işlendi.
              </p>
            </div>

            <span className="mini-pill">Saved</span>
          </div>

          <table className="module-table">
            <tbody>
              <tr>
                <td>Orijinal Ad</td>
                <td>{uploadedFile.originalName}</td>
              </tr>

              <tr>
                <td>Kaydedilen Ad</td>
                <td>{uploadedFile.storedName}</td>
              </tr>

              <tr>
                <td>Dosya Tipi</td>
                <td>{uploadedFile.mimeType}</td>
              </tr>

              <tr>
                <td>Boyut</td>
                <td>{uploadedFile.size} byte</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Yüklenen Belgeler</h2>

            <p className="panel-sub">
              Bu liste veritabanındaki UploadedDocument tablosundan gelir.
            </p>
          </div>

          <span className="mini-pill">
            {loadingDocuments ? "Yükleniyor" : documents.length + " Dosya"}
          </span>
        </div>

        <table className="module-table">
          <thead>
            <tr>
              <th>Dosya</th>
              <th>Belge Türü</th>
              <th>Durum</th>
              <th>AI</th>
              <th>İşlendi</th>
              <th>Tarih</th>
              <th>Boyut</th>
            </tr>
          </thead>

          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan="7">Henüz kayıtlı dosya yok.</td>
              </tr>
            ) : (
              documents.map((document) => (
                <tr key={document.id}>
                  <td>{document.originalName}</td>
                  <td>
                    {documentTypeLabels[document.documentType] ||
                      document.documentType}
                  </td>
                  <td>{document.status}</td>
                  <td>{document.aiRead ? "Okundu" : "Bekliyor"}</td>
                  <td>{document.processed ? "Evet" : "Hayır"}</td>
                  <td>{formatDate(document.createdAt)}</td>
                  <td>{formatFileSize(document.sizeBytes)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}