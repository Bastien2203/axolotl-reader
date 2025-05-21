import { useEffect, useState } from "react";
import SeriesRow from "./SeriesRow";
import { useToast } from "../../contexts/ToastContext";
import { Feed, Publication } from "../../services/OPDS";
import { getFavorites } from "../../services/Series";
import { useSeries } from "../../hooks/useSeries";



type SeriesTableProps = {
    feed: Feed;
    onFeedChange: (feed: Feed) => void;
}

const SeriesTable = (props: SeriesTableProps) => {
    const [favorites, setFavorite] = useState<Publication[] | null>(null);
    const { showToast } = useToast();
    const {selectSeries} = useSeries();


    useEffect(() => {
        getFavorites().then((favoritesFeed) => {
            setFavorite(favoritesFeed?.publications || []);
        }).catch(() => {
            showToast({
                message: "Error while getting user info",
                type: "alert-error"
            })
        })
    }, []);


    return <table className="w-full">
        <tbody>
            {props.feed.publications && props.feed.publications.map((publication) => (
                <SeriesRow
                    favorites={favorites}
                    key={publication.id}
                    publication={publication}
                    onClick={() => selectSeries(publication.id)}
                    onDelete={() => {
                        props.onFeedChange(
                            new Feed(
                                {
                                    ...props.feed,
                                    publications: props.feed.publications?.filter((s) => s.id !== publication.id)
                                }
                            )
                        );

                    }}
                />
            ))}
        </tbody>
    </table>
}

export default SeriesTable;