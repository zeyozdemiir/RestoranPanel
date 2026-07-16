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
   1) Prisma schema: Zayi / Kırılma
----------------------------- */

let schema = fs.readFileSync(schemaPath, "utf8");

schema = addLineToModel(schema, "Restaurant", "wasteRecords         WasteRecord[]");
schema = addLineToModel(schema, "InventoryItem", "wasteRecords         WasteRecord[]");

if (!/model\s+WasteRecord\s+{/.test(schema)) {
  schema += `

model WasteRecord {
  id                 Int      @id @default(autoincrement())
  type               String   @default("WASTE")
  recordDate         DateTime @default(now())
  itemName           String
  category           String   @default("Genel")
  quantity           Float    @default(0)
  unit               String   @default("adet")
  estimatedUnitPrice Float    @default(0)
  estimatedCost      Float    @default(0)
  reason             String?
  responsible        String?
  note               String?
  stockDeducted      Boolean  @default(false)
  status             String   @default("RECORDED")
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  restaurantId       Int
  restaurant         Restaurant @relation(fields: [restaurantId], references: [id])

  inventoryItemId    Int?
  inventoryItem      InventoryItem? @relation(fields: [inventoryItemId], references: [id])
}
`;
}

fs.writeFileSync(schemaPath, schema, "utf8");

/* -----------------------------
   2) Server API: Zayi / Kırılma
----------------------------- */

let server = fs.readFileSync(serverPath, "utf8");

if (!server.includes('app.get("/api/waste-records"')) {
  const insertBefore = server.includes('app.listen(PORT')
    ? 'app.listen(PORT'
    : null;

  if (!insertBefore) {
    throw new Error("server.js içinde app.listen bulunamadı.");
  }

  const wasteApi = `

function formatWasteInventoryItem(item) {
  if (!item) {
    return null;
  }

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    unit: item.unit,
    currentStock: item.currentStock,
    minStock: item.minStock,
  };
}

function formatWasteRecord(record) {
  return {
    id: record.id,
    type: record.type,
    recordDate: record.recordDate,
    itemName: record.itemName,
    category: record.category,
    quantity: record.quantity,
    unit: record.unit,
    estimatedUnitPrice: record.estimatedUnitPrice,
    estimatedCost: record.estimatedCost,
    reason: record.reason,
    responsible: record.responsible,
    note: record.note,
    stockDeducted: record.stockDeducted,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    inventoryItem: formatWasteInventoryItem(record.inventoryItem),
  };
}

app.get("/api/waste-records", authMiddleware, async (req, res) => {
  try {
    const records = await prisma.wasteRecord.findMany({
      where: {
        restaurantId: req.user.restaurantId,
      },
      include: {
        inventoryItem: true,
      },
      orderBy: {
        recordDate: "desc",
      },
    });

    const summary = records.reduce(
      (total, record) => {
        const cost = Number(record.estimatedCost || 0);

        total.totalCost += cost;
        total.totalQuantity += Number(record.quantity || 0);

        if (record.type === "WASTE") {
          total.wasteCost += cost;
        }

        if (record.type === "BREAKAGE") {
          total.breakageCost += cost;
        }

        if (record.type === "SPILL") {
          total.spillCost += cost;
        }

        if (record.type === "STAFF_MEAL") {
          total.staffMealCost += cost;
        }

        return total;
      },
      {
        totalCost: 0,
        totalQuantity: 0,
        wasteCost: 0,
        breakageCost: 0,
        spillCost: 0,
        staffMealCost: 0,
      }
    );

    return res.json({
      wasteRecords: records.map(formatWasteRecord),
      summary,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Zayi / kırılma kayıtları alınamadı.",
      detail: error.message,
    });
  }
});

app.post("/api/waste-records", authMiddleware, async (req, res) => {
  try {
    const {
      type,
      recordDate,
      inventoryItemId,
      itemName,
      category,
      quantity,
      unit,
      estimatedUnitPrice,
      reason,
      responsible,
      note,
      deductFromStock,
    } = req.body;

    const numericQuantity = Number(quantity || 0);
    const numericEstimatedUnitPrice = Number(estimatedUnitPrice || 0);
    const estimatedCost = numericQuantity * numericEstimatedUnitPrice;

    if (!itemName && !inventoryItemId) {
      return res.status(400).json({
        message: "Ürün / stok adı zorunludur.",
      });
    }

    if (numericQuantity <= 0) {
      return res.status(400).json({
        message: "Miktar 0'dan büyük olmalıdır.",
      });
    }

    let inventoryItem = null;

    if (inventoryItemId) {
      inventoryItem = await prisma.inventoryItem.findFirst({
        where: {
          id: Number(inventoryItemId),
          restaurantId: req.user.restaurantId,
        },
      });

      if (!inventoryItem) {
        return res.status(404).json({
          message: "Stok kartı bulunamadı.",
        });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const record = await tx.wasteRecord.create({
        data: {
          restaurantId: req.user.restaurantId,
          inventoryItemId: inventoryItem ? inventoryItem.id : null,
          type: type || "WASTE",
          recordDate: recordDate ? new Date(recordDate) : new Date(),
          itemName: inventoryItem ? inventoryItem.name : String(itemName).trim(),
          category: inventoryItem
            ? inventoryItem.category
            : category || "Genel",
          quantity: numericQuantity,
          unit: inventoryItem ? inventoryItem.unit : unit || "adet",
          estimatedUnitPrice: numericEstimatedUnitPrice,
          estimatedCost,
          reason: reason || null,
          responsible: responsible || null,
          note: note || null,
          stockDeducted: Boolean(inventoryItem && deductFromStock),
          status: "RECORDED",
        },
        include: {
          inventoryItem: true,
        },
      });

      if (inventoryItem && deductFromStock) {
        await tx.inventoryItem.update({
          where: {
            id: inventoryItem.id,
          },
          data: {
            currentStock: {
              decrement: numericQuantity,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            restaurantId: req.user.restaurantId,
            inventoryItemId: inventoryItem.id,
            type:
              record.type === "BREAKAGE"
                ? "BREAKAGE_OUT"
                : record.type === "SPILL"
                  ? "SPILL_OUT"
                  : record.type === "STAFF_MEAL"
                    ? "STAFF_MEAL_OUT"
                    : "WASTE_OUT",
            movementDate: record.recordDate,
            quantity: -numericQuantity,
            unit: record.unit,
            unitPrice: numericEstimatedUnitPrice,
            totalAmount: -estimatedCost,
            source: "WASTE_RECORD",
            note:
              "Zayi / kırılma kaydı: " +
              (record.reason || record.note || record.type),
          },
        });
      }

      return tx.wasteRecord.findUnique({
        where: {
          id: record.id,
        },
        include: {
          inventoryItem: true,
        },
      });
    });

    return res.json({
      message: inventoryItem && deductFromStock
        ? "Zayi / kırılma kaydı oluşturuldu ve stoktan düşüldü."
        : "Zayi / kırılma kaydı oluşturuldu.",
      wasteRecord: formatWasteRecord(result),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Zayi / kırılma kaydı oluşturulamadı.",
      detail: error.message,
    });
  }
});

app.put("/api/waste-records/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const recordId = Number(req.params.id);

    const record = await prisma.wasteRecord.findFirst({
      where: {
        id: recordId,
        restaurantId: req.user.restaurantId,
      },
      include: {
        inventoryItem: true,
      },
    });

    if (!record) {
      return res.status(404).json({
        message: "Zayi / kırılma kaydı bulunamadı.",
      });
    }

    if (record.status === "CANCELLED") {
      return res.status(400).json({
        message: "Bu kayıt zaten iptal edilmiş.",
      });
    }

    const updatedRecord = await prisma.$transaction(async (tx) => {
      if (record.inventoryItemId && record.stockDeducted) {
        await tx.inventoryItem.update({
          where: {
            id: record.inventoryItemId,
          },
          data: {
            currentStock: {
              increment: Number(record.quantity || 0),
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            restaurantId: req.user.restaurantId,
            inventoryItemId: record.inventoryItemId,
            type: "WASTE_CANCEL_RESTORE",
            movementDate: new Date(),
            quantity: Number(record.quantity || 0),
            unit: record.unit,
            unitPrice: Number(record.estimatedUnitPrice || 0),
            totalAmount: Number(record.estimatedCost || 0),
            source: "WASTE_RECORD_CANCEL",
            note: "İptal edilen zayi / kırılma kaydı stoğa geri alındı.",
          },
        });
      }

      return tx.wasteRecord.update({
        where: {
          id: record.id,
        },
        data: {
          status: "CANCELLED",
        },
        include: {
          inventoryItem: true,
        },
      });
    });

    return res.json({
      message: "Zayi / kırılma kaydı iptal edildi.",
      wasteRecord: formatWasteRecord(updatedRecord),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Zayi / kırılma kaydı iptal edilemedi.",
      detail: error.message,
    });
  }
});

`;

  server = server.replace(insertBefore, wasteApi + "\n" + insertBefore);
}

fs.writeFileSync(serverPath, server, "utf8");

console.log("Zayi / Kırılma backend schema ve API hazır.");
