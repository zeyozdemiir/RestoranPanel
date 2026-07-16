const fs = require("fs");

const schemaPath = "./prisma/schema.prisma";
const serverPath = "./src/server.js";

function addLineToSpecificModel(text, modelName, line) {
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

let schema = fs.readFileSync(schemaPath, "utf8");

schema = addLineToSpecificModel(
  schema,
  "Restaurant",
  "purchaseOrders       PurchaseOrder[]"
);

schema = addLineToSpecificModel(
  schema,
  "Supplier",
  "purchaseOrders       PurchaseOrder[]"
);

fs.writeFileSync(schemaPath, schema, "utf8");

let server = fs.readFileSync(serverPath, "utf8");

// Backend mesajlarını talep diline çevir
server = server.replaceAll("Satın alma kaydı oluşturuldu.", "Satın alma talebi oluşturuldu.");
server = server.replaceAll("Satın alma kaydı oluşturulamadı.", "Satın alma talebi oluşturulamadı.");
server = server.replaceAll("Satın alma kayıtları alınamadı.", "Satın alma talepleri alınamadı.");
server = server.replaceAll("Satın alma kaydı güncellendi.", "Satın alma talebi güncellendi.");
server = server.replaceAll("Satın alma kaydı güncellenemedi.", "Satın alma talebi güncellenemedi.");
server = server.replaceAll("Satın alma kaydı bulunamadı.", "Satın alma talebi bulunamadı.");

// Hata sebebini response içinde de göster ki tekrar kör gitmeyelim
server = server.replace(
  `return res.status(500).json({
      message: "Satın alma talebi oluşturulamadı.",
    });`,
  `return res.status(500).json({
      message: "Satın alma talebi oluşturulamadı.",
      detail: error.message,
    });`
);

server = server.replace(
  `return res.status(500).json({
      message: "Satın alma talebi güncellenemedi.",
    });`,
  `return res.status(500).json({
      message: "Satın alma talebi güncellenemedi.",
      detail: error.message,
    });`
);

fs.writeFileSync(serverPath, server, "utf8");

console.log("Satın alma talebi backend dili ve ilişki modeli düzeltildi.");
