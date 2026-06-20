import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const months = await prisma.monthRecord.findMany({
      include: {
        income: true,
        expenseGroups: { include: { items: true } },
      },
      orderBy: { month: 'desc' },
    });

    const result = months.map((m) => {
      const totalIncome = m.income.reduce((sum, s) => sum + s.amount, 0);
      const totalExpenses = m.expenseGroups.reduce(
        (sum, g) => sum + g.items.reduce((gs, item) => gs + item.amount, 0),
        0
      );
      return { month: m.month, totalIncome, totalExpenses };
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch months' }, { status: 500 });
  }
}
