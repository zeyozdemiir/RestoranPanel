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
   1) Prisma schema: Manuel Kasa Hareketi
----------------------------- */

let schema = fs.readFileSync(schemaPath, "utf8");

schema = addLineToModel(schema, "Restaurant", "cashMovements       CashMovement[]");

if (!/model\s+CashMovement\s+{/.test(schema)) {
  schema += `

model CashMovement {
  id          Int      @id @default(autoincrement())
  movementDate DateTime @default(now())
  direction   String   @default("IN")
  title       String
  category    String   @default("Genel")
  amount      Float    @default(0)
  method      String   @default("CASH")
  note        String?
  status      String   @default("ACTIVE")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  restaurantId Int
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
}
`;
}

fs.writeFileSync(schemaPath, schema, "utf8");

/* -----------------------------
   2) Server API: Manuel Kasa Hareketi
----------------------------- */

let server = fs.readFileSync(serverPath, "utf8");

if (!server.includes('app.get("/api/cash-movements"')) {
  const insertBefore = server.includes('app.listen(PORT')
    ? 'app.listen(PORT'
    : null;

  if (!insertBefore) {
    throw new Error("server.js içinde app.listen bulunamadı.");
  }

  const cashMovementApi = `

function formatCashMovement(movement) {
  return {
    id: movement.id,
    movementDate: movement.movementDate,
    direction: movement.direction,
    title: movement.title,
    category: movement.category,
    amount: movement.amount,
    method: movement.method,
    note: movement.note,
    status: movement.status,
    createdAt: movement.createdAt,
    updatedAt: movement.updatedAt,
  };
}

app.get("/api/cash-movements", authMiddleware, async (req, res) => {
  try {
    const movements = await prisma.cashMovement.findMany({
      where: {
        restaurantId: req.user.restaurantId,
      },
      orderBy: {
        movementDate: "desc",
      },
    });

    const summary = movements.reduce(
      (total, movement) => {
        if (movement.status === "CANCELLED") {
          total.cancelledCount += 1;
          return total;
        }

        const amount = Number(movement.amount || 0);

        if (movement.direction === "IN") {
          total.inflow += amount;
        } else {
          total.outflow += amount;
        }

        total.net = total.inflow - total.outflow;
        total.activeCount += 1;

        return total;
      },
      {
        inflow: 0,
        outflow: 0,
        net: 0,
        activeCount: 0,
        cancelledCount: 0,
      }
    );

    return res.json({
      cashMovements: movements.map(formatCashMovement),
      summary,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Kasa hareketleri alınamadı.",
      detail: error.message,
    });
  }
});

app.post("/api/cash-movements", authMiddleware, async (req, res) => {
  try {
    const {
      movementDate,
      direction,
      title,
      category,
      amount,
      method,
      note,
    } = req.body;

    const numericAmount = Number(amount || 0);

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        message: "Açıklama zorunludur.",
      });
    }

    if (numericAmount <= 0) {
      return res.status(400).json({
        message: "Tutar 0'dan büyük olmalıdır.",
      });
    }

    const finalDirection = direction === "OUT" ? "OUT" : "IN";

    const movement = await prisma.cashMovement.create({
      data: {
        restaurantId: req.user.restaurantId,
        movementDate: movementDate ? new Date(movementDate) : new Date(),
        direction: finalDirection,
        title: String(title).trim(),
        category: category || "Genel",
        amount: numericAmount,
        method: method || "CASH",
        note: note || null,
        status: "ACTIVE",
      },
    });

    return res.json({
      message:
        finalDirection === "IN"
          ? "Kasa girişi kaydedildi."
          : "Kasa çıkışı kaydedildi.",
      cashMovement: formatCashMovement(movement),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Kasa hareketi kaydedilemedi.",
      detail: error.message,
    });
  }
});

app.put("/api/cash-movements/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const movementId = Number(req.params.id);

    const movement = await prisma.cashMovement.findFirst({
      where: {
        id: movementId,
        restaurantId: req.user.restaurantId,
      },
    });

    if (!movement) {
      return res.status(404).json({
        message: "Kasa hareketi bulunamadı.",
      });
    }

    if (movement.status === "CANCELLED") {
      return res.status(400).json({
        message: "Bu kasa hareketi zaten iptal edilmiş.",
      });
    }

    const updatedMovement = await prisma.cashMovement.update({
      where: {
        id: movement.id,
      },
      data: {
        status: "CANCELLED",
      },
    });

    return res.json({
      message: "Kasa hareketi iptal edildi.",
      cashMovement: formatCashMovement(updatedMovement),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Kasa hareketi iptal edilemedi.",
      detail: error.message,
    });
  }
});

`;

  server = server.replace(insertBefore, cashMovementApi + "\n" + insertBefore);
}

fs.writeFileSync(serverPath, server, "utf8");

console.log("Manuel Kasa Hareketi backend schema ve API hazır.");
