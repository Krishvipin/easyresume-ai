import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Cross-browser, cross-protocol copy helper.
 * Safely copies text on Secure Contexts (HTTPS, localhost) as well as unsecure HTTP LAN IPs (http://192.168.x.x).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Try Modern Async Clipboard API (Secure contexts: HTTPS / localhost)
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard?.writeText &&
    typeof window !== "undefined" &&
    window.isSecureContext
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn(
        "[EasyResume AI] Async Clipboard API failed, falling back to execCommand...",
        err,
      );
    }
  }

  // 2. Universal Fallback for HTTP over LAN / non-secure contexts
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-999999px";
    textarea.style.top = "-999999px";
    textarea.setAttribute("readonly", "");
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    const successful = document.execCommand("copy");
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    console.error("[EasyResume AI] Fallback copy failed:", err);
    return false;
  }
}
