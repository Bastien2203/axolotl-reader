import { useEffect } from "react";

export const useAutoHideOverlay = (overlay: boolean, loading: string | null, onHide: () => void) => {
  useEffect(() => {
    if (!overlay || loading) return;
    const timeout = setTimeout(onHide, 5000);
    return () => clearTimeout(timeout);
  }, [overlay, loading]);
};
