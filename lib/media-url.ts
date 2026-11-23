/** Resolve stored R2 keys through the existing public media endpoint. */
export function getMediaUrl(value?: string | null): string | null {
  if (!value?.trim()) return null;
  const input = value.trim();
  if (/^(https?:)?\/\//i.test(input) || /^(data:|blob:)/i.test(input)) return input;
  if (input.startsWith('/api/media?')) return input;
  if (input.startsWith('api/media?')) return `/${input}`;
  const key = input.replace(/^\/+/, '');
  return `/api/media?key=${encodeURIComponent(key)}`;
}
