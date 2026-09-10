'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, CalendarClock, Clock, Layers, Users, ArrowRight } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Stats {
  totalBooks: number;
  totalStudents: number;
  totalCategories: number;
  activeReservations: number;
  waitingListCount: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    totalStudents: 0,
    totalCategories: 0,
    activeReservations: 0,
    waitingListCount: 0,
  });
  const [loading, setLoading] = useState(true);

  async function loadDashboardStats() {
    try {
      setLoading(true);
      const [books, students, categories, reservations, waitingList] = await Promise.all([
        apiFetch<unknown[]>('/books').catch(() => []),
        apiFetch<unknown[]>('/students').catch(() => []),
        apiFetch<unknown[]>('/categories').catch(() => []),
        apiFetch<unknown[]>('/reservations').catch(() => []),
        apiFetch<unknown[]>('/waiting-list').catch(() => []),
      ]);

      setStats({
        totalBooks: books.length,
        totalStudents: students.length,
        totalCategories: categories.length,
        activeReservations: reservations.length,
        waitingListCount: waitingList.length,
      });
    } catch (err) {
      console.error('Erro ao carregar métricas do dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDashboardStats();
  }, []);

  const cards = [
    {
      label: 'Livros no Acervo',
      value: stats.totalBooks,
      href: '/admin/livros',
      icon: BookOpen,
      color: 'bg-blue-600',
    },
    {
      label: 'Alunos Cadastrados',
      value: stats.totalStudents,
      href: '/admin/alunos',
      icon: Users,
      color: 'bg-purple-600',
    },
    {
      label: 'Categorias Ativas',
      value: stats.totalCategories,
      href: '/admin/categorias',
      icon: Layers,
      color: 'bg-indigo-600',
    },
    {
      label: 'Reservas Registradas',
      value: stats.activeReservations,
      href: '/admin/reservas',
      icon: CalendarClock,
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Painel Geral</span>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Visão Geral da Biblioteca
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Acompanhe em tempo real o acervo, usuários e movimentação de reservas.
          </p>
        </div>

        <button
          onClick={() => loadDashboardStats()}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          {loading ? 'Atualizando...' : 'Atualizar métricas'}
        </button>
      </div>

      {/* Cards de Métricas Reais */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl text-white ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                </div>

                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {card.label}
                </p>
                <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
                  {loading ? '...' : card.value}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Informações adicionais */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Ações Rápidas de Gestão</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Acesse diretamente os módulos do sistema.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link
              href="/admin/livros"
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:bg-blue-50 hover:border-blue-200 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
            >
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <strong className="block text-sm font-semibold text-slate-900 dark:text-white">Gerenciar Acervo</strong>
                <span className="text-xs text-slate-500">Adicionar livros ou alterar estoque</span>
              </div>
            </Link>

            <Link
              href="/admin/reservas"
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:bg-blue-50 hover:border-blue-200 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
            >
              <CalendarClock className="h-5 w-5 text-amber-500" />
              <div>
                <strong className="block text-sm font-semibold text-slate-900 dark:text-white">Retiradas e Devoluções</strong>
                <span className="text-xs text-slate-500">Atender empréstimos e conferir devoluções</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg shadow-blue-600/20">
          <div>
            <div className="flex items-center gap-2 text-blue-100">
              <Clock className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Fila de Espera Global</span>
            </div>
            <p className="mt-4 text-4xl font-extrabold">{loading ? '...' : stats.waitingListCount}</p>
            <p className="mt-2 text-sm text-blue-100">Alunos aguardando liberação de novos exemplares no acervo.</p>
          </div>

          <Link
            href="/admin/reservas"
            className="mt-6 flex items-center justify-between rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            <span>Ver Fila Completa</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
