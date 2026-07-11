const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createRestaurantAndUsers() {
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

  const demo = await prisma.restaurant.upsert({
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
      restaurantId: demo.id,
      isActive: true,
    },
    create: {
      email: "demo@restaurant.com",
      password: passwordHash,
      name: "Demo Restaurant Admin",
      role: "Restaurant Admin",
      restaurantId: demo.id,
      isActive: true,
    },
  });

  return {
    no1,
    demo,
  };
}

async function clearDashboardData(restaurantId) {
  await prisma.dashboardStat.deleteMany({
    where: {
      restaurantId,
    },
  });

  await prisma.dashboardRevenueBar.deleteMany({
    where: {
      restaurantId,
    },
  });

  await prisma.dashboardAction.deleteMany({
    where: {
      restaurantId,
    },
  });

  await prisma.dailyReport.deleteMany({
    where: {
      restaurantId,
    },
  });
}

async function seedNo1Dashboard(restaurantId) {
  await prisma.dashboardStat.createMany({
    data: [
      {
        restaurantId,
        title: "Günlük Ciro",
        value: "128.500₺",
        note: "+%18 dünle karşılaştırma",
        sortOrder: 1,
      },
      {
        restaurantId,
        title: "Rezervasyon",
        value: "64",
        note: "12 masa onay bekliyor",
        sortOrder: 2,
      },
      {
        restaurantId,
        title: "Açık Görev",
        value: "12",
        note: "4 yüksek öncelik",
        sortOrder: 3,
      },
      {
        restaurantId,
        title: "Kasa Farkı",
        value: "-150₺",
        note: "Kontrol bekliyor",
        sortOrder: 4,
      },
    ],
  });

  await prisma.dashboardRevenueBar.createMany({
    data: [
      {
        restaurantId,
        label: "Pzt",
        value: "78K",
        height: "48%",
        sortOrder: 1,
      },
      {
        restaurantId,
        label: "Sal",
        value: "92K",
        height: "58%",
        sortOrder: 2,
      },
      {
        restaurantId,
        label: "Çar",
        value: "110K",
        height: "72%",
        sortOrder: 3,
      },
      {
        restaurantId,
        label: "Per",
        value: "96K",
        height: "62%",
        sortOrder: 4,
      },
      {
        restaurantId,
        label: "Cum",
        value: "138K",
        height: "84%",
        sortOrder: 5,
      },
      {
        restaurantId,
        label: "Cmt",
        value: "164K",
        height: "100%",
        sortOrder: 6,
      },
      {
        restaurantId,
        label: "Paz",
        value: "128K",
        height: "78%",
        sortOrder: 7,
      },
    ],
  });

  await prisma.dashboardAction.createMany({
    data: [
      {
        restaurantId,
        title: "Brunch masa planı kontrolü",
        description:
          "Rezervasyon sayısı ve kişi planı servis ekibiyle eşleştirilecek.",
        status: "Devam Ediyor",
        sortOrder: 1,
      },
      {
        restaurantId,
        title: "Kritik stok kontrolü",
        description:
          "Eksik ürünler satın alma talepleriyle karşılaştırılacak.",
        status: "Aksiyon",
        sortOrder: 2,
      },
      {
        restaurantId,
        title: "Kasa kapanış hazırlığı",
        description:
          "Adisyo, POS, nakit ve online ödeme toplamları kontrol edilecek.",
        status: "Planlandı",
        sortOrder: 3,
      },
    ],
  });

  await prisma.dailyReport.createMany({
    data: [
      {
        restaurantId,
        reportDate: new Date("2026-07-03T00:00:00.000Z"),
        revenue: 128500,
        reservationCount: 64,
        openTaskCount: 12,
        cashDifference: -150,
        note: "No1 Culinaria günlük rapor kaydı.",
      },
      {
        restaurantId,
        reportDate: new Date("2026-07-04T00:00:00.000Z"),
        revenue: 150000,
        reservationCount: 72,
        openTaskCount: 8,
        cashDifference: -250,
        note: "Manuel günlük rapor girişi test edildi.",
      },
    ],
  });
}

async function seedDemoDashboard(restaurantId) {
  await prisma.dashboardStat.createMany({
    data: [
      {
        restaurantId,
        title: "Günlük Ciro",
        value: "42.300₺",
        note: "+%7 dünle karşılaştırma",
        sortOrder: 1,
      },
      {
        restaurantId,
        title: "Rezervasyon",
        value: "18",
        note: "3 masa onay bekliyor",
        sortOrder: 2,
      },
      {
        restaurantId,
        title: "Açık Görev",
        value: "5",
        note: "1 yüksek öncelik",
        sortOrder: 3,
      },
      {
        restaurantId,
        title: "Kasa Farkı",
        value: "0₺",
        note: "Kasa dengede",
        sortOrder: 4,
      },
    ],
  });

  await prisma.dashboardRevenueBar.createMany({
    data: [
      {
        restaurantId,
        label: "Pzt",
        value: "28K",
        height: "45%",
        sortOrder: 1,
      },
      {
        restaurantId,
        label: "Sal",
        value: "34K",
        height: "54%",
        sortOrder: 2,
      },
      {
        restaurantId,
        label: "Çar",
        value: "39K",
        height: "62%",
        sortOrder: 3,
      },
      {
        restaurantId,
        label: "Per",
        value: "32K",
        height: "51%",
        sortOrder: 4,
      },
      {
        restaurantId,
        label: "Cum",
        value: "48K",
        height: "76%",
        sortOrder: 5,
      },
      {
        restaurantId,
        label: "Cmt",
        value: "63K",
        height: "100%",
        sortOrder: 6,
      },
      {
        restaurantId,
        label: "Paz",
        value: "42K",
        height: "66%",
        sortOrder: 7,
      },
    ],
  });

  await prisma.dashboardAction.createMany({
    data: [
      {
        restaurantId,
        title: "Masa planı kontrolü",
        description: "Bugünkü rezervasyonlara göre masa düzeni kontrol edilecek.",
        status: "Planlandı",
        sortOrder: 1,
      },
      {
        restaurantId,
        title: "Stok kontrolü",
        description: "Kritik ürünlerin gün sonu stok seviyesi kontrol edilecek.",
        status: "Devam",
        sortOrder: 2,
      },
      {
        restaurantId,
        title: "Kasa kapanışı",
        description: "POS, nakit ve online ödeme toplamları eşleştirilecek.",
        status: "Bekliyor",
        sortOrder: 3,
      },
    ],
  });

  await prisma.dailyReport.createMany({
    data: [
      {
        restaurantId,
        reportDate: new Date("2026-07-03T00:00:00.000Z"),
        revenue: 42300,
        reservationCount: 18,
        openTaskCount: 5,
        cashDifference: 0,
        note: "Demo restoran günlük rapor kaydı.",
      },
      {
        restaurantId,
        reportDate: new Date("2026-07-04T00:00:00.000Z"),
        revenue: 52000,
        reservationCount: 21,
        openTaskCount: 4,
        cashDifference: 0,
        note: "Demo restoran ikinci günlük rapor kaydı.",
      },
    ],
  });
}

async function main() {
  const { no1, demo } = await createRestaurantAndUsers();

  await clearDashboardData(no1.id);
  await clearDashboardData(demo.id);

  await seedNo1Dashboard(no1.id);
  await seedDemoDashboard(demo.id);

  console.log("Seed tamamlandı.");
  console.log("No1 Culinaria kullanıcı: admin@handsoff.com / 123456");
  console.log("Demo kullanıcı: demo@restaurant.com / 123456");
}

main()
  .catch((error) => {
    console.error("Seed hatası:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });