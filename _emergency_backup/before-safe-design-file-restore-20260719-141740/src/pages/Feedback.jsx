import { useState } from "react";

const initialFeedbacks = [
  {
    id: 1,
    customerName: "Derya Aksoy",
    source: "Instagram",
    type: "Övgü",
    category: "Servis",
    rating: 5,
    date: "2026-06-24",
    owner: "Servis Ekibi",
    status: "Yanıtlandı",
    message: "Servis çok ilgiliydi, masa ve sunum çok güzeldi.",
    actionNote: "Teşekkür mesajı gönderildi.",
  },
  {
    id: 2,
    customerName: "Mert Yıldırım",
    source: "Google",
    type: "Şikayet",
    category: "Bekleme Süresi",
    rating: 2,
    date: "2026-06-23",
    owner: "Operasyon",
    status: "Aksiyon Bekliyor",
    message: "Rezervasyon olmasına rağmen masa için bekledik.",
    actionNote: "Rezervasyon akışı kontrol edilecek.",
  },
  {
    id: 3,
    customerName: "Selin Korkmaz",
    source: "Yemeksepeti",
    type: "Öneri",
    category: "Menü",
    rating: 4,
    date: "2026-06-21",
    owner: "Mutfak",
    status: "İnceleniyor",
    message: "Brunch çok güzeldi, kahvaltı pizzası daha çok vurgulanmalı.",
    actionNote: "Sosyal medya ve menü açıklamasında öne çıkarılacak.",
  },
];

function getStatusClass(status) {
  if (status === "Yanıtlandı") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "İnceleniyor") return "bg-blue-50 text-blue-700 border-blue-200";
  if (status === "Aksiyon Bekliyor") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "Kapandı") return "bg-gray-50 text-gray-700 border-gray-200";

  return "bg-red-50 text-red-700 border-red-200";
}

function getTypeClass(type) {
  if (type === "Övgü") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (type === "Şikayet") return "bg-red-50 text-red-700 border-red-200";
  if (type === "Öneri") return "bg-blue-50 text-blue-700 border-blue-200";

  return "bg-gray-50 text-gray-700 border-gray-200";
}

function getSourceClass(source) {
  if (source === "Google") return "bg-blue-50 text-blue-700 border-blue-200";
  if (source === "Instagram") return "bg-purple-50 text-purple-700 border-purple-200";
  if (source === "Yemeksepeti") return "bg-red-50 text-red-700 border-red-200";
  if (source === "Telefon") return "bg-[#fff7e7] text-[#9c7439] border-[#c9a45c]/30";

  return "bg-gray-50 text-gray-700 border-gray-200";
}

function getRatingClass(rating) {
  if (Number(rating) >= 4) return "text-emerald-700";
  if (Number(rating) === 3) return "text-amber-700";

  return "text-red-700";
}

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);

  const [form, setForm] = useState({
    customerName: "",
    source: "",
    type: "",
    category: "",
    rating: "",
    date: "",
    owner: "",
    status: "İnceleniyor",
    message: "",
    actionNote: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const newFeedback = {
      id: Date.now(),
      customerName: form.customerName,
      source: form.source,
      type: form.type,
      category: form.category,
      rating: Number(form.rating),
      date: form.date,
      owner: form.owner,
      status: form.status,
      message: form.message,
      actionNote: form.actionNote,
    };

    setFeedbacks((prev) => [newFeedback, ...prev]);

    setForm({
      customerName: "",
      source: "",
      type: "",
      category: "",
      rating: "",
      date: "",
      owner: "",
      status: "İnceleniyor",
      message: "",
      actionNote: "",
    });
  }

  function updateStatus(id, nextStatus) {
    setFeedbacks((prev) =>
      prev.map((feedback) =>
        feedback.id === id ? { ...feedback, status: nextStatus } : feedback
      )
    );
  }

  function updateOwner(id, nextOwner) {
    setFeedbacks((prev) =>
      prev.map((feedback) =>
        feedback.id === id ? { ...feedback, owner: nextOwner } : feedback
      )
    );
  }

  const totalFeedbacks = feedbacks.length;

  const averageRating =
    feedbacks.length === 0
      ? 0
      : feedbacks.reduce((total, item) => total + Number(item.rating), 0) /
        feedbacks.length;

  const complaintCount = feedbacks.filter(
    (item) => item.type === "Şikayet"
  ).length;

  const openActionCount = feedbacks.filter(
    (item) => item.status === "Aksiyon Bekliyor" || item.status === "İnceleniyor"
  ).length;

  const answeredCount = feedbacks.filter(
    (item) => item.status === "Yanıtlandı"
  ).length;

  const sources = [...new Set(feedbacks.map((item) => item.source))];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8c7ad] bg-white/85 p-8 shadow-sm backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9c7439]">
          Ekip & Müşteri
        </p>

        <div className="mt-3 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#211914]">
              Geri Bildirim
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6b5a]">
              Google, Instagram, Yemeksepeti, telefon ve restoran içinden gelen
              müşteri yorumlarını; puan, kategori, aksiyon sahibi ve çözüm
              durumuyla takip et.
            </p>
          </div>

          <button className="rounded-full border border-[#c9a45c]/30 bg-[#211914] px-5 py-3 text-sm font-medium text-[#e6c57a] shadow-sm transition hover:bg-black">
            Geri Bildirim Raporu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Toplam Kayıt</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#211914]">
            {totalFeedbacks}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Ortalama Puan</p>
          <h3 className={`mt-3 text-2xl font-semibold ${getRatingClass(averageRating)}`}>
            {averageRating.toFixed(1)} / 5
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Şikayet</p>
          <h3 className="mt-3 text-2xl font-semibold text-red-700">
            {complaintCount}
          </h3>
        </div>

        <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#8a7560]">Açık Aksiyon</p>
          <h3 className="mt-3 text-2xl font-semibold text-amber-700">
            {openActionCount}
          </h3>
          <p className="mt-2 text-xs text-[#8a7560]">
            Yanıtlandı: {answeredCount}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#211914]">
            Yeni Geri Bildirim Ekle
          </h2>

          <p className="mt-1 text-sm text-[#8a7560]">
            Yorumu, puanı, kaynağı ve çözüm aksiyonunu buradan kaydet.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            placeholder="Müşteri adı"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="source"
            value={form.source}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Kaynak seç</option>
            <option value="Google">Google</option>
            <option value="Instagram">Instagram</option>
            <option value="Yemeksepeti">Yemeksepeti</option>
            <option value="Telefon">Telefon</option>
            <option value="Restoran İçi">Restoran İçi</option>
          </select>

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Tip seç</option>
            <option value="Övgü">Övgü</option>
            <option value="Şikayet">Şikayet</option>
            <option value="Öneri">Öneri</option>
          </select>

          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Kategori"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="rating"
            value={form.rating}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Puan seç</option>
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="1">1</option>
          </select>

          <input
            name="date"
            value={form.date}
            onChange={handleChange}
            type="date"
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <select
            name="owner"
            value={form.owner}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          >
            <option value="">Aksiyon sahibi seç</option>
            <option value="Servis Ekibi">Servis Ekibi</option>
            <option value="Mutfak">Mutfak</option>
            <option value="Bar">Bar</option>
            <option value="Operasyon">Operasyon</option>
            <option value="Pazarlama">Pazarlama</option>
            <option value="Yönetim">Yönetim</option>
          </select>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          >
            <option value="İnceleniyor">İnceleniyor</option>
            <option value="Aksiyon Bekliyor">Aksiyon Bekliyor</option>
            <option value="Yanıtlandı">Yanıtlandı</option>
            <option value="Kapandı">Kapandı</option>
          </select>

          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Müşteri yorumu"
            rows="3"
            className="col-span-2 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
            required
          />

          <textarea
            name="actionNote"
            value={form.actionNote}
            onChange={handleChange}
            placeholder="Aksiyon / çözüm notu"
            rows="3"
            className="col-span-2 rounded-2xl border border-[#dfd0b8] bg-[#fbf8f3] px-4 py-3 text-sm outline-none transition focus:border-[#c9a45c]"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="rounded-full bg-[#211914] px-6 py-3 text-sm font-medium text-[#e6c57a] transition hover:bg-black">
            Geri Bildirim Ekle
          </button>
        </div>
      </form>

      <div className="grid grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="overflow-hidden rounded-3xl border border-[#e3d6c4] bg-white shadow-sm">
          <div className="border-b border-[#eadfce] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#211914]">
              Geri Bildirim Listesi
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Açık aksiyonlar operasyon toplantılarında takip edilecek.
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#f5efe6] text-xs uppercase tracking-[0.16em] text-[#8a7560]">
              <tr>
                <th className="px-6 py-4">Müşteri / Yorum</th>
                <th className="px-6 py-4">Kaynak</th>
                <th className="px-6 py-4">Tip</th>
                <th className="px-6 py-4">Puan</th>
                <th className="px-6 py-4">Aksiyon</th>
                <th className="px-6 py-4 text-right">Durum</th>
              </tr>
            </thead>

            <tbody>
              {feedbacks.map((feedback) => (
                <tr
                  key={feedback.id}
                  className="border-t border-[#efe5d6] transition hover:bg-[#fbf8f3]"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#211914]">
                      {feedback.customerName}
                    </p>

                    <p className="mt-1 text-xs text-[#8a7560]">
                      {feedback.category} / {feedback.date}
                    </p>

                    <p className="mt-2 max-w-[360px] text-xs leading-5 text-[#7d6b5a]">
                      {feedback.message}
                    </p>

                    {feedback.actionNote && (
                      <p className="mt-2 max-w-[360px] text-xs font-medium leading-5 text-[#9c7439]">
                        Aksiyon: {feedback.actionNote}
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${getSourceClass(
                        feedback.source
                      )}`}
                    >
                      {feedback.source}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${getTypeClass(
                        feedback.type
                      )}`}
                    >
                      {feedback.type}
                    </span>
                  </td>

                  <td className={`px-6 py-4 text-sm font-semibold ${getRatingClass(feedback.rating)}`}>
                    {feedback.rating} / 5
                  </td>

                  <td className="px-6 py-4">
                    <select
                      value={feedback.owner}
                      onChange={(event) =>
                        updateOwner(feedback.id, event.target.value)
                      }
                      className="rounded-xl border border-[#dfd0b8] bg-[#fbf8f3] px-3 py-2 text-xs outline-none focus:border-[#c9a45c]"
                    >
                      <option value="Servis Ekibi">Servis Ekibi</option>
                      <option value="Mutfak">Mutfak</option>
                      <option value="Bar">Bar</option>
                      <option value="Operasyon">Operasyon</option>
                      <option value="Pazarlama">Pazarlama</option>
                      <option value="Yönetim">Yönetim</option>
                    </select>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <select
                      value={feedback.status}
                      onChange={(event) =>
                        updateStatus(feedback.id, event.target.value)
                      }
                      className={`rounded-xl border px-3 py-2 text-xs outline-none ${getStatusClass(
                        feedback.status
                      )}`}
                    >
                      <option value="İnceleniyor">İnceleniyor</option>
                      <option value="Aksiyon Bekliyor">Aksiyon Bekliyor</option>
                      <option value="Yanıtlandı">Yanıtlandı</option>
                      <option value="Kapandı">Kapandı</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Kaynak Özeti
            </h2>

            <p className="mt-1 text-sm text-[#8a7560]">
              Yorumların geldiği kanallar.
            </p>

            <div className="mt-6 space-y-4">
              {sources.map((source) => {
                const sourceFeedbacks = feedbacks.filter(
                  (feedback) => feedback.source === source
                );

                const sourceAverage =
                  sourceFeedbacks.length === 0
                    ? 0
                    : sourceFeedbacks.reduce(
                        (total, feedback) => total + Number(feedback.rating),
                        0
                      ) / sourceFeedbacks.length;

                return (
                  <div key={source} className="rounded-2xl bg-[#fbf8f3] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getSourceClass(
                          source
                        )}`}
                      >
                        {source}
                      </span>

                      <span className="text-sm font-semibold text-[#211914]">
                        {sourceFeedbacks.length} kayıt
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-[#8a7560]">
                      Ortalama puan: {sourceAverage.toFixed(1)} / 5
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-[#e3d6c4] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#211914]">
              Yönetim Notu
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#7d6b5a]">
              Düşük puanlı yorumlar ve aksiyon bekleyen şikayetler ileride
              operasyon panelinde otomatik uyarı olarak gösterilecek.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}