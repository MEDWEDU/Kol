import type { PropsWithChildren } from 'react';
import { Toaster } from 'react-hot-toast';

import { useThemeStore } from '../stores/themeStore';

export function ToastProvider({ children }: PropsWithChildren) {
  const theme = useThemeStore((s) => s.theme);

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            'rounded-md border text-sm shadow-lg ' +
            (theme === 'dark'
              ? 'border-slate-800 bg-slate-900 text-slate-100'
              : 'border-slate-200 bg-white text-slate-900'),
        }}
      />
    </>
  );
}
