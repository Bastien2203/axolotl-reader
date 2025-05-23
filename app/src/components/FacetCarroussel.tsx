import { useEffect, useState } from "react";
import { Facet, Feed, Link, navigationDocument } from "../services/OPDS";
import { useToast } from "../contexts/ToastContext";
import SeriesCarroussel from "./series/SeriesCarroussel";


type FacetCarrousselProps = {
  facet: Facet;
}

const FacetCarroussel = (props: FacetCarrousselProps) => {
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [feed, setFeed] = useState<Feed | null>(null);
  const { showToast } = useToast();

  const changeLink = (link: Link) => {
    if (selectedLink !== link) {
      setSelectedLink(link);
      navigationDocument({
        url: link.href,
      }).then((feed) => {
        setFeed(feed);
      }).catch((err) => {
        console.error(err);
        showToast({
          message: "Error loading series",
          type: "alert-error"
        });
      })
    }
  }

  useEffect(() => {
    if (props.facet.links && props.facet.links.length > 0) {
      changeLink(props.facet.links[0]);
    }
  }, [props.facet.links]);

  return <>
    <div className="overflow-x-auto overflow-y-hidden flex gap-2">
      {

        props.facet.links?.map((link,i ) => {
          if (!link.title) {
            return null;
          }
          
         return <div key={i} className={`badge p-4 text-nowrap  rounded-full ${selectedLink === link ? "badge-primary" : "badge-outline"
            } cursor-pointer`}
            onClick={() => {
              changeLink(link);
            }}>
            {link.title}
          </div>
})
      }
    </div>
    {
      selectedLink && feed && (feed?.publications?.length ?? 0) > 0 && (
        <SeriesCarroussel feed={feed} />
      )
    }</>
}

export default FacetCarroussel;