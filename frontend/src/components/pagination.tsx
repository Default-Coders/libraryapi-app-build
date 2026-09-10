'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

function pageItems(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, 'ellipsis', total];
  if (current >= total - 3) return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total];
  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
}

export function Pagination({
  page,
  totalItems,
  pageSize = 10,
  onPageChange,
  itemLabel = 'itens',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const current = Math.min(Math.max(page, 1), totalPages);

  if (totalItems <= pageSize) return null;

  const firstItem = (current - 1) * pageSize + 1;
  const lastItem = Math.min(current * pageSize, totalItems);

  const goTo = (nextPage: number) => {
    const normalized = Math.min(Math.max(nextPage, 1), totalPages);
    onPageChange(normalized);
  };

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-sm text-slate-500 dark:text-slate-400 sm:text-left">
        Exibindo <strong className="font-semibold text-slate-700 dark:text-slate-200">{firstItem}–{lastItem}</strong> de{' '}
        <strong className="font-semibold text-slate-700 dark:text-slate-200">{totalItems}</strong> {itemLabel}
      </p>

      <nav aria-label="Paginação" className="flex items-center justify-center gap-1">
        <button
          type="button"
          onClick={() => goTo(current - 1)}
          disabled={current === 1}
          aria-label="Página anterior"
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pageItems(current, totalPages).map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="grid h-9 w-7 place-items-center text-slate-400" aria-hidden="true">…</span>
          ) : (
            <button
              type="button"
              key={item}
              onClick={() => goTo(item)}
              aria-current={item === current ? 'page' : undefined}
              className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition ${
                item === current
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => goTo(current + 1)}
          disabled={current === totalPages}
          aria-label="Próxima página"
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}

export function paginate<T>(items: T[], page: number, pageSize = 10): T[] {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(page, 1), totalPages);
  return items.slice((current - 1) * pageSize, current * pageSize);
}
