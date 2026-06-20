'use client';

import { useState } from 'react';
import { useFinanceStore, getTotalExpenses } from '@/store/useFinanceStore';
import { useMonthData } from '@/hooks/useMonthData';
import MonthNavigator from '@/components/ui/MonthNavigator';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { formatIDR, formatInputNumber, parseInputNumber } from '@/lib/utils';
import {
  Plus,
  Pencil,
  Trash2,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { ExpenseGroup, ExpenseItem } from '@/types/finance';

interface ItemFormState {
  name: string;
  price: string;
  quantity: string;
  note: string;
}

const emptyItemForm: ItemFormState = { name: '', price: '', quantity: '1', note: '' };

interface GroupModal {
  open: boolean;
  editingId: string | null;
  name: string;
}

interface ItemModal {
  open: boolean;
  groupId: string | null;
  editingId: string | null;
  form: ItemFormState;
}

interface DeleteState {
  type: 'group' | 'item' | null;
  groupId?: string;
  itemId?: string;
  itemCount?: number;
}

export default function ExpensesPage() {
  const { currentMonth } = useFinanceStore();
  const { data, loading, refresh } = useMonthData(currentMonth);

  const totalExpenses = getTotalExpenses(data);
  const expenseGroups = data?.expenseGroups ?? [];

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [groupModal, setGroupModal] = useState<GroupModal>({ open: false, editingId: null, name: '' });
  const [itemModal, setItemModal] = useState<ItemModal>({ open: false, groupId: null, editingId: null, form: emptyItemForm });
  const [deleteState, setDeleteState] = useState<DeleteState>({ type: null });

  function toggleGroup(id: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ---- Group handlers ----
  function openAddGroup() {
    setGroupModal({ open: true, editingId: null, name: '' });
  }

  function openEditGroup(group: ExpenseGroup) {
    setGroupModal({ open: true, editingId: group.id, name: group.name });
  }

  async function handleGroupSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!groupModal.name.trim()) return;

    if (groupModal.editingId) {
      await fetch(`/api/months/${currentMonth}/groups/${groupModal.editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupModal.name.trim() }),
      });
    } else {
      await fetch(`/api/months/${currentMonth}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupModal.name.trim() }),
      });
    }

    setGroupModal({ open: false, editingId: null, name: '' });
    refresh();
  }

  function tryDeleteGroup(group: ExpenseGroup) {
    setDeleteState({ type: 'group', groupId: group.id, itemCount: group.items.length });
  }

  async function handleDeleteGroup(groupId: string) {
    await fetch(`/api/months/${currentMonth}/groups/${groupId}`, { method: 'DELETE' });
    refresh();
  }

  // ---- Item handlers ----
  function openAddItem(groupId: string) {
    setItemModal({ open: true, groupId, editingId: null, form: emptyItemForm });
  }

  function openEditItem(groupId: string, item: ExpenseItem) {
    setItemModal({
      open: true,
      groupId,
      editingId: item.id,
      form: { name: item.name, price: formatInputNumber(String(item.price ?? item.amount)), quantity: String(item.quantity ?? 1), note: item.note ?? '' },
    });
  }

  async function handleItemSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { groupId, editingId, form } = itemModal;
    if (!groupId) return;
    const price = parseInputNumber(form.price);
    const quantity = Math.max(1, parseInt(form.quantity) || 1);
    if (!form.name.trim() || form.price === '') return;

    const body = {
      name: form.name.trim(),
      price,
      quantity,
      note: form.note.trim() || undefined,
    };

    if (editingId) {
      await fetch(`/api/months/${currentMonth}/groups/${groupId}/items/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      await fetch(`/api/months/${currentMonth}/groups/${groupId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }

    setItemModal({ open: false, groupId: null, editingId: null, form: emptyItemForm });
    refresh();
  }

  async function handleDeleteItem(groupId: string, itemId: string) {
    await fetch(`/api/months/${currentMonth}/groups/${groupId}/items/${itemId}`, {
      method: 'DELETE',
    });
    refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-slate-100">Expenses</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage expense groups and items</p>
        </div>
        <div className="flex-shrink-0">
          <MonthNavigator />
        </div>
      </div>

      {/* Action row */}
      <div className="flex justify-end">
        <button
          onClick={openAddGroup}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Group
        </button>
      </div>

      {/* Groups */}
      {expenseGroups.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          message="No expense groups yet"
          description="Create groups like Transport, Household, Entertainment"
        />
      ) : (
        <div className="space-y-3">
          {expenseGroups.map((group) => {
            const groupTotal = group.items.reduce((sum, item) => sum + item.amount, 0);
            const isExpanded = expandedGroups.has(group.id);

            return (
              <div
                key={group.id}
                className="bg-midnight-surface border border-midnight-border rounded-xl overflow-hidden"
              >
                {/* Group header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
                    )}
                    <span className="text-slate-100 font-semibold truncate flex-1 min-w-0">{group.name}</span>
                    <span className="text-slate-500 text-xs flex-shrink-0">
                      {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-red-400 font-semibold text-sm">{formatIDR(groupTotal)}</span>
                    <button
                      onClick={() => openEditGroup(group)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
                      aria-label="Edit group"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => tryDeleteGroup(group)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      aria-label="Delete group"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>


                {/* Expanded: items + add button */}
                {isExpanded && (
                  <div className="border-t border-midnight-border">
                    {group.items.length === 0 ? (
                      <div className="px-4 py-4 text-center text-slate-500 text-sm">
                        No items in this group
                      </div>
                    ) : (
                      <div>
                        {/* Column headers — desktop only */}
                        <div className="hidden sm:flex items-center px-4 py-2 text-xs font-medium text-slate-500 border-b border-midnight-border">
                          <span className="flex-1">Item</span>
                          <span className="w-28 text-right">Price</span>
                          <span className="w-10 text-center">Qty</span>
                          <span className="w-28 text-right">Total</span>
                          <span className="w-20" />
                        </div>
                        <div className="divide-y divide-midnight-border">
                          {group.items.map((item) => (
                            <div key={item.id} className="hover:bg-midnight-surface-2 transition-colors">
                              {/* Mobile layout */}
                              <div className="sm:hidden flex items-start gap-3 px-4 py-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-slate-200 text-sm font-medium leading-snug">{item.name}</p>
                                  {item.note && (
                                    <p className="text-slate-500 text-xs mt-0.5">{item.note}</p>
                                  )}
                                  <p className="text-slate-500 text-xs mt-1 tabular-nums">
                                    {formatIDR(item.price ?? item.amount)}
                                    {(item.quantity ?? 1) > 1 && (
                                      <span> × {item.quantity ?? 1}</span>
                                    )}
                                  </p>
                                </div>
                                <span className="text-slate-100 text-sm font-semibold tabular-nums shrink-0 pt-0.5">
                                  {formatIDR(item.amount)}
                                </span>
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <button
                                    onClick={() => openEditItem(group.id, item)}
                                    className="p-2 rounded text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
                                    aria-label="Edit item"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDeleteState({ type: 'item', groupId: group.id, itemId: item.id })
                                    }
                                    className="p-2 rounded text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                    aria-label="Delete item"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              {/* Desktop layout */}
                              <div className="hidden sm:flex items-start px-4 py-3">
                                <div className="flex-1 min-w-0 pr-3">
                                  <p className="text-slate-200 text-sm leading-snug">{item.name}</p>
                                  {item.note && (
                                    <p className="text-slate-500 text-xs mt-0.5">{item.note}</p>
                                  )}
                                </div>
                                <span className="w-28 text-slate-400 text-sm text-right tabular-nums shrink-0 pt-0.5">{formatIDR(item.price ?? item.amount)}</span>
                                <span className="w-10 text-slate-400 text-sm text-center tabular-nums shrink-0 pt-0.5">{item.quantity ?? 1}</span>
                                <span className="w-28 text-slate-100 text-sm font-semibold text-right tabular-nums shrink-0 pt-0.5">{formatIDR(item.amount)}</span>
                                <div className="w-20 flex items-center justify-end gap-1 shrink-0 pl-3">
                                  <button
                                    onClick={() => openEditItem(group.id, item)}
                                    className="p-1.5 rounded text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
                                    aria-label="Edit item"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDeleteState({ type: 'item', groupId: group.id, itemId: item.id })
                                    }
                                    className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                    aria-label="Delete item"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Add item button */}
                    <div className="px-4 py-3 bg-midnight-surface-2">
                      <button
                        onClick={() => openAddItem(group.id)}
                        className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Plus size={14} />
                        Add Item
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Total summary */}
      {expenseGroups.length > 0 && (
        <div className="bg-midnight-surface border border-midnight-border rounded-xl p-4 flex items-center justify-between">
          <span className="text-slate-400 font-medium">Total Expenses</span>
          <span className="text-red-400 text-xl font-bold">{formatIDR(totalExpenses)}</span>
        </div>
      )}

      {/* Group modal */}
      <Modal
        isOpen={groupModal.open}
        onClose={() => setGroupModal({ open: false, editingId: null, name: '' })}
        title={groupModal.editingId ? 'Edit Group' : 'Add Expense Group'}
      >
        <form onSubmit={handleGroupSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Group Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={groupModal.name}
              onChange={(e) => setGroupModal((g) => ({ ...g, name: e.target.value }))}
              placeholder="e.g. Transport, Household"
              className="w-full px-3 py-2 bg-midnight-surface-2 border border-midnight-border rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm"
              required
              autoFocus
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setGroupModal({ open: false, editingId: null, name: '' })}
              className="px-4 py-2 rounded-lg border border-midnight-border text-slate-300 hover:bg-midnight-surface-2 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm font-medium"
            >
              {groupModal.editingId ? 'Save Changes' : 'Add Group'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Item modal */}
      <Modal
        isOpen={itemModal.open}
        onClose={() => setItemModal({ open: false, groupId: null, editingId: null, form: emptyItemForm })}
        title={itemModal.editingId ? 'Edit Expense Item' : 'Add Expense Item'}
      >
        <form onSubmit={handleItemSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Item Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={itemModal.form.name}
              onChange={(e) =>
                setItemModal((m) => ({ ...m, form: { ...m.form, name: e.target.value } }))
              }
              placeholder="e.g. Toll, Grocery, Netflix"
              className="w-full px-3 py-2 bg-midnight-surface-2 border border-midnight-border rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm"
              required
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Price (IDR) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={itemModal.form.price}
                onChange={(e) =>
                  setItemModal((m) => ({ ...m, form: { ...m.form, price: formatInputNumber(e.target.value) } }))
                }
                placeholder="e.g. 110,000"
                className="w-full px-3 py-2 bg-midnight-surface-2 border border-midnight-border rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Qty
              </label>
              <input
                type="number"
                min="1"
                value={itemModal.form.quantity}
                onChange={(e) =>
                  setItemModal((m) => ({ ...m, form: { ...m.form, quantity: e.target.value } }))
                }
                className="w-full px-3 py-2 bg-midnight-surface-2 border border-midnight-border rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>
          {/* Total preview */}
          {itemModal.form.price && (
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-midnight-surface-2 text-sm">
              <span className="text-slate-500">Total</span>
              <span className="text-slate-200 font-medium tabular-nums">
                {formatIDR(parseInputNumber(itemModal.form.price) * (Math.max(1, parseInt(itemModal.form.quantity) || 1)))}
              </span>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Note <span className="text-slate-500">(optional)</span>
            </label>
            <input
              type="text"
              value={itemModal.form.note}
              onChange={(e) =>
                setItemModal((m) => ({ ...m, form: { ...m.form, note: e.target.value } }))
              }
              placeholder="Optional note"
              className="w-full px-3 py-2 bg-midnight-surface-2 border border-midnight-border rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() =>
                setItemModal({ open: false, groupId: null, editingId: null, form: emptyItemForm })
              }
              className="px-4 py-2 rounded-lg border border-midnight-border text-slate-300 hover:bg-midnight-surface-2 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm font-medium"
            >
              {itemModal.editingId ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmations */}
      <ConfirmDialog
        isOpen={deleteState.type === 'group'}
        onClose={() => setDeleteState({ type: null })}
        onConfirm={() => {
          if (deleteState.groupId) handleDeleteGroup(deleteState.groupId);
          setDeleteState({ type: null });
        }}
        message={
          deleteState.itemCount && deleteState.itemCount > 0 ? (
            <span>
              This group contains{' '}
              <span className="font-semibold text-white">{deleteState.itemCount} item{deleteState.itemCount !== 1 ? 's' : ''}</span>.
              Deleting it will permanently remove all items inside.{' '}
              <span className="text-red-400">This cannot be undone.</span>
            </span>
          ) : 'Delete this expense group? This cannot be undone.'
        }
      />
      <ConfirmDialog
        isOpen={deleteState.type === 'item'}
        onClose={() => setDeleteState({ type: null })}
        onConfirm={() => {
          if (deleteState.groupId && deleteState.itemId)
            handleDeleteItem(deleteState.groupId, deleteState.itemId);
          setDeleteState({ type: null });
        }}
        message="Delete this expense item? This cannot be undone."
      />
    </div>
  );
}
