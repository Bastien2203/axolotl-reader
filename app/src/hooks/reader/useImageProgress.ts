import { useEffect } from "react";
import { Publication } from "../../types";
import { getBookProgress, setBookProgress } from "../../services/Book";

export const useImageProgress = (
  images: string[],
  containerRef: React.RefObject<HTMLDivElement | null>,
  book: Publication,
  setProgress: (p: number) => void
) => {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const scrollTop = el.scrollTop;
      const maxScroll = el.scrollHeight - el.clientHeight;
      const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

      setProgress(progress);
      setBookProgress(book.metadata.identifier, progress);
    };


    const adjustScrollToProgress = () => {
      const savedProgress = getBookProgress(book.metadata.identifier)?.progress; 
      if (savedProgress && el) {
        const maxScroll = el.scrollHeight - el.clientHeight;
        const targetScrollTop = (savedProgress / 100) * maxScroll;
        el.scrollTo({ top: targetScrollTop });
        setProgress(savedProgress); 
      }
    };

    const timeout = setTimeout(adjustScrollToProgress, 0);
    el.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(timeout);
      el.removeEventListener("scroll", onScroll);
    };
  }, [images, book, setProgress]);
};
