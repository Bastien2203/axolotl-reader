import { createContext, useContext, useState, ReactNode } from "react";
import SeriesPage from "../components/series/SeriesPage";
import { Publication } from "../services/OPDS";

type SeriesPageProps = {
  publication: Publication;
  onBack: () => void;
};

type SeriesPageContextType = {
  showPage: (seriesPage: SeriesPageProps) => void;
  hidePage: () => void;
};

const SeriesPageContext = createContext<SeriesPageContextType | undefined>(undefined);

export const SeriesPageProvider = ({ children }: { children: ReactNode }) => {
  const [seriesPage, setSeriesPage] = useState<SeriesPageProps | null>(null);

  const showPage = (seriesPage: SeriesPageProps) => {
    setSeriesPage(seriesPage);
  };

  const hidePage = () => {
    setSeriesPage(null);
  };

  return (
    <SeriesPageContext.Provider value={{ showPage, hidePage }}>
      {
        seriesPage ? 
        <SeriesPage {...seriesPage} />
         :  children
      }
      
    </SeriesPageContext.Provider>
  );
};

export const useSeriesPage = () => {
  const ctx = useContext(SeriesPageContext);
  if (!ctx) throw new Error("useSeriesPage must be used within SeriesPageProvider");
  return ctx;
}
