'use client';

const THEME_KEY = 'biblioteca-theme';
const LEGACY_THEME_KEY = 'theme';

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
}

export function restoreTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) ?? localStorage.getItem(LEGACY_THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme === 'dark' || (savedTheme !== 'light' && prefersDark));
}

export function toggleTheme() {
  const isDark = !document.documentElement.classList.contains('dark');
  const theme = isDark ? 'dark' : 'light';

  applyTheme(isDark);
  localStorage.setItem(THEME_KEY, theme);
  localStorage.setItem(LEGACY_THEME_KEY, theme);
}
