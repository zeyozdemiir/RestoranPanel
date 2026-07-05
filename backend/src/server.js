const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
  } catch (error) {
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

  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 0,
  }).format(number) + "\u20ba";
}

function formatShortMoney(value) {
  const number = Number(value || 0);

  if (number >= 1000) {
    return Math.round(number / 1000) + "K";
  }

  return String(number);
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
        title: "G\u00fcnl\u00fck Ciro",
        value: formatMoney(latestReport.revenue),
        note: `Son rapor tarihi: ${formatDateTR(latestReport.reportDate)}`,
      },
      {
        id: "daily-reservation",
        title: "Rezervasyon",
        value: String(latestReport.reservationCount),
        note: "Son kaydedilen g\u00fcnl\u00fck rapordan alindi",
      },
      {
        id: "daily-open-task",
        title: "A\u00e7\u0131k G\u00f6rev",
        value: String(latestReport.openTaskCount),
        note: "Operasyon kaydindan alindi",
      },
      {
        id: "daily-cash-difference",
        title: "Kasa Fark\u0131",
        value: formatMoney(latestReport.cashDifference),
        note: latestReport.cashDifference === 0 ? "Kasa dengede" : "Kontrol edilmeli",
      },
    ],
    revenueBars,
    actions: [
      {
        id: "daily-report-note",
        title: "G\u00fcnl\u00fck rapor notu",
        description: latestReport.note || "Bu g\u00fcn i\u00e7in not girilmemi\u015f.",
        status: "Rapor",
      },
      {
        id: "daily-report-check",
        title: "Rapor kontrol\u00fc",
        description: "Ciro, rezervasyon, g\u00f6rev ve kasa fark\u0131 g\u00fcnl\u00fck rapordan hesaplan\u0131yor.",
        status: "Canl\u0131",
      },
    ],
  };
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

app.put("/api/dashboard/stats/:id", authMiddleware, async (req, res) => {
  try {
    const statId = Number(req.params.id);

    if (!statId) {
      return res.status(400).json({
        message: "Gecersiz kart ID.",
      });
    }

    const { title, value, note } = req.body;

    const existingStat = await prisma.dashboardStat.findFirst({
      where: {
        id: statId,
        restaurantId: req.user.restaurantId,
      },
    });

    if (!existingStat) {
      return res.status(404).json({
        message: "Dashboard karti bulunamadi.",
      });
    }

    const updatedStat = await prisma.dashboardStat.update({
      where: {
        id: statId,
      },
      data: {
        title: title ?? existingStat.title,
        value: value ?? existingStat.value,
        note: note ?? existingStat.note,
      },
      select: {
        id: true,
        title: true,
        value: true,
        note: true,
      },
    });

    return res.json({
      message: "Dashboard karti guncellendi.",
      stat: updatedStat,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Dashboard karti guncellenemedi.",
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
