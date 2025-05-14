import { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";
import PageLayout from "../layout/PageLayout";
import { getFacets } from "../services/Book";
import { Series } from "../types";
import SeriesCarroussel from "../components/series/SeriesCarroussel";



const Home = () => {
  const [series, setSeries] = useState<Record<string, Series[]>>({});
  const { showToast } = useToast();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    getFacets({ series: true }).then((data) => {
      const seriesByTag = {} as Record<string, Series[]>;
      data.facets.series?.forEach((series: Series) => {
        const tags = series.tags
        if (tags) {
          tags.forEach((tag) => {
            if (!seriesByTag[tag.name]) {
              seriesByTag[tag.name] = []
            }
            seriesByTag[tag.name].push(series)
          })
        }
      })
      setSelectedTag(Object.keys(seriesByTag)[0] || null)
      setSeries(seriesByTag)
    }).catch((error) => {
      console.error("Error fetching series:", error);
      showToast({
        type: "alert-error",
        message: "Error fetching series",
      });
    })
  }, []);
  
  return <PageLayout title="Library">
    <h2 className="text-xl font-semibold">Series by categories</h2>
    <div className="overflow-x-auto flex gap-2">
      {
        Object.keys(series).map((tag) => (
          <div className={`badge p-4  rounded-full ${selectedTag === tag ? "badge-primary" : "badge-outline"
            } cursor-pointer`}
            onClick={() => {
              setSelectedTag(tag)
            }}
            key={tag}>
            {tag}
          </div>
        ))
      }
    </div>
    {
      selectedTag && series[selectedTag] && series[selectedTag].length > 0 && (
       <SeriesCarroussel series={series[selectedTag]} />
      )
    }

  </PageLayout>
}

export default Home;