import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { month: string } }
) {
  const month = decodeURIComponent(params.month);
  const { from } = await req.json() as { from: string };

  try {
    const sourceRecord = await prisma.monthRecord.findUnique({
      where: { month: from },
      include: {
        income: true,
        expenseGroups: {
          include: { items: true },
        },
      },
    });

    if (!sourceRecord) {
      return NextResponse.json({ error: 'Source month not found' }, { status: 404 });
    }

    const targetRecord = await prisma.monthRecord.upsert({
      where: { month },
      update: {},
      create: { month },
    });

    // Copy expense groups one by one so items get the correct new groupId
    for (const group of sourceRecord.expenseGroups) {
      await prisma.expenseGroup.create({
        data: {
          monthId: targetRecord.id,
          name: group.name,
          items: {
            create: group.items.map((item) => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              amount: item.amount,
              note: item.note,
            })),
          },
        },
      });
    }

    await prisma.incomeSource.createMany({
      data: sourceRecord.income.map((inc) => ({
        monthId: targetRecord.id,
        name: inc.name,
        amount: inc.amount,
        note: inc.note,
      })),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to copy month' }, { status: 500 });
  }
}
