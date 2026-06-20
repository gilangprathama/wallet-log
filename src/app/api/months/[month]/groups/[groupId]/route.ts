import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: { month: string; groupId: string } }
) {
  const { groupId } = params;

  try {
    const body = await req.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const existing = await prisma.expenseGroup.findUnique({ where: { id: groupId } });
    if (!existing) {
      return NextResponse.json({ error: 'Expense group not found' }, { status: 404 });
    }

    const updated = await prisma.expenseGroup.update({
      where: { id: groupId },
      data: { name: name.trim() },
    });

    return NextResponse.json({ id: updated.id, name: updated.name });
  } catch {
    return NextResponse.json({ error: 'Failed to update expense group' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { month: string; groupId: string } }
) {
  const { groupId } = params;

  try {
    const existing = await prisma.expenseGroup.findUnique({ where: { id: groupId } });
    if (!existing) {
      return NextResponse.json({ error: 'Expense group not found' }, { status: 404 });
    }

    // Cascade deletes items via schema onDelete: Cascade
    await prisma.expenseGroup.delete({ where: { id: groupId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete expense group' }, { status: 500 });
  }
}
