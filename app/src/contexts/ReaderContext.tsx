import { createContext, useContext, useState, ReactNode } from "react";
import { Publication } from "../types";
import Reader from "../components/Reader";

type ReaderProps = {
      book: Publication;
      onClose?: () => void;
      onNext?: () => void;
      onPrev?: () => void;
};

type ReaderContextType = {
  showReader: (reader: ReaderProps) => void;
  closeReader : () => void
};

const ReaderContext = createContext<ReaderContextType | undefined>(undefined);

export const ReaderProvider = ({ children }: { children: ReactNode }) => {
  const [reader, setReader] = useState<ReaderProps | null>(null);

  const showReader = (reader: ReaderProps) => {
    const url = new URL(window.location.href);
    url.searchParams.set("book", reader.book.metadata.identifier);
    window.history.pushState({}, "", url.toString());
    setReader({...reader, onClose: () => {
      setReader(null)
      const url = new URL(window.location.href);
      url.searchParams.delete("book");
      window.history.pushState({}, "", url.toString());
      reader.onClose?.()
    }});
  };

  const closeReader = () => {
    setReader(null)
  }

  return (
    <ReaderContext.Provider value={{ showReader, closeReader }}>
      {children}
      {reader && <Reader {...reader} />}
    </ReaderContext.Provider>
  );
};

export const userReader = () => {
  const ctx = useContext(ReaderContext);
  if (!ctx) throw new Error("useReader must be used within ReaderProvider");
  return ctx;
};
