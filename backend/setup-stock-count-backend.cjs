const fs = require("fs");

const schemaPath = "./prisma/schema.prisma";
const serverPath = "./src/server.js";

function addLineToModel(text, modelName, line) {
  const start = text.indexOf(`model ${modelName} {`);

  if (start === -1) {
    throw new Error(`${modelName} modeli bulunamadı.`);
  }

  const nextModel = text.indexOf("\nmodel ", start + 1);
  const end = nextModel === -1 ? text.length : nextModel;
  const block = text.slice(start, end);

  if (block.includes(line.trim())) {
    return text;
  }

  const closeIndex = block.lastIndexOf("}");

  if (closeIndex === -1) {
    throw new Error(`${modelName} modeli kapanış parantezi bulunamadı.`);
  }

  const newBlock =
    block.slice(0, closeIndex) +
    `  ${line.trim()}\n` +
    block.slice(closeIndex);

  return text.slice(0, start) + newBlock + text.slice(end);
}

/* -----------------------------
   1) Prisma schema: stok sayımı
----------------------------- */

let schema = fs.readFileSync(schemaPath, "utf8");

schema = addLineToModel(schema, "Restaurant", "stockCounts          StockCount[]");
schema = addLineToModel(schema, "InventoryItem", "stockCountLines     StockCountLine[]");

if (!/model\s+StockCount\s+{/.test(schema)) {
  schema += `

model StockCount {
  id           Int      @id @default(autoincrement())
  countNo      String
  countDate    DateTime @default(now())
  status       String   @default("DRAFT")
  note         String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  restaurantId Int
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])

  lines StockCountLine[]

  @@unique([restaurantId, countNo])
}
`;
}

if (!/model\s+StockCountLine\s+{/.test(schema)) {
  schema += `

model StockCountLine {
  id           Int      @id @default(autoincrement())
  systemStock  Float    @default(0)
  countedStock Float?
  difference   Float    @default(0)
  unit         String   @default("adet")
  note         String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  stockCountId Int
  stockCount   StockCount @relation(fields: [stockCountId], references: [id])

  inventoryItemId Int
  inventoryItem   InventoryItem @relation(fields: [inventoryItemId], references: [id])

  @@unique([stockCountId, inventoryItemId])
}
`;
}

fs.writeFileSync(schemaPath, schema, "utf8");

/* -----------------------------
   2) Server API: stok sayımı
----------------------------- */

let server = fs.readFileSync(serverPath, "utf8");

if (!server.includes('app.get("/api/stock-counts"')) {
  const insertBefore = server.includes('app.listen(PORT')
    ? 'app.listen(PORT'
    : null;

  if (!insertBefore) {
    throw new Error("server.js içinde app.listen bulunamadı.");
  }

  const stockCountApi = `

function formatStockCountItem(item) {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    unit: item.unit,
    currentStock: item.currentStock,
    minStock: item.minStock,
    isActive: item.isActive,
  };
}

function formatStockCountLine(line) {
  return {
    id: line.id,
    systemStock: line.systemStock,
    countedStock: line.countedStock,
    difference: line.difference,
    unit: line.unit,
    note: line.note,
    createdAt: line.createdAt,
    updatedAt: line.updatedAt,
    inventoryItem: line.inventoryItem
      ? formatStockCountItem(line.inventoryItem)
      : null,
  };
}

function formatStockCount(count) {
  return {
    id: count.id,
    countNo: count.countNo,
    countDate: count.countDate,
    status: count.status,
    note: count.note,
    createdAt: count.createdAt,
    updatedAt: count.updatedAt,
    lines: count.lines ? count.lines.map(formatStockCountLine) : [],
  };
}

app.get("/api/stock-counts", authMiddleware, async (req, res) => {
  try {
    const counts = await prisma.stockCount.findMany({
      where: {
        restaurantId: req.user.restaurantId,
      },
      include: {
        lines: {
          include: {
            inventoryItem: true,
          },
          orderBy: {
            id: "asc",
          },
        },
      },
      orderBy: {
        countDate: "desc",
      },
    });

    return res.json({
      stockCounts: counts.map(formatStockCount),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Stok sayımları alınamadı.",
      detail: error.message,
    });
  }
});

app.post("/api/stock-counts", authMiddleware, async (req, res) => {
  try {
    const { countNo, countDate, note } = req.body;

    const inventoryItems = await prisma.inventoryItem.findMany({
      where: {
        restaurantId: req.user.restaurantId,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const generatedCountNo =
      countNo ||
      "SAYIM-" +
        new Date()
          .toISOString()
          .slice(0, 16)
          .replace(/[-:T]/g, "");

    const stockCount = await prisma.stockCount.create({
      data: {
        restaurantId: req.user.restaurantId,
        countNo: generatedCountNo,
        countDate: countDate ? new Date(countDate) : new Date(),
        status: "DRAFT",
        note: note || null,
        lines: {
          create: inventoryItems.map((item) => ({
            inventoryItemId: item.id,
            systemStock: Number(item.currentStock || 0),
            countedStock: null,
            difference: 0,
            unit: item.unit || "adet",
            note: null,
          })),
        },
      },
      include: {
        lines: {
          include: {
            inventoryItem: true,
          },
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    return res.json({
      message: "Stok sayımı oluşturuldu.",
      stockCount: formatStockCount(stockCount),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Stok sayımı oluşturulamadı.",
      detail: error.message,
    });
  }
});

app.put("/api/stock-counts/:id/lines/:lineId", authMiddleware, async (req, res) => {
  try {
    const countId = Number(req.params.id);
    const lineId = Number(req.params.lineId);
    const { countedStock, note } = req.body;

    const stockCount = await prisma.stockCount.findFirst({
      where: {
        id: countId,
        restaurantId: req.user.restaurantId,
      },
    });

    if (!stockCount) {
      return res.status(404).json({
        message: "Stok sayımı bulunamadı.",
      });
    }

    if (stockCount.status === "COMPLETED") {
      return res.status(400).json({
        message: "Tamamlanmış stok sayımı düzenlenemez.",
      });
    }

    const line = await prisma.stockCountLine.findFirst({
      where: {
        id: lineId,
        stockCountId: countId,
      },
      include: {
        inventoryItem: true,
      },
    });

    if (!line) {
      return res.status(404).json({
        message: "Stok sayım satırı bulunamadı.",
      });
    }

    const numericCountedStock =
      countedStock === "" || countedStock === null || countedStock === undefined
        ? null
        : Number(countedStock);

    const difference =
      numericCountedStock === null
        ? 0
        : numericCountedStock - Number(line.systemStock || 0);

    const updatedLine = await prisma.stockCountLine.update({
      where: {
        id: line.id,
      },
      data: {
        countedStock: numericCountedStock,
        difference,
        note: note || null,
      },
      include: {
        inventoryItem: true,
      },
    });

    return res.json({
      message: "Stok sayım satırı güncellendi.",
      line: formatStockCountLine(updatedLine),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Stok sayım satırı güncellenemedi.",
      detail: error.message,
    });
  }
});

app.post("/api/stock-counts/:id/complete", authMiddleware, async (req, res) => {
  try {
    const countId = Number(req.params.id);

    const stockCount = await prisma.stockCount.findFirst({
      where: {
        id: countId,
        restaurantId: req.user.restaurantId,
      },
      include: {
        lines: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    if (!stockCount) {
      return res.status(404).json({
        message: "Stok sayımı bulunamadı.",
      });
    }

    if (stockCount.status === "COMPLETED") {
      return res.status(400).json({
        message: "Bu stok sayımı zaten tamamlanmış.",
      });
    }

    const completedCount = await prisma.$transaction(async (tx) => {
      for (const line of stockCount.lines) {
        const counted =
          line.countedStock === null || line.countedStock === undefined
            ? Number(line.systemStock || 0)
            : Number(line.countedStock || 0);

        const difference = counted - Number(line.systemStock || 0);

        await tx.stockCountLine.update({
          where: {
            id: line.id,
          },
          data: {
            countedStock: counted,
            difference,
          },
        });

        if (difference !== 0) {
          await tx.stockMovement.create({
            data: {
              restaurantId: req.user.restaurantId,
              inventoryItemId: line.inventoryItemId,
              type: "COUNT_ADJUSTMENT",
              movementDate: new Date(),
              quantity: difference,
              unit: line.unit || line.inventoryItem.unit || "adet",
              unitPrice: 0,
              totalAmount: 0,
              source: "STOCK_COUNT",
              note:
                stockCount.countNo +
                " stok sayımı fark düzeltmesi. Sistem: " +
                line.systemStock +
                ", Sayım: " +
                counted,
            },
          });
        }

        await tx.inventoryItem.update({
          where: {
            id: line.inventoryItemId,
          },
          data: {
            currentStock: counted,
          },
        });
      }

      return tx.stockCount.update({
        where: {
          id: stockCount.id,
        },
        data: {
          status: "COMPLETED",
        },
        include: {
          lines: {
            include: {
              inventoryItem: true,
            },
            orderBy: {
              id: "asc",
            },
          },
        },
      });
    });

    return res.json({
      message: "Stok sayımı tamamlandı ve stoklar güncellendi.",
      stockCount: formatStockCount(completedCount),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Stok sayımı tamamlanamadı.",
      detail: error.message,
    });
  }
});

`;

  server = server.replace(insertBefore, stockCountApi + "\n" + insertBefore);
}

fs.writeFileSync(serverPath, server, "utf8");

console.log("Stok sayımı backend schema ve API hazır.");
