// src/lib/img.ts
export function makeImgSrc(apiBase: string, imageUrl?: string | null) {
  const path = (imageUrl ?? "").replace(/^\/?/, "");
  return path ? `${apiBase}/${path}` : "/icon.png";
}
