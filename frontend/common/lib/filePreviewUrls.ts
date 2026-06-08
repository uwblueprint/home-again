export function isImage(file: File): boolean {
  return file.type.startsWith("image/");
}

interface PreviewUrlEntry {
  url: string;
  refs: number;
}

const filePreviewUrlCache = new WeakMap<File, PreviewUrlEntry>();

export function getFilePreviewUrl(file: File): string {
  const cached = filePreviewUrlCache.get(file);
  if (cached) {
    cached.refs += 1;
    return cached.url;
  }

  const url = URL.createObjectURL(file);
  filePreviewUrlCache.set(file, { url, refs: 1 });
  return url;
}

export function revokeFilePreviewUrl(file: File): void {
  const cached = filePreviewUrlCache.get(file);
  if (!cached) return;

  if (cached.refs > 1) {
    cached.refs -= 1;
    return;
  }

  URL.revokeObjectURL(cached.url);
  filePreviewUrlCache.delete(file);
}

export function revokeFilePreviewUrls(files: File[]): void {
  files.forEach((file) => revokeFilePreviewUrl(file));
}
