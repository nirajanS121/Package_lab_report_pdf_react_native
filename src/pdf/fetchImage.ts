export interface FetchedImage {
  bytes: ArrayBuffer;
  format: "png" | "jpg";
}

const cache = new Map<string, Promise<FetchedImage | null>>();

async function fetchImageUncached(url: string): Promise<FetchedImage | null> {
  const t0 = Date.now();
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
    if (!response.ok) {
      console.log(
        `[lab-pdf-view] fetch NOT OK (${response.status}) after ${Date.now() - t0}ms: ${url}`,
      );
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    const isPng = contentType.includes("png") || /\.png($|\?)/i.test(url);
    const bytes = await response.arrayBuffer();
    console.log(
      `[lab-pdf-view] fetch OK, ${bytes.byteLength} bytes in ${Date.now() - t0}ms: ${url}`,
    );
    return { bytes, format: isPng ? "png" : "jpg" };
  } catch (error) {
    console.log(
      `[lab-pdf-view] fetch THREW after ${Date.now() - t0}ms (likely 10s timeout abort): ${url}`,
      error,
    );
    return null;
  }
}

export function fetchImage(url: string): Promise<FetchedImage | null> {
  if (!url) return Promise.resolve(null);
  if (cache.has(url)) {
    console.log(`[lab-pdf-view] fetchImage module-cache hit: ${url}`);
  } else {
    cache.set(url, fetchImageUncached(url));
  }
  return cache.get(url)!;
}
