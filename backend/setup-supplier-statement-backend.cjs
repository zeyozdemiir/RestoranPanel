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
   1) Prisma schema: Tedarikçi Cari / Ödeme
----------------------------- */

let schema = fs.readFileSync(schemaPath, "utf8");

schema = addLineToModel(schema, "Restaurant", "supplierPayments    SupplierPayment[]");
schema = addLineToModel(schema, "Supplier", "supplierPayments      SupplierPayment[]");

if (!/model\s+SupplierPayment\s+{/.test(schema)) {
  schema += `

model SupplierPayment {
  id           Int      @id @default(autoincrement())
  paymentDate  DateTime @default(now())
  supplierName String
  amount       Float    @default(0)
  method       String   @default("BANK_TRANSFER")
  note         String?
  status       String   @default("ACTIVE")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  restaurantId Int
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])

  supplierId   Int?
  supplier     Supplier? @relation(fields: [supplierId], references: [id])
}
`;
}

fs.writeFileSync(schemaPath, schema, "utf8");

/* -----------------------------
   2) Server API: Tedarikçi Cari / Borç
----------------------------- */

let server = fs.readFileSync(serverPath, "utf8");

if (!server.includes('app.get("/api/supplier-statements"')) {
  const insertBefore = server.includes('app.listen(PORT')
    ? 'app.listen(PORT'
    : null;

  if (!insertBefore) {
    throw new Error("server.js içinde app.listen bulunamadı.");
  }

  const supplierStatementApi = `

function normalizeSupplierKey(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("tr-TR");
}

function readMoneyValue(item, keys) {
  for (const key of keys) {
    if (item && item[key] !== undefined && item[key] !== null && item[key] !== "") {
      return Number(item[key] || 0);
    }
  }

  return 0;
}

function getExpenseTotalAmountForStatement(expense) {
  return readMoneyValue(expense, [
    "totalAmount",
    "amount",
    "price",
    "cost",
    "paidAmount",
  ]);
}

function getExpenseDebtAmountForStatement(expense) {
  const totalAmount = getExpenseTotalAmountForStatement(expense);
  const paymentStatus = String(expense.paymentStatus || "").toUpperCase();

  if (paymentStatus === "PAID" || paymentStatus === "ODENDI" || paymentStatus === "ÖDENDI" || paymentStatus === "ÖDENDİ") {
    return 0;
  }

  if (paymentStatus === "PARTIAL" || paymentStatus === "KISMI") {
    const remainingAmount = readMoneyValue(expense, ["remainingAmount", "unpaidAmount"]);

    if (remainingAmount > 0) {
      return remainingAmount;
    }

    const paidAmount = readMoneyValue(expense, ["paidAmount"]);

    if (paidAmount > 0) {
      return Math.max(totalAmount - paidAmount, 0);
    }
  }

  return totalAmount;
}

function formatSupplierPayment(payment) {
  return {
    id: payment.id,
    paymentDate: payment.paymentDate,
    supplierId: payment.supplierId,
    supplierName: payment.supplierName,
    amount: payment.amount,
    method: payment.method,
    note: payment.note,
    status: payment.status,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    supplier: payment.supplier
      ? {
          id: payment.supplier.id,
          name: payment.supplier.name,
          category: payment.supplier.category,
          taxNumber: payment.supplier.taxNumber,
          iban: payment.supplier.iban,
          phone: payment.supplier.phone,
          email: payment.supplier.email,
          contactName: payment.supplier.contactName,
        }
      : null,
  };
}

app.get("/api/supplier-payments", authMiddleware, async (req, res) => {
  try {
    const payments = await prisma.supplierPayment.findMany({
      where: {
        restaurantId: req.user.restaurantId,
      },
      include: {
        supplier: true,
      },
      orderBy: {
        paymentDate: "desc",
      },
    });

    return res.json({
      supplierPayments: payments.map(formatSupplierPayment),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Tedarikçi ödemeleri alınamadı.",
      detail: error.message,
    });
  }
});

app.post("/api/supplier-payments", authMiddleware, async (req, res) => {
  try {
    const { supplierId, supplierName, paymentDate, amount, method, note } = req.body;

    const numericAmount = Number(amount || 0);

    if (numericAmount <= 0) {
      return res.status(400).json({
        message: "Ödeme tutarı 0'dan büyük olmalıdır.",
      });
    }

    let supplier = null;

    if (supplierId) {
      supplier = await prisma.supplier.findFirst({
        where: {
          id: Number(supplierId),
          restaurantId: req.user.restaurantId,
        },
      });

      if (!supplier) {
        return res.status(404).json({
          message: "Tedarikçi bulunamadı.",
        });
      }
    }

    const finalSupplierName =
      supplier?.name || String(supplierName || "").trim();

    if (!finalSupplierName) {
      return res.status(400).json({
        message: "Tedarikçi adı zorunludur.",
      });
    }

    const payment = await prisma.supplierPayment.create({
      data: {
        restaurantId: req.user.restaurantId,
        supplierId: supplier ? supplier.id : null,
        supplierName: finalSupplierName,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        amount: numericAmount,
        method: method || "BANK_TRANSFER",
        note: note || null,
        status: "ACTIVE",
      },
      include: {
        supplier: true,
      },
    });

    return res.json({
      message: "Tedarikçi ödemesi kaydedildi.",
      supplierPayment: formatSupplierPayment(payment),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Tedarikçi ödemesi kaydedilemedi.",
      detail: error.message,
    });
  }
});

app.put("/api/supplier-payments/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const paymentId = Number(req.params.id);

    const payment = await prisma.supplierPayment.findFirst({
      where: {
        id: paymentId,
        restaurantId: req.user.restaurantId,
      },
      include: {
        supplier: true,
      },
    });

    if (!payment) {
      return res.status(404).json({
        message: "Tedarikçi ödemesi bulunamadı.",
      });
    }

    if (payment.status === "CANCELLED") {
      return res.status(400).json({
        message: "Bu ödeme zaten iptal edilmiş.",
      });
    }

    const updatedPayment = await prisma.supplierPayment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "CANCELLED",
      },
      include: {
        supplier: true,
      },
    });

    return res.json({
      message: "Tedarikçi ödemesi iptal edildi.",
      supplierPayment: formatSupplierPayment(updatedPayment),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Tedarikçi ödemesi iptal edilemedi.",
      detail: error.message,
    });
  }
});

app.get("/api/supplier-statements", authMiddleware, async (req, res) => {
  try {
    const [suppliers, expenses, payments] = await Promise.all([
      prisma.supplier.findMany({
        where: {
          restaurantId: req.user.restaurantId,
        },
        orderBy: {
          name: "asc",
        },
      }),
      prisma.expense.findMany({
        where: {
          restaurantId: req.user.restaurantId,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.supplierPayment.findMany({
        where: {
          restaurantId: req.user.restaurantId,
        },
        include: {
          supplier: true,
        },
        orderBy: {
          paymentDate: "desc",
        },
      }),
    ]);

    const statementMap = new Map();

    function ensureStatement({ supplierId, supplierName, supplier }) {
      const key = supplierId
        ? "id:" + supplierId
        : "name:" + normalizeSupplierKey(supplierName);

      if (!statementMap.has(key)) {
        statementMap.set(key, {
          key,
          supplierId: supplierId || null,
          supplierName: supplierName || "Tedarikçi belirtilmemiş",
          supplier: supplier || null,
          totalExpense: 0,
          debtFromExpenses: 0,
          paidBySupplierPayments: 0,
          remainingDebt: 0,
          expenseCount: 0,
          paymentCount: 0,
          expenses: [],
          payments: [],
        });
      }

      return statementMap.get(key);
    }

    suppliers.forEach((supplier) => {
      ensureStatement({
        supplierId: supplier.id,
        supplierName: supplier.name,
        supplier,
      });
    });

    expenses.forEach((expense) => {
      const status = String(expense.status || "").toUpperCase();

      if (status === "CANCELLED" || status === "IPTAL") {
        return;
      }

      const supplierId = expense.supplierId || null;
      const supplierName =
        expense.supplierName ||
        expense.vendorName ||
        expense.companyName ||
        "Tedarikçi belirtilmemiş";

      const matchedSupplier = supplierId
        ? suppliers.find((supplier) => supplier.id === supplierId)
        : suppliers.find(
            (supplier) =>
              normalizeSupplierKey(supplier.name) === normalizeSupplierKey(supplierName)
          );

      const statement = ensureStatement({
        supplierId: matchedSupplier?.id || supplierId,
        supplierName: matchedSupplier?.name || supplierName,
        supplier: matchedSupplier || null,
      });

      const totalAmount = getExpenseTotalAmountForStatement(expense);
      const debtAmount = getExpenseDebtAmountForStatement(expense);

      statement.totalExpense += totalAmount;
      statement.debtFromExpenses += debtAmount;
      statement.expenseCount += 1;
      statement.expenses.push({
        id: expense.id,
        title: expense.title || expense.description || expense.category || "Gider",
        category: expense.category || "Genel",
        date: expense.expenseDate || expense.date || expense.createdAt,
        totalAmount,
        debtAmount,
        paymentStatus: expense.paymentStatus || "-",
        status: expense.status || "-",
      });
    });

    payments.forEach((payment) => {
      const matchedSupplier = payment.supplierId
        ? suppliers.find((supplier) => supplier.id === payment.supplierId)
        : suppliers.find(
            (supplier) =>
              normalizeSupplierKey(supplier.name) === normalizeSupplierKey(payment.supplierName)
          );

      const statement = ensureStatement({
        supplierId: matchedSupplier?.id || payment.supplierId,
        supplierName: matchedSupplier?.name || payment.supplierName,
        supplier: matchedSupplier || payment.supplier || null,
      });

      const isActive = payment.status !== "CANCELLED";

      if (isActive) {
        statement.paidBySupplierPayments += Number(payment.amount || 0);
      }

      statement.paymentCount += 1;
      statement.payments.push(formatSupplierPayment(payment));
    });

    const statements = Array.from(statementMap.values()).map((statement) => {
      const remainingDebt =
        Number(statement.debtFromExpenses || 0) -
        Number(statement.paidBySupplierPayments || 0);

      return {
        ...statement,
        remainingDebt,
        status:
          remainingDebt > 0
            ? "BORÇLU"
            : remainingDebt < 0
              ? "AVANS / ALACAK"
              : "KAPALI",
      };
    });

    const summary = statements.reduce(
      (total, statement) => {
        total.totalExpense += Number(statement.totalExpense || 0);
        total.debtFromExpenses += Number(statement.debtFromExpenses || 0);
        total.paidBySupplierPayments += Number(statement.paidBySupplierPayments || 0);
        total.remainingDebt += Number(statement.remainingDebt || 0);

        if (statement.remainingDebt > 0) {
          total.debtSupplierCount += 1;
        }

        return total;
      },
      {
        totalExpense: 0,
        debtFromExpenses: 0,
        paidBySupplierPayments: 0,
        remainingDebt: 0,
        debtSupplierCount: 0,
      }
    );

    return res.json({
      supplierStatements: statements.sort((a, b) => b.remainingDebt - a.remainingDebt),
      summary,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Tedarikçi cari kayıtları alınamadı.",
      detail: error.message,
    });
  }
});

`;

  server = server.replace(insertBefore, supplierStatementApi + "\n" + insertBefore);
}

fs.writeFileSync(serverPath, server, "utf8");

console.log("Tedarikçi Cari / Borç backend schema ve API hazır.");
