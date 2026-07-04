const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const no1 = await prisma.restaurant.findUnique({
    where: { slug: "no1-culinaria" },
  });

  const demo = await prisma.restaurant.findUnique({
    where: { slug: "demo-restaurant" },
  });

  if (!no1 || !demo) {
    console.log("Restoranlar bulunamadı.");
    return;
  }

  await prisma.dashboardStat.deleteMany({});
  await prisma.dashboardRevenueBar.deleteMany({});
  await prisma.dashboardAction.deleteMany({});

  await prisma.dashboardStat.createMany({
    data: [
      {
        restaurantId: no1.id,
        title: "Günlük Ciro",
        value: "128.500₺",
        note: "+%18 dünle karşılaştırma",
        sortOrder: 1,
      },
      {
        restaurantId: no1.id,
        title: "Rezervasyon",
        value: "64",
        note: "12 masa onay bekliyor",
        sortOrder: 2,
      },
      {
        restaurantId: no1.id,
        title: "Açık Görev",
        value: "12",
        note: "4 yüksek öncelik",
        sortOrder: 3,
      },
      {
        restaurantId: no1.id,
        title: "Kasa Farkı",
        value: "-150₺",
        note: "Kontrol bekliyor",
        sortOrder: 4,
      },
      {
        restaurantId: demo.id,
        title: "Günlük Ciro",
        value: "42.300₺",
        note: "+%7 dünle karşılaştırma",
        sortOrder: 1,
      },
      {
        restaurantId: demo.id,
        title: "Rezervasyon",
        value: "18",
        note: "3 masa onay bekliyor",
        sortOrder: 2,
      },
      {
        restaurantId: demo.id,
        title: "Açık Görev",
        value: "5",
        note: "1 yüksek öncelik",
        sortOrder: 3,
      },
      {
        restaurantId: demo.id,
        title: "Kasa Farkı",
        value: "0₺",
        note: "Kasa dengede",
        sortOrder: 4,
      },
    ],
  });

  await prisma.dashboardRevenueBar.createMany({
    data: [
      { restaurantId: no1.id, label: "Pzt", value: "78K", height: "48%", sortOrder: 1 },
      { restaurantId: no1.id, label: "Sal", value: "92K", height: "58%", sortOrder: 2 },
      { restaurantId: no1.id, label: "Çar", value: "110K", height: "72%", sortOrder: 3 },
      { restaurantId: no1.id, label: "Per", value: "96K", height: "62%", sortOrder: 4 },
      { restaurantId: no1.id, label: "Cum", value: "138K", height: "84%", sortOrder: 5 },
      { restaurantId: no1.id, label: "Cmt", value: "164K", height: "100%", sortOrder: 6 },
      { restaurantId: no1.id, label: "Paz", value: "128K", height: "78%", sortOrder: 7 },

      { restaurantId: demo.id, label: "Pzt", value: "28K", height: "45%", sortOrder: 1 },
      { restaurantId: demo.id, label: "Sal", value: "34K", height: "54%", sortOrder: 2 },
      { restaurantId: demo.id, label: "Çar", value: "39K", height: "62%", sortOrder: 3 },
      { restaurantId: demo.id, label: "Per", value: "32K", height: "51%", sortOrder: 4 },
      { restaurantId: demo.id, label: "Cum", value: "48K", height: "76%", sortOrder: 5 },
      { restaurantId: demo.id, label: "Cmt", value: "63K", height: "100%", sortOrder: 6 },
      { restaurantId: demo.id, label: "Paz", value: "42K", height: "66%", sortOrder: 7 },
    ],
  });

  await prisma.dashboardAction.createMany({
    data: [
      {
        restaurantId: no1.id,
        title: "Brunch masa planı kontrolü",
        description: "Rezervasyon sayısı ve kişi planı servis ekibiyle eşleştirilecek.",
        status: "Devam Ediyor",
        sortOrder: 1,
      },
      {
        restaurantId: no1.id,
        title: "Kritik stok kontrolü",
        description: "Eksik ürünler satın alma talepleriyle karşılaştırılacak.",
        status: "Aksiyon",
        sortOrder: 2,
      },
      {
        restaurantId: no1.id,
        title: "Kasa kapanış hazırlığı",
        description: "Adisyo, POS, nakit ve online ödeme toplamları kontrol edilecek.",
        status: "Planlandı",
        sortOrder: 3,
      },

      {
        restaurantId: demo.id,
        title: "Masa planı kontrolü",
        description: "Bugünkü rezervasyonlara göre masa düzeni kontrol edilecek.",
        status: "Planlandı",
        sortOrder: 1,
      },
      {
        restaurantId: demo.id,
        title: "Stok kontrolü",
        description: "Kritik ürünlerin gün sonu stok seviyesi kontrol edilecek.",
        status: "Devam",
        sortOrder: 2,
      },
      {
        restaurantId: demo.id,
        title: "Kasa kapanışı",
        description: "POS, nakit ve online ödeme toplamları eşleştirilecek.",
        status: "Bekliyor",
        sortOrder: 3,
      },
    ],
  });

  console.log("Dashboard verileri başarıyla eklendi.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });