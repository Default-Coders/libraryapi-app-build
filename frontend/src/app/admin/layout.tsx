"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarClock,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  Tags,
  Users,
  ShieldCheck,
  X,
} from "lucide-react";
import { clearAuthData, getUserEmail, getUserName, getUserRole } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { restoreTheme, toggleTheme } from "@/lib/theme";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Livros", href: "/admin/livros", icon: BookOpen },
  { name: "Categorias", href: "/admin/categorias", icon: Tags },
  { name: "Alunos", href: "/admin/alunos", icon: Users },
  { name: "Administradores", href: "/admin/administradores", icon: ShieldCheck },
  { name: "Reservas", href: "/admin/reservas", icon: CalendarClock },
];

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("Administrador");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    restoreTheme();
    const timer = window.setTimeout(() => {
      setUserName(getUserName() || "Administrador");
      setUserEmail(getUserEmail() || "");
      if (getUserRole() !== "ROLE_ADMIN") router.replace("/");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  async function logout() {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      clearAuthData();
      router.push("/");
    }
  }

  const navigation = (
    <nav className="mt-8 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <Image
            src="/ete-logo.png"
            alt="Logo da ETE - Escola Técnica Estadual"
            width={120}
            height={65}
            priority
            className="h-12 w-auto rounded-lg object-contain"
          />
          <span>
            <strong className="block text-sm">Biblioteca</strong>
            <small className="text-slate-500 dark:text-slate-400">
              Área administrativa
            </small>
          </span>
        </Link>
        <button
          onClick={() => setMenuOpen(false)}
          className="rounded-lg p-2 md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      {navigation}
      <div className="mt-auto rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {userName}
        </p>
        <p className="mt-1 truncate text-xs text-slate-500">{userEmail || "Gestão do acervo"}</p>
        <button
          onClick={logout}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="hidden fixed inset-y-0 md:block">{sidebar}</div>
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Fechar menu"
            className="absolute inset-0 bg-slate-950/45"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative h-full shadow-2xl">{sidebar}</div>
        </div>
      )}
      <div className="md:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 md:px-8">
          <button
            onClick={() => setMenuOpen(true)}
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden text-sm text-slate-300 md:block">
            Painel de controle
          </div>
          <button
            onClick={toggleTheme}
            aria-label="Alternar tema"
            title="Alternar tema"
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Sun className="hidden h-4 w-4 dark:block" />
            <Moon className="h-4 w-4 dark:hidden" />
          </button>
        </header>
        <main className="mx-auto w-full max-w-7xl p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
