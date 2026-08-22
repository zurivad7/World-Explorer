/**
 * Resolve a public asset path against the app's base URL.
 *
 * Vite serves the app at `import.meta.env.BASE_URL` ('/' locally, '/World-Explorer/'
 * on GitHub Pages). Asset paths stored in content data use a leading-slash,
 * root-relative form (e.g. '/assets/flags/fr.svg'); this rewrites them to include
 * the base so they resolve under a sub-path deployment too.
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}
