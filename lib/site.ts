/** Set NEXT_PUBLIC_SITE_URL to the verified public origin before launch. */
export function getSiteUrl(): URL | undefined {
  const value = process.env.NEXT_PUBLIC_SITE_URL;
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return undefined;
    return new URL(url.origin);
  } catch { return undefined; }
}
