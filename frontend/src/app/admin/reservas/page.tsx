"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  RotateCcw,
  PackageCheck,
  Layers,
  Search,
  Check,
  AlertCircle,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Pagination, paginate } from "@/components/pagination";
import { toast } from "react-toastify";
import { ConfirmModal } from "@/components/confirm-modal";

const PAGE_SIZE = 2;

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string | null;
}

interface Reservation {
  id: string;
  student: Student;
  book: Book;
  reservationDate: string;
  pickupDeadline?: string;
  pickupDate?: string;
  returnDate?: string;
  status:
    | "REQUESTED"
    | "APPROVED"
    | "PICKED_UP"
    | "RETURNED"
    | "CANCELLED"
    | "EXPIRED";
}

interface WaitingItem {
  id: string;
  student: Student;
  book: Book;
  position: number;
  requestDate: string;
  status: "WAITING" | "NOTIFIED" | "RESERVED" | "EXPIRED" | "CANCELLED";
}

const reservationStatusMap = {
  REQUESTED: {
    label: "Solicitada",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  APPROVED: {
    label: "Aprovada (Aguardando Retirada)",
    color:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  PICKED_UP: {
    label: "Retirada (Empréstimo Ativo)",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  },
  RETURNED: {
    label: "Devolvida",
    color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  },
  CANCELLED: {
    label: "Cancelada",
    color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  },
  EXPIRED: {
    label: "Expirada",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
};

const waitingStatusMap = {
  WAITING: {
    label: "Aguardando",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  NOTIFIED: {
    label: "Notificado (Liberado)",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  RESERVED: {
    label: "Convertido em Reserva",
    color:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  EXPIRED: {
    label: "Expirado",
    color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  },
  CANCELLED: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  },
};

export default function AdminReservationsPage() {
  const [activeTab, setActiveTab] = useState<"reservations" | "waiting">(
    "reservations",
  );
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [waitingList, setWaitingList] = useState<WaitingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
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
      const [rData, wData] = await Promise.all([
        apiFetch<Reservation[]>("/reservations").catch(() => []),
        apiFetch<WaitingItem[]>("/waiting-list").catch(() => []),
      ]);
      setReservations(rData);
      setWaitingList(wData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar dados de reservas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const stats = useMemo(() => {
    const requested = reservations.filter(
      (r) => r.status === "REQUESTED" || r.status === "APPROVED",
    ).length;
    const active = reservations.filter((r) => r.status === "PICKED_UP").length;
    const returned = reservations.filter((r) => r.status === "RETURNED").length;
    const inQueue = waitingList.filter(
      (w) => w.status === "WAITING" || w.status === "NOTIFIED",
    ).length;
    return { requested, active, returned, inQueue };
  }, [reservations, waitingList]);

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const matchSearch =
        r.student?.name.toLowerCase().includes(search.toLowerCase()) ||
        r.book?.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [reservations, search, statusFilter]);

  const filteredWaiting = useMemo(() => {
    return waitingList.filter((w) => {
      return (
        w.student?.name.toLowerCase().includes(search.toLowerCase()) ||
        w.book?.title.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [waitingList, search]);

  async function handlePickup(id: string) {
    setConfirmConfig({
      isOpen: true,
      title: 'Confirmar Retirada',
      description: 'Deseja realmente confirmar a RETIRADA do livro pelo aluno?',
      confirmText: 'Confirmar Retirada',
      variant: 'info',
      onConfirm: async () => {
        setConfirmConfig(null);
        try {
          await apiFetch(`/reservations/${id}/pickup`, { method: "PATCH" });
          toast.success("Retirada registrada com sucesso! Empréstimo ativo.");
          await loadData();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Erro ao registrar retirada.");
        }
      },
    });
  }

  async function handleReturn(id: string) {
    setConfirmConfig({
      isOpen: true,
      title: 'Confirmar Devolução',
      description: 'Deseja realmente confirmar a DEVOLUÇÃO do livro?',
      confirmText: 'Confirmar Devolução',
      variant: 'info',
      onConfirm: async () => {
        setConfirmConfig(null);
        try {
          await apiFetch(`/reservations/${id}/return`, { method: "PATCH" });
          toast.success("Devolução registrada com sucesso! Estoque recomposto.");
          await loadData();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Erro ao registrar devolução.");
        }
      },
    });
  }

  function formatDate(str?: string) {
    if (!str) return "-";
    try {
      return new Date(str).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return str;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarClock className="h-6 w-6 text-blue-600" />
          Gestão de Reservas & Empréstimos
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gerencie solicitações, retiradas na biblioteca, devoluções e a lista
          de espera global.
        </p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Solicitadas / Aprovadas
            </span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.requested}
          </p>
          <p className="mt-1 text-xs text-slate-500">Aguardando retirada</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Empréstimos Ativos
            </span>
            <PackageCheck className="h-5 w-5 text-purple-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.active}
          </p>
          <p className="mt-1 text-xs text-slate-500">Livros com alunos</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Devoluções Concluídas
            </span>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.returned}
          </p>
          <p className="mt-1 text-xs text-slate-500">Exemplares devolvidos</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Lista de Espera
            </span>
            <Layers className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.inQueue}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Alunos aguardando estoque
          </p>
        </article>
      </div>

      {/* Navegação por Abas */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            setActiveTab("reservations");
            setSearch("");
            setStatusFilter("");
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === "reservations"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          <CalendarClock className="h-4 w-4" />
          Reservas ({reservations.length})
        </button>

        <button
          onClick={() => {
            setActiveTab("waiting");
            setSearch("");
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === "waiting"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          <Clock className="h-4 w-4" />
          Lista de Espera ({waitingList.length})
        </button>
      </div>

      {/* Controles de Busca e Filtro */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setReservationsPage(1);
              setWaitingPage(1);
            }}
            placeholder="Buscar por aluno ou livro..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        {activeTab === "reservations" && (
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setReservationsPage(1);
            }}
            className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">Todos os status</option>
            <option value="REQUESTED">Solicitada</option>
            <option value="APPROVED">Aprovada</option>
            <option value="PICKED_UP">Retirada (Ativo)</option>
            <option value="RETURNED">Devolvida</option>
            <option value="CANCELLED">Cancelada</option>
            <option value="EXPIRED">Expirada</option>
          </select>
        )}
      </div>

      {/* Conteúdo da Aba 1: Reservas */}
      {activeTab === "reservations" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3 font-semibold">Aluno</th>
                  <th className="px-6 py-3 font-semibold">Livro</th>
                  <th className="px-6 py-3 font-semibold">Data Reserva</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">
                    Ações Rápidas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Carregando reservas...
                    </td>
                  </tr>
                ) : filteredReservations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Nenhuma reserva encontrada.
                    </td>
                  </tr>
                ) : (
                  paginate(
                    filteredReservations,
                    reservationsPage,
                    PAGE_SIZE,
                  ).map((res) => {
                    const statusInfo = reservationStatusMap[res.status] || {
                      label: res.status,
                      color: "bg-slate-100",
                    };

                    return (
                      <tr
                        key={res.id}
                        className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {res.student?.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {res.student?.email}
                          </p>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                          {res.book?.title}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                          {formatDate(res.reservationDate)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {(res.status === "REQUESTED" ||
                              res.status === "APPROVED") && (
                              <button
                                onClick={() => handlePickup(res.id)}
                                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.99]"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Registrar Retirada
                              </button>
                            )}
                            {res.status === "PICKED_UP" && (
                              <button
                                onClick={() => handleReturn(res.id)}
                                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99]"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Registrar Devolução
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={reservationsPage}
            totalItems={filteredReservations.length}
            pageSize={PAGE_SIZE}
            onPageChange={setReservationsPage}
            itemLabel="reservas"
          />
        </div>
      )}

      {/* Conteúdo da Aba 2: Lista de Espera */}
      {activeTab === "waiting" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3 font-semibold text-center">
                    Posição
                  </th>
                  <th className="px-6 py-3 font-semibold">Aluno</th>
                  <th className="px-6 py-3 font-semibold">Livro Solicitado</th>
                  <th className="px-6 py-3 font-semibold">Data de Entrada</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Carregando lista de espera...
                    </td>
                  </tr>
                ) : filteredWaiting.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Nenhum registro na fila de espera.
                    </td>
                  </tr>
                ) : (
                  paginate(filteredWaiting, waitingPage, PAGE_SIZE).map(
                    (item) => {
                      const statusInfo = waitingStatusMap[item.status] || {
                        label: item.status,
                        color: "bg-slate-100",
                      };

                      return (
                        <tr
                          key={item.id}
                          className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                        >
                          <td className="px-6 py-4 text-center font-extrabold text-blue-600 dark:text-blue-400">
                            #{item.position}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900 dark:text-white">
                              {item.student?.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {item.student?.email}
                            </p>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                            {item.book?.title}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                            {formatDate(item.requestDate)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusInfo.color}`}
                            >
                              {statusInfo.label}
                            </span>
                          </td>
                        </tr>
                      );
                    },
                  )
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={waitingPage}
            totalItems={filteredWaiting.length}
            pageSize={PAGE_SIZE}
            onPageChange={setWaitingPage}
            itemLabel="registros"
          />
        </div>
      )}

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
