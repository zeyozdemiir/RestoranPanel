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

function getDashboardSummary(user) {
  if (user.restaurant.slug === "no1-culinaria") {
    return {
      restaurantName: user.restaurant.name,
      stats: [
        {
          title: "Günlük Ciro",
          value: "128.500₺",
          note: "+%18 dünle karşılaştırma",
        },
        {
          title: "Rezervasyon",
          value: "64",
          note: "12 masa onay bekliyor",
        },
        {
          title: "Açık Görev",
          value: "12",
          note: "4 yüksek öncelik",
        },
        {
          title: "Kasa Farkı",
          value: "-150₺",
          note: "Kontrol bekliyor",
        },
      ],
      revenueBars: [
        { label: "Pzt", value: "78K", height: "48%" },
        { label: "Sal", value: "92K", height: "58%" },
        { label: "Çar", value: "110K", height: "72%" },
        { label: "Per", value: "96K", height: "62%" },
        { label: "Cum", value: "138K", height: "84%" },
        { label: "Cmt", value: "164K", height: "100%" },
        { label: "Paz", value: "128K", height: "78%" },
      ],
      actions: [
        {
          title: "Brunch masa planı kontrolü",
          description:
            "Rezervasyon sayısı ve kişi planı servis ekibiyle eşleştirilecek.",
          status: "Devam Ediyor",
        },
        {
          title: "Kritik stok kontrolü",
          description:
            "Eksik ürünler satın alma talepleriyle karşılaştırılacak.",
          status: "Aksiyon",
        },
        {
          title: "Kasa kapanış hazırlığı",
          description:
            "Adisyo, POS, nakit ve online ödeme toplamları kontrol edilecek.",
          status: "Planlandı",
        },
      ],
    };
  }

  return {
    restaurantName: user.restaurant.name,
    stats: [
      {
        title: "Günlük Ciro",
        value: "42.300₺",
        note: "+%7 dünle karşılaştırma",
      },
      {
        title: "Rezervasyon",
        value: "18",
        note: "3 masa onay bekliyor",
      },
      {
        title: "Açık Görev",
        value: "5",
        note: "1 yüksek öncelik",
      },
      {
        title: "Kasa Farkı",
        value: "0₺",
        note: "Kasa dengede",
      },
    ],
    revenueBars: [
      { label: "Pzt", value: "28K", height: "45%" },
      { label: "Sal", value: "34K", height: "54%" },
      { label: "Çar", value: "39K", height: "62%" },
      { label: "Per", value: "32K", height: "51%" },
      { label: "Cum", value: "48K", height: "76%" },
      { label: "Cmt", value: "63K", height: "100%" },
      { label: "Paz", value: "42K", height: "66%" },
    ],
    actions: [
      {
        title: "Masa planı kontrolü",
        description: "Bugünkü rezervasyonlara göre masa düzeni kontrol edilecek.",
        status: "Planlandı",
      },
      {
        title: "Stok kontrolü",
        description: "Kritik ürünlerin gün sonu stok seviyesi kontrol edilecek.",
        status: "Devam",
      },
      {
        title: "Kasa kapanışı",
        description: "POS, nakit ve online ödeme toplamları eşleştirilecek.",
        status: "Bekliyor",
      },
    ],
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

app.get("/api/dashboard/summary", authMiddleware, (req, res) => {
  return res.json(getDashboardSummary(req.user));
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
