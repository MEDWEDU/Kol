type Props = {
  password: string;
};

function Hint({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}>
      {label}
    </li>
  );
}

export function PasswordStrengthHints({ password }: Props) {
  const hasMinLength = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  return (
    <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
      <p className="font-medium text-slate-700 dark:text-slate-200">Password strength</p>
      <ul className="mt-2 space-y-1">
        <Hint ok={hasMinLength} label="At least 8 characters" />
        <Hint ok={hasLower} label="Lowercase letter" />
        <Hint ok={hasUpper} label="Uppercase letter" />
        <Hint ok={hasNumber} label="Number" />
        <Hint ok={hasSymbol} label="Symbol" />
      </ul>
    </div>
  );
}
