/**
 * Minimal toast utility without an external library.
 * Dispatches custom DOM events that the ToastContainer component listens to.
 * WHY not a library: keeps bundle lean; the design system handles toast UI.
 */

type ToastType = "success" | "error" | "warning" | "info";

interface ToastEvent {
  message: string;
  type: ToastType;
  id: string;
}

function dispatch(message: string, type: ToastType) {
  if (typeof window === "undefined") return;
  const event = new CustomEvent<ToastEvent>("campus-toast", {
    detail: { message, type, id: crypto.randomUUID() },
  });
  window.dispatchEvent(event);
}

export const toast = {
  success: (msg: string) => dispatch(msg, "success"),
  error: (msg: string) => dispatch(msg, "error"),
  warning: (msg: string) => dispatch(msg, "warning"),
  info: (msg: string) => dispatch(msg, "info"),
};
