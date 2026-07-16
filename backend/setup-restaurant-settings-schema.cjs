const fs = require("fs");

const schemaPath = "./prisma/schema.prisma";
let schema = fs.readFileSync(schemaPath, "utf8");

if (!schema.includes("model RestaurantSetting")) {
  const restaurantModelMatch = schema.match(/model\s+Restaurant\s+\{[\s\S]*?\n\}/);

  if (!restaurantModelMatch) {
    throw new Error("schema.prisma içinde Restaurant modeli bulunamadı.");
  }

  const restaurantModel = restaurantModelMatch[0];
  const idTypeMatch = restaurantModel.match(/\n\s*id\s+([A-Za-z0-9_]+)\s+@id/);
  const restaurantIdType = idTypeMatch ? idTypeMatch[1] : "Int";

  if (!restaurantModel.includes("restaurantSetting")) {
    const updatedRestaurantModel = restaurantModel.replace(
      /model\s+Restaurant\s+\{\n/,
      "model Restaurant {\n  restaurantSetting RestaurantSetting?\n"
    );

    schema = schema.replace(restaurantModel, updatedRestaurantModel);
  }

  const model = `

model RestaurantSetting {
  id                     Int      @id @default(autoincrement())
  restaurantId           ${restaurantIdType}   @unique
  restaurant             Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  restaurantName         String?
  phone                  String?
  email                  String?
  address                String?
  taxOffice              String?
  taxNumber              String?
  mersisNo               String?
  currency               String   @default("TRY")

  minStockWarningEnabled Boolean  @default(true)
  minStockWarningLevel   Float?
  backupNote             String?
  usageNotes             String?

  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
}
`;

  schema = schema.trimEnd() + model + "\n";
}

fs.writeFileSync(schemaPath, schema, "utf8");

console.log("RestaurantSetting modeli schema.prisma içine eklendi.");
