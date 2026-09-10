"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Layers,
  Package,
  X,
  CheckCircle,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import { apiFetch, assetUrl } from "@/lib/api";
import { maskIsbn, onlyDigits } from "@/lib/masks";
import { Pagination, paginate } from "@/components/pagination";
import { toast } from "react-toastify";
import { ConfirmModal } from "@/components/confirm-modal";

const PAGE_SIZE = 5;

interface Category {
  id: string;
  name: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  isbn?: string | null;
  publicationYear?: number;
  totalQuantity: number;
  availableQuantity: number;
  category?: Category;
  coverUrl?: string | null;
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [stockBook, setStockBook] = useState<Book | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  } | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [isbn, setIsbn] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [totalQuantity, setTotalQuantity] = useState<number>(1);
  const [categoryId, setCategoryId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // Stock edit state
  const [newStock, setNewStock] = useState<number>(1);

  async function loadData() {
    try {
      setLoading(true);
      const [bData, cData] = await Promise.all([
        apiFetch<Book[]>("/books").catch(() => []),
        apiFetch<Category[]>("/categories").catch(() => []),
      ]);
      setBooks(bData);
      setCategories(cData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar livros.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase()) ||
        (b.isbn ?? "").includes(search),
    );
  }, [books, search]);

  function openCreateModal() {
    setTitle("");
    setAuthor("");
    setPublisher("");
    setIsbn("");
    setYear(new Date().getFullYear());
    setTotalQuantity(1);
    setCategoryId(categories[0]?.id || "");
    setCoverFile(null);
    setShowCreateModal(true);
  }

  function openEditModal(book: Book) {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setPublisher(book.publisher || "");
    setIsbn(maskIsbn(book.isbn));
    setYear(book.publicationYear || new Date().getFullYear());
    setCategoryId(book.category?.id || categories[0]?.id || "");
    setCoverFile(null);
  }

  function openStockModal(book: Book) {
    setStockBook(book);
    setNewStock(book.totalQuantity);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await apiFetch<Book>("/books", {
        method: "POST",
        body: JSON.stringify({
          title,
          author,
          publisher,
          isbn: onlyDigits(isbn, 13),
          publicationYear: year,
          totalQuantity,
          categoryId,
        }),
      });
      if (coverFile) await uploadCover(created.id, coverFile);
      toast.success("Livro cadastrado com sucesso!");
      setShowCreateModal(false);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar livro.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e: FormEvent) {
    e.preventDefault();
    if (!editingBook) return;
    setSaving(true);
    try {
      await apiFetch(`/books/${editingBook.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          author,
          publisher,
          isbn: onlyDigits(isbn, 13),
          publicationYear: year,
          totalQuantity: editingBook.totalQuantity,
          categoryId,
        }),
      });
      if (coverFile) await uploadCover(editingBook.id, coverFile);
      toast.success("Livro atualizado com sucesso!");
      setEditingBook(null);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar livro.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadCover(bookId: string, file: File) {
    const formData = new FormData();
    formData.append("cover", file);
    await apiFetch(`/books/${bookId}/cover`, {
      method: "POST",
      body: formData,
    });
  }

  async function handleRemoveCover() {
    if (!editingBook?.coverUrl) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Remover Capa',
      description: 'Deseja realmente remover a capa deste livro?',
      confirmText: 'Remover Capa',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmConfig(null);
        setSaving(true);
        try {
          await apiFetch(`/books/${editingBook.id}/cover`, { method: "DELETE" });
          setEditingBook({ ...editingBook, coverUrl: null });
          toast.success("Capa removida com sucesso.");
          await loadData();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Erro ao remover capa.");
        } finally {
          setSaving(false);
        }
      },
    });
  }

  async function handleUpdateStock(e: FormEvent) {
    e.preventDefault();
    if (!stockBook) return;
    setSaving(true);
    try {
      await apiFetch(`/books/${stockBook.id}/stock`, {
        method: "PATCH",
        body: JSON.stringify({ newTotalQuantity: newStock }),
      });
      toast.success("Estoque atualizado com sucesso!");
      setStockBook(null);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao ajustar estoque.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, bookTitle: string) {
    setConfirmConfig({
      isOpen: true,
      title: 'Desativar Livro',
      description: `Deseja realmente desativar o livro "${bookTitle}"?`,
      confirmText: 'Desativar Livro',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmConfig(null);
        try {
          await apiFetch(`/books/${id}`, { method: "DELETE" });
          toast.success("Livro desativado com sucesso.");
          await loadData();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Erro ao desativar livro.");
        }
      },
    });
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            Gestão de Livros
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Cadastre, edite e gerencie o acervo e estoque de exemplares.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.99]"
        >
          <Plus className="h-4 w-4" />
          Novo Livro
        </button>
      </div>

      {/* Tabela e Busca */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por título, autor ou ISBN..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3 font.semibold">Título & Autor</th>
                <th className="px-6 py-3 font-semibold">Categoria</th>
                <th className="px-6 py-3 font-semibold">ISBN</th>
                <th className="px-6 py-3 font-semibold text-center">
                  Estoque (Disp / Total)
                </th>
                <th className="px-6 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Carregando livros...
                  </td>
                </tr>
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Nenhum livro cadastrado ou encontrado.
                  </td>
                </tr>
              ) : (
                paginate(filteredBooks, page, PAGE_SIZE).map((book) => (
                  <tr
                    key={book.id}
                    className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {book.coverUrl ? (
                          <Image
                            src={assetUrl(book.coverUrl)!}
                            alt={`Capa de ${book.title}`}
                            width={40}
                            height={56}
                            unoptimized
                            className="h-14 w-10 rounded object-cover shadow-sm"
                          />
                        ) : (
                          <div className="flex h-14 w-10 items-center justify-center rounded bg-slate-100 text-slate-400 dark:bg-slate-800">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {book.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {book.author}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-mono text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                        <Layers className="h-3 w-3" />
                        {book.category?.name || "Sem Categoria"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                      {maskIsbn(book.isbn)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                          book.availableQuantity > 0
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        }`}
                      >
                        {book.availableQuantity} / {book.totalQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openStockModal(book)}
                          title="Ajustar Estoque"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                        >
                          <Package className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(book)}
                          title="Editar"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(book.id, book.title)}
                          title="Desativar"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          totalItems={filteredBooks.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          itemLabel="livros"
        />
      </div>

      {/* Modal Criar */}
      {showCreateModal && (
        <div onClick={() => setShowCreateModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Cadastrar Novo Livro
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Autor
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Editora
                  </label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    ISBN (10/13 dígitos)
                  </label>
                  <input
                    type="text"
                    required
                    value={isbn}
                    onChange={(e) => setIsbn(maskIsbn(e.target.value))}
                    placeholder="978-8-5123-4567-8"
                    inputMode="numeric"
                    maxLength={17}
                    pattern="(?:\d-\d{4}-\d{4}-\d|\d{3}-\d-\d{4}-\d{4}-\d)"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Ano
                  </label>
                  <input
                    type="number"
                    min={1500}
                    max={new Date().getFullYear()}
                    step={1}
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Estoque Inicial
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={totalQuantity}
                    onChange={(e) => setTotalQuantity(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Categoria
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value="">Selecione uma categoria...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Capa (opcional)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                  className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700 dark:text-slate-300 dark:file:bg-blue-950 dark:file:text-blue-300"
                />
                <p className="mt-1 text-xs text-slate-500">
                  JPEG, PNG ou WebP, até 2 MB.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Salvar Livro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {editingBook && (
        <div onClick={() => setEditingBook(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Editar Livro
              </h3>
              <button
                onClick={() => setEditingBook(null)}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Autor
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Editora
                  </label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    ISBN (10/13 dígitos)
                  </label>
                  <input
                    type="text"
                    required
                    value={isbn}
                    onChange={(e) => setIsbn(maskIsbn(e.target.value))}
                    placeholder="978-8-5123-4567-8"
                    inputMode="numeric"
                    maxLength={17}
                    pattern="(?:\d-\d{4}-\d{4}-\d|\d{3}-\d-\d{4}-\d{4}-\d)"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Ano
                  </label>
                  <input
                    type="number"
                    min={1500}
                    max={new Date().getFullYear()}
                    step={1}
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Categoria
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value="">Selecione uma categoria...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Capa
                </label>
                {editingBook.coverUrl && (
                  <div className="mt-2 flex items-center gap-3">
                    <Image
                      src={assetUrl(editingBook.coverUrl)!}
                      alt={`Capa de ${editingBook.title}`}
                      width={64}
                      height={96}
                      unoptimized
                      className="h-24 w-16 rounded object-cover shadow"
                    />
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleRemoveCover}
                      className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      Remover capa
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                  className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700 dark:text-slate-300 dark:file:bg-blue-950 dark:file:text-blue-300"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Selecione para adicionar ou substituir. Máximo de 2 MB.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Atualizando..." : "Atualizar Livro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajustar Estoque */}
      {stockBook && (
        <div onClick={() => setStockBook(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ajustar Estoque
              </h3>
              <button
                onClick={() => setStockBook(null)}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStock} className="mt-4 space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aumentar o estoque promoverá automaticamente os alunos
                aguardando na lista de espera.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Nova Quantidade Total
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  required
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setStockBook(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Confirmar Estoque"}
                </button>
              </div>
            </form>
          </div>
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
