import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: { month: string; groupId: string; id: string } }
) {
  const { id } = params;

  try {
    const body = await req.json();
    const { name, price, quantity, note } = body;

    const existing = await prisma.expenseItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Expense item not found' }, { status: 404 });
    }

    const p = price != null ? Math.round(price) : existing.price;
    const q = quantity != null ? Math.max(1, Math.round(quantity)) : existing.quantity;

    const updated = await prisma.expenseItem.update({
      where: { id },
      data: {
        ...(name != null && { name: name.trim() }),
        price: p,
        quantity: q,
        amount: p * q,
        ...(note !== undefined && { note: note?.trim() || null }),
      },
    });

    return NextResponse.json({
      id: updated.id,
      groupId: updated.groupId,
      name: updated.name,
      price: updated.price,
      quantity: updated.quantity,
      amount: updated.amount,
      note: updated.note ?? undefined,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update expense item' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { month: string; groupId: string; id: string } }
) {
  const { id } = params;

  try {
    const existing = await prisma.expenseItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Expense item not found' }, { status: 404 });
    }

    await prisma.expenseItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete expense item' }, { status: 500 });
  }
}
