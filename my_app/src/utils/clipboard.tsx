export const copyTextToClipboard = async (text: string) => {
  const value = text.trim();

  if (!value) {
    return false;
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch (error) {
      console.log("Clipboard API failed", error);
    }
  }

  if (typeof document !== "undefined") {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);

      return copied;
    } catch (error) {
      console.log("execCommand clipboard fallback failed", error);
    }
  }

  return false;
};
