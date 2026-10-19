// Küçük hash tabanlı yönlendirici: #/riffler/du-hast gibi adresler. Statik sunucuda ve PWA'da sorunsuz çalışır.

import { useSyncExternalStore, type AnchorHTMLAttributes } from 'react';

function currentPath(): string {
  const h = window.location.hash.replace(/^#/, '');
  const p = h.split('?')[0];
  return p.startsWith('/') ? p : `/${p}`;
}

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

export function usePath(): string {
  return useSyncExternalStore(subscribe, currentPath);
}

export function navigate(to: string) {
  if (currentPath() === to) return;
  window.location.hash = to;
}

/** "/riffler/:id" kalıbını yol ile eşleştirir. */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const a = pattern.split('/').filter(Boolean);
  const b = path.split('/').filter(Boolean);
  if (a.length !== b.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) params[a[i].slice(1)] = decodeURIComponent(b[i]);
    else if (a[i] !== b[i]) return null;
  }
  return params;
}

export function Link({ to, ...rest }: { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a href={`#${to}`} {...rest} />;
}
