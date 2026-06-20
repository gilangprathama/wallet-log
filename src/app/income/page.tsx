'use client';

import { useState } from 'react';
import { useFinanceStore, getTotalIncome } from '@/store/useFinanceStore';
import { useMonthData } from '@/hooks/useMonthData';
import MonthNavigator from '@/components/ui/MonthNavigator';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { formatIDR, formatInputNumber, parseInputNumber } from '@/lib/utils';
import { Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { IncomeSource } from '@/types/finance';

interface FormState {
  name: string;
  amount: string;
  note: string;
}

const emptyForm: FormState = { name: '', amount: '', note: '' };

export default function IncomePage() {
  const { currentMonth } = useFinanceStore();
  const { data, loading, refresh } = useMonthData(currentMonth);

  const totalIncome = getTotalIncome(data);
  const incomeSources = data?.income ?? [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEdit(src: IncomeSource) {
    setEditingId(src.id);
    setForm({ name: src.name, amount: formatInputNumber(String(src.amount)), note: src.note ?? '' });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseInputNumber(form.amount);
    if (!form.name.trim() || amount <= 0) return;

    const body = {
      name: form.name.trim(),
      amount,
      note: form.note.trim() || undefined,
    };

    if (editingId) {
      await fetch(`/api/months/${currentMonth}/income/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      await fetch(`/api/months/${currentMonth}/income`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }

    setIsModalOpen(false);
    setForm(emptyForm);
    refresh();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/months/${currentMonth}/income/${id}`, { method: 'DELETE' });
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Income</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage income sources</p>
        </div>
        <MonthNavigator />
      </div>

      {/* Action row */}
      <div className="flex justify-end">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Income
        </button>
      </div>

      {/* Income list */}
      {incomeSources.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          message="No income sources yet"
          description="Add your salary, bonuses, and other income streams"
        />
      ) : (
        <div className="space-y-3">
          {incomeSources.map((src) => (
            <div
              key={src.id}
              className="bg-midnight-surface border border-midnight-border rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-slate-100 font-medium truncate">{src.name}</p>
                {src.note && (
                  <p className="text-slate-500 text-sm mt-0.5 truncate">{src.note}</p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-green-400 font-semibold">{formatIDR(src.amount)}</span>
                <button
                  onClick={() => openEdit(src)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
                  aria-label="Edit income"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget(src.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  aria-label="Delete income"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total summary */}
      {incomeSources.length > 0 && (
        <div className="bg-midnight-surface border border-midnight-border rounded-xl p-4 flex items-center justify-between">
          <span className="text-slate-400 font-medium">Total Income</span>
          <span className="text-green-400 text-xl font-bold">{formatIDR(totalIncome)}</span>
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Income Source' : 'Add Income Source'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Gilang Salary"
              className="w-full px-3 py-2 bg-midnight-surface-2 border border-midnight-border rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Amount (IDR) <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: formatInputNumber(e.target.value) }))}
              placeholder="e.g. 22,990,000"
              className="w-full px-3 py-2 bg-midnight-surface-2 border border-midnight-border rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Note <span className="text-slate-500">(optional)</span>
            </label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Optional note"
              className="w-full px-3 py-2 bg-midnight-surface-2 border border-midnight-border rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-midnight-border text-slate-300 hover:bg-midnight-surface-2 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm font-medium"
            >
              {editingId ? 'Save Changes' : 'Add Income'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget);
          setDeleteTarget(null);
        }}
        message="Delete this income source? This cannot be undone."
      />
    </div>
  );
}
