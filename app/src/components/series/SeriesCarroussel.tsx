import SecureImage from "../common/SecureImage"
import { Feed } from "../../services/OPDS"
import { useSeries } from "../../hooks/useSeries"


type SeriesCarrousselProps = {
  feed: Feed
}

const SeriesCarroussel = (props: SeriesCarrousselProps) => {
  const {selectSeries} = useSeries();

  return <div className="flex gap-5 overflow-x-auto">
    {
      props.feed.publications && props.feed.publications.map((series) => (
        <div
          className="flex flex-col gap-2 cursor-pointer hover:opacity-60"
          style={{ width: "calc(15em * 0.75)" }}
          key={series.id}
          onClick={() => {
            selectSeries(series.id);
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