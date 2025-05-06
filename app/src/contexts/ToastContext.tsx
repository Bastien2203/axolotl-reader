import { createContext, useContext, useState, ReactNode } from "react";
import Toast from "../components/common/Toast";

type ToastProps = {
  message: string;
  type: "alert-info" | "alert-success" | "alert-error" | "alert-warning";
};

type ToastContextType = {
  showToast: (toast: ToastProps) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = (toast: ToastProps) => {
    setToast(toast);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast {...toast} />}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
