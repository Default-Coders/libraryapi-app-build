'use client';

import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  containerClassName?: string;
  leftIcon?: ReactNode;
}

export function PasswordInput({
  className = '',
  containerClassName = '',
  leftIcon,
  disabled,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`relative ${containerClassName}`}>
      {leftIcon}
      <input
        {...props}
        disabled={disabled}
        type={visible ? 'text' : 'password'}
        className={`${className} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        disabled={disabled}
        aria-label={visible ? 'Ocultar senha' : 'Exibir senha'}
        aria-pressed={visible}
        title={visible ? 'Ocultar senha' : 'Exibir senha'}
        className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
