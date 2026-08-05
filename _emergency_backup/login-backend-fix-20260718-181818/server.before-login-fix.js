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

// HANDSOFF_BACKEND_CORS_FIX
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
// HANDSOFF_BACKEND_CORS_FIX_END


// HANDSOFF_PREVIEW_CORS_ALLOW
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173"
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

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



// HANDSOFF_SUPPLIER_PERMISSION_MIDDLEWARE

function handsoffSupplierRestaurantId(req) {
  return req.user?.restaurantId || req.user?.restaurant?.id || req.restaurantId || 1;
}

async function handsoffSupplierCurrentRoleMember(req) {
  const restaurantId = handsoffSupplierRestaurantId(req);

  const email = String(
    req.user?.email ||
    req.user?.user?.email ||
    req.userEmail ||
    ""
  ).toLowerCase();

  try {
    if (!prisma.userRoleMember) {
      return {
        role: "OWNER",
        status: "ACTIVE",
        canManageSuppliers: true,
      };
    }

    if (email) {
      const member = await prisma.userRoleMember.findFirst({
        where: {
          restaurantId,
          email: {
            equals: email,
          },
        },
      });

      if (member) return member;
    }

    const owner = await prisma.userRoleMember.findFirst({
      where: {
        restaurantId,
        role: "OWNER",
        status: "ACTIVE",
      },
    });

    if (owner) return owner;

    return {
      role: "OWNER",
      status: "ACTIVE",
      canManageSuppliers: true,
    };
  } catch (error) {
    console.error("supplier role lookup error:", error);

    return {
      role: "OWNER",
      status: "ACTIVE",
      canManageSuppliers: true,
    };
  }
}

function handsoffCanManageSuppliers(member) {
  if (!member) return false;
  if (member.status && member.status !== "ACTIVE") return false;
  if (member.role === "OWNER") return true;

  return Boolean(member.canManageSuppliers);
}

async function handsoffSupplierWriteGuard(req, res, next) {
  try {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      return next();
    }

    const member = await handsoffSupplierCurrentRoleMember(req);

    if (handsoffCanManageSuppliers(member)) {
      req.handsoffRoleMember = member;
      return next();
    }

    return res.status(403).json({
      message: "Bu tedarikçi işlemi için yetkiniz yok.",
      requiredPermission: "canManageSuppliers",
      currentRole: member?.role || null,
    });
  } catch (error) {
    console.error("supplier permission error:", error);

    return res.status(500).json({
      message: "Tedarikçi yetki kontrolü yapılamadı.",
      detail: error.message,
    });
  }
}

app.use(
  ["/api/suppliers", "/api/purchase-orders", "/api/supplier-statements"],
  authMiddleware,
  handsoffSupplierWriteGuard
);




// HANDSOFF_SETTINGS_PERMISSION_MIDDLEWARE

function handsoffSettingsRestaurantId(req) {
  return req.user?.restaurantId || req.user?.restaurant?.id || req.restaurantId || 1;
}

async function handsoffSettingsCurrentRoleMember(req) {
  const restaurantId = handsoffSettingsRestaurantId(req);

  const email = String(
    req.user?.email ||
    req.user?.user?.email ||
    req.userEmail ||
    ""
  ).toLowerCase();

  try {
    if (!prisma.userRoleMember) {
      return {
        role: "OWNER",
        status: "ACTIVE",
        canManageSettings: true,
      };
    }

    if (email) {
      const member = await prisma.userRoleMember.findFirst({
        where: {
          restaurantId,
          email: {
            equals: email,
          },
        },
      });

      if (member) return member;
    }

    const owner = await prisma.userRoleMember.findFirst({
      where: {
        restaurantId,
        role: "OWNER",
        status: "ACTIVE",
      },
    });

    if (owner) return owner;

    return {
      role: "OWNER",
      status: "ACTIVE",
      canManageSettings: true,
    };
  } catch (error) {
    console.error("settings role lookup error:", error);

    return {
      role: "OWNER",
      status: "ACTIVE",
      canManageSettings: true,
    };
  }
}

function handsoffCanManageSettings(member) {
  if (!member) return false;
  if (member.status && member.status !== "ACTIVE") return false;
  if (member.role === "OWNER") return true;

  return Boolean(member.canManageSettings);
}

async function handsoffSettingsGuard(req, res, next) {
  try {
    const member = await handsoffSettingsCurrentRoleMember(req);

    if (handsoffCanManageSettings(member)) {
      req.handsoffRoleMember = member;
      return next();
    }

    return res.status(403).json({
      message: "Bu ayar işlemi için yetkiniz yok.",
      requiredPermission: "canManageSettings",
      currentRole: member?.role || null,
    });
  } catch (error) {
    console.error("settings permission error:", error);

    return res.status(500).json({
      message: "Ayar yetki kontrolü yapılamadı.",
      detail: error.message,
    });
  }
}

app.use(
  [
    "/api/restaurant-settings",
    "/api/user-roles",
    "/api/backup/export",
    "/api/system-health"
  ],
  authMiddleware,
  handsoffSettingsGuard
);


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


function formatSupplier(supplier) {
  return {
    id: supplier.id,
    name: supplier.name,
    taxNumber: supplier.taxNumber,
    iban: supplier.iban,
    phone: supplier.phone,
    email: supplier.email,
    address: supplier.address,
    category: supplier.category,
    contactName: supplier.contactName,
    note: supplier.note,
    isActive: supplier.isActive,
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt,
  };
}


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
    stockMovementCreated: order.stockMovementCreated,
    note: order.note,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}


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

app.post("/api/inventory-items", authMiddleware, requireHandsoffPermission("canManageStock"), async (req, res) => {
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
      message: "Satın alma talepleri alınamadı.",
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
      message: "Satın alma talebi oluşturuldu.",
      purchaseOrder: formatPurchaseOrder(order),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Satın alma talebi oluşturulamadı.",
      detail: error.message,
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
        message: "Satın alma talebi bulunamadı.",
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
      message: "Satın alma talebi güncellendi.",
      purchaseOrder: formatPurchaseOrder(updatedOrder),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Satın alma talebi güncellenemedi.",
      detail: error.message,
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
        message: "Satın alma talebi bulunamadı.",
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
          ? order.note + "\nSatın alma kaydından gider oluşturuldu."
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

app.get("/api/suppliers", authMiddleware, async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: {
        restaurantId: req.user.restaurantId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      suppliers: suppliers.map(formatSupplier),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Tedarikciler alinamadi.",
    });
  }
});

app.post("/api/suppliers", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      taxNumber,
      iban,
      phone,
      email,
      address,
      category,
      contactName,
      note,
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        message: "Tedarikci adi zorunludur.",
      });
    }

    const supplier = await prisma.supplier.create({
      data: {
        restaurantId: req.user.restaurantId,
        name: String(name).trim(),
        taxNumber: taxNumber || null,
        iban: iban || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        category: category || "Genel",
        contactName: contactName || null,
        note: note || null,
        isActive: true,
      },
    });

    return res.json({
      message: "Tedarikci kaydi olusturuldu.",
      supplier: formatSupplier(supplier),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Tedarikci kaydi olusturulamadi.",
    });
  }
});

app.put("/api/suppliers/:id", authMiddleware, async (req, res) => {
  try {
    const supplierId = Number(req.params.id);

    if (!supplierId) {
      return res.status(400).json({
        message: "Gecersiz tedarikci ID.",
      });
    }

    const existingSupplier = await prisma.supplier.findFirst({
      where: {
        id: supplierId,
        restaurantId: req.user.restaurantId,
      },
    });

    if (!existingSupplier) {
      return res.status(404).json({
        message: "Tedarikci bulunamadi.",
      });
    }

    const {
      name,
      taxNumber,
      phone,
      email,
      address,
      category,
      contactName,
      note,
      isActive,
    } = req.body;

    const updatedSupplier = await prisma.supplier.update({
      where: {
        id: supplierId,
      },
      data: {
        name: name ?? existingSupplier.name,
        taxNumber:
          taxNumber === "" ? null : taxNumber ?? existingSupplier.taxNumber,
        iban: iban === "" ? null : iban ?? existingSupplier.iban,
        phone: phone === "" ? null : phone ?? existingSupplier.phone,
        email: email === "" ? null : email ?? existingSupplier.email,
        address: address === "" ? null : address ?? existingSupplier.address,
        category: category ?? existingSupplier.category,
        contactName:
          contactName === ""
            ? null
            : contactName ?? existingSupplier.contactName,
        note: note === "" ? null : note ?? existingSupplier.note,
        isActive:
          typeof isActive === "boolean" ? isActive : existingSupplier.isActive,
      },
    });

    return res.json({
      message: "Tedarikci kaydi guncellendi.",
      supplier: formatSupplier(updatedSupplier),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Tedarikci kaydi guncellenemedi.",
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

app.post("/api/stock-counts", authMiddleware, requireHandsoffPermission("canManageStock"), async (req, res) => {
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

app.put("/api/stock-counts/:id/lines/:lineId", authMiddleware, requireHandsoffPermission("canManageStock"), async (req, res) => {
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

app.post("/api/stock-counts/:id/complete", authMiddleware, requireHandsoffPermission("canManageStock"), async (req, res) => {
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

app.post("/api/waste-records", authMiddleware, requireHandsoffPermission("canManageStock"), async (req, res) => {
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

app.put("/api/waste-records/:id/cancel", authMiddleware, requireHandsoffPermission("canManageStock"), async (req, res) => {
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




function handsoffRestaurantId(req) {
  return req.user?.restaurantId || req.user?.restaurant?.id || req.restaurantId || 1;
}

app.get("/api/action-tasks", authMiddleware, async (req, res) => {
  try {
    const restaurantId = handsoffRestaurantId(req);

    const tasks = await prisma.actionTask.findMany({
      where: {
        restaurantId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      tasks,
    });
  } catch (error) {
    console.error("action-tasks get error:", error);

    return res.status(500).json({
      message: "Aksiyon görevleri alınamadı.",
      detail: error.message,
    });
  }
});

app.post("/api/action-tasks", authMiddleware, async (req, res) => {
  try {
    const restaurantId = handsoffRestaurantId(req);
    const body = req.body || {};

    if (!body.title || !String(body.title).trim()) {
      return res.status(400).json({
        message: "Görev başlığı zorunludur.",
      });
    }

    const task = await prisma.actionTask.create({
      data: {
        restaurantId,
        title: String(body.title).trim(),
        owner: body.owner ? String(body.owner).trim() : null,
        source: body.source ? String(body.source).trim() : "Yönetim",
        priority: body.priority ? String(body.priority).trim() : "Orta",
        status: body.status ? String(body.status).trim() : "Açık",
        dueDate: body.dueDate ? String(body.dueDate).slice(0, 10) : null,
        note: body.note ? String(body.note).trim() : null,
      },
    });

    return res.json({
      message: "Görev eklendi.",
      task,
    });
  } catch (error) {
    console.error("action-tasks post error:", error);

    return res.status(500).json({
      message: "Görev eklenemedi.",
      detail: error.message,
    });
  }
});

app.put("/api/action-tasks/:id", authMiddleware, async (req, res) => {
  try {
    const restaurantId = handsoffRestaurantId(req);
    const id = Number(req.params.id);
    const body = req.body || {};

    const existingTask = await prisma.actionTask.findFirst({
      where: {
        id,
        restaurantId,
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        message: "Görev bulunamadı.",
      });
    }

    const task = await prisma.actionTask.update({
      where: {
        id,
      },
      data: {
        title: body.title !== undefined ? String(body.title).trim() : existingTask.title,
        owner: body.owner !== undefined ? String(body.owner || "").trim() || null : existingTask.owner,
        source: body.source !== undefined ? String(body.source || "").trim() || null : existingTask.source,
        priority: body.priority !== undefined ? String(body.priority).trim() : existingTask.priority,
        status: body.status !== undefined ? String(body.status).trim() : existingTask.status,
        dueDate: body.dueDate !== undefined ? String(body.dueDate || "").slice(0, 10) || null : existingTask.dueDate,
        note: body.note !== undefined ? String(body.note || "").trim() || null : existingTask.note,
      },
    });

    return res.json({
      message: "Görev güncellendi.",
      task,
    });
  } catch (error) {
    console.error("action-tasks put error:", error);

    return res.status(500).json({
      message: "Görev güncellenemedi.",
      detail: error.message,
    });
  }
});

app.delete("/api/action-tasks/:id", authMiddleware, async (req, res) => {
  try {
    const restaurantId = handsoffRestaurantId(req);
    const id = Number(req.params.id);

    const existingTask = await prisma.actionTask.findFirst({
      where: {
        id,
        restaurantId,
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        message: "Görev bulunamadı.",
      });
    }

    await prisma.actionTask.delete({
      where: {
        id,
      },
    });

    return res.json({
      message: "Görev silindi.",
    });
  } catch (error) {
    console.error("action-tasks delete error:", error);

    return res.status(500).json({
      message: "Görev silinemedi.",
      detail: error.message,
    });
  }
});




const HANDSOFF_DAILY_CHECKLIST_SECTIONS = [
  {
    title: "Ciro ve Kasa",
    items: [
      "Günlük ciro girişi yapıldı",
      "Nakit / kart / online satış ayrımı kontrol edildi",
      "Kasa hareketleri kontrol edildi",
      "Eksik kasa çıkışı varsa işlendi",
    ],
  },
  {
    title: "Gider ve Tedarikçi",
    items: [
      "Günün giderleri işlendi",
      "Tedarikçi ödemeleri kontrol edildi",
      "Açık cari borçlar kontrol edildi",
      "Satın alma talepleri kontrol edildi",
    ],
  },
  {
    title: "Stok ve Operasyon",
    items: [
      "Düşük stok uyarıları kontrol edildi",
      "Zayi / kırılma kayıtları işlendi",
      "Mutfak eksikleri kontrol edildi",
      "Bar eksikleri kontrol edildi",
    ],
  },
  {
    title: "Kapanış",
    items: [
      "Gün sonu raporu kontrol edildi",
      "Veri yedeği alındı",
      "Ertesi gün notları yazıldı",
    ],
  },
];

function buildDailyChecklistDefaultItems() {
  const items = [];
  let sortOrder = 0;

  HANDSOFF_DAILY_CHECKLIST_SECTIONS.forEach((section) => {
    section.items.forEach((text) => {
      items.push({
        section: section.title,
        text,
        done: false,
        sortOrder,
      });

      sortOrder += 1;
    });
  });

  return items;
}

async function getOrCreateDailyChecklist(restaurantId, date) {
  let checklist = await prisma.dailyChecklist.findUnique({
    where: {
      restaurantId_date: {
        restaurantId,
        date,
      },
    },
    include: {
      items: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (checklist) {
    return checklist;
  }

  checklist = await prisma.dailyChecklist.create({
    data: {
      restaurantId,
      date,
      note: "",
      status: "OPEN",
      items: {
        create: buildDailyChecklistDefaultItems(),
      },
    },
    include: {
      items: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  return checklist;
}

app.get("/api/daily-checklists/:date", authMiddleware, async (req, res) => {
  try {
    const restaurantId = handsoffRestaurantId(req);
    const date = String(req.params.date || "").slice(0, 10);

    if (!date) {
      return res.status(400).json({
        message: "Tarih zorunludur.",
      });
    }

    const checklist = await getOrCreateDailyChecklist(restaurantId, date);

    return res.json({
      checklist,
    });
  } catch (error) {
    console.error("daily-checklists get error:", error);

    return res.status(500).json({
      message: "Günlük kontrol listesi alınamadı.",
      detail: error.message,
    });
  }
});

app.put("/api/daily-checklists/:date", authMiddleware, async (req, res) => {
  try {
    const restaurantId = handsoffRestaurantId(req);
    const date = String(req.params.date || "").slice(0, 10);
    const body = req.body || {};
    const items = Array.isArray(body.items) ? body.items : [];

    let checklist = await getOrCreateDailyChecklist(restaurantId, date);

    const updatedChecklist = await prisma.$transaction(async (tx) => {
      await tx.dailyChecklist.update({
        where: {
          id: checklist.id,
        },
        data: {
          note: body.note === undefined || body.note === null ? "" : String(body.note),
          status: body.status ? String(body.status) : "OPEN",
        },
      });

      await tx.dailyChecklistItem.deleteMany({
        where: {
          checklistId: checklist.id,
        },
      });

      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];

        await tx.dailyChecklistItem.create({
          data: {
            checklistId: checklist.id,
            section: String(item.section || "Genel"),
            text: String(item.text || ""),
            done: Boolean(item.done),
            sortOrder: Number(item.sortOrder ?? index),
          },
        });
      }

      return tx.dailyChecklist.findUnique({
        where: {
          id: checklist.id,
        },
        include: {
          items: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      });
    });

    return res.json({
      message: "Günlük kontrol listesi kaydedildi.",
      checklist: updatedChecklist,
    });
  } catch (error) {
    console.error("daily-checklists put error:", error);

    return res.status(500).json({
      message: "Günlük kontrol listesi kaydedilemedi.",
      detail: error.message,
    });
  }
});




const HANDSOFF_DEFAULT_USER_ROLES = [
  {
    fullName: "İşletme Sahibi",
    email: "owner@handsoff.local",
    role: "OWNER",
    status: "ACTIVE",
    canViewReports: true,
    canManageFinance: true,
    canManageStock: true,
    canManageSuppliers: true,
    canManageSettings: true,
  },
  {
    fullName: "Muhasebe",
    email: "accounting@handsoff.local",
    role: "ACCOUNTING",
    status: "ACTIVE",
    canViewReports: true,
    canManageFinance: true,
    canManageStock: false,
    canManageSuppliers: true,
    canManageSettings: false,
  },
  {
    fullName: "Mutfak",
    email: "kitchen@handsoff.local",
    role: "KITCHEN",
    status: "ACTIVE",
    canViewReports: false,
    canManageFinance: false,
    canManageStock: true,
    canManageSuppliers: false,
    canManageSettings: false,
  },
];

async function ensureDefaultUserRoles(restaurantId) {
  const count = await prisma.userRoleMember.count({
    where: {
      restaurantId,
    },
  });

  if (count > 0) {
    return;
  }

  for (const item of HANDSOFF_DEFAULT_USER_ROLES) {
    await prisma.userRoleMember.create({
      data: {
        restaurantId,
        ...item,
      },
    });
  }
}



// HANDSOFF_USER_ROLES_RESCUE_API

function handsoffRescueRestaurantId(req) {
  return req.user?.restaurantId || req.user?.restaurant?.id || req.restaurantId || 1;
}

const HANDSOFF_RESCUE_DEFAULT_USER_ROLES = [
  {
    fullName: "İşletme Sahibi",
    email: "owner@handsoff.local",
    role: "OWNER",
    status: "ACTIVE",
    canViewReports: true,
    canManageFinance: true,
    canManageStock: true,
    canManageSuppliers: true,
    canManageSettings: true,
  },
  {
    fullName: "Muhasebe",
    email: "accounting@handsoff.local",
    role: "ACCOUNTING",
    status: "ACTIVE",
    canViewReports: true,
    canManageFinance: true,
    canManageStock: false,
    canManageSuppliers: true,
    canManageSettings: false,
  },
  {
    fullName: "Mutfak",
    email: "kitchen@handsoff.local",
    role: "KITCHEN",
    status: "ACTIVE",
    canViewReports: false,
    canManageFinance: false,
    canManageStock: true,
    canManageSuppliers: false,
    canManageSettings: false,
  },
];

async function handsoffEnsureRescueDefaultUserRoles(restaurantId) {
  const count = await prisma.userRoleMember.count({
    where: {
      restaurantId,
    },
  });

  if (count > 0) {
    return;
  }

  for (const item of HANDSOFF_RESCUE_DEFAULT_USER_ROLES) {
    await prisma.userRoleMember.create({
      data: {
        restaurantId,
        ...item,
      },
    });
  }
}

app.get("/api/user-roles", authMiddleware, async (req, res) => {
  try {
    const restaurantId = handsoffRescueRestaurantId(req);

    await handsoffEnsureRescueDefaultUserRoles(restaurantId);

    const users = await prisma.userRoleMember.findMany({
      where: {
        restaurantId,
      },
      orderBy: {
        id: "asc",
      },
    });

    return res.json({
      users,
    });
  } catch (error) {
    console.error("user-roles rescue get error:", error);

    return res.status(500).json({
      message: "Rol listesi alınamadı.",
      detail: error.message,
    });
  }
});

app.post("/api/user-roles", authMiddleware, async (req, res) => {
  try {
    const restaurantId = handsoffRescueRestaurantId(req);
    const body = req.body || {};

    if (!body.fullName || !String(body.fullName).trim()) {
      return res.status(400).json({
        message: "Ad soyad zorunludur.",
      });
    }

    const user = await prisma.userRoleMember.create({
      data: {
        restaurantId,
        fullName: String(body.fullName).trim(),
        email: body.email ? String(body.email).trim() : null,
        role: body.role ? String(body.role).trim() : "READONLY",
        status: body.status ? String(body.status).trim() : "ACTIVE",
        canViewReports: Boolean(body.canViewReports),
        canManageFinance: Boolean(body.canManageFinance),
        canManageStock: Boolean(body.canManageStock),
        canManageSuppliers: Boolean(body.canManageSuppliers),
        canManageSettings: Boolean(body.canManageSettings),
      },
    });

    return res.json({
      message: "Kullanıcı rolü eklendi.",
      user,
    });
  } catch (error) {
    console.error("user-roles rescue post error:", error);

    return res.status(500).json({
      message: "Kullanıcı rolü eklenemedi.",
      detail: error.message,
    });
  }
});

app.put("/api/user-roles/:id", authMiddleware, async (req, res) => {
  try {
    const restaurantId = handsoffRescueRestaurantId(req);
    const id = Number(req.params.id);
    const body = req.body || {};

    const existing = await prisma.userRoleMember.findFirst({
      where: {
        id,
        restaurantId,
      },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Kullanıcı rolü bulunamadı.",
      });
    }

    const user = await prisma.userRoleMember.update({
      where: {
        id,
      },
      data: {
        fullName: body.fullName !== undefined ? String(body.fullName).trim() : existing.fullName,
        email: body.email !== undefined ? String(body.email || "").trim() || null : existing.email,
        role: body.role !== undefined ? String(body.role).trim() : existing.role,
        status: body.status !== undefined ? String(body.status).trim() : existing.status,
        canViewReports: body.canViewReports !== undefined ? Boolean(body.canViewReports) : existing.canViewReports,
        canManageFinance: body.canManageFinance !== undefined ? Boolean(body.canManageFinance) : existing.canManageFinance,
        canManageStock: body.canManageStock !== undefined ? Boolean(body.canManageStock) : existing.canManageStock,
        canManageSuppliers: body.canManageSuppliers !== undefined ? Boolean(body.canManageSuppliers) : existing.canManageSuppliers,
        canManageSettings: body.canManageSettings !== undefined ? Boolean(body.canManageSettings) : existing.canManageSettings,
      },
    });

    return res.json({
      message: "Kullanıcı rolü güncellendi.",
      user,
    });
  } catch (error) {
    console.error("user-roles rescue put error:", error);

    return res.status(500).json({
      message: "Kullanıcı rolü güncellenemedi.",
      detail: error.message,
    });
  }
});

app.delete("/api/user-roles/:id", authMiddleware, async (req, res) => {
  try {
    const restaurantId = handsoffRescueRestaurantId(req);
    const id = Number(req.params.id);

    const existing = await prisma.userRoleMember.findFirst({
      where: {
        id,
        restaurantId,
      },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Kullanıcı rolü bulunamadı.",
      });
    }

    await prisma.userRoleMember.delete({
      where: {
        id,
      },
    });

    return res.json({
      message: "Kullanıcı rolü silindi.",
    });
  } catch (error) {
    console.error("user-roles rescue delete error:", error);

    return res.status(500).json({
      message: "Kullanıcı rolü silinemedi.",
      detail: error.message,
    });
  }
});


app.get("/api/user-roles", authMiddleware, async (req, res) => {
  try {
    const restaurantId = handsoffRestaurantId(req);

    await ensureDefaultUserRoles(restaurantId);

    const users = await prisma.userRoleMember.findMany({
      where: {
        restaurantId,
      },
      orderBy: {
        id: "asc",
      },
    });

    return res.json({
      users,
    });
  } catch (error) {
    console.error("user-roles get error:", error);

    return res.status(500).json({
      message: "Kullanıcı rolleri alınamadı.",
      detail: error.message,
    });
  }
});

app.post("/api/user-roles", authMiddleware, async (req, res) => {
  try {
    const restaurantId = handsoffRestaurantId(req);
    const body = req.body || {};

    if (!body.fullName || !String(body.fullName).trim()) {
      return res.status(400).json({
        message: "Ad soyad zorunludur.",
      });
    }

    const user = await prisma.userRoleMember.create({
      data: {
        restaurantId,
        fullName: String(body.fullName).trim(),
        email: body.email ? String(body.email).trim() : null,
        role: body.role ? String(body.role).trim() : "READONLY",
        status: body.status ? String(body.status).trim() : "ACTIVE",
        canViewReports: Boolean(body.canViewReports),
        canManageFinance: Boolean(body.canManageFinance),
        canManageStock: Boolean(body.canManageStock),
        canManageSuppliers: Boolean(body.canManageSuppliers),
        canManageSettings: Boolean(body.canManageSettings),
      },
    });

    return res.json({
      message: "Kullanıcı rolü eklendi.",
      user,
    });
  } catch (error) {
    console.error("user-roles post error:", error);

    return res.status(500).json({
      message: "Kullanıcı rolü eklenemedi.",
      detail: error.message,
    });
  }
});

app.put("/api/user-roles/:id", authMiddleware, async (req, res) => {
  try {
    const restaurantId = handsoffRestaurantId(req);
    const id = Number(req.params.id);
    const body = req.body || {};

    const existing = await prisma.userRoleMember.findFirst({
      where: {
        id,
        restaurantId,
      },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Kullanıcı rolü bulunamadı.",
      });
    }

    const user = await prisma.userRoleMember.update({
      where: {
        id,
      },
      data: {
        fullName: body.fullName !== undefined ? String(body.fullName).trim() : existing.fullName,
        email: body.email !== undefined ? String(body.email || "").trim() || null : existing.email,
        role: body.role !== undefined ? String(body.role).trim() : existing.role,
        status: body.status !== undefined ? String(body.status).trim() : existing.status,
        canViewReports: body.canViewReports !== undefined ? Boolean(body.canViewReports) : existing.canViewReports,
        canManageFinance: body.canManageFinance !== undefined ? Boolean(body.canManageFinance) : existing.canManageFinance,
        canManageStock: body.canManageStock !== undefined ? Boolean(body.canManageStock) : existing.canManageStock,
        canManageSuppliers: body.canManageSuppliers !== undefined ? Boolean(body.canManageSuppliers) : existing.canManageSuppliers,
        canManageSettings: body.canManageSettings !== undefined ? Boolean(body.canManageSettings) : existing.canManageSettings,
      },
    });

    return res.json({
      message: "Kullanıcı rolü güncellendi.",
      user,
    });
  } catch (error) {
    console.error("user-roles put error:", error);

    return res.status(500).json({
      message: "Kullanıcı rolü güncellenemedi.",
      detail: error.message,
    });
  }
});

app.delete("/api/user-roles/:id", authMiddleware, async (req, res) => {
  try {
    const restaurantId = handsoffRestaurantId(req);
    const id = Number(req.params.id);

    const existing = await prisma.userRoleMember.findFirst({
      where: {
        id,
        restaurantId,
      },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Kullanıcı rolü bulunamadı.",
      });
    }

    await prisma.userRoleMember.delete({
      where: {
        id,
      },
    });

    return res.json({
      message: "Kullanıcı rolü silindi.",
    });
  } catch (error) {
    console.error("user-roles delete error:", error);

    return res.status(500).json({
      message: "Kullanıcı rolü silinemedi.",
      detail: error.message,
    });
  }
});




function handsoffRoleCan(member, permission) {
  if (!member) return false;

  if (member.status && member.status !== "ACTIVE") return false;

  if (member.role === "OWNER") return true;

  if (permission === "canManageFinance") return Boolean(member.canManageFinance);
  if (permission === "canManageStock") return Boolean(member.canManageStock);
  if (permission === "canManageSuppliers") return Boolean(member.canManageSuppliers);
  if (permission === "canManageSettings") return Boolean(member.canManageSettings);
  if (permission === "canViewReports") return Boolean(member.canViewReports);

  return false;
}

async function handsoffCurrentRoleMember(req) {
  const restaurantId = handsoffRestaurantId(req);

  const email = String(
    req.user?.email ||
    req.user?.user?.email ||
    req.userEmail ||
    ""
  ).toLowerCase();

  try {
    if (!prisma.userRoleMember) {
      return {
        role: "OWNER",
        status: "ACTIVE",
        canViewReports: true,
        canManageFinance: true,
        canManageStock: true,
        canManageSuppliers: true,
        canManageSettings: true,
      };
    }

    if (email) {
      const member = await prisma.userRoleMember.findFirst({
        where: {
          restaurantId,
          email: {
            equals: email,
          },
        },
      });

      if (member) return member;
    }

    const owner = await prisma.userRoleMember.findFirst({
      where: {
        restaurantId,
        role: "OWNER",
        status: "ACTIVE",
      },
    });

    if (owner) return owner;

    return {
      role: "OWNER",
      status: "ACTIVE",
      canViewReports: true,
      canManageFinance: true,
      canManageStock: true,
      canManageSuppliers: true,
      canManageSettings: true,
    };
  } catch (error) {
    console.error("role lookup error:", error);

    return {
      role: "OWNER",
      status: "ACTIVE",
      canViewReports: true,
      canManageFinance: true,
      canManageStock: true,
      canManageSuppliers: true,
      canManageSettings: true,
    };
  }
}

function requireHandsoffPermission(permission) {
  return async function handsoffPermissionMiddleware(req, res, next) {
    try {
      const member = await handsoffCurrentRoleMember(req);

      if (handsoffRoleCan(member, permission)) {
        req.handsoffRoleMember = member;
        return next();
      }

      return res.status(403).json({
        message: "Bu işlem için yetkiniz yok.",
        requiredPermission: permission,
        currentRole: member?.role || null,
      });
    } catch (error) {
      console.error("permission middleware error:", error);

      return res.status(500).json({
        message: "Yetki kontrolü yapılamadı.",
        detail: error.message,
      });
    }
  };
}

app.listen(PORT, () => {
  console.log(`HandsOff backend calisiyor: http://localhost:${PORT}`);
});

// HANDSOFF_BACKEND_KEEPALIVE
setInterval(() => {}, 1000 * 60 * 60);
