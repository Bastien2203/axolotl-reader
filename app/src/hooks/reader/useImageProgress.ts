import { useEffect } from "react";
import { getBookProgress, setBookProgress } from "../../services/Book";
import { Publication } from "../../services/OPDS";

export const useImageProgress = (
  images: string[],
  containerRef: React.RefObject<HTMLDivElement | null>,
  book: Publication | null,
  setProgress: (p: number) => void
) => {
  useEffect(() => {
    if (!book || !images.length) return;
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const scrollTop = el.scrollTop;
      const maxScroll = el.scrollHeight - el.clientHeight;
      const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

      setProgress(progress);
      setBookProgress(book.id, progress);
    };


    const adjustScrollToProgress = () => {
      const savedProgress = getBookProgress(book.id)?.progress; 
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
