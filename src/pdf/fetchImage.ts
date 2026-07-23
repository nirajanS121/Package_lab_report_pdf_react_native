export interface FetchedImage {
  bytes: ArrayBuffer;
  format: "png" | "jpg";
}

const cache = new Map<string, Promise<FetchedImage | null>>();

async function fetchImageUncached(url: string): Promise<FetchedImage | null> {
  try {
    const controller =
      typeof AbortController !== "undefined"
        ? new AbortController()
        : undefined;
    const timeoutId = controller
      ? setTimeout(() => controller.abort(), 10000)
      : undefined;
    const response = await fetch(url, { signal: controller?.signal });
    if (timeoutId) clearTimeout(timeoutId);
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") || "";
    const isPng = contentType.includes("png") || /\.png($|\?)/i.test(url);
    const bytes = await response.arrayBuffer();
    return { bytes, format: isPng ? "png" : "jpg" };
  } catch {
    return null;
  }
}

export function fetchImage(url: string): Promise<FetchedImage | null> {
  if (!url) return Promise.resolve(null);
  if (!cache.has(url)) {
    cache.set(url, fetchImageUncached(url));
  }
  return cache.get(url)!;
}
