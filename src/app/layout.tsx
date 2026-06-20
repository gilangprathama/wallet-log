import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import MobileHeader from '@/components/layout/MobileHeader';

export const metadata: Metadata = {
  title: 'WalletLog — Family Finance Tracker',
  description: 'Track your family income and expenses by month',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="flex h-[100dvh] overflow-hidden">
          {/* Desktop sidebar */}
          <aside className="hidden lg:flex lg:w-60 xl:w-64 flex-shrink-0 flex-col">
            <Sidebar />
          </aside>

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Mobile header */}
            <MobileHeader />

            {/* Page content */}
            <main className="flex-1 overflow-y-auto bg-midnight p-4 lg:p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
