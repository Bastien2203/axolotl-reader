import { useEffect, useState } from "react";
import Series from "../components/Series";
import { useLocation } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";

import PageLayout from "../layout/PageLayout";
import { getFacets, getLastReadBook } from "../services/Book";
import { API_HOST, Publication } from "../types";
import SecureImage from "../components/common/SecureImage";
import { userReader } from "../contexts/ReaderContext";



const Home = () => {
  const [series, setSeries] = useState<string[]>([]);
  const [serieSelected, setSerieSelected] = useState<string | null>(null);
  const [lastRead, setLastRead] = useState<Publication | null>(null);
  const location = useLocation();
  const { showToast } = useToast();
  const {showReader} = userReader();

  const locationChangeHandler = () => {
    const url = new URL(window.location.href);
    const seriesName = url.searchParams.get("series");

    if (seriesName && series && series.includes(seriesName)) {
      setSerieSelected(seriesName);
    } else {
      setSerieSelected(null);
    }

    getLastReadBook().then((book) => {
      setLastRead(book);
    }).catch((error) => {
      console.error("Error fetching last read book:", error);
      showToast({
        type: "alert-error",
        message: "Error fetching last read book",
      });
    })
  };


  useEffect(() => {
    getFacets({series: true}).then((data) => {
      setSeries(data.facets.series || []);
    }).catch((error) => {
      console.error("Error fetching series:", error);
      showToast({
        type: "alert-error",
        message: "Error fetching series",
      });
    })
    getLastReadBook().then((book) => {
      setLastRead(book);
    }).catch((error) => {
      console.error("Error fetching last read book:", error);
      showToast({
        type: "alert-error",
        message: "Error fetching last read book",
      });
    })
  }, []);

  useEffect(() => {
    if (series.length === 0) return;
    locationChangeHandler();
  }, [series]);

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
    return <Series seriesName={serieSelected} onBack={backToLibrary} />
  }

  return <>
    <PageLayout title="Home">
    {lastRead && <>
      <h2 className="text-xl font-semibold">Continue reading</h2>

        <div className="flex flex-col items-center hover:opacity-60 cursor-pointer w-fit" onClick={() => showReader({
            book: lastRead,
          })
        }>
          <SecureImage
            alt={lastRead.metadata.title}
            className="object-cover rounded-md h-64 p-1"
            url={API_HOST + lastRead.links.filter(link => link.rel === "cover")[0].href}
            token={localStorage.getItem("token") || ""}
          />
          <h3>{lastRead.metadata.title}</h3>
        </div>
      </> }
      




      <h2 className="text-xl font-semibold">Series</h2>
      {series.map((seriesName) => (
        <div key={seriesName} onClick={() => selectSeries(seriesName)} className="flex flex-col gap-2 p-4 border border-base-100 rounded-md cursor-pointer hover:bg-base-100">
          <h4 className="text-lg font-semibold">{seriesName}</h4>
        </div>
      ))}

    </PageLayout>
  </>;
}

export default Home;