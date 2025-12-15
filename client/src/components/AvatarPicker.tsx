import { useId } from 'react';

import { Button } from '../ui/Button';
import { resolveAssetUrl } from '../utils/assetUrl';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxBytes = 5 * 1024 * 1024;

export type AvatarValidationResult = { ok: true } | { ok: false; message: string };

export function validateAvatarFile(file: File): AvatarValidationResult {
  if (!allowedTypes.has(file.type)) {
    return { ok: false, message: 'Only JPG, PNG or WEBP images are allowed' };
  }

  if (file.size > maxBytes) {
    return { ok: false, message: 'Avatar must be 5MB or smaller' };
  }

  return { ok: true };
}

type Props = {
  value: File | null;
  previewUrl: string | null;
  existingUrl?: string;
  onPick: (file: File) => void;
  onClear: () => void;
  disabled?: boolean;
  error?: string;
};

export function AvatarPicker({
  value,
  previewUrl,
  existingUrl,
  onPick,
  onClear,
  disabled,
  error,
}: Props) {
  const inputId = useId();

  const showUrl = previewUrl || (existingUrl ? resolveAssetUrl(existingUrl) : '');

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
          {showUrl ? (
            <img src={showUrl} alt="Avatar preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
              No avatar
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={disabled}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              onPick(file);
            }}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => document.getElementById(inputId)?.click()}
              disabled={disabled}
            >
              {value ? 'Change avatar' : 'Upload avatar'}
            </Button>

            {(value || previewUrl) && (
              <Button type="button" variant="secondary" onClick={onClear} disabled={disabled}>
                Remove
              </Button>
            )}
          </div>

          <p className="text-xs text-slate-500">JPG / PNG / WEBP · up to 5MB</p>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
