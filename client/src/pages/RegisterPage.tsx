import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { AvatarPicker, validateAvatarFile } from '../components/AvatarPicker';
import { PasswordStrengthHints } from '../components/PasswordStrengthHints';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Spinner } from '../ui/Spinner';
import { getErrorMessage } from '../utils/errors';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'Use at least 8 characters'),
  name: z.string().max(100, 'Name is too long').optional().or(z.literal('')),
  organization: z.string().max(100, 'Organization is too long').optional().or(z.literal('')),
  position: z.string().max(100, 'Position is too long').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio is too long').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const registerAction = useAuthStore((s) => s.register);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      organization: '',
      position: '',
      bio: '',
    },
  });

  const password = watch('password') ?? '';

  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string>('');
  const [uploadPercent, setUploadPercent] = useState<number>(0);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  const canSubmit = useMemo(() => {
    if (avatarError) return false;
    return true;
  }, [avatarError]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h1 className="text-xl font-semibold">Create account</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Register to access your profile.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={handleSubmit(async (values) => {
          if (!canSubmit) return;

          try {
            setUploadPercent(0);
            await registerAction(
              {
                email: values.email,
                password: values.password,
                name: values.name || undefined,
                organization: values.organization || undefined,
                position: values.position || undefined,
                bio: values.bio || undefined,
                avatar,
              },
              {
                onUploadProgress: (e) => {
                  if (!e.total) return;
                  setUploadPercent(Math.round((e.loaded / e.total) * 100));
                },
              },
            );

            toast.success('Account created');
            navigate('/app/profile', { replace: true });
          } catch (err) {
            toast.error(getErrorMessage(err));
          } finally {
            setUploadPercent(0);
          }
        })}
      >
        <div>
          <label className="text-sm font-medium">Avatar (optional)</label>
          <div className="mt-2">
            <AvatarPicker
              value={avatar}
              previewUrl={avatarPreviewUrl}
              onPick={(file) => {
                const result = validateAvatarFile(file);
                if (!result.ok) {
                  setAvatarError(result.message);
                  return;
                }

                setAvatarError('');

                if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
                setAvatar(file);
                setAvatarPreviewUrl(URL.createObjectURL(file));
              }}
              onClear={() => {
                setAvatar(null);
                setAvatarError('');
                if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
                setAvatarPreviewUrl(null);
              }}
              disabled={isSubmitting}
              error={avatarError}
            />
          </div>
        </div>

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
            <Input type="password" autoComplete="new-password" {...register('password')} />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">
              {errors.password.message}
            </p>
          )}
          <PasswordStrengthHints password={password} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Name</label>
            <div className="mt-1">
              <Input type="text" autoComplete="name" {...register('name')} />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Organization</label>
            <div className="mt-1">
              <Input type="text" {...register('organization')} />
            </div>
            {errors.organization && (
              <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">
                {errors.organization.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Position</label>
            <div className="mt-1">
              <Input type="text" {...register('position')} />
            </div>
            {errors.position && (
              <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">
                {errors.position.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Bio</label>
          <div className="mt-1">
            <Textarea rows={4} {...register('bio')} />
          </div>
          {errors.bio && (
            <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{errors.bio.message}</p>
          )}
        </div>

        {isSubmitting && uploadPercent > 0 && (
          <div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Uploading…</span>
              <span>{uploadPercent}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
              <div
                className="h-2 bg-indigo-600 dark:bg-indigo-500"
                style={{ width: `${uploadPercent}%` }}
              />
            </div>
          </div>
        )}

        <Button type="submit" disabled={isSubmitting || !canSubmit} className="w-full">
          {isSubmitting ? (
            <>
              <Spinner />
              Creating…
            </>
          ) : (
            'Create account'
          )}
        </Button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
