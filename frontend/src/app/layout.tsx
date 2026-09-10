import type { Metadata } from 'next';
import { ToastProvider } from '@/components/toast-provider';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Biblioteca Virtual — ETE Integrado',
  description:
    'Plataforma digital completa de gestão de acervo, catálogo, reservas e empréstimos da Biblioteca da Escola Técnica Estadual (ETE). Acesse o acervo, solicite reservas online e gerencie seu perfil.',
  icons: {
    icon: '/ete-logo.png',
    shortcut: '/ete-logo.png',
    apple: '/ete-logo.png',
  },
};

const themeInitializer = `
  (function () {
    try {
      var savedTheme = localStorage.getItem('biblioteca-theme') || localStorage.getItem('theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var isDark = savedTheme === 'dark' || (savedTheme !== 'light' && prefersDark);
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    } catch (_) {}
  })();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
      </head>
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
