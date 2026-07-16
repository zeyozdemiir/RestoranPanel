const fs = require("fs");

const serverPath = "./src/server.js";
let server = fs.readFileSync(serverPath, "utf8");

fs.writeFileSync("./src/server.before-daily-checklist-only.backup.js", server, "utf8");

if (!server.includes("function handsoffRestaurantId")) {
  const insertBefore = server.includes("app.listen(PORT") ? "app.listen(PORT" : null;

  if (!insertBefore) {
    throw new Error("server.js içinde app.listen(PORT bulunamadı.");
  }

  const helper = `

function handsoffRestaurantId(req) {
  return req.user?.restaurantId || req.user?.restaurant?.id || req.restaurantId || 1;
}

`;

  server = server.replace(insertBefore, helper + insertBefore);
}

if (!server.includes('app.get("/api/daily-checklists/:date"')) {
  const insertBefore = server.includes("app.listen(PORT") ? "app.listen(PORT" : null;

  if (!insertBefore) {
    throw new Error("server.js içinde app.listen(PORT bulunamadı.");
  }

  const api = `

const HANDSOFF_DAILY_CHECKLIST_SECTIONS = [
  {
    title: "Ciro ve Kasa",
    items: [
      "Günlük ciro girişi yapıldı",
      "Nakit / kart / online satış ayrımı kontrol edildi",
      "Kasa hareketleri kontrol edildi",
      "Eksik kasa çıkışı varsa işlendi",
    ],
  },
  {
    title: "Gider ve Tedarikçi",
    items: [
      "Günün giderleri işlendi",
      "Tedarikçi ödemeleri kontrol edildi",
      "Açık cari borçlar kontrol edildi",
      "Satın alma talepleri kontrol edildi",
    ],
  },
  {
    title: "Stok ve Operasyon",
    items: [
      "Düşük stok uyarıları kontrol edildi",
      "Zayi / kırılma kayıtları işlendi",
      "Mutfak eksikleri kontrol edildi",
      "Bar eksikleri kontrol edildi",
    ],
  },
  {
    title: "Kapanış",
    items: [
      "Gün sonu raporu kontrol edildi",
      "Veri yedeği alındı",
      "Ertesi gün notları yazıldı",
    ],
  },
];

function buildDailyChecklistDefaultItems() {
  const items = [];
  let sortOrder = 0;

  HANDSOFF_DAILY_CHECKLIST_SECTIONS.forEach((section) => {
    section.items.forEach((text) => {
      items.push({
        section: section.title,
        text,
        done: false,
        sortOrder,
      });

      sortOrder += 1;
    });
  });

  return items;
}

async function getOrCreateDailyChecklist(restaurantId, date) {
  let checklist = await prisma.dailyChecklist.findUnique({
    where: {
      restaurantId_date: {
        restaurantId,
        date,
      },
    },
    include: {
      items: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (checklist) {
    return checklist;
  }

  checklist = await prisma.dailyChecklist.create({
    data: {
      restaurantId,
      date,
      note: "",
      status: "OPEN",
      items: {
        create: buildDailyChecklistDefaultItems(),
      },
    },
    include: {
      items: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  return checklist;
}

app.get("/api/daily-checklists/:date", authMiddleware, async (req, res) => {
  try {
    const restaurantId = handsoffRestaurantId(req);
    const date = String(req.params.date || "").slice(0, 10);

    if (!date) {
      return res.status(400).json({
        message: "Tarih zorunludur.",
      });
    }

    const checklist = await getOrCreateDailyChecklist(restaurantId, date);

    return res.json({
      checklist,
    });
  } catch (error) {
    console.error("daily-checklists get error:", error);

    return res.status(500).json({
      message: "Günlük kontrol listesi alınamadı.",
      detail: error.message,
    });
  }
});

app.put("/api/daily-checklists/:date", authMiddleware, async (req, res) => {
  try {
    const restaurantId = handsoffRestaurantId(req);
    const date = String(req.params.date || "").slice(0, 10);
    const body = req.body || {};
    const items = Array.isArray(body.items) ? body.items : [];

    let checklist = await getOrCreateDailyChecklist(restaurantId, date);

    const updatedChecklist = await prisma.$transaction(async (tx) => {
      await tx.dailyChecklist.update({
        where: {
          id: checklist.id,
        },
        data: {
          note: body.note === undefined || body.note === null ? "" : String(body.note),
          status: body.status ? String(body.status) : "OPEN",
        },
      });

      await tx.dailyChecklistItem.deleteMany({
        where: {
          checklistId: checklist.id,
        },
      });

      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];

        await tx.dailyChecklistItem.create({
          data: {
            checklistId: checklist.id,
            section: String(item.section || "Genel"),
            text: String(item.text || ""),
            done: Boolean(item.done),
            sortOrder: Number(item.sortOrder ?? index),
          },
        });
      }

      return tx.dailyChecklist.findUnique({
        where: {
          id: checklist.id,
        },
        include: {
          items: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      });
    });

    return res.json({
      message: "Günlük kontrol listesi kaydedildi.",
      checklist: updatedChecklist,
    });
  } catch (error) {
    console.error("daily-checklists put error:", error);

    return res.status(500).json({
      message: "Günlük kontrol listesi kaydedilemedi.",
      detail: error.message,
    });
  }
});

`;

  server = server.replace(insertBefore, api + "\n" + insertBefore);
}

server = server.replace(
  /^\s*process\.exit\([^)]*\);?\s*$/gm,
  "// process.exit dev ortamında kapatıldı"
);

if (!server.includes("HANDSOFF_BACKEND_KEEPALIVE")) {
  server += `

// HANDSOFF_BACKEND_KEEPALIVE
setInterval(() => {}, 1000 * 60 * 60);
`;
}

fs.writeFileSync(serverPath, server, "utf8");

console.log("DailyChecklist API eklendi.");
