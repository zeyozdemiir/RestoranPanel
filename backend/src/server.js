const fs = require("fs");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const nodePath = require("path");
const { PrismaClient } = require("@prisma/client");

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const PORT = 4000;
const JWT_SECRET = process.env.JWT_SECRET || "handsoff_secret_key";

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

const uploadDir = nodePath.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const uploadStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, uploadDir);
  },
  filename: function (req, file, callback) {
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const uniqueName = Date.now() + "-" + safeOriginalName;

    callback(null, uniqueName);
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
  fileFilter: function (req, file, callback) {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(new Error("Sadece PDF, Excel veya CSV dosyasi yuklenebilir."));
    }

    callback(null, true);
  },
});

function createToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      restaurantId: user.restaurantId,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token bulunamadi.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      include: {
        restaurant: true,
      },
    });

    if (!user || !user.isActive || !user.restaurant.isActive) {
      return res.status(401).json({
        message: "Kullanici veya restoran aktif degil.",
      });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({
      message: "Gecersiz token.",
    });
  }
}

function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    restaurantId: user.restaurantId,
    restaurantName: user.restaurant.name,
    plan: user.restaurant.plan,
  };
}

function normalizeReportDate(value) {
  if (!value) {
    const today = new Date().toISOString().slice(0, 10);
    return new Date(`${today}T00:00:00.000Z`);
  }

  const dateOnly = String(value).slice(0, 10);
  return new Date(`${dateOnly}T00:00:00.000Z`);
}

function formatDateTR(date) {
  return date.toISOString().slice(0, 10);
}

function formatMoney(value) {
  const number = Number(value || 0);

  return (
    new Intl.NumberFormat("tr-TR", {
      maximumFractionDigits: 0,
    }).format(number) + "₺"
  );
}

function formatShortMoney(value) {
  const number = Number(value || 0);

  if (number >= 1000) {
    return Math.round(number / 1000) + "K";
  }

  return String(number);
}

function formatDailyReport(report) {
  return {
    id: report.id,
    reportDate: formatDateTR(report.reportDate),
    revenue: report.revenue,
    reservationCount: report.reservationCount,
    openTaskCount: report.openTaskCount,
    cashDifference: report.cashDifference,
    note: report.note,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}

function formatExpense(expense) {
  return {
    id: expense.id,
    supplierName: expense.supplierName,
    invoiceNo: expense.invoiceNo,
    invoiceDate: expense.invoiceDate,
    category: expense.category,
    description: expense.description,
    netAmount: expense.netAmount,
    taxAmount: expense.taxAmount,
    totalAmount: expense.totalAmount,
    currency: expense.currency,
    paymentStatus: expense.paymentStatus,
    status: expense.status,
    source: expense.source,
    note: expense.note,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
    uploadedDocument: expense.uploadedDocument
      ? {
          id: expense.uploadedDocument.id,
          originalName: expense.uploadedDocument.originalName,
          documentType: expense.uploadedDocument.documentType,
        }
      : null,
  };
}

async function getFallbackDashboard(user) {
  const restaurantId = user.restaurantId;

  const stats = await prisma.dashboardStat.findMany({
    where: {
      restaurantId,
    },
    orderBy: {
      sortOrder: "asc",
    },
    select: {
      id: true,
      title: true,
      value: true,
      note: true,
    },
  });

  const revenueBars = await prisma.dashboardRevenueBar.findMany({
    where: {
      restaurantId,
    },
    orderBy: {
      sortOrder: "asc",
    },
    select: {
      id: true,
      label: true,
      value: true,
      height: true,
    },
  });

  const actions = await prisma.dashboardAction.findMany({
    where: {
      restaurantId,
    },
    orderBy: {
      sortOrder: "asc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
    },
  });

  return {
    restaurantName: user.restaurant.name,
    stats,
    revenueBars,
    actions,
  };
}

async function getDailyReportDashboard(user) {
  const restaurantId = user.restaurantId;

  const reportCount = await prisma.dailyReport.count({
    where: {
      restaurantId,
    },
  });

  if (reportCount === 0) {
    return getFallbackDashboard(user);
  }

  const latestReport = await prisma.dailyReport.findFirst({
    where: {
      restaurantId,
    },
    orderBy: {
      reportDate: "desc",
    },
  });

  const lastSevenReports = await prisma.dailyReport.findMany({
    where: {
      restaurantId,
    },
    orderBy: {
      reportDate: "desc",
    },
    take: 7,
  });

  const sortedReports = [...lastSevenReports].sort(
    (a, b) => a.reportDate.getTime() - b.reportDate.getTime()
  );

  const maxRevenue = Math.max(
    ...sortedReports.map((report) => Number(report.revenue || 0)),
    1
  );

  const revenueBars = sortedReports.map((report) => {
    const heightNumber = Math.max(
      8,
      Math.round((Number(report.revenue || 0) / maxRevenue) * 100)
    );

    return {
      id: report.id,
      label: formatDateTR(report.reportDate).slice(5),
      value: formatShortMoney(report.revenue),
      height: `${heightNumber}%`,
    };
  });

  return {
    restaurantName: user.restaurant.name,
    stats: [
      {
        id: "daily-revenue",
        title: "Gunluk Ciro",
        value: formatMoney(latestReport.revenue),
        note: `Son rapor tarihi: ${formatDateTR(latestReport.reportDate)}`,
      },
      {
        id: "daily-reservation",
        title: "Rezervasyon",
        value: String(latestReport.reservationCount),
        note: "Son kaydedilen gunluk rapordan alindi",
      },
      {
        id: "daily-open-task",
        title: "Acik Gorev",
        value: String(latestReport.openTaskCount),
        note: "Operasyon kaydindan alindi",
      },
      {
        id: "daily-cash-difference",
        title: "Kasa Farki",
        value: formatMoney(latestReport.cashDifference),
        note: latestReport.cashDifference === 0 ? "Kasa dengede" : "Kontrol edilmeli",
      },
    ],
    revenueBars,
    actions: [
      {
        id: "daily-report-note",
        title: "Gunluk rapor notu",
        description: latestReport.note || "Bu gun icin not girilmemis.",
        status: "Rapor",
      },
      {
        id: "daily-report-check",
        title: "Rapor kontrolu",
        description:
          "Ciro, rezervasyon, gorev ve kasa farki gunluk rapordan hesaplaniyor.",
        status: "Canli",
      },
    ],
  };
}

app.get("/", (req, res) => {
  res.send("HandsOff Backend calisiyor.");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "HandsOff Backend",
    message: "Backend calisiyor.",
  });
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Mail ve sifre zorunludur.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
      include: {
        restaurant: true,
      },
    });

    if (!user || !user.isActive || !user.restaurant.isActive) {
      return res.status(401).json({
        message: "Mail veya sifre hatali.",
      });
    }

    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({
        message: "Mail veya sifre hatali.",
      });
    }

    const token = createToken(user);

    return res.json({
      message: "Giris basarili.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Sunucu hatasi.",
    });
  }
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  return res.json({
    user: formatUser(req.user),
  });
});

app.get("/api/dashboard/summary", authMiddleware, async (req, res) => {
  try {
    const dashboard = await getDailyReportDashboard(req.user);

    return res.json(dashboard);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Dashboard verisi alinamadi.",
    });
  }
});

app.get("/api/daily-reports", authMiddleware, async (req, res) => {
  try {
    const { from, to } = req.query;

    const where = {
      restaurantId: req.user.restaurantId,
    };

    if (from || to) {
      where.reportDate = {};

      if (from) {
        where.reportDate.gte = normalizeReportDate(from);
      }

      if (to) {
        where.reportDate.lte = normalizeReportDate(to);
      }
    }

    const reports = await prisma.dailyReport.findMany({
      where,
      orderBy: {
        reportDate: "desc",
      },
    });

    return res.json({
      reports: reports.map(formatDailyReport),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gunluk raporlar alinamadi.",
    });
  }
});

app.post("/api/daily-reports", authMiddleware, async (req, res) => {
  try {
    const {
      reportDate,
      revenue,
      reservationCount,
      openTaskCount,
      cashDifference,
      note,
    } = req.body;

    const normalizedDate = normalizeReportDate(reportDate);

    const savedReport = await prisma.dailyReport.upsert({
      where: {
        restaurantId_reportDate: {
          restaurantId: req.user.restaurantId,
          reportDate: normalizedDate,
        },
      },
      update: {
        revenue: Number(revenue || 0),
        reservationCount: Number(reservationCount || 0),
        openTaskCount: Number(openTaskCount || 0),
        cashDifference: Number(cashDifference || 0),
        note: note || null,
      },
      create: {
        restaurantId: req.user.restaurantId,
        reportDate: normalizedDate,
        revenue: Number(revenue || 0),
        reservationCount: Number(reservationCount || 0),
        openTaskCount: Number(openTaskCount || 0),
        cashDifference: Number(cashDifference || 0),
        note: note || null,
      },
    });

    return res.json({
      message: "Gunluk rapor kaydedildi.",
      report: formatDailyReport(savedReport),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gunluk rapor kaydedilemedi.",
    });
  }
});

app.post("/api/report-uploads", authMiddleware, function (req, res) {
  upload.single("file")(req, res, async function (error) {
    try {
      if (error) {
        return res.status(400).json({
          message: error.message || "Rapor dosyasi yuklenemedi.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "Dosya bulunamadi.",
        });
      }

      const documentType = req.body.documentType || "ADISYON_REPORT";

      const uploadedDocument = await prisma.uploadedDocument.create({
        data: {
          originalName: req.file.originalname,
          storedName: req.file.filename,
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
          path: req.file.path,
          documentType,
          status: "UPLOADED",
          aiRead: false,
          processed: false,
          restaurantId: req.user.restaurantId,
          uploadedByUserId: req.user.id,
        },
      });

      if (
        documentType === "EXPENSE_INVOICE" ||
        documentType === "STOCK_INVOICE"
      ) {
        await prisma.expense.create({
          data: {
            restaurantId: req.user.restaurantId,
            uploadedDocumentId: uploadedDocument.id,
            supplierName: "AI okuma bekliyor",
            category:
              documentType === "STOCK_INVOICE"
                ? "Stok / Satin Alma"
                : "Gider Faturasi",
            description: req.file.originalname,
            netAmount: 0,
            taxAmount: 0,
            totalAmount: 0,
            paymentStatus: "UNPAID",
            status: "WAITING_AI",
            source: "UPLOAD",
            note: "Fatura yuklendi. AI okuma ve kullanici onayi bekliyor.",
          },
        });

        await prisma.uploadedDocument.update({
          where: {
            id: uploadedDocument.id,
          },
          data: {
            status: "EXPENSE_DRAFT_CREATED",
          },
        });
      }

      return res.json({
        message: "Dosya yuklendi ve veritabanina kaydedildi.",
        file: {
          originalName: req.file.originalname,
          storedName: req.file.filename,
          size: req.file.size,
          mimeType: req.file.mimetype,
          path: req.file.path,
        },
        document: uploadedDocument,
      });
    } catch (saveError) {
      console.error(saveError);

      return res.status(500).json({
        message: "Dosya yuklendi ama veritabanina kaydedilemedi.",
      });
    }
  });
});

app.get("/api/report-uploads", authMiddleware, async (req, res) => {
  try {
    const documents = await prisma.uploadedDocument.findMany({
      where: {
        restaurantId: req.user.restaurantId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        originalName: true,
        storedName: true,
        mimeType: true,
        sizeBytes: true,
        documentType: true,
        status: true,
        aiRead: true,
        processed: true,
        createdAt: true,
      },
    });

    return res.json({
      documents,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Yuklenen dosyalar alinamadi.",
    });
  }
});

app.get("/api/expenses", authMiddleware, async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: {
        restaurantId: req.user.restaurantId,
      },
      include: {
        uploadedDocument: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      expenses: expenses.map(formatExpense),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gider kayitlari alinamadi.",
    });
  }
});

app.post("/api/expenses", authMiddleware, async (req, res) => {
  try {
    const {
      supplierName,
      invoiceNo,
      invoiceDate,
      category,
      description,
      netAmount,
      taxAmount,
      totalAmount,
      paymentStatus,
      note,
    } = req.body;

    const expense = await prisma.expense.create({
      data: {
        restaurantId: req.user.restaurantId,
        supplierName: supplierName || "Manuel gider",
        invoiceNo: invoiceNo || null,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : null,
        category: category || "Fatura",
        description: description || null,
        netAmount: Number(netAmount || 0),
        taxAmount: Number(taxAmount || 0),
        totalAmount: Number(totalAmount || 0),
        paymentStatus: paymentStatus || "UNPAID",
        status: "APPROVED",
        source: "MANUAL",
        note: note || null,
      },
      include: {
        uploadedDocument: true,
      },
    });

    return res.json({
      message: "Gider kaydi olusturuldu.",
      expense: formatExpense(expense),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gider kaydi olusturulamadi.",
    });
  }
});


app.put("/api/expenses/:id", authMiddleware, async (req, res) => {
  try {
    const expenseId = Number(req.params.id);

    if (!expenseId) {
      return res.status(400).json({
        message: "Gecersiz gider ID.",
      });
    }

    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        restaurantId: req.user.restaurantId,
      },
    });

    if (!existingExpense) {
      return res.status(404).json({
        message: "Gider kaydi bulunamadi.",
      });
    }

    const {
      supplierName,
      invoiceNo,
      invoiceDate,
      category,
      description,
      netAmount,
      taxAmount,
      totalAmount,
      paymentStatus,
      status,
      note,
    } = req.body;

    const updatedExpense = await prisma.expense.update({
      where: {
        id: expenseId,
      },
      data: {
        supplierName: supplierName ?? existingExpense.supplierName,
        invoiceNo: invoiceNo === "" ? null : invoiceNo ?? existingExpense.invoiceNo,
        invoiceDate:
          invoiceDate === ""
            ? null
            : invoiceDate
              ? new Date(invoiceDate)
              : existingExpense.invoiceDate,
        category: category ?? existingExpense.category,
        description:
          description === "" ? null : description ?? existingExpense.description,
        netAmount:
          netAmount === undefined ? existingExpense.netAmount : Number(netAmount || 0),
        taxAmount:
          taxAmount === undefined ? existingExpense.taxAmount : Number(taxAmount || 0),
        totalAmount:
          totalAmount === undefined
            ? existingExpense.totalAmount
            : Number(totalAmount || 0),
        paymentStatus: paymentStatus ?? existingExpense.paymentStatus,
        status: status ?? existingExpense.status,
        note: note === "" ? null : note ?? existingExpense.note,
      },
      include: {
        uploadedDocument: true,
      },
    });

    return res.json({
      message: "Gider kaydi guncellendi.",
      expense: formatExpense(updatedExpense),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gider kaydi guncellenemedi.",
    });
  }
});

app.post("/api/report-uploads/:id/create-expense", authMiddleware, async (req, res) => {
  try {
    const documentId = Number(req.params.id);

    if (!documentId) {
      return res.status(400).json({
        message: "Gecersiz belge ID.",
      });
    }

    const document = await prisma.uploadedDocument.findFirst({
      where: {
        id: documentId,
        restaurantId: req.user.restaurantId,
      },
    });

    if (!document) {
      return res.status(404).json({
        message: "Belge bulunamadi.",
      });
    }

    const existingExpense = await prisma.expense.findFirst({
      where: {
        uploadedDocumentId: document.id,
        restaurantId: req.user.restaurantId,
      },
      include: {
        uploadedDocument: true,
      },
    });

    if (existingExpense) {
      return res.json({
        message: "Bu belge icin gider taslagi zaten var.",
        expense: formatExpense(existingExpense),
      });
    }

    const expense = await prisma.expense.create({
      data: {
        restaurantId: req.user.restaurantId,
        uploadedDocumentId: document.id,
        supplierName: "AI okuma bekliyor",
        category:
          document.documentType === "STOCK_INVOICE"
            ? "Stok / Satin Alma"
            : "Gider Faturasi",
        description: document.originalName,
        netAmount: 0,
        taxAmount: 0,
        totalAmount: 0,
        paymentStatus: "UNPAID",
        status: "WAITING_AI",
        source: "UPLOAD",
        note: "Fatura yuklendi. AI okuma ve kullanici onayi bekliyor.",
      },
      include: {
        uploadedDocument: true,
      },
    });

    await prisma.uploadedDocument.update({
      where: {
        id: document.id,
      },
      data: {
        status: "EXPENSE_DRAFT_CREATED",
      },
    });

    return res.json({
      message: "Belgeden gider taslagi olusturuldu.",
      expense: formatExpense(expense),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Belgeden gider taslagi olusturulamadi.",
    });
  }
});


function getMonthDateRange(monthValue) {
  const now = new Date();
  const fallbackMonth = String(now.getMonth() + 1).padStart(2, "0");
  const fallback = now.getFullYear() + "-" + fallbackMonth;

  const month = monthValue || fallback;
  const parts = String(month).split("-");
  const year = Number(parts[0]);
  const monthIndex = Number(parts[1]) - 1;

  const startDate = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0));

  return {
    month,
    startDate,
    endDate,
  };
}

app.get("/api/finance/monthly-summary", authMiddleware, async (req, res) => {
  try {
    const { month, startDate, endDate } = getMonthDateRange(req.query.month);

    const dailyReports = await prisma.dailyReport.findMany({
      where: {
        restaurantId: req.user.restaurantId,
        reportDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: {
        reportDate: "asc",
      },
    });

    const expenses = await prisma.expense.findMany({
      where: {
        restaurantId: req.user.restaurantId,
        OR: [
          {
            invoiceDate: {
              gte: startDate,
              lt: endDate,
            },
          },
          {
            invoiceDate: null,
            createdAt: {
              gte: startDate,
              lt: endDate,
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalRevenue = dailyReports.reduce((total, report) => {
      return total + Number(report.revenue || 0);
    }, 0);

    const totalExpenses = expenses.reduce((total, expense) => {
      return total + Number(expense.totalAmount || 0);
    }, 0);

    const approvedExpenses = expenses
      .filter((expense) => expense.status === "APPROVED")
      .reduce((total, expense) => {
        return total + Number(expense.totalAmount || 0);
      }, 0);

    const unpaidExpenses = expenses
      .filter((expense) => expense.paymentStatus === "UNPAID")
      .reduce((total, expense) => {
        return total + Number(expense.totalAmount || 0);
      }, 0);

    const categoryMap = new Map();

    expenses.forEach((expense) => {
      const category = expense.category || "Diger";
      const current = categoryMap.get(category) || {
        category,
        count: 0,
        totalAmount: 0,
      };

      current.count += 1;
      current.totalAmount += Number(expense.totalAmount || 0);

      categoryMap.set(category, current);
    });

    const expenseCategories = Array.from(categoryMap.values()).sort(
      (a, b) => b.totalAmount - a.totalAmount
    );

    return res.json({
      month,
      totals: {
        totalRevenue,
        totalExpenses,
        approvedExpenses,
        unpaidExpenses,
        netProfit: totalRevenue - totalExpenses,
        reportCount: dailyReports.length,
        expenseCount: expenses.length,
      },
      dailyReports: dailyReports.map((report) => ({
        id: report.id,
        reportDate: formatDateTR(report.reportDate),
        revenue: report.revenue,
        reservationCount: report.reservationCount,
        cashDifference: report.cashDifference,
      })),
      expenseCategories,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Aylik finans ozeti alinamadi.",
    });
  }
});

app.get("/api/restaurants", authMiddleware, async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.json({
      restaurants,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Restoranlar alinamadi.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`HandsOff backend calisiyor: http://localhost:${PORT}`);
});