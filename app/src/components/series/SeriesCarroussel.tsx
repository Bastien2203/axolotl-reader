import { useEffect, useState } from "react"
import { API_HOST, Series } from "../../types"
import SecureImage from "../common/SecureImage"
import { useNavigate } from "react-router-dom"
import { useSeriesPage } from "../../contexts/SeriesPageContext"


type SeriesCarrousselProps = {
  series: Series[]
}

const SeriesCarroussel = (props: SeriesCarrousselProps) => {
  const [serieSelected, setSerieSelected] = useState<Series | null>(null);
  const { showPage, hidePage } = useSeriesPage()
  const navigate = useNavigate();

  const locationChangeHandler = () => {
    const url = new URL(window.location.href);
    const seriesId = url.searchParams.get("series");

    const _selectedSeries = props.series.find(s => s.id == seriesId);
    if (seriesId && props.series && _selectedSeries) {
      setSerieSelected(_selectedSeries);
    } else {
      setSerieSelected(null);
      hidePage();
    }
  }


  const selectSeries = (series: Series) => {
    setSerieSelected(series);
    navigate(`?series=${series.id}`);
  };

  const goBack = () => {
    setSerieSelected(null);
    hidePage();
    navigate("");
  };

  useEffect(() => {
    if (props.series.length === 0) return;
    locationChangeHandler();
  }, [props.series]);

  useEffect(() => {
    if (serieSelected !== null) {
        showPage({
            series: serieSelected,
            onBack: goBack,
        });
    }
}, [serieSelected])

  return <div className="flex gap-5 overflow-x-auto">
    {
      props.series.map((series) => (
        <div 
        className="flex flex-col gap-2 cursor-pointer hover:opacity-60" 
        style={{ width: "calc(15em * 0.75)" }} 
        key={series.id}
        onClick={() => {
          selectSeries(series);
        }}
        >
          <SecureImage
            url={API_HOST + series.cover}
            key={series.id}
            alt={series.name}
            token={localStorage.getItem("token") || ""}
            aspectRatio="3/4"
            height="15em"
            className="rounded shadow-lg h-[15em]"
          />
          <span className="truncate">{series.name}</span>
        </div>
      ))

    }
  </div>
}

export default SeriesCarroussel