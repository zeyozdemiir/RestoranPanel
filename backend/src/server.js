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
      message: "Token bulunamadı.",
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
        message: "Kullanıcı veya restoran aktif değil.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Geçersiz token.",
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

app.get("/", (req, res) => {
  res.send("HandsOff Backend çalışıyor.");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "HandsOff Backend",
    message: "Backend çalışıyor.",
  });
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Mail ve şifre zorunludur.",
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
        message: "Mail veya şifre hatalı.",
      });
    }

    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({
        message: "Mail veya şifre hatalı.",
      });
    }

    const token = createToken(user);

    return res.json({
      message: "Giriş başarılı.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Sunucu hatası.",
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
    const restaurantId = req.user.restaurantId;

    const stats = await prisma.dashboardStat.findMany({
      where: {
        restaurantId,
      },
      orderBy: {
        sortOrder: "asc",
      },
      select: {
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
        title: true,
        description: true,
        status: true,
      },
    });

    return res.json({
      restaurantName: req.user.restaurant.name,
      stats,
      revenueBars,
      actions,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Dashboard verisi alınamadı.",
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
      message: "Restoranlar alınamadı.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`HandsOff backend çalışıyor: http://localhost:${PORT}`);
});
