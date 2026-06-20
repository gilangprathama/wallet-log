import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { month: string } }
) {
  const month = decodeURIComponent(params.month);

  try {
    const record = await prisma.monthRecord.upsert({
      where: { month },
      update: {},
      create: { month },
      include: {
        income: { orderBy: { createdAt: 'asc' } },
        expenseGroups: {
          orderBy: { createdAt: 'asc' },
          include: { items: { orderBy: { createdAt: 'desc' } } },
        },
      },
    });

    // Map to match the MonthRecord TypeScript type
    return NextResponse.json({
      month: record.month,
      income: record.income.map((s) => ({
        id: s.id,
        name: s.name,
        amount: s.amount,
        note: s.note ?? undefined,
      })),
      expenseGroups: record.expenseGroups.map((g) => ({
        id: g.id,
        name: g.name,
        items: g.items.map((item) => ({
          id: item.id,
          groupId: item.groupId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          amount: item.amount,
          note: item.note ?? undefined,
        })),
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch month record' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { month: string } }
) {
  const month = decodeURIComponent(params.month);
  try {
    await prisma.monthRecord.deleteMany({ where: { month } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete month' }, { status: 500 });
  }
}
