'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookOpen, CalendarClock, LogOut, Menu, Moon, Sun, User, X } from 'lucide-react';
import { clearAuthData, getUserName, getUserRole } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import { restoreTheme, toggleTheme } from '@/lib/theme';

const navItems = [
  { name: 'Catálogo', href: '/aluno/dashboard', icon: BookOpen },
  { name: 'Minhas Reservas', href: '/aluno/reservas', icon: CalendarClock },
  { name: 'Meu Perfil', href: '/aluno/perfil', icon: User },
];

export default function StudentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState('Aluno');

  useEffect(() => {
    restoreTheme();
    const timer = window.setTimeout(() => {
      setUserName(getUserName() || 'Aluno');
      if (getUserRole() !== 'ROLE_STUDENT') router.replace('/');
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  async function logout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // Ignora erro no logout para limpar estado local de qualquer forma
    } finally {
      clearAuthData();
      router.push('/');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/aluno/dashboard" className="flex items-center gap-3">
            <Image
              src="/ete-logo.png"
              alt="Logo da ETE Integral"
              width={100}
              height={50}
              priority
              className="h-10 w-auto rounded-lg object-contain"
            />
            <div>
              <span className="block text-base font-bold leading-none text-slate-900 dark:text-white">
                Biblioteca Virtual
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Área do Aluno</span>
            </div>
          </Link>

          {/* Nav Desktop */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden max-w-40 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200 lg:flex">
              <User className="h-4 w-4 shrink-0" />
              <span className="truncate">{userName}</span>
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Alternar tema"
              title="Alternar tema"
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Sun className="hidden h-4 w-4 dark:block" />
              <Moon className="h-4 w-4 dark:hidden" />
            </button>

            <button
              onClick={logout}
              className="hidden items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40 md:flex"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {menuOpen && (
          <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:hidden">
            <p className="mb-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Olá, {userName}</p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                <LogOut className="h-5 w-5" />
                Sair da conta
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
