import { toBlob } from "html-to-image";

export type ShareImageResult = "shared" | "downloaded" | "cancelled";

/**
 * Captures a DOM element as a PNG and, where the browser/OS supports the Web Share API with
 * files (most Android and iOS browsers), opens the native share sheet with the image already
 * attached — the user just picks WhatsApp and a contact. Where file sharing isn't supported
 * (most desktop browsers), it downloads the PNG instead so it can be attached manually.
 */
export async function shareOrDownloadImage(
  element: HTMLElement,
  filename: string,
  shareText: string,
): Promise<ShareImageResult> {
  const blob = await toBlob(element, { pixelRatio: 3, backgroundColor: "#ffffff" });
  if (!blob) {
    throw new Error("Couldn't generate the receipt image.");
  }

  const file = new File([blob], filename, { type: "image/png" });

  if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: shareText });
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return "cancelled";
      }
      // Fall through to download if sharing failed for another reason (e.g. a stale user gesture).
    }
  }

  downloadBlob(blob, filename);
  return "downloaded";
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
