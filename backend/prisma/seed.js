const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedDashboard(restaurantSlug, data) {
  const restaurant = await prisma.restaurant.findUnique({
    where: {
      slug: restaurantSlug,
    },
  });

  if (!restaurant) {
    console.log(`${restaurantSlug} restoranı bulunamadı.`);
    return;
  }

  await prisma.dashboardStat.deleteMany({
    where: {
      restaurantId: restaurant.id,
    },
  });

  await prisma.dashboardRevenueBar.deleteMany({
    where: {
      restaurantId: restaurant.id,
    },
  });

  await prisma.dashboardAction.deleteMany({
    where: {
      restaurantId: restaurant.id,
    },
  });

  await prisma.dashboardStat.createMany({
    data: data.stats.map((item, index) => ({
      restaurantId: restaurant.id,
      title: item.title,
      value: item.value,
      note: item.note,
      sortOrder: index + 1,
    })),
  });

  await prisma.dashboardRevenueBar.createMany({
    data: data.revenueBars.map((item, index) => ({
      restaurantId: restaurant.id,
      label: item.label,
      value: item.value,
      height: item.height,
      sortOrder: index + 1,
    })),
  });

  await prisma.dashboardAction.createMany({
    data: data.actions.map((item, index) => ({
      restaurantId: restaurant.id,
      title: item.title,
      description: item.description,
      status: item.status,
      sortOrder: index + 1,
    })),
  });

  console.log(`${restaurant.name} dashboard verileri eklendi.`);
}

async function main() {
  await seedDashboard("no1-culinaria", {
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
  });

  await seedDashboard("demo-restaurant", {
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
  });

  console.log("Dashboard seed tamamlandı.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
'@ | Set-Content -Encoding UTF8 .\prisma\seed-dashboard.js