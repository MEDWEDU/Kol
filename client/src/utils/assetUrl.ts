export function resolveAssetUrl(path: string) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;

  const base = import.meta.env.VITE_API_URL;
  if (!base) return path;

  return new URL(path, base).toString();
}
