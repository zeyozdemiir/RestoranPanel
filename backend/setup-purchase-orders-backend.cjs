const fs = require("fs");

const schemaPath = "./prisma/schema.prisma";
const serverPath = "./src/server.js";

function addLineToModel(text, modelName, line) {
  if (text.includes(line.trim())) {
    return text;
  }

  const start = text.indexOf(`model ${modelName} {`);

  if (start === -1) {
    throw new Error(`${modelName} modeli bulunamadi.`);
  }

  const nextModel = text.indexOf("\nmodel ", start + 1);
  const end = nextModel === -1 ? text.length : nextModel;

  const block = text.slice(start, end);
  const closeIndex = block.lastIndexOf("}");

  if (closeIndex === -1) {
    throw new Error(`${modelName} modeli kapanis parantezi bulunamadi.`);
  }

  const newBlock =
    block.slice(0, closeIndex) +
    `  ${line.trim()}\n` +
    block.slice(closeIndex);

  return text.slice(0, start) + newBlock + text.slice(end);
}

/* -----------------------------
   1) Prisma schema: PurchaseOrder modeli
----------------------------- */

let schema = fs.readFileSync(schemaPath, "utf8");

if (!/purchaseOrders\s+PurchaseOrder\[\]/.test(schema)) {
  schema = addLineToModel(
    schema,
    "Restaurant",
    "purchaseOrders       PurchaseOrder[]"
  );
}

if (/model\s+Supplier\s+{/.test(schema) && !/purchaseOrders\s+PurchaseOrder\[\]/.test(schema)) {
  schema = addLineToModel(
    schema,
    "Supplier",
    "purchaseOrders       PurchaseOrder[]"
  );
}

if (!/model\s+PurchaseOrder\s+{/.test(schema)) {
  schema += `

model PurchaseOrder {
  id             Int      @id @default(autoincrement())
  supplierId     Int?
  supplier       Supplier? @relation(fields: [supplierId], references: [id])
  supplierName   String
  orderNo        String?
  orderDate      DateTime @default(now())
  category       String   @default("Stok / Satın Alma")
  itemName       String
  quantity       Float    @default(1)
  unit           String   @default("adet")
  unitPrice      Float    @default(0)
  totalAmount    Float    @default(0)
  paymentStatus  String   @default("UNPAID")
  status         String   @default("DRAFT")
  expenseCreated Boolean  @default(false)
  note           String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  restaurantId   Int
  restaurant     Restaurant @relation(fields: [restaurantId], references: [id])
}
`;
}

fs.writeFileSync(schemaPath, schema, "utf8");

/* -----------------------------
   2) Server API: satın alma endpointleri
----------------------------- */

let server = fs.readFileSync(serverPath, "utf8");

if (!server.includes('app.get("/api/purchase-orders"')) {
  const insertBefore = server.includes('app.get("/api/suppliers"')
    ? 'app.get("/api/suppliers"'
    : server.includes('app.get("/api/restaurants"')
      ? 'app.get("/api/restaurants"'
      : "app.listen(PORT";

  const purchaseApi = `
function formatPurchaseOrder(order) {
  return {
    id: order.id,
    supplierId: order.supplierId,
    supplierName: order.supplierName,
    supplier: order.supplier
      ? {
          id: order.supplier.id,
          name: order.supplier.name,
          taxNumber: order.supplier.taxNumber,
          iban: order.supplier.iban,
          phone: order.supplier.phone,
          category: order.supplier.category,
          contactName: order.supplier.contactName,
        }
      : null,
    orderNo: order.orderNo,
    orderDate: order.orderDate,
    category: order.category,
    itemName: order.itemName,
    quantity: order.quantity,
    unit: order.unit,
    unitPrice: order.unitPrice,
    totalAmount: order.totalAmount,
    paymentStatus: order.paymentStatus,
    status: order.status,
    expenseCreated: order.expenseCreated,
    note: order.note,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

app.get("/api/purchase-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      where: {
        restaurantId: req.user.restaurantId,
      },
      include: {
        supplier: true,
      },
      orderBy: {
        orderDate: "desc",
      },
    });

    return res.json({
      purchaseOrders: orders.map(formatPurchaseOrder),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Satın alma kayıtları alınamadı.",
    });
  }
});

app.post("/api/purchase-orders", authMiddleware, async (req, res) => {
  try {
    const {
      supplierId,
      supplierName,
      orderNo,
      orderDate,
      category,
      itemName,
      quantity,
      unit,
      unitPrice,
      totalAmount,
      paymentStatus,
      status,
      note,
    } = req.body;

    if (!supplierName || !String(supplierName).trim()) {
      return res.status(400).json({
        message: "Tedarikçi adı zorunludur.",
      });
    }

    if (!itemName || !String(itemName).trim()) {
      return res.status(400).json({
        message: "Ürün / kalem adı zorunludur.",
      });
    }

    const quantityNumber = Number(quantity || 1);
    const unitPriceNumber = Number(unitPrice || 0);
    const calculatedTotal =
      totalAmount !== undefined && totalAmount !== ""
        ? Number(totalAmount || 0)
        : quantityNumber * unitPriceNumber;

    let safeSupplierId = supplierId ? Number(supplierId) : null;

    if (safeSupplierId) {
      const supplier = await prisma.supplier.findFirst({
        where: {
          id: safeSupplierId,
          restaurantId: req.user.restaurantId,
        },
      });

      if (!supplier) {
        safeSupplierId = null;
      }
    }

    const order = await prisma.purchaseOrder.create({
      data: {
        restaurantId: req.user.restaurantId,
        supplierId: safeSupplierId,
        supplierName: String(supplierName).trim(),
        orderNo: orderNo || null,
        orderDate: orderDate ? new Date(orderDate) : new Date(),
        category: category || "Stok / Satın Alma",
        itemName: String(itemName).trim(),
        quantity: quantityNumber,
        unit: unit || "adet",
        unitPrice: unitPriceNumber,
        totalAmount: calculatedTotal,
        paymentStatus: paymentStatus || "UNPAID",
        status: status || "DRAFT",
        note: note || null,
      },
      include: {
        supplier: true,
      },
    });

    return res.json({
      message: "Satın alma kaydı oluşturuldu.",
      purchaseOrder: formatPurchaseOrder(order),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Satın alma kaydı oluşturulamadı.",
    });
  }
});

app.put("/api/purchase-orders/:id", authMiddleware, async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    if (!orderId) {
      return res.status(400).json({
        message: "Geçersiz satın alma ID.",
      });
    }

    const existingOrder = await prisma.purchaseOrder.findFirst({
      where: {
        id: orderId,
        restaurantId: req.user.restaurantId,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        message: "Satın alma kaydı bulunamadı.",
      });
    }

    const {
      supplierId,
      supplierName,
      orderNo,
      orderDate,
      category,
      itemName,
      quantity,
      unit,
      unitPrice,
      totalAmount,
      paymentStatus,
      status,
      note,
      expenseCreated,
    } = req.body;

    const quantityNumber =
      quantity !== undefined && quantity !== ""
        ? Number(quantity || 0)
        : existingOrder.quantity;

    const unitPriceNumber =
      unitPrice !== undefined && unitPrice !== ""
        ? Number(unitPrice || 0)
        : existingOrder.unitPrice;

    const calculatedTotal =
      totalAmount !== undefined && totalAmount !== ""
        ? Number(totalAmount || 0)
        : quantityNumber * unitPriceNumber;

    let safeSupplierId =
      supplierId !== undefined && supplierId !== ""
        ? Number(supplierId)
        : existingOrder.supplierId;

    if (safeSupplierId) {
      const supplier = await prisma.supplier.findFirst({
        where: {
          id: safeSupplierId,
          restaurantId: req.user.restaurantId,
        },
      });

      if (!supplier) {
        safeSupplierId = existingOrder.supplierId;
      }
    }

    const updatedOrder = await prisma.purchaseOrder.update({
      where: {
        id: orderId,
      },
      data: {
        supplierId: safeSupplierId || null,
        supplierName: supplierName ?? existingOrder.supplierName,
        orderNo: orderNo === "" ? null : orderNo ?? existingOrder.orderNo,
        orderDate: orderDate ? new Date(orderDate) : existingOrder.orderDate,
        category: category ?? existingOrder.category,
        itemName: itemName ?? existingOrder.itemName,
        quantity: quantityNumber,
        unit: unit ?? existingOrder.unit,
        unitPrice: unitPriceNumber,
        totalAmount: calculatedTotal,
        paymentStatus: paymentStatus ?? existingOrder.paymentStatus,
        status: status ?? existingOrder.status,
        note: note === "" ? null : note ?? existingOrder.note,
        expenseCreated:
          typeof expenseCreated === "boolean"
            ? expenseCreated
            : existingOrder.expenseCreated,
      },
      include: {
        supplier: true,
      },
    });

    return res.json({
      message: "Satın alma kaydı güncellendi.",
      purchaseOrder: formatPurchaseOrder(updatedOrder),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Satın alma kaydı güncellenemedi.",
    });
  }
});

app.post("/api/purchase-orders/:id/create-expense", authMiddleware, async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    if (!orderId) {
      return res.status(400).json({
        message: "Geçersiz satın alma ID.",
      });
    }

    const order = await prisma.purchaseOrder.findFirst({
      where: {
        id: orderId,
        restaurantId: req.user.restaurantId,
      },
      include: {
        supplier: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Satın alma kaydı bulunamadı.",
      });
    }

    if (order.expenseCreated) {
      return res.status(400).json({
        message: "Bu satın alma kaydı daha önce giderlere aktarılmış.",
      });
    }

    if (order.status === "CANCELLED") {
      return res.status(400).json({
        message: "İptal edilmiş satın alma giderlere aktarılamaz.",
      });
    }

    const expense = await prisma.expense.create({
      data: {
        restaurantId: req.user.restaurantId,
        supplierName: order.supplierName,
        invoiceNo: order.orderNo || null,
        invoiceDate: order.orderDate,
        category: order.category || "Stok / Satın Alma",
        description:
          order.itemName +
          " - " +
          order.quantity +
          " " +
          order.unit +
          " x " +
          order.unitPrice,
        netAmount: order.totalAmount,
        taxAmount: 0,
        totalAmount: order.totalAmount,
        currency: "TRY",
        paymentStatus: order.paymentStatus,
        status: "APPROVED",
        source: "PURCHASE_ORDER",
        note: order.note
          ? order.note + "\\nSatın alma kaydından gider oluşturuldu."
          : "Satın alma kaydından gider oluşturuldu.",
      },
    });

    const updatedOrder = await prisma.purchaseOrder.update({
      where: {
        id: order.id,
      },
      data: {
        expenseCreated: true,
        status: "APPROVED",
      },
      include: {
        supplier: true,
      },
    });

    return res.json({
      message: "Satın alma kaydı giderlere aktarıldı.",
      purchaseOrder: formatPurchaseOrder(updatedOrder),
      expense,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Satın alma giderlere aktarılamadı.",
    });
  }
});

`;

  server = server.replace(insertBefore, purchaseApi + insertBefore);
  fs.writeFileSync(serverPath, server, "utf8");
}

console.log("Satın alma schema ve API hazır.");
