'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  ChevronDown,
  GraduationCap,
  Lock,
  Mail,
  Moon,
  Phone,
  Search,
  Sun,
  User,
  UserPlus,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { setAuthData } from '@/lib/auth';
import { PasswordInput } from '@/components/password-input';
import { toggleTheme } from '@/lib/theme';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Constants ──────────────────────────────────────────────── */

const COURSES = [
  { value: 'SYSTEMS_DEVELOPMENT', label: 'Desenvolvimento de Sistemas' },
  { value: 'NUTRITION_AND_DIETETICS', label: 'Nutrição e Dietética' },
];

const CLASSES = [
  { value: 'FIRST_A', label: '1º A' },
  { value: 'FIRST_B', label: '1º B' },
  { value: 'SECOND_A', label: '2º A' },
  { value: 'SECOND_B', label: '2º B' },
  { value: 'THIRD_A', label: '3º A' },
  { value: 'THIRD_B', label: '3º B' },
];

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/* ─── Features data ──────────────────────────────────────────── */

const FEATURES = [
  {
    icon: Search,
    title: 'Catálogo Digital',
    description: 'Explore o acervo completo de livros da escola com busca e filtros por categoria.',
  },
  {
    icon: CalendarCheck,
    title: 'Reservas Online',
    description: 'Solicite reservas diretamente do sistema e acompanhe seus empréstimos.',
  },
  {
    icon: BookOpen,
    title: 'Lista de Espera',
    description: 'Se o exemplar está emprestado, entre na fila e seja notificado quando liberar.',
  },
];

/* ═══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // State Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State Cadastro
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCourse, setRegCourse] = useState(COURSES[0].value);
  const [regSchoolClass, setRegSchoolClass] = useState(CLASSES[0].value);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Refs for GSAP
  const heroRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  /* ─── GSAP ScrollTrigger animations ────────────────────────── */
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Make all gsap-reveal elements visible without animation
      document.querySelectorAll('.gsap-reveal, .gsap-reveal-left, .gsap-reveal-right').forEach((el) => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'none';
      });
      return;
    }

    const ctx = gsap.context(() => {
      // Hero parallax title
      if (heroRef.current) {
        const heroTitle = heroRef.current.querySelector('.hero-title');
        const heroSubtitle = heroRef.current.querySelector('.hero-subtitle');
        if (heroTitle) {
          gsap.from(heroTitle, {
            y: 40,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
          });
        }
        if (heroSubtitle) {
          gsap.from(heroSubtitle, {
            y: 30,
            opacity: 0,
            duration: 1,
            delay: 0.2,
            ease: 'power3.out',
          });
        }

        // Parallax effect on hero during scroll
        gsap.to(heroRef.current.querySelector('.hero-content'), {
          y: -60,
          opacity: 0.3,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // About section reveal
      if (aboutRef.current) {
        gsap.utils.toArray<HTMLElement>(aboutRef.current.querySelectorAll('.gsap-reveal')).forEach((el, i) => {
          gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            delay: i * 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          });
        });
      }

      // Features cards stagger reveal
      if (featuresRef.current) {
        gsap.utils.toArray<HTMLElement>(featuresRef.current.querySelectorAll('.feature-card')).forEach((el, i) => {
          gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: i * 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          });
        });
      }

      // CTA section
      if (ctaRef.current) {
        gsap.utils.toArray<HTMLElement>(ctaRef.current.querySelectorAll('.gsap-reveal')).forEach((el) => {
          gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          });
        });
      }
    });

    return () => ctx.revert();
  }, []);

  /* ─── Lock body scroll when auth modal is open ─────────────── */
  useEffect(() => {
    if (showAuth) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [showAuth]);

  /* ─── Handlers ─────────────────────────────────────────────── */

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || body.error || 'Credenciais inválidas. Tente novamente.');
      }

      const data = await response.json();
      setAuthData(data.role, data.name, data.email);
      toast.success(`Bem-vindo(a), ${data.name}!`);

      if (data.role === 'ROLE_ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/aluno/dashboard');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: regName,
            email: regEmail,
            password: regPassword,
            phone: regPhone,
            course: regCourse,
            schoolClass: regSchoolClass,
          }),
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || body.error || 'Erro ao realizar cadastro. Tente novamente.');
      }

      const data = await response.json();
      setAuthData(data.role, data.name, data.email);
      toast.success('Cadastro realizado com sucesso! Redirecionando...');

      setTimeout(() => {
        router.push('/aluno/dashboard');
      }, 1000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao cadastrar conta');
    } finally {
      setLoading(false);
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */

  return (
    <div className="relative min-h-screen bg-[#f4f2ee] text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {/* ── Theme Toggle (fixed) ──────────────────────────────── */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Alternar entre tema claro e escuro"
        title="Alternar tema"
        className="fixed right-4 top-4 z-50 grid h-10 w-10 place-items-center rounded-xl border border-slate-200/60 bg-white/80 text-slate-600 shadow-sm backdrop-blur-md transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700/60 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800 sm:right-6 sm:top-6"
      >
        <Sun className="hidden h-4 w-4 dark:block" />
        <Moon className="h-4 w-4 dark:hidden" />
      </button>

      {/* ═══════════════════════════════════════════════════════════
         SECTION 1 — HERO
         ═══════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="landing-section landing-hero relative px-6"
      >
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-400/5" />
          <div className="absolute -left-20 bottom-20 h-72 w-72 rounded-full bg-slate-500/5 blur-3xl dark:bg-slate-400/5" />
        </div>

        <div className="hero-content relative z-10 flex flex-col items-center text-center">
          {/* Logo */}
          <div className="mb-8 rounded-2xl border border-slate-200/50 bg-white/60 p-5 shadow-lg backdrop-blur-md dark:border-slate-700/40 dark:bg-slate-900/60">
            <Image
              src="/ete-logo.png"
              alt="Logo da ETE - Escola Técnica Estadual"
              width={280}
              height={150}
              priority
              className="h-24 w-auto object-contain sm:h-32"
            />
          </div>

          {/* Title */}
          <h1 className="hero-title max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="landing-gradient-text">Biblioteca Virtual</span>
          </h1>

          <p className="hero-subtitle mt-4 max-w-xl text-base font-medium text-slate-600 dark:text-slate-400 sm:text-lg">
            Escola Técnica Estadual — ETE Integrado
          </p>

          {/* Scroll indicator */}
          <div className="mt-16 flex flex-col items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Descubra mais
            </span>
            <ChevronDown className="h-5 w-5 animate-bounce text-slate-400 dark:text-slate-500" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         SECTION 2 — ABOUT / WELCOME
         ═══════════════════════════════════════════════════════════ */}
      <section
        ref={aboutRef}
        className="relative flex min-h-[70vh] flex-col items-center justify-center px-6 py-24"
      >
        <div className="mx-auto max-w-3xl text-center">
          <span className="gsap-reveal inline-block rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:border-blue-800/50 dark:bg-blue-950/50 dark:text-blue-300">
            Bem-vindo(a) ao acervo
          </span>

          <h2 className="gsap-reveal mt-6 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            Sua biblioteca escolar,{' '}
            <span className="landing-gradient-text">em um só lugar</span>
          </h2>

          <p className="gsap-reveal mt-6 text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">
            Explore o acervo completo de livros da ETE, acompanhe seus empréstimos,
            solicite reservas online e gerencie seu perfil acadêmico com facilidade
            e rapidez. Tudo digital, tudo organizado.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         SECTION 3 — FEATURES
         ═══════════════════════════════════════════════════════════ */}
      <section
        ref={featuresRef}
        className="relative px-6 py-20"
      >
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="feature-card gsap-reveal group rounded-2xl border border-slate-200/80 bg-white/70 p-7 backdrop-blur-sm transition hover:border-blue-200 hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-900/70 dark:hover:border-slate-700"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:group-hover:bg-blue-900/50">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         SECTION 4 — CTA
         ═══════════════════════════════════════════════════════════ */}
      <section
        ref={ctaRef}
        className="relative flex min-h-[50vh] flex-col items-center justify-center px-6 py-20"
      >
        <div className="mx-auto max-w-lg text-center">
          <h2 className="gsap-reveal text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Pronto para começar?
          </h2>
          <p className="gsap-reveal mt-4 text-base text-slate-600 dark:text-slate-400">
            Acesse sua conta ou cadastre-se para explorar todo o acervo da
            Biblioteca Virtual da ETE.
          </p>
          <div className="gsap-reveal mt-8">
            <button
              onClick={() => setShowAuth(true)}
              className="group inline-flex items-center gap-2.5 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 hover:shadow-blue-500/30 active:scale-[0.98]"
            >
              Acessar o Sistema
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         FOOTER
         ═══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-slate-200/60 bg-white/50 px-6 py-10 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-950/50">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
          <Image
            src="/ete-logo.png"
            alt="Logo da ETE"
            width={100}
            height={50}
            className="h-10 w-auto object-contain opacity-60"
          />
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Biblioteca Virtual — Escola Técnica Estadual — ETE Integrado
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-600">
            © {new Date().getFullYear()} ETE. Sistema de gestão do acervo escolar.
          </p>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════
         AUTH MODAL OVERLAY
         ═══════════════════════════════════════════════════════════ */}
      {showAuth && (
        <div
          className="modal-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => setShowAuth(false)}
        >
          <div
            className="modal-content w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowAuth(false)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Voltar</span>
              </button>
            </div>

            {/* Logo & Title */}
            <div className="mt-4 text-center space-y-2">
              <Image
                src="/ete-logo.png"
                alt="Logo da ETE"
                width={200}
                height={100}
                priority
                className="mx-auto mb-2 h-16 w-auto object-contain sm:h-20"
              />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                Acesse sua conta
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                {activeTab === 'login'
                  ? 'Insira suas credenciais para entrar no sistema'
                  : 'Preencha os campos abaixo para criar sua conta'}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="mt-6 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800/60">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition sm:text-sm ${
                  activeTab === 'login'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <User className="h-4 w-4" />
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition sm:text-sm ${
                  activeTab === 'register'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <UserPlus className="h-4 w-4" />
                Cadastrar-se
              </button>
            </div>

            {/* ── Login Form ──────────────────────────────────── */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    E-mail Institucional
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@escola.edu.br"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-100 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                    <PasswordInput
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-100 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-slate-900 mt-2 shadow-sm"
                >
                  {loading ? 'Entrando...' : 'Entrar no Sistema'}
                </button>

                <div className="relative flex items-center justify-center py-2">
                  <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400 px-3">ou</span>
                  <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                </div>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                  Ainda não possui uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Faça seu cadastro
                  </button>
                </p>
              </form>
            )}

            {/* ── Register Form ───────────────────────────────── */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="mt-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-100 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    E-mail Institucional
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="seu.email@escola.edu.br"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-100 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                    <PasswordInput
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Sua senha (mínimo 6 caracteres)"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-100 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Telefone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(maskPhone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-100 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-8 space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Curso Técnico
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select
                        value={regCourse}
                        onChange={(e) => setRegCourse(e.target.value)}
                        className="w-full pl-9 pr-2 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 sm:text-sm transition"
                      >
                        {COURSES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-span-4 space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Turma
                    </label>
                    <select
                      value={regSchoolClass}
                      onChange={(e) => setRegSchoolClass(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 sm:text-sm transition"
                    >
                      {CLASSES.map((cls) => (
                        <option key={cls.value} value={cls.value}>
                          {cls.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-slate-900 mt-2 shadow-sm"
                >
                  {loading ? 'Cadastrando...' : 'Criar minha conta'}
                </button>

                <div className="relative flex items-center justify-center py-2">
                  <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400 px-3">ou</span>
                  <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                </div>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                  Já possui uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Faça login
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
