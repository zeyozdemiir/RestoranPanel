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
   1) Prisma schema: Günlük Ciro / Gelir
----------------------------- */

let schema = fs.readFileSync(schemaPath, "utf8");

schema = addLineToModel(schema, "Restaurant", "dailySales          DailySale[]");

if (!/model\s+DailySale\s+{/.test(schema)) {
  schema += `

model DailySale {
  id                 Int      @id @default(autoincrement())
  saleDate           DateTime @default(now())
  title              String   @default("Günlük Ciro")
  cashAmount         Float    @default(0)
  cardAmount         Float    @default(0)
  onlineAmount       Float    @default(0)
  yemeksepetiAmount  Float    @default(0)
  getirAmount        Float    @default(0)
  trendyolAmount     Float    @default(0)
  otherAmount        Float    @default(0)
  totalAmount        Float    @default(0)
  guestCount         Int      @default(0)
  orderCount         Int      @default(0)
  note               String?
  status             String   @default("ACTIVE")
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  restaurantId       Int
  restaurant         Restaurant @relation(fields: [restaurantId], references: [id])
}
`;
}

fs.writeFileSync(schemaPath, schema, "utf8");

/* -----------------------------
   2) Server API: Günlük Ciro / Gelir
----------------------------- */

let server = fs.readFileSync(serverPath, "utf8");

if (!server.includes('app.get("/api/daily-sales"')) {
  const insertBefore = server.includes('app.listen(PORT')
    ? 'app.listen(PORT'
    : null;

  if (!insertBefore) {
    throw new Error("server.js içinde app.listen bulunamadı.");
  }

  const dailySalesApi = `

function calculateDailySaleTotal(data) {
  return (
    Number(data.cashAmount || 0) +
    Number(data.cardAmount || 0) +
    Number(data.onlineAmount || 0) +
    Number(data.yemeksepetiAmount || 0) +
    Number(data.getirAmount || 0) +
    Number(data.trendyolAmount || 0) +
    Number(data.otherAmount || 0)
  );
}

function formatDailySale(sale) {
  return {
    id: sale.id,
    saleDate: sale.saleDate,
    date: sale.saleDate,
    title: sale.title,
    cashAmount: sale.cashAmount,
    cardAmount: sale.cardAmount,
    onlineAmount: sale.onlineAmount,
    yemeksepetiAmount: sale.yemeksepetiAmount,
    getirAmount: sale.getirAmount,
    trendyolAmount: sale.trendyolAmount,
    otherAmount: sale.otherAmount,
    totalAmount: sale.totalAmount,
    totalRevenue: sale.totalAmount,
    totalSales: sale.totalAmount,
    revenue: sale.totalAmount,
    guestCount: sale.guestCount,
    orderCount: sale.orderCount,
    note: sale.note,
    status: sale.status,
    createdAt: sale.createdAt,
    updatedAt: sale.updatedAt,
  };
}

app.get("/api/daily-sales", authMiddleware, async (req, res) => {
  try {
    const sales = await prisma.dailySale.findMany({
      where: {
        restaurantId: req.user.restaurantId,
      },
      orderBy: {
        saleDate: "desc",
      },
    });

    const summary = sales.reduce(
      (total, sale) => {
        if (sale.status === "CANCELLED") {
          total.cancelledCount += 1;
          return total;
        }

        total.cashAmount += Number(sale.cashAmount || 0);
        total.cardAmount += Number(sale.cardAmount || 0);
        total.onlineAmount += Number(sale.onlineAmount || 0);
        total.yemeksepetiAmount += Number(sale.yemeksepetiAmount || 0);
        total.getirAmount += Number(sale.getirAmount || 0);
        total.trendyolAmount += Number(sale.trendyolAmount || 0);
        total.otherAmount += Number(sale.otherAmount || 0);
        total.totalAmount += Number(sale.totalAmount || 0);
        total.guestCount += Number(sale.guestCount || 0);
        total.orderCount += Number(sale.orderCount || 0);
        total.activeCount += 1;

        return total;
      },
      {
        cashAmount: 0,
        cardAmount: 0,
        onlineAmount: 0,
        yemeksepetiAmount: 0,
        getirAmount: 0,
        trendyolAmount: 0,
        otherAmount: 0,
        totalAmount: 0,
        guestCount: 0,
        orderCount: 0,
        activeCount: 0,
        cancelledCount: 0,
      }
    );

    return res.json({
      dailySales: sales.map(formatDailySale),
      sales: sales.map(formatDailySale),
      summary,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Günlük ciro kayıtları alınamadı.",
      detail: error.message,
    });
  }
});

app.post("/api/daily-sales", authMiddleware, async (req, res) => {
  try {
    const {
      saleDate,
      title,
      cashAmount,
      cardAmount,
      onlineAmount,
      yemeksepetiAmount,
      getirAmount,
      trendyolAmount,
      otherAmount,
      guestCount,
      orderCount,
      note,
    } = req.body;

    const payload = {
      cashAmount: Number(cashAmount || 0),
      cardAmount: Number(cardAmount || 0),
      onlineAmount: Number(onlineAmount || 0),
      yemeksepetiAmount: Number(yemeksepetiAmount || 0),
      getirAmount: Number(getirAmount || 0),
      trendyolAmount: Number(trendyolAmount || 0),
      otherAmount: Number(otherAmount || 0),
    };

    const totalAmount = calculateDailySaleTotal(payload);

    if (totalAmount <= 0) {
      return res.status(400).json({
        message: "Günlük ciro toplamı 0'dan büyük olmalıdır.",
      });
    }

    const sale = await prisma.dailySale.create({
      data: {
        restaurantId: req.user.restaurantId,
        saleDate: saleDate ? new Date(saleDate) : new Date(),
        title: title || "Günlük Ciro",
        cashAmount: payload.cashAmount,
        cardAmount: payload.cardAmount,
        onlineAmount: payload.onlineAmount,
        yemeksepetiAmount: payload.yemeksepetiAmount,
        getirAmount: payload.getirAmount,
        trendyolAmount: payload.trendyolAmount,
        otherAmount: payload.otherAmount,
        totalAmount,
        guestCount: Number(guestCount || 0),
        orderCount: Number(orderCount || 0),
        note: note || null,
        status: "ACTIVE",
      },
    });

    return res.json({
      message: "Günlük ciro kaydı oluşturuldu.",
      dailySale: formatDailySale(sale),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Günlük ciro kaydı oluşturulamadı.",
      detail: error.message,
    });
  }
});

app.put("/api/daily-sales/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const saleId = Number(req.params.id);

    const sale = await prisma.dailySale.findFirst({
      where: {
        id: saleId,
        restaurantId: req.user.restaurantId,
      },
    });

    if (!sale) {
      return res.status(404).json({
        message: "Günlük ciro kaydı bulunamadı.",
      });
    }

    if (sale.status === "CANCELLED") {
      return res.status(400).json({
        message: "Bu günlük ciro kaydı zaten iptal edilmiş.",
      });
    }

    const updatedSale = await prisma.dailySale.update({
      where: {
        id: sale.id,
      },
      data: {
        status: "CANCELLED",
      },
    });

    return res.json({
      message: "Günlük ciro kaydı iptal edildi.",
      dailySale: formatDailySale(updatedSale),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Günlük ciro kaydı iptal edilemedi.",
      detail: error.message,
    });
  }
});

/*
  Uyum endpointleri:
  Nakit Akışı ve Kâr Zarar ekranları /api/sales veya /api/daily-reports okuyorsa
  aynı günlük ciro verisini bu endpointlerden de döndürüyoruz.
*/

if (!global.__handsOffSalesCompatibilityRoutesAdded) {
  global.__handsOffSalesCompatibilityRoutesAdded = true;

  app.get("/api/sales", authMiddleware, async (req, res) => {
    try {
      const sales = await prisma.dailySale.findMany({
        where: {
          restaurantId: req.user.restaurantId,
        },
        orderBy: {
          saleDate: "desc",
        },
      });

      return res.json({
        sales: sales.map(formatDailySale),
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Satış kayıtları alınamadı.",
        detail: error.message,
      });
    }
  });

  app.get("/api/daily-reports", authMiddleware, async (req, res) => {
    try {
      const reports = await prisma.dailySale.findMany({
        where: {
          restaurantId: req.user.restaurantId,
        },
        orderBy: {
          saleDate: "desc",
        },
      });

      return res.json({
        dailyReports: reports.map(formatDailySale),
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Günlük rapor kayıtları alınamadı.",
        detail: error.message,
      });
    }
  });
}

`;

  server = server.replace(insertBefore, dailySalesApi + "\n" + insertBefore);
}

fs.writeFileSync(serverPath, server, "utf8");

console.log("Günlük Ciro / Gelir backend schema ve API hazır.");
