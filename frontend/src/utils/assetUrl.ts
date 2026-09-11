/** Prefix app-relative asset paths with Vite `base` (needed on GitHub Pages). Idempotent. */
export function assetUrl(path?: string | null): string {
  if (!path) return '';
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  if (!base) return path.startsWith('/') ? path : `/${path}`;
  // Avoid /shopping/shopping/... when callers already applied the base.
  if (path === base || path.startsWith(`${base}/`)) return path;
  if (path.startsWith('/')) return `${base}${path}`;
  return `${base}/${path}`;
}
