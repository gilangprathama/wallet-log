import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: { month: string; id: string } }
) {
  const { id } = params;

  try {
    const body = await req.json();
    const { name, amount, note } = body;

    const existing = await prisma.incomeSource.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Income source not found' }, { status: 404 });
    }

    const updated = await prisma.incomeSource.update({
      where: { id },
      data: {
        ...(name != null && { name: name.trim() }),
        ...(amount != null && { amount: Math.round(amount) }),
        ...(note !== undefined && { note: note?.trim() || null }),
      },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      amount: updated.amount,
      note: updated.note ?? undefined,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update income' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { month: string; id: string } }
) {
  const { id } = params;

  try {
    const existing = await prisma.incomeSource.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Income source not found' }, { status: 404 });
    }

    await prisma.incomeSource.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete income' }, { status: 500 });
  }
}
