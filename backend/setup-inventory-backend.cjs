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
   1) Prisma schema: stok modelleri
----------------------------- */

let schema = fs.readFileSync(schemaPath, "utf8");

schema = addLineToModel(
  schema,
  "Restaurant",
  "inventoryItems       InventoryItem[]"
);

schema = addLineToModel(
  schema,
  "Restaurant",
  "stockMovements       StockMovement[]"
);

schema = addLineToModel(
  schema,
  "PurchaseOrder",
  "stockMovementCreated Boolean  @default(false)"
);

schema = addLineToModel(
  schema,
  "PurchaseOrder",
  "stockMovements       StockMovement[]"
);

if (!/model\s+InventoryItem\s+{/.test(schema)) {
  schema += `

model InventoryItem {
  id           Int      @id @default(autoincrement())
  name         String
  category     String   @default("Genel")
  unit         String   @default("adet")
  currentStock Float    @default(0)
  minStock     Float    @default(0)
  isActive     Boolean  @default(true)
  note         String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  restaurantId Int
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])

  stockMovements StockMovement[]

  @@unique([restaurantId, name])
}
`;
}

if (!/model\s+StockMovement\s+{/.test(schema)) {
  schema += `

model StockMovement {
  id              Int      @id @default(autoincrement())
  type            String   @default("PURCHASE_IN")
  movementDate    DateTime @default(now())
  quantity        Float    @default(0)
  unit            String   @default("adet")
  unitPrice       Float    @default(0)
  totalAmount     Float    @default(0)
  source          String   @default("PURCHASE_ORDER")
  note            String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  restaurantId    Int
  restaurant      Restaurant @relation(fields: [restaurantId], references: [id])

  inventoryItemId Int
  inventoryItem   InventoryItem @relation(fields: [inventoryItemId], references: [id])

  purchaseOrderId Int?
  purchaseOrder   PurchaseOrder? @relation(fields: [purchaseOrderId], references: [id])
}
`;
}

fs.writeFileSync(schemaPath, schema, "utf8");

/* -----------------------------
   2) Server API: stok endpointleri
----------------------------- */

let server = fs.readFileSync(serverPath, "utf8");

// PurchaseOrder formatına stok aktarım bilgisini ekle
if (
  server.includes("expenseCreated: order.expenseCreated,") &&
  !server.includes("stockMovementCreated: order.stockMovementCreated,")
) {
  server = server.replace(
    "expenseCreated: order.expenseCreated,",
    "expenseCreated: order.expenseCreated,\n    stockMovementCreated: order.stockMovementCreated,"
  );
}

if (!server.includes('app.get("/api/inventory-items"')) {
  const insertBefore = server.includes('app.get("/api/purchase-orders"')
    ? 'app.get("/api/purchase-orders"'
    : server.includes('app.get("/api/suppliers"')
      ? 'app.get("/api/suppliers"'
      : "app.listen(PORT";

  const inventoryApi = `
function formatInventoryItem(item) {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    unit: item.unit,
    currentStock: item.currentStock,
    minStock: item.minStock,
    isActive: item.isActive,
    note: item.note,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function formatStockMovement(movement) {
  return {
    id: movement.id,
    type: movement.type,
    movementDate: movement.movementDate,
    quantity: movement.quantity,
    unit: movement.unit,
    unitPrice: movement.unitPrice,
    totalAmount: movement.totalAmount,
    source: movement.source,
    note: movement.note,
    createdAt: movement.createdAt,
    updatedAt: movement.updatedAt,
    inventoryItem: movement.inventoryItem
      ? formatInventoryItem(movement.inventoryItem)
      : null,
    purchaseOrder: movement.purchaseOrder
      ? {
          id: movement.purchaseOrder.id,
          supplierName: movement.purchaseOrder.supplierName,
          itemName: movement.purchaseOrder.itemName,
          totalAmount: movement.purchaseOrder.totalAmount,
        }
      : null,
  };
}

app.get("/api/inventory-items", authMiddleware, async (req, res) => {
  try {
    const items = await prisma.inventoryItem.findMany({
      where: {
        restaurantId: req.user.restaurantId,
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.json({
      inventoryItems: items.map(formatInventoryItem),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Stok kartları alınamadı.",
      detail: error.message,
    });
  }
});

app.post("/api/inventory-items", authMiddleware, async (req, res) => {
  try {
    const { name, category, unit, currentStock, minStock, note } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        message: "Stok adı zorunludur.",
      });
    }

    const item = await prisma.inventoryItem.upsert({
      where: {
        restaurantId_name: {
          restaurantId: req.user.restaurantId,
          name: String(name).trim(),
        },
      },
      update: {
        category: category || "Genel",
        unit: unit || "adet",
        currentStock: Number(currentStock || 0),
        minStock: Number(minStock || 0),
        note: note || null,
      },
      create: {
        restaurantId: req.user.restaurantId,
        name: String(name).trim(),
        category: category || "Genel",
        unit: unit || "adet",
        currentStock: Number(currentStock || 0),
        minStock: Number(minStock || 0),
        note: note || null,
      },
    });

    return res.json({
      message: "Stok kartı kaydedildi.",
      inventoryItem: formatInventoryItem(item),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Stok kartı kaydedilemedi.",
      detail: error.message,
    });
  }
});

app.get("/api/stock-movements", authMiddleware, async (req, res) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      where: {
        restaurantId: req.user.restaurantId,
      },
      include: {
        inventoryItem: true,
        purchaseOrder: true,
      },
      orderBy: {
        movementDate: "desc",
      },
    });

    return res.json({
      stockMovements: movements.map(formatStockMovement),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Stok hareketleri alınamadı.",
      detail: error.message,
    });
  }
});

app.post("/api/purchase-orders/:id/create-stock-movement", authMiddleware, async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    if (!orderId) {
      return res.status(400).json({
        message: "Geçersiz satın alma talebi ID.",
      });
    }

    const order = await prisma.purchaseOrder.findFirst({
      where: {
        id: orderId,
        restaurantId: req.user.restaurantId,
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Satın alma talebi bulunamadı.",
      });
    }

    if (order.status === "CANCELLED") {
      return res.status(400).json({
        message: "İptal edilmiş talep stoğa aktarılamaz.",
      });
    }

    if (order.stockMovementCreated) {
      return res.status(400).json({
        message: "Bu talep daha önce stoğa aktarılmış.",
      });
    }

    const item = await prisma.inventoryItem.upsert({
      where: {
        restaurantId_name: {
          restaurantId: req.user.restaurantId,
          name: order.itemName,
        },
      },
      update: {
        category: order.category || "Genel",
        unit: order.unit || "adet",
        currentStock: {
          increment: Number(order.quantity || 0),
        },
      },
      create: {
        restaurantId: req.user.restaurantId,
        name: order.itemName,
        category: order.category || "Genel",
        unit: order.unit || "adet",
        currentStock: Number(order.quantity || 0),
        minStock: 0,
      },
    });

    const movement = await prisma.stockMovement.create({
      data: {
        restaurantId: req.user.restaurantId,
        inventoryItemId: item.id,
        purchaseOrderId: order.id,
        type: "PURCHASE_IN",
        movementDate: order.orderDate || new Date(),
        quantity: Number(order.quantity || 0),
        unit: order.unit || "adet",
        unitPrice: Number(order.unitPrice || 0),
        totalAmount: Number(order.totalAmount || 0),
        source: "PURCHASE_ORDER",
        note:
          order.supplierName +
          " satın alma talebinden stok girişi oluşturuldu.",
      },
      include: {
        inventoryItem: true,
        purchaseOrder: true,
      },
    });

    const updatedOrder = await prisma.purchaseOrder.update({
      where: {
        id: order.id,
      },
      data: {
        stockMovementCreated: true,
        status: "APPROVED",
      },
      include: {
        supplier: true,
      },
    });

    return res.json({
      message: "Satın alma talebi stoğa aktarıldı.",
      stockMovement: formatStockMovement(movement),
      inventoryItem: formatInventoryItem(item),
      purchaseOrder: formatPurchaseOrder(updatedOrder),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Satın alma talebi stoğa aktarılamadı.",
      detail: error.message,
    });
  }
});

`;

  server = server.replace(insertBefore, inventoryApi + insertBefore);
}

fs.writeFileSync(serverPath, server, "utf8");

console.log("Stok schema ve API hazır.");
