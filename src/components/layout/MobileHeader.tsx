'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Wallet } from 'lucide-react';
import Sidebar from './Sidebar';

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Top bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-midnight-surface border-b border-midnight-border sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/20">
            <Wallet size={16} className="text-blue-400" />
          </div>
          <span className="text-slate-100 font-bold text-base">WalletLog</span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-midnight-surface-2 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Drawer overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          {/* Drawer panel */}
          <div className="relative z-10 w-64 flex flex-col">
            {/* Close button */}
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-midnight-surface-2 transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <Sidebar onNavClick={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
