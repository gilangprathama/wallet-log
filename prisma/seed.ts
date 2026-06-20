import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const month = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  // Upsert month record
  const monthRecord = await prisma.monthRecord.upsert({
    where: { month },
    update: {},
    create: { month },
  });

  // Idempotent: delete existing income + groups for this month then recreate
  await prisma.incomeSource.deleteMany({ where: { monthId: monthRecord.id } });
  await prisma.expenseGroup.deleteMany({ where: { monthId: monthRecord.id } });

  // Income
  await prisma.incomeSource.createMany({
    data: [
      { monthId: monthRecord.id, name: 'Gilang Salary', amount: 22990000 },
      { monthId: monthRecord.id, name: 'Ratih Salary', amount: 17200000 },
    ],
  });

  // Expense groups with items
  const groupsData = [
    {
      name: 'Personal (Gilang)',
      items: [{ name: 'Jajan Gilang', amount: 1500000 }],
    },
    {
      name: 'Personal (Ratih)',
      items: [{ name: 'Jajan Ratih', amount: 1500000 }],
    },
    {
      name: 'Household Needs',
      items: [
        { name: 'KPR', amount: 11201000 },
        { name: 'Belanja bulanan', amount: 1500000 },
        { name: 'Lauk mingguan', amount: 750000 },
        { name: 'Listrik', amount: 700000 },
        { name: 'Internet', amount: 350000 },
        { name: 'Gas', amount: 110000 },
        { name: 'Aqua', amount: 80000 },
        { name: 'IPL', amount: 300000 },
        { name: 'Pulsa', amount: 250000 },
        { name: 'PBB', amount: 88349 },
        { name: 'Tukang', amount: 150000 },
        { name: 'Kucing', amount: 2050000 },
      ],
    },
    {
      name: 'Transport',
      items: [
        { name: 'Toll', amount: 748000 },
        { name: 'Mobil Listrik (Cicilan)', amount: 7629350 },
        { name: 'Mobil Listrik (Listrik)', amount: 400000 },
        { name: 'Public transport', amount: 480000 },
      ],
    },
    {
      name: 'Credit Card',
      items: [{ name: 'Credit Card', amount: 3270000 }],
    },
    {
      name: 'KTA',
      items: [{ name: 'KTA', amount: 4000275 }],
    },
    {
      name: 'Family (Mama)',
      items: [{ name: 'Family (Mama)', amount: 1000000 }],
    },
    {
      name: 'Family (Permata)',
      items: [{ name: 'Family (Permata)', amount: 1000000 }],
    },
  ];

  for (const groupData of groupsData) {
    const group = await prisma.expenseGroup.create({
      data: { monthId: monthRecord.id, name: groupData.name },
    });
    await prisma.expenseItem.createMany({
      data: groupData.items.map((item) => ({ ...item, groupId: group.id })),
    });
  }

  console.log(`Seeded month ${month} successfully.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
