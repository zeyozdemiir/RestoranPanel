const fs = require("fs");

const schemaPath = "./prisma/schema.prisma";
let schema = fs.readFileSync(schemaPath, "utf8");

fs.writeFileSync("./prisma/schema.before-daily-checklist-only.backup.prisma", schema, "utf8");

if (!schema.includes("model DailyChecklist")) {
  schema += `

model DailyChecklist {
  id           Int                  @id @default(autoincrement())
  restaurantId Int

  date         String
  note         String?
  status       String               @default("OPEN")

  items        DailyChecklistItem[]

  createdAt    DateTime             @default(now())
  updatedAt    DateTime             @updatedAt

  @@unique([restaurantId, date])
}
`;
}

if (!schema.includes("model DailyChecklistItem")) {
  schema += `

model DailyChecklistItem {
  id           Int            @id @default(autoincrement())
  checklistId  Int
  checklist    DailyChecklist @relation(fields: [checklistId], references: [id], onDelete: Cascade)

  section      String
  text         String
  done         Boolean        @default(false)
  sortOrder    Int            @default(0)

  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}
`;
}

fs.writeFileSync(schemaPath, schema, "utf8");

console.log("DailyChecklist modelleri eklendi.");
