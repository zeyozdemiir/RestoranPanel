const fs = require("fs");

const serverPath = "./src/server.js";

let server = fs.readFileSync(serverPath, "utf8");

if (!server.includes('app.get("/api/backup/export"')) {
  const insertBefore = server.includes("app.listen(PORT")
    ? "app.listen(PORT"
    : null;

  if (!insertBefore) {
    throw new Error("server.js içinde app.listen bulunamadı.");
  }

  const backupApi = `

async function readBackupModel(modelName, restaurantId, options = {}) {
  try {
    if (!prisma[modelName]) {
      return [];
    }

    return await prisma[modelName].findMany({
      where: {
        restaurantId,
      },
      ...options,
    });
  } catch (error) {
    console.warn("Backup model okunamadı:", modelName, error.message);
    return [];
  }
}

app.get("/api/backup/export", authMiddleware, async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;

    const [
      suppliers,
      expenses,
      purchaseOrders,
      inventoryItems,
      stockMovements,
      stockCounts,
      wasteRecords,
      supplierPayments,
      cashMovements,
      dailySales,
      reportUploads,
    ] = await Promise.all([
      readBackupModel("supplier", restaurantId, {
        orderBy: { createdAt: "desc" },
      }),

      readBackupModel("expense", restaurantId, {
        orderBy: { createdAt: "desc" },
      }),

      readBackupModel("purchaseOrder", restaurantId, {
        include: {
          supplier: true,
        },
        orderBy: { createdAt: "desc" },
      }),

      readBackupModel("inventoryItem", restaurantId, {
        orderBy: { name: "asc" },
      }),

      readBackupModel("stockMovement", restaurantId, {
        include: {
          inventoryItem: true,
          purchaseOrder: true,
        },
        orderBy: { createdAt: "desc" },
      }),

      readBackupModel("stockCount", restaurantId, {
        include: {
          lines: {
            include: {
              inventoryItem: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      readBackupModel("wasteRecord", restaurantId, {
        include: {
          inventoryItem: true,
        },
        orderBy: { createdAt: "desc" },
      }),

      readBackupModel("supplierPayment", restaurantId, {
        include: {
          supplier: true,
        },
        orderBy: { createdAt: "desc" },
      }),

      readBackupModel("cashMovement", restaurantId, {
        orderBy: { createdAt: "desc" },
      }),

      readBackupModel("dailySale", restaurantId, {
        orderBy: { createdAt: "desc" },
      }),

      readBackupModel("reportUpload", restaurantId, {
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const backup = {
      metadata: {
        app: "HandsOff Restaurant Panel",
        version: "1.0",
        exportedAt: new Date().toISOString(),
        restaurantId,
        exportedBy: req.user.email || null,
      },
      counts: {
        suppliers: suppliers.length,
        expenses: expenses.length,
        purchaseOrders: purchaseOrders.length,
        inventoryItems: inventoryItems.length,
        stockMovements: stockMovements.length,
        stockCounts: stockCounts.length,
        wasteRecords: wasteRecords.length,
        supplierPayments: supplierPayments.length,
        cashMovements: cashMovements.length,
        dailySales: dailySales.length,
        reportUploads: reportUploads.length,
      },
      data: {
        suppliers,
        expenses,
        purchaseOrders,
        inventoryItems,
        stockMovements,
        stockCounts,
        wasteRecords,
        supplierPayments,
        cashMovements,
        dailySales,
        reportUploads,
      },
    };

    return res.json(backup);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Yedek dosyası oluşturulamadı.",
      detail: error.message,
    });
  }
});

`;

  server = server.replace(insertBefore, backupApi + "\n" + insertBefore);
}

fs.writeFileSync(serverPath, server, "utf8");

console.log("Veri Yedekleme / Dışa Aktarma backend API hazır.");
