'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wallet,
  LayoutDashboard,
  TrendingUp,
  ShoppingCart,
  BarChart3,
} from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatMonth } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Income', href: '/income', icon: TrendingUp },
  { label: 'Expenses', href: '/expenses', icon: ShoppingCart },
  { label: 'Statistics', href: '/statistics', icon: BarChart3 },
];

interface SidebarProps {
  onNavClick?: () => void;
}

export default function Sidebar({ onNavClick }: SidebarProps) {
  const pathname = usePathname();
  const currentMonth = useFinanceStore((s) => s.currentMonth);

  return (
    <div className="flex flex-col h-full bg-midnight-surface border-r border-midnight-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-midnight-border">
        <div className="p-2 rounded-lg bg-blue-500/20">
          <Wallet size={20} className="text-blue-400" />
        </div>
        <span className="text-slate-100 font-bold text-lg tracking-tight">WalletLog</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-midnight-surface-2'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-midnight-border">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current Month</p>
        <p className="text-sm font-medium text-slate-300">{formatMonth(currentMonth)}</p>
      </div>
    </div>
  );
}
