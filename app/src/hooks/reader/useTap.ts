import { useRef } from "react";

export const useTap = (onTap: () => void, threshold = 10) => {
  const startX = useRef(0);
  const startY = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const dx = Math.abs(touch.clientX - startX.current);
    const dy = Math.abs(touch.clientY - startY.current);
    if (dx < threshold && dy < threshold) {
      onTap();
    }
  };

  return { onTouchStart, onTouchEnd };
};
