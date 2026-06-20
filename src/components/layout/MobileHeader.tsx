'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Wallet, LayoutDashboard, TrendingUp, ShoppingCart, BarChart3 } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Income', href: '/income', icon: TrendingUp },
  { label: 'Expenses', href: '/expenses', icon: ShoppingCart },
  { label: 'Statistics', href: '/statistics', icon: BarChart3 },
];

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="lg:hidden sticky top-0 z-30 bg-midnight-surface border-b border-midnight-border">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20">
              <Wallet size={16} className="text-blue-400" />
            </div>
            <span className="text-slate-100 font-bold text-base">WalletLog</span>
          </Link>
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-midnight-surface-2 transition-colors"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Dropdown nav — slides from top */}
        {isOpen && (
          <div className="border-t border-midnight-border bg-midnight-surface">
            <nav className="grid grid-cols-4 gap-1 px-2 py-3">
              {navItems.map(({ label, href, icon: Icon }) => {
                const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl text-center transition-colors ${
                      isActive
                        ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-midnight-surface-2'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-xs font-medium">{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
