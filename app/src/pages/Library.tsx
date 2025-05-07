import { useEffect, useState } from "react";
import { API_HOST, Publication } from "../types";
import Series from "../components/Series";
import { useLocation } from "react-router-dom";
import DeleteBookModal from "../components/DeleteBookModal";
import { useToast } from "../contexts/ToastContext";
import BookTable from "../components/BookTable";



const Library = () => {
  const [seriesMap, setSeriesMap] = useState<Record<string, Publication[]>>({});
  const [standalones, setStandalones] = useState<Publication[]>([]);
  const [serieSelected, setSerieSelected] = useState<string | null>(null);
  const location = useLocation();
  const [deleteModalOpen, setDeleteModalOpen] = useState<string>();
  const { showToast } = useToast();

  const locationChangeHandler = () => {
    const url = new URL(window.location.href);
    const seriesName = url.searchParams.get("series");

    if (seriesName && seriesMap[seriesName]) {
      setSerieSelected(seriesName);
    } else {
      setSerieSelected(null);
    }
  };


  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_HOST}/opds/catalog.json`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const publications: Publication[] = data.publications || [];
        const series: Record<string, Publication[]> = {};
        const standalones: Publication[] = [];

        publications.forEach((pub) => {
          const seriesInfo = pub.metadata.belongsTo?.series;
          if (seriesInfo && seriesInfo.name) {
            const name = seriesInfo.name;
            if (!series[name]) series[name] = [];
            series[name].push(pub);
          } else {
            standalones.push(pub);
          }
        });

        Object.values(series).forEach((books) =>
          books.sort(
            (a, b) =>
              (a.metadata.belongsTo?.series?.position ?? 0) -
              (b.metadata.belongsTo?.series?.position ?? 0)
          )
        );

        setSeriesMap(series);
        setStandalones(standalones);
      }).catch((err) => {
        console.error(err);
        showToast({
          type: "alert-error",
          message: "Failed to fetch library data. Please try again later.",
        });
      });
  }, []);

  useEffect(() => {
    if (standalones.length === 0 && Object.keys(seriesMap).length === 0) return;
    locationChangeHandler();
  }, [standalones, seriesMap]);

  useEffect(() => {
    locationChangeHandler();
  }, [location]);

  const selectSeries = (seriesName: string) => {
    setSerieSelected(seriesName);

    const url = new URL(window.location.href);
    url.searchParams.set("series", seriesName);
    window.history.pushState({}, "", url.toString());
  };
  const backToLibrary = () => {
    setSerieSelected(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("series");
    window.history.pushState({}, "", url.toString());
  };

  if (serieSelected !== null) {
    return <Series seriesName={serieSelected} books={seriesMap[serieSelected]} onBack={backToLibrary} setBooks={
      (books: Publication[]) => {
        setSeriesMap((prev) => ({
          ...prev,
          [serieSelected]: books,
        }));
      }
    } />
  }

  return <>
    <DeleteBookModal
      books={standalones}
      setBooks={setStandalones}
      deleteModalOpen={deleteModalOpen}
      setDeleteModalOpen={setDeleteModalOpen}
    />
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Library</h2>

      <h3 className="text-xl font-semibold">Series</h3>
      {Object.entries(seriesMap).map(([seriesName]) => (
        <div key={seriesName} onClick={() => selectSeries(seriesName)} className="flex flex-col gap-2 p-4 border border-base-100 rounded-md cursor-pointer hover:bg-base-100">
          <h4 className="text-lg font-semibold">{seriesName}</h4>
        </div>
      ))}


      {standalones.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold">One-shots / Standalone</h3>
          <BookTable books={standalones} setBooks={setStandalones}/>
        </div>
      )}
    </div>
  </>;
}

export default Library;