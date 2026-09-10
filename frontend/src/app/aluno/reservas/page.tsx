'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, Clock, XCircle, Bookmark, Layers } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Pagination, paginate } from '@/components/pagination';
import { toast } from 'react-toastify';
import { ConfirmModal } from '@/components/confirm-modal';

const PAGE_SIZE = 6;

interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string | null;
}

interface Reservation {
  id: string;
  book: Book;
  reservationDate: string;
  pickupDeadline?: string;
  status: 'REQUESTED' | 'APPROVED' | 'PICKED_UP' | 'RETURNED' | 'CANCELLED' | 'EXPIRED';
}

interface WaitingItem {
  id: string;
  book: Book;
  position: number;
  requestDate: string;
  status: 'WAITING' | 'NOTIFIED' | 'RESERVED' | 'EXPIRED' | 'CANCELLED';
}

const reservationStatusMap = {
  REQUESTED: { label: 'Solicitada', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  APPROVED: { label: 'Aprovada (Aguardando Retirada)', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  PICKED_UP: { label: 'Retirada (Empréstimo Ativo)', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  RETURNED: { label: 'Devolvida', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
  EXPIRED: { label: 'Expirada', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
};

const waitingStatusMap = {
  WAITING: { label: 'Aguardando na Fila', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  NOTIFIED: { label: 'Exemplar Disponível', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  RESERVED: { label: 'Convertido em Reserva', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  EXPIRED: { label: 'Expirado', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
};

export default function StudentReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [waitingList, setWaitingList] = useState<WaitingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reservationsPage, setReservationsPage] = useState(1);
  const [waitingPage, setWaitingPage] = useState(1);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  } | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const [resData, waitData] = await Promise.all([
        apiFetch<Reservation[]>('/reservations/me').catch(() => []),
        apiFetch<WaitingItem[]>('/waiting-list/me').catch(() => []),
      ]);
      setReservations(resData);
      setWaitingList(waitData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function handleCancelReservation(id: string) {
    setConfirmConfig({
      isOpen: true,
      title: 'Cancelar Reserva',
      description: 'Deseja realmente cancelar esta reserva?',
      confirmText: 'Cancelar Reserva',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmConfig(null);
        try {
          await apiFetch(`/reservations/${id}/cancel`, { method: 'PATCH' });
          toast.success('Reserva cancelada com sucesso.');
          await loadData();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Erro ao cancelar reserva.');
        }
      },
    });
  }

  async function handleCancelWait(id: string) {
    setConfirmConfig({
      isOpen: true,
      title: 'Sair da Lista de Espera',
      description: 'Deseja realmente sair desta lista de espera?',
      confirmText: 'Sair da Fila',
      variant: 'warning',
      onConfirm: async () => {
        setConfirmConfig(null);
        try {
          await apiFetch(`/waiting-list/${id}/cancel`, { method: 'PATCH' });
          toast.success('Saída da lista de espera efetuada.');
          await loadData();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Erro ao cancelar posição na fila.');
        }
      },
    });
  }

  function formatDate(str?: string) {
    if (!str) return '-';
    try {
      return new Date(str).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return str;
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Minhas Solicitacões</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Acompanhe suas reservas ativas e suas posições na lista de espera.
        </p>
      </div>

      {/* Seção 1: Reservas */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
          <CalendarClock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Minhas Reservas</h2>
          <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {reservations.length}
          </span>
        </div>

        {loading ? (
          <div className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
        ) : reservations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <Bookmark className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm text-slate-500">Você ainda não solicitou nenhuma reserva.</p>
          </div>
        ) : (
          <>
          <div className="grid gap-4 sm:grid-cols-2">
            {paginate(reservations, reservationsPage, PAGE_SIZE).map((res) => {
              const statusInfo = reservationStatusMap[res.status] || { label: res.status, color: 'bg-slate-100' };
              const canCancel = res.status === 'REQUESTED' || res.status === 'APPROVED';

              return (
                <div
                  key={res.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">{res.book?.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{res.book?.author}</p>

                    <div className="mt-4 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <p>Solicitado em: {formatDate(res.reservationDate)}</p>
                      {res.pickupDeadline && (
                        <p className="font-semibold text-amber-600 dark:text-amber-400">
                          Prazo de Retirada: {formatDate(res.pickupDeadline)}
                        </p>
                      )}
                    </div>
                  </div>

                  {canCancel && (
                    <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                      <button
                        onClick={() => handleCancelReservation(res.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancelar Reserva
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <Pagination page={reservationsPage} totalItems={reservations.length} pageSize={PAGE_SIZE} onPageChange={setReservationsPage} itemLabel="reservas" />
          </div>
          </>
        )}
      </section>

      {/* Seção 2: Fila de Espera */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
          <Clock className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Minha Lista de Espera</h2>
          <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {waitingList.length}
          </span>
        </div>

        {loading ? (
          <div className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
        ) : waitingList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <Layers className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm text-slate-500">Você não está em nenhuma lista de espera no momento.</p>
          </div>
        ) : (
          <>
          <div className="grid gap-4 sm:grid-cols-2">
            {paginate(waitingList, waitingPage, PAGE_SIZE).map((item) => {
              const statusInfo = waitingStatusMap[item.status] || { label: item.status, color: 'bg-slate-100' };
              const canCancel = item.status === 'WAITING' || item.status === 'NOTIFIED';

              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {item.position}º na fila
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">{item.book?.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.book?.author}</p>

                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      Entrada na fila: {formatDate(item.requestDate)}
                    </p>
                  </div>

                  {canCancel && (
                    <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                      <button
                        onClick={() => handleCancelWait(item.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        <XCircle className="h-4 w-4" />
                        Sair da Fila
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <Pagination page={waitingPage} totalItems={waitingList.length} pageSize={PAGE_SIZE} onPageChange={setWaitingPage} itemLabel="registros" />
          </div>
          </>
        )}
      </section>

      {confirmConfig && (
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          description={confirmConfig.description}
          confirmText={confirmConfig.confirmText}
          variant={confirmConfig.variant}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig(null)}
        />
      )}
    </div>
  );
}
