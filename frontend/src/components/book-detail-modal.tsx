'use client';

import Image from 'next/image';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Building2,
  Hash,
  Layers,
  X,
} from 'lucide-react';
import { assetUrl } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  isbn?: string | null;
  year?: number;
  publicationYear?: number;
  totalQuantity: number;
  availableQuantity: number;
  category?: Category;
  coverUrl?: string | null;
  description?: string | null;
}

interface BookDetailModalProps {
  book: Book;
  isOpen: boolean;
  actionLoading?: boolean;
  onClose: () => void;
  onReserve: (book: Book) => void;
}

export function BookDetailModal({
  book,
  isOpen,
  actionLoading,
  onClose,
  onReserve,
}: BookDetailModalProps) {
  if (!isOpen) return null;

  const hasStock = book.availableQuantity > 0;
  const pubYear = book.publicationYear ?? book.year;

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="modal-content relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Fechar detalhes do livro"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col sm:flex-row">
          {/* Cover */}
          <div className="flex items-center justify-center bg-slate-50 p-6 dark:bg-slate-950 sm:w-56 sm:rounded-l-2xl sm:p-8">
            {book.coverUrl ? (
              <div className="relative h-64 w-44 sm:h-52 sm:w-36">
                <Image
                  src={assetUrl(book.coverUrl)!}
                  alt={`Capa de ${book.title}`}
                  fill
                  unoptimized
                  className="rounded-lg object-contain"
                />
              </div>
            ) : (
              <div className="flex h-52 w-36 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-500">
                <BookOpen className="h-12 w-12" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-6 sm:p-8">
            {/* Category badge */}
            {book.category && (
              <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                <Layers className="h-3 w-3" />
                {book.category.name}
              </span>
            )}

            {/* Title & Author */}
            <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              {book.title}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
              {book.author}
            </p>

            {/* Metadata grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              {book.publisher && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate">{book.publisher}</span>
                </div>
              )}
              {pubYear && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>{pubYear}</span>
                </div>
              )}
              {book.isbn && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Hash className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="font-mono text-xs">{book.isbn}</span>
                </div>
              )}
            </div>

            {/* Synopsis / Description */}
            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Sinopse
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {book.description || 'Sinopse não disponível para este título.'}
              </p>
            </div>

            {/* Availability */}
            <div className="mt-6 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  hasStock
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {hasStock ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5" />
                    {book.availableQuantity}{' '}
                    {book.availableQuantity === 1 ? 'exemplar disponível' : 'exemplares disponíveis'}
                  </>
                ) : (
                  <>
                    <Clock className="h-3.5 w-3.5" />
                    Sem exemplares — Lista de espera
                  </>
                )}
              </span>
            </div>

            {/* Action button */}
            <button
              onClick={() => onReserve(book)}
              disabled={actionLoading}
              className={`mt-6 w-full rounded-xl py-3 text-sm font-semibold transition flex items-center justify-center gap-2 ${
                hasStock
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99]'
                  : 'bg-amber-600 text-white hover:bg-amber-700 active:scale-[0.99]'
              } disabled:opacity-50`}
            >
              {actionLoading
                ? 'Processando...'
                : hasStock
                ? 'Solicitar Reserva'
                : 'Entrar na Fila de Espera'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
