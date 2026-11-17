const binaries = new Map<string, Promise<ArrayBuffer>>();
const images = new Map<string, Promise<HTMLImageElement>>();

/** Keep model bytes for the current visit; warmup and the actual renderer never fetch twice. */
export function loadModelBytes(url: string): Promise<ArrayBuffer> {
  const cached = binaries.get(url);
  if (cached) return cached;
  const request = fetch(url, { signal: AbortSignal.timeout(12_000) }).then(response => {
    if (!response.ok) throw new Error('Model unavailable');
    return response.arrayBuffer();
  }).catch(error => { binaries.delete(url); throw error; });
  binaries.set(url, request);
  return request;
}

export function prepareImage(url: string): Promise<HTMLImageElement> {
  const cached = images.get(url);
  if (cached) return cached;
  const request = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const timer = window.setTimeout(() => { image.src = ''; reject(new Error('Image timed out')); }, 12_000);
    image.onload = () => {
      void image.decode().catch(() => {}).then(() => { clearTimeout(timer); resolve(image); });
    };
    image.onerror = () => { clearTimeout(timer); reject(new Error('Image unavailable')); };
    image.src = url;
  }).catch(error => { images.delete(url); throw error; });
  images.set(url, request);
  return request;
}
