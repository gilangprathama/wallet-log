import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { month: string; groupId: string } }
) {
  const { groupId } = params;

  try {
    const body = await req.json();
    const { name, price, quantity, note } = body;

    if (!name?.trim() || price == null) {
      return NextResponse.json({ error: 'name and price are required' }, { status: 400 });
    }

    const group = await prisma.expenseGroup.findUnique({ where: { id: groupId } });
    if (!group) {
      return NextResponse.json({ error: 'Expense group not found' }, { status: 404 });
    }

    const p = Math.round(price);
    const q = Math.max(1, Math.round(quantity ?? 1));

    const item = await prisma.expenseItem.create({
      data: {
        groupId,
        name: name.trim(),
        price: p,
        quantity: q,
        amount: p * q,
        note: note?.trim() || null,
      },
    });

    return NextResponse.json({
      id: item.id,
      groupId: item.groupId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      amount: item.amount,
      note: item.note ?? undefined,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to create expense item' }, { status: 500 });
  }
}
