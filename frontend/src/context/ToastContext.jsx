import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Stamped-ledger style confirmation — full-width banner on mobile,
          a small rotated "stamp" card on larger screens. */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-4 sm:right-4 z-50 flex flex-col gap-2 items-center sm:items-end p-3 sm:p-0 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto w-full sm:w-auto max-w-sm px-4 py-3 rounded border-2 border-dashed shadow-lg text-sm font-mono uppercase tracking-wide animate-toast-in ${
              t.type === "error" ? "bg-alert border-alert/60 text-bone" : "bg-signal border-ink/30 text-ink"
            }`}
          >
            {t.type === "error" ? "✕ " : "✓ "}{t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
