const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();
const PORT = 4000;
const JWT_SECRET = "handsoff_secret_key";

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

const demoUsers = [
  {
    id: 1,
    email: "admin@handsoff.com",
    password: "123456",
    name: "HandsOff Admin",
    role: "Super Admin",
    restaurantId: 1,
    restaurantName: "No1 Culinaria",
    plan: "Enterprise",
  },
  {
    id: 2,
    email: "demo@restaurant.com",
    password: "123456",
    name: "Demo Restaurant Admin",
    role: "Restaurant Admin",
    restaurantId: 2,
    restaurantName: "Demo Restaurant",
    plan: "Pro",
  },
];

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

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token bulunamadı.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = demoUsers.find((item) => item.id === decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "Kullanıcı bulunamadı.",
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

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Mail ve şifre zorunludur.",
    });
  }

  const user = demoUsers.find(
    (item) => item.email.toLowerCase() === email.toLowerCase().trim()
  );

  if (!user) {
    return res.status(401).json({
      message: "Mail veya şifre hatalı.",
    });
  }

  if (password !== user.password) {
    return res.status(401).json({
      message: "Mail veya şifre hatalı.",
    });
  }

  const token = createToken(user);

  return res.json({
    message: "Giriş başarılı.",
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      restaurantId: user.restaurantId,
      restaurantName: user.restaurantName,
      plan: user.plan,
    },
  });
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  const user = req.user;

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      restaurantId: user.restaurantId,
      restaurantName: user.restaurantName,
      plan: user.plan,
    },
  });
});

app.listen(PORT, () => {
  console.log(`HandsOff backend çalışıyor: http://localhost:${PORT}`);
});
