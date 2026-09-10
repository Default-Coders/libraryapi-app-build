'use client';

import { FormEvent, useEffect, useState } from 'react';
import { User, Mail, Phone, GraduationCap, School, Save, KeyRound, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { PasswordInput } from '@/components/password-input';
import { toast } from 'react-toastify';
import { maskPhone, onlyDigits } from '@/lib/masks';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  course?: string;
  schoolClass?: string;
}

const COURSES = [
  { value: 'SYSTEMS_DEVELOPMENT', label: 'Desenvolvimento de Sistemas' },
  { value: 'NUTRITION_AND_DIETETICS', label: 'Nutrição e Dietética' },
];

const CLASSES = [
  { value: 'FIRST_A', label: '1º ano A' },
  { value: 'FIRST_B', label: '1º ano B' },
  { value: 'SECOND_A', label: '2º ano A' },
  { value: 'SECOND_B', label: '2º ano B' },
  { value: 'THIRD_A', label: '3º ano A' },
  { value: 'THIRD_B', label: '3º ano B' },
];

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Form states (Profile)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('');
  const [schoolClass, setSchoolClass] = useState('');

  // Form states (Password)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  async function loadProfile() {
    try {
      setLoading(true);
      const data = await apiFetch<StudentProfile>('/students/me');
      setName(data.name || '');
      setEmail(data.email || '');
      setPhone(maskPhone(data.phone || ''));
      setCourse(data.course || 'SYSTEMS_DEVELOPMENT');
      setSchoolClass(data.schoolClass || 'FIRST_A');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar dados do perfil.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch<StudentProfile>('/students/me', {
        method: 'PUT',
        body: JSON.stringify({
          name,
          email,
          phone: onlyDigits(phone),
          course,
          schoolClass,
        }),
      });

      toast.success('Perfil atualizado com sucesso!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível atualizar o perfil.');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('A nova senha e a confirmação não coincidem.');
      return;
    }

    setSavingPassword(true);
    try {
      await apiFetch('/students/me/password', {
        method: 'PATCH',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      toast.success('Sua senha foi alterada com sucesso!');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível alterar a senha.');
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Meu Perfil</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Visualize e atualize suas informações e senha de acesso.
        </p>
      </div>

      {/* Formulário Dados Pessoais */}
      <form
        onSubmit={handleUpdateProfile}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
      >
        <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
          Informações Pessoais
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Nome Completo
            </label>
            <div className="relative mt-1.5">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-transparent py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 dark:border-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              E-mail institucional
            </label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-transparent py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 dark:border-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Telefone / WhatsApp
            </label>
            <div className="relative mt-1.5">
              <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                placeholder="(81) 99999-9999"
                inputMode="numeric"
                maxLength={15}
                autoComplete="tel"
                className="w-full rounded-xl border border-slate-200 bg-transparent py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 dark:border-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Curso Técnico
              </label>
              <div className="relative mt-1.5">
                <GraduationCap className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-transparent py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 dark:border-slate-800 dark:text-slate-100"
                >
                  {COURSES.map((c) => (
                    <option key={c.value} value={c.value} className="dark:bg-slate-900">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Turma
              </label>
              <div className="relative mt-1.5">
                <School className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={schoolClass}
                  onChange={(e) => setSchoolClass(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-transparent py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 dark:border-slate-800 dark:text-slate-100"
                >
                  {CLASSES.map((cl) => (
                    <option key={cl.value} value={cl.value} className="dark:bg-slate-900">
                      {cl.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-5 dark:border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>

      {/* Formulário Alterar Senha */}
      <form
        onSubmit={handleChangePassword}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
      >
        <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-amber-500" />
          Segurança & Alteração de Senha
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Senha Atual
            </label>
            <PasswordInput
                containerClassName="mt-1.5"
                leftIcon={<Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Sua senha atual..."
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-200 bg-transparent py-2.5 pl-10 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 dark:border-slate-800 dark:text-slate-100"
              />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Nova Senha (min. 6 car.)
              </label>
              <PasswordInput
                  containerClassName="mt-1.5"
                  leftIcon={<Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nova senha..."
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 bg-transparent py-2.5 pl-10 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 dark:border-slate-800 dark:text-slate-100"
                />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Confirmar Nova Senha
              </label>
              <PasswordInput
                  containerClassName="mt-1.5"
                  leftIcon={<Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha..."
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 bg-transparent py-2.5 pl-10 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 dark:border-slate-800 dark:text-slate-100"
                />
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-5 dark:border-slate-800">
          <button
            type="submit"
            disabled={savingPassword}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 active:scale-[0.99] disabled:opacity-50"
          >
            <KeyRound className="h-4 w-4" />
            {savingPassword ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </div>
      </form>
    </div>
  );
}
