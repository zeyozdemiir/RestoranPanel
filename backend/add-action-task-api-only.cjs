const fs = require("fs");

const serverPath = "./src/server.js";
let server = fs.readFileSync(serverPath, "utf8");

fs.writeFileSync("./src/server.before-action-task-only.backup.js", server, "utf8");

if (!server.includes('app.get("/api/action-tasks"')) {
  const insertBefore = server.includes("app.listen(PORT") ? "app.listen(PORT" : null;

  if (!insertBefore) {
    throw new Error("server.js içinde app.listen(PORT bulunamadı.");
  }

  const api = `

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

`;

  server = server.replace(insertBefore, api + "\n" + insertBefore);
}

server = server.replace(
  /^\s*process\.exit\([^)]*\);?\s*$/gm,
  "// process.exit dev ortamında kapatıldı"
);

if (!server.includes("HANDSOFF_BACKEND_KEEPALIVE")) {
  server += `

// HANDSOFF_BACKEND_KEEPALIVE
setInterval(() => {}, 1000 * 60 * 60);
`;
}

fs.writeFileSync(serverPath, server, "utf8");

console.log("ActionTask API eklendi.");
