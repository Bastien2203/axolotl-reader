import { useEffect, useState } from "react"
import SecureImage from "../common/SecureImage"
import { useNavigate } from "react-router-dom"
import { useSeriesPage } from "../../contexts/SeriesPageContext"
import { Feed, Publication } from "../../services/OPDS"


type SeriesCarrousselProps = {
  feed: Feed
}

const SeriesCarroussel = (props: SeriesCarrousselProps) => {
  const [serieSelected, setSerieSelected] = useState<Publication | null>(null);
  const { showPage, hidePage } = useSeriesPage()
  const navigate = useNavigate();

  const locationChangeHandler = () => {
    const url = new URL(window.location.href);
    const seriesId = url.searchParams.get("series");

    const _selectedSeries = props.feed.publications?.find(s => s.id == seriesId);
    if (seriesId && props.feed.publications && _selectedSeries) {
      setSerieSelected(_selectedSeries);
    } else {
      setSerieSelected(null);
      hidePage();
    }
  }


  const selectSeries = (series: Publication) => {
    setSerieSelected(series);
    navigate(`?series=${series.id}`);
  };

  const goBack = () => {
    setSerieSelected(null);
    hidePage();
    navigate("");
  };


  useEffect(() => {
    if (props.feed.publications?.length === 0) return;
    locationChangeHandler();
  }, [props.feed.publications]);


  useEffect(() => {
    if (serieSelected !== null) {
      showPage({
        publication: serieSelected,
        onBack: goBack,
      });
    }
  }, [serieSelected])

  return <div className="flex gap-5 overflow-x-auto">
    {
      props.feed.publications && props.feed.publications.map((series) => (
        <div
          className="flex flex-col gap-2 cursor-pointer hover:opacity-60"
          style={{ width: "calc(15em * 0.75)" }}
          key={series.id}
          onClick={() => {
            selectSeries(series);
          }}
        >
          <SecureImage
            url={series.cover?.href ?? ""}
            key={series.id}
            alt={series.metadata.title}
            token={localStorage.getItem("token") || ""}
            aspectRatio="3/4"
            height="15em"
            className="rounded shadow-lg h-[15em] object-cover"
          />
          <span className="truncate">{series.metadata.title}</span>
        </div>
      ))

    }
  </div>
}

export default SeriesCarroussel