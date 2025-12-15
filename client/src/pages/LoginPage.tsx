import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useAuthStore } from '../stores/authStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { getErrorMessage } from '../utils/errors';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ||
    '/app/profile';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h1 className="text-xl font-semibold">Login</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Use your email and password.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={handleSubmit(async (values) => {
          try {
            await login(values);
            toast.success('Welcome back');
            navigate(from, { replace: true });
          } catch (err) {
            toast.error(getErrorMessage(err));
          }
        })}
      >
        <div>
          <label className="text-sm font-medium">Email</label>
          <div className="mt-1">
            <Input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Password</label>
          <div className="mt-1">
            <Input type="password" autoComplete="current-password" {...register('password')} />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Spinner />
              Logging in…
            </>
          ) : (
            'Login'
          )}
        </Button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          New here?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
