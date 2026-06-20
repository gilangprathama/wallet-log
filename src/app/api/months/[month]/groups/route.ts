import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { month: string } }
) {
  const month = decodeURIComponent(params.month);

  try {
    const body = await req.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const monthRecord = await prisma.monthRecord.upsert({
      where: { month },
      update: {},
      create: { month },
    });

    const group = await prisma.expenseGroup.create({
      data: {
        monthId: monthRecord.id,
        name: name.trim(),
      },
    });

    return NextResponse.json({ id: group.id, name: group.name, items: [] });
  } catch {
    return NextResponse.json({ error: 'Failed to create expense group' }, { status: 500 });
  }
}
