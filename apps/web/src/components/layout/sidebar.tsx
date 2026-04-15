'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard',      label: 'Dashboard',            icon: '▦' },
  { href: '/kpis',           label: 'Gestão de KPIs',       icon: '⊞' },
  { href: '/input-mensal',   label: 'Input Mensal',         icon: '✎' },
  { href: '/performance',    label: 'Performance',          icon: '◈' },
  { href: '/planos-acao',    label: 'Planos de Ação',       icon: '◉' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-brand-sidebar flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-green rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Fits Ops OS</p>
            <p className="text-gray-500 text-xs mt-0.5">Fitbank Operações</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-brand-green text-white font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{user?.email?.[0]?.toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.email}</p>
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded font-medium',
              user?.role === 'ADMIN' ? 'bg-brand-green text-white' : 'bg-gray-700 text-gray-300'
            )}>
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={clearAuth}
          className="w-full text-left text-gray-500 hover:text-white text-xs transition-colors py-1"
        >
          Sair do sistema →
        </button>
      </div>
    </aside>
  );
}
