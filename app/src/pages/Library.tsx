import { useState, useEffect } from "react";
import SeriesTable from "../components/series/SeriesTable";
import PageLayout from "../layout/PageLayout";
import { getFacets } from "../services/Book";
import { Series } from "../types";
import { useToast } from "../contexts/ToastContext";

const Library = () => {
    const [series, setSeries] = useState<Series[]>([]);
    const { showToast } = useToast();

    useEffect(() => {
        getFacets({ series: true }).then((data) => {
          setSeries(data.facets.series || []);
        }).catch((error) => {
          console.error("Error fetching series:", error);
          showToast({
            type: "alert-error",
            message: "Error fetching series",
          });
        })
      }, []);
    return <PageLayout title="Library">
        <h2 className="text-xl font-semibold">Series</h2>
        <SeriesTable
            series={series}
            onSeriesChange={setSeries}
        />

    
    </PageLayout>
}

export default Library;