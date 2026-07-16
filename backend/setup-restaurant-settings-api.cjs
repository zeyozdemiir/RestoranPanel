const fs = require("fs");

const serverPath = "./src/server.js";
let server = fs.readFileSync(serverPath, "utf8");

if (!server.includes('app.get("/api/restaurant-settings"')) {
  const insertBefore = server.includes("app.listen(PORT")
    ? "app.listen(PORT"
    : null;

  if (!insertBefore) {
    throw new Error("server.js içinde app.listen bulunamadı.");
  }

  const api = `

function cleanNullableText(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();

  return text.length > 0 ? text : null;
}

function cleanCurrency(value) {
  const text = String(value || "TRY").trim().toUpperCase();

  return text || "TRY";
}

app.get("/api/restaurant-settings", authMiddleware, async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;

    let settings = await prisma.restaurantSetting.findUnique({
      where: {
        restaurantId,
      },
    });

    if (!settings) {
      settings = await prisma.restaurantSetting.create({
        data: {
          restaurantId,
          restaurantName:
            req.user.restaurantName ||
            req.user.restaurant?.name ||
            "Restoran",
          currency: "TRY",
          minStockWarningEnabled: true,
        },
      });
    }

    return res.json({
      settings,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Restoran ayarları alınamadı.",
      detail: error.message,
    });
  }
});

app.put("/api/restaurant-settings", authMiddleware, async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const body = req.body || {};

    const data = {
      restaurantName: cleanNullableText(body.restaurantName),
      phone: cleanNullableText(body.phone),
      email: cleanNullableText(body.email),
      address: cleanNullableText(body.address),
      taxOffice: cleanNullableText(body.taxOffice),
      taxNumber: cleanNullableText(body.taxNumber),
      mersisNo: cleanNullableText(body.mersisNo),
      currency: cleanCurrency(body.currency),
      minStockWarningEnabled: Boolean(body.minStockWarningEnabled),
      minStockWarningLevel:
        body.minStockWarningLevel === "" ||
        body.minStockWarningLevel === undefined ||
        body.minStockWarningLevel === null
          ? null
          : Number(body.minStockWarningLevel || 0),
      backupNote: cleanNullableText(body.backupNote),
      usageNotes: cleanNullableText(body.usageNotes),
    };

    const settings = await prisma.restaurantSetting.upsert({
      where: {
        restaurantId,
      },
      create: {
        restaurantId,
        ...data,
      },
      update: data,
    });

    return res.json({
      message: "Restoran ayarları kaydedildi.",
      settings,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Restoran ayarları kaydedilemedi.",
      detail: error.message,
    });
  }
});

`;

  server = server.replace(insertBefore, api + "\n" + insertBefore);
}

fs.writeFileSync(serverPath, server, "utf8");

console.log("Restoran ayarları backend API hazır.");
