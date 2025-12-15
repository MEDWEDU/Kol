import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { AvatarPicker, validateAvatarFile } from '../components/AvatarPicker';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { Textarea } from '../ui/Textarea';
import { getErrorMessage } from '../utils/errors';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  name: z.string().max(100, 'Name is too long').optional().or(z.literal('')),
  organization: z.string().max(100, 'Organization is too long').optional().or(z.literal('')),
  position: z.string().max(100, 'Position is too long').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio is too long').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const getMe = useAuthStore((s) => s.getMe);
  const updateMe = useAuthStore((s) => s.updateMe);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: user?.email ?? '',
      name: user?.name ?? '',
      organization: user?.organization ?? '',
      position: user?.position ?? '',
      bio: user?.bio ?? '',
    },
  });

  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string>('');
  const [uploadPercent, setUploadPercent] = useState<number>(0);

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        name: user.name,
        organization: user.organization,
        position: user.position,
        bio: user.bio,
      });
    }
  }, [user, reset]);

  useEffect(() => {
    void (async () => {
      try {
        const fresh = await getMe();
        reset({
          email: fresh.email,
          name: fresh.name,
          organization: fresh.organization,
          position: fresh.position,
          bio: fresh.bio,
        });
      } catch {
        // AuthGate handles the unauthenticated case.
      }
    })();
  }, [getMe, reset]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Your profile</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Update your public details and avatar.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (values) => {
            if (avatarError) return;

            try {
              setUploadPercent(0);
              await updateMe(
                {
                  email: values.email,
                  name: values.name || '',
                  organization: values.organization || '',
                  position: values.position || '',
                  bio: values.bio || '',
                  avatar,
                },
                {
                  onUploadProgress: (e) => {
                    if (!e.total) return;
                    setUploadPercent(Math.round((e.loaded / e.total) * 100));
                  },
                },
              );

              setAvatar(null);
              if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
              setAvatarPreviewUrl(null);

              toast.success('Profile updated');
            } catch (err) {
              toast.error(getErrorMessage(err));
            } finally {
              setUploadPercent(0);
            }
          })}
        >
          <div>
            <label className="text-sm font-medium">Avatar</label>
            <div className="mt-2">
              <AvatarPicker
                value={avatar}
                previewUrl={avatarPreviewUrl}
                existingUrl={user?.avatarUrl}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Email</label>
              <div className="mt-1">
                <Input type="email" autoComplete="email" {...register('email')} />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">
                  {errors.email.message}
                </p>
              )}
            </div>

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

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || Boolean(avatarError) || (!isDirty && !avatar)}
            >
              {isSubmitting ? (
                <>
                  <Spinner />
                  Saving…
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
