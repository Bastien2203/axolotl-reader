import { useState, useEffect } from "react";
import SeriesTable from "../components/series/SeriesTable";
import PageLayout from "../layout/PageLayout";
import { useToast } from "../contexts/ToastContext";
import { Feed, navigationDocument } from "../services/OPDS";

const Library = () => {
  const [feed, setFeed] = useState<Feed>();

  const { showToast } = useToast();

  useEffect(() => {
    navigationDocument().then((data) => {
      setFeed(data);
    }).catch((error) => {
      console.error("Error fetching feed:", error);
      showToast({
        type: "alert-error",
        message: "Error fetching feed",
      });
    })
  }, []);
  return <PageLayout title="Library">
    <h2 className="text-xl font-semibold">Series</h2>
    {
      feed && <SeriesTable
        feed={feed}
        onFeedChange={setFeed}
      />
    }



  </PageLayout>
}

export default Library;