import type { TextareaHTMLAttributes } from 'react';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className = '', ...props }: Props) {
  return (
    <textarea
      className={`w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-indigo-500 focus:ring-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 ${className}`}
      {...props}
    />
  );
}
