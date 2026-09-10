/** Prefix a public-path with Vite's base (Grok `/`, GitHub Pages `/covington-field-book/`). */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const trimmed = path.replace(/^\/+/, "");
  return `${base}${trimmed}`;
}
