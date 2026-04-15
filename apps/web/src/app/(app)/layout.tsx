'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { useAuthStore } from '@/store/auth-store';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { token, isHydrated, hydrate } = useAuthStore();
  const router = useRouter();

  useEffect(() => { hydrate(); }, []);

  useEffect(() => {
    if (isHydrated && !token) router.replace('/login');
  }, [isHydrated, token]);

  if (!isHydrated || !token) {
    return (
      <div className="min-h-screen bg-brand-sidebar flex items-center justify-center">
        <div className="text-white text-sm animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
