const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const no1 = await prisma.restaurant.upsert({
    where: {
      slug: "no1-culinaria",
    },
    update: {
      name: "No1 Culinaria",
      plan: "Enterprise",
      isActive: true,
    },
    create: {
      name: "No1 Culinaria",
      slug: "no1-culinaria",
      plan: "Enterprise",
      isActive: true,
    },
  });

  const demoRestaurant = await prisma.restaurant.upsert({
    where: {
      slug: "demo-restaurant",
    },
    update: {
      name: "Demo Restaurant",
      plan: "Pro",
      isActive: true,
    },
    create: {
      name: "Demo Restaurant",
      slug: "demo-restaurant",
      plan: "Pro",
      isActive: true,
    },
  });

  const passwordHash = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: {
      email: "admin@handsoff.com",
    },
    update: {
      password: passwordHash,
      name: "HandsOff Admin",
      role: "Super Admin",
      restaurantId: no1.id,
      isActive: true,
    },
    create: {
      email: "admin@handsoff.com",
      password: passwordHash,
      name: "HandsOff Admin",
      role: "Super Admin",
      restaurantId: no1.id,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: {
      email: "demo@restaurant.com",
    },
    update: {
      password: passwordHash,
      name: "Demo Restaurant Admin",
      role: "Restaurant Admin",
      restaurantId: demoRestaurant.id,
      isActive: true,
    },
    create: {
      email: "demo@restaurant.com",
      password: passwordHash,
      name: "Demo Restaurant Admin",
      role: "Restaurant Admin",
      restaurantId: demoRestaurant.id,
      isActive: true,
    },
  });

  console.log("Demo restoranlar ve kullanıcılar başarıyla eklendi.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
