const fs = require("fs");

const schemaPath = "./prisma/schema.prisma";
let schema = fs.readFileSync(schemaPath, "utf8");

fs.writeFileSync("./prisma/schema.before-action-task-only.backup.prisma", schema, "utf8");

function getRestaurantIdType() {
  const restaurantMatch = schema.match(/model\s+Restaurant\s+\{[\s\S]*?\n\}/);

  if (!restaurantMatch) {
    return "Int";
  }

  const restaurantModel = restaurantMatch[0];
  const idMatch = restaurantModel.match(/\n\s*id\s+([A-Za-z0-9_]+)\s+@id/);

  return idMatch ? idMatch[1] : "Int";
}

const restaurantIdType = getRestaurantIdType();

if (!schema.includes("model ActionTask")) {
  schema += `

model ActionTask {
  id           Int      @id @default(autoincrement())
  restaurantId ${restaurantIdType}

  title        String
  owner        String?
  source       String?
  priority     String   @default("Orta")
  status       String   @default("Açık")
  dueDate      String?
  note         String?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
`;
}

fs.writeFileSync(schemaPath, schema, "utf8");

console.log("ActionTask modeli eklendi.");
