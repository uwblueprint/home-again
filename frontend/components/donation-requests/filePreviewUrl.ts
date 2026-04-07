const filePreviewUrlCache = new WeakMap<File, string>();

export function getFilePreviewUrl(file: File): string {
  const cached = filePreviewUrlCache.get(file);
  if (cached) return cached;

  const url = URL.createObjectURL(file);
  filePreviewUrlCache.set(file, url);
  return url;
}

export function refreshFilePreviewUrl(file: File): string {
  const previous = filePreviewUrlCache.get(file);
  if (previous) {
    URL.revokeObjectURL(previous);
  }

  const url = URL.createObjectURL(file);
  filePreviewUrlCache.set(file, url);
  return url;
}
