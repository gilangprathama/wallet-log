import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { month: string } }
) {
  const month = decodeURIComponent(params.month);

  try {
    const body = await req.json();
    const { name, amount, note } = body;

    if (!name?.trim() || amount == null) {
      return NextResponse.json({ error: 'name and amount are required' }, { status: 400 });
    }

    const monthRecord = await prisma.monthRecord.upsert({
      where: { month },
      update: {},
      create: { month },
    });

    const income = await prisma.incomeSource.create({
      data: {
        monthId: monthRecord.id,
        name: name.trim(),
        amount: Math.round(amount),
        note: note?.trim() || null,
      },
    });

    return NextResponse.json({
      id: income.id,
      name: income.name,
      amount: income.amount,
      note: income.note ?? undefined,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to create income' }, { status: 500 });
  }
}
