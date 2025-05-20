import { createContext, useContext, useState, ReactNode } from "react";
import Reader from "../components/reader/Reader";
import { Publication } from "../services/OPDS";

type ReaderProps = {
      publication: Publication;
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
    url.searchParams.set("book", reader.publication.id);
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
