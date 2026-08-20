export function isLikelyMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export async function downloadPdfFile(url: string, filename: string) {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "PDF download failed.");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  // iOS Safari often ignores the download attribute; open the file instead.
  if (isLikelyMobileBrowser()) {
    const opened = window.open(objectUrl, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.assign(objectUrl);
    }
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    return;
  }

  const link = window.document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export function openPdfForPrint(url: string) {
  // iframe.contentWindow.print() is unreliable on mobile browsers.
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    window.location.assign(url);
  }
}
