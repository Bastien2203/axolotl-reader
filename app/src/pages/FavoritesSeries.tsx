import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SeriesTable from "../components/series/SeriesTable";
import { useToast } from "../contexts/ToastContext";
import PageLayout from "../layout/PageLayout";
import { getFavorites } from "../services/Series";
import { Feed } from "../services/OPDS";


const FavoritesSeries = () => {
  const [favoriteFeed, setFavoriteFeed] = useState<Feed>();
  const { showToast } = useToast();


  useEffect(() => {   
    getFavorites().then(setFavoriteFeed).catch((error) => {
      console.error("Error fetching user data:", error);
      showToast({
        type: "alert-error",
        message: "Error fetching user data",
      });
    }
    );
  }, []);



  return <>
    <PageLayout title="Favorites">

      {
        favoriteFeed && (favoriteFeed?.publications?.length ?? 0) > 0 &&
        <>
          <h2 className="text-xl font-semibold">Favorites</h2>
          <SeriesTable
            feed={favoriteFeed}
            onFeedChange={setFavoriteFeed}
          />
        </>
      }

      {
        favoriteFeed && (favoriteFeed?.publications?.length ?? 0)  === 0 &&
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-xl font-semibold">Start Reading !</h2>
          <p className="text-gray-500 text-center">
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