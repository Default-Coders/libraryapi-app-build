"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Edit, KeyRound, RefreshCw, Search, ShieldCheck, ShieldPlus, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { apiFetch } from "@/lib/api";
import { Pagination, paginate } from "@/components/pagination";
import { PasswordInput } from "@/components/password-input";
import { ConfirmModal } from "@/components/confirm-modal";

const PAGE_SIZE = 10;

interface Administrator {
  id: string;
  name: string;
  email: string;
  firstLogin: boolean;
  active: boolean;
}

export default function AdministratorsPage() {
  const [admins, setAdmins] = useState<Administrator[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Administrator | null>(null);
  const [resetting, setResetting] = useState<Administrator | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  } | null>(null);

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ includeInactive: "true" });
      if (search.trim()) params.set("query", search.trim());
      setAdmins(await apiFetch<Administrator[]>(`/admins?${params}`));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar administradores.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAdmins(), 300);
    return () => window.clearTimeout(timer);
  }, [loadAdmins]);

  const filtered = useMemo(
    () => admins.filter((admin) => status === "ALL" || (status === "ACTIVE" ? admin.active : !admin.active)),
    [admins, status],
  );

  function openCreate() {
    setName(""); setEmail(""); setPassword(""); setCreating(true);
  }

  function openEdit(admin: Administrator) {
    setName(admin.name); setEmail(admin.email); setEditing(admin);
  }

  async function createAdmin(event: FormEvent) {
    event.preventDefault(); setSaving(true);
    try {
      await apiFetch("/admins", { method: "POST", body: JSON.stringify({ name, email, password }) });
      toast.success("Administrador cadastrado com sucesso!");
      setCreating(false); await loadAdmins();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao cadastrar administrador.");
    } finally { setSaving(false); }
  }

  async function updateAdmin(event: FormEvent) {
    event.preventDefault(); if (!editing) return; setSaving(true);
    try {
      await apiFetch(`/admins/${editing.id}`, { method: "PUT", body: JSON.stringify({ name, email }) });
      toast.success("Administrador atualizado com sucesso!");
      setEditing(null); await loadAdmins();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar administrador.");
    } finally { setSaving(false); }
  }

  async function resetPassword(event: FormEvent) {
    event.preventDefault(); if (!resetting) return; setSaving(true);
    try {
      await apiFetch(`/admins/${resetting.id}/password`, { method: "PATCH", body: JSON.stringify({ newPassword: password }) });
      toast.success(`Senha de “${resetting.name}” redefinida.`);
      setResetting(null); await loadAdmins();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao redefinir senha.");
    } finally { setSaving(false); }
  }

  async function changeStatus(admin: Administrator) {
    const action = admin.active ? "desativar" : "reativar";
    setConfirmConfig({
      isOpen: true,
      title: admin.active ? 'Desativar Administrador' : 'Reativar Administrador',
      description: `Deseja realmente ${action} o administrador "${admin.name}"?`,
      confirmText: admin.active ? 'Desativar' : 'Reativar',
      variant: admin.active ? 'danger' : 'info',
      onConfirm: async () => {
        setConfirmConfig(null);
        try {
          await apiFetch(`/admins/${admin.id}${admin.active ? "" : "/reactivate"}`, { method: admin.active ? "DELETE" : "PATCH" });
          toast.success(`Administrador ${admin.active ? "desativado" : "reativado"} com sucesso.`);
          await loadAdmins();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : `Erro ao ${action} administrador.`);
        }
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white"><ShieldCheck className="h-6 w-6 text-purple-600" />Gestão de Administradores</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Cadastre, edite, redefina senhas e gerencie o acesso dos administradores.</p>
        </div>
        <button onClick={openCreate} className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-purple-700"><ShieldPlus className="h-4 w-4" />Novo Administrador</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por nome ou e-mail..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-purple-600 dark:border-slate-800 dark:bg-slate-900" /></div>
        <select value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-900"><option value="ALL">Todos</option><option value="ACTIVE">Ativos</option><option value="INACTIVE">Inativos</option></select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950"><tr><th className="px-6 py-3">Administrador</th><th className="px-6 py-3">Primeiro acesso</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Ações</th></tr></thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-500">Carregando administradores...</td></tr> : filtered.length === 0 ? <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-500">Nenhum administrador encontrado.</td></tr> : paginate(filtered, page, PAGE_SIZE).map((admin) => (
              <tr key={admin.id} className={!admin.active ? "opacity-60" : ""}><td className="px-6 py-4"><strong className="block text-slate-900 dark:text-white">{admin.name}</strong><span className="text-xs text-slate-500">{admin.email}</span></td><td className="px-6 py-4 text-xs">{admin.firstLogin ? "Pendente" : "Concluído"}</td><td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${admin.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"}`}>{admin.active ? "Ativo" : "Inativo"}</span></td><td className="px-6 py-4"><div className="flex justify-end gap-2"><button onClick={() => openEdit(admin)} title="Editar" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"><Edit className="h-4 w-4" /></button><button onClick={() => { setPassword(""); setResetting(admin); }} title="Redefinir senha" className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-600"><KeyRound className="h-4 w-4" /></button><button onClick={() => changeStatus(admin)} title={admin.active ? "Desativar" : "Reativar"} className={`rounded-lg p-2 ${admin.active ? "text-red-500 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"}`}>{admin.active ? <Trash2 className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}</button></div></td></tr>
            ))}
          </tbody></table></div>
        <Pagination page={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} itemLabel="administradores" />
      </div>

      {(creating || editing) && <Modal title={creating ? "Cadastrar Administrador" : "Editar Administrador"} close={() => creating ? setCreating(false) : setEditing(null)}><form onSubmit={creating ? createAdmin : updateAdmin} className="space-y-4"><Field label="Nome" value={name} setValue={setName} /><Field label="E-mail" type="email" value={email} setValue={setEmail} />{creating && <div><label className="text-xs font-semibold uppercase text-slate-500">Senha inicial</label><PasswordInput required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-800" /></div>}<Actions saving={saving} cancel={() => creating ? setCreating(false) : setEditing(null)} /></form></Modal>}
      {resetting && <Modal title={`Redefinir senha — ${resetting.name}`} close={() => setResetting(null)}><form onSubmit={resetPassword} className="space-y-4"><div><label className="text-xs font-semibold uppercase text-slate-500">Nova senha</label><PasswordInput required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-800" /></div><Actions saving={saving} cancel={() => setResetting(null)} /></form></Modal>}
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

function Field({ label, value, setValue, type = "text" }: { label: string; value: string; setValue: (value: string) => void; type?: string }) {
  return <div><label className="text-xs font-semibold uppercase text-slate-500">{label}</label><input required type={type} value={value} onChange={(e) => setValue(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-purple-600 dark:border-slate-800" /></div>;
}

function Modal({ title, close, children }: { title: string; close: () => void; children: React.ReactNode }) {
  return <div onClick={close} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"><div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"><div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800"><h2 className="font-bold">{title}</h2><button onClick={close} type="button"><X className="h-5 w-5" /></button></div>{children}</div></div>;
}

function Actions({ saving, cancel }: { saving: boolean; cancel: () => void }) {
  return <div className="flex justify-end gap-2 pt-3"><button type="button" onClick={cancel} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Cancelar</button><button disabled={saving} className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button></div>;
}
