const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("MODEL KONTROLÜ:");
  console.log({
    restaurant: Boolean(prisma.restaurant),
    user: Boolean(prisma.user),
    dashboardStat: Boolean(prisma.dashboardStat),
    dashboardRevenueBar: Boolean(prisma.dashboardRevenueBar),
    dashboardAction: Boolean(prisma.dashboardAction),
  });

  if (!prisma.dashboardStat || !prisma.dashboardRevenueBar || !prisma.dashboardAction) {
    console.log("SORUN: Prisma dashboard modellerini görmüyor. Prisma generate tekrar yapılmalı.");
    return;
  }

  const restaurants = await prisma.restaurant.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          users: true,
          dashboardStats: true,
          dashboardRevenueBars: true,
          dashboardActions: true,
        },
      },
    },
  });

  console.log("VERİTABANI KONTROLÜ:");
  console.log(JSON.stringify(restaurants, null, 2));
}

main()
  .catch((error) => {
    console.error("KONTROL HATASI:");
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
