import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import SecureImage from "../components/common/SecureImage";
import SeriesTable from "../components/series/SeriesTable";
import { userReader } from "../contexts/ReaderContext";
import { useToast } from "../contexts/ToastContext";
import PageLayout from "../layout/PageLayout";
import { getLastReadBook } from "../services/Book";
import { getMe } from "../services/Users";
import { Series, Publication, API_HOST } from "../types";


const FavoritesSeries = () => {
  const [favoriteSeries, setFavoriteSeries] = useState<Series[]>();
  const [lastRead, setLastRead] = useState<Publication | null>();
  const location = useLocation();
  const { showToast } = useToast();
  const { showReader } = userReader();


  const locationChangeHandler = () => {
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
    getLastReadBook().then((book) => {
      setLastRead(book);
    }).catch((error) => {
      console.error("Error fetching last read book:", error);
      showToast({
        type: "alert-error",
        message: "Error fetching last read book",
      });
    })

    getMe().then((user) => {
      if (user && user.favorite_series) {
        setFavoriteSeries(user.favorite_series);
      }
    }).catch((error) => {
      console.error("Error fetching user data:", error);
      showToast({
        type: "alert-error",
        message: "Error fetching user data",
      });
    }
    );
  }, []);


  useEffect(() => {
    locationChangeHandler();
  }, [location]);



  return <>
    <PageLayout title="Home">
      {lastRead && <>
        <h2 className="text-xl font-semibold">Continue reading</h2>

        <div className="flex flex-col items-center cursor-pointer w-full">
          <SecureImage
            alt={lastRead.metadata.title}
            className="object-cover rounded-md w-full max-w-xs p-1 hover:opacity-60"
            url={API_HOST + lastRead.links.filter(link => link.rel === "cover")[0].href}
            onClick={() => showReader({
              book: lastRead,
            })}
            token={localStorage.getItem("token") || ""}
          />
          <h3>{lastRead.metadata.title}</h3>
        </div>
      </>}

      {
        favoriteSeries && favoriteSeries.length > 0 &&
        <>
          <h2 className="text-xl font-semibold">Favorites</h2>
          <SeriesTable
            series={favoriteSeries}
            onSeriesChange={setFavoriteSeries}
          />
        </>
      }

      {
        favoriteSeries && favoriteSeries.length === 0 && lastRead === null &&
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-xl font-semibold">Start Reading !</h2>
          <p className="text-gray-500">
            You don't have any favorite series or last read book.
            <br />
            Start exploring the library and add your favorite series.
          </p>

          <Link to="/library" className="btn btn-primary mt-4">
            Explore Library
          </Link>
          
        </div>
      }


    </PageLayout>
  </>;
}

export default FavoritesSeries;