import { useEffect, useState } from "react";
import SeriesRow from "./SeriesRow";
import { useToast } from "../../contexts/ToastContext";
import { useSeriesPage } from "../../contexts/SeriesPageContext";
import { useNavigate } from "react-router-dom";
import { Feed, Publication } from "../../services/OPDS";
import { getFavorites } from "../../services/Series";


type SeriesTableProps = {
    feed: Feed;
    onFeedChange: (feed: Feed) => void;
}

const SeriesTable = (props: SeriesTableProps) => {
    const [serieSelected, setSerieSelected] = useState<Publication | null>(null);
    const [favorites, setFavorite] = useState<Publication[] | null>(null);
    const { showToast } = useToast();
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
        getFavorites().then((favoritesFeed) => {
            setFavorite(favoritesFeed?.publications || []);
        }).catch(() => {
            showToast({
                message: "Error while getting user info",
                type: "alert-error"
            })
        })
    }, []);

    useEffect(() => {
        if (serieSelected !== null) {
            showPage({
                publication: serieSelected,
                onBack: goBack,
            });
        }
    }, [serieSelected])


    return <table className="w-full">
        <tbody>
            {props.feed.publications && props.feed.publications.map((publication) => (
                <SeriesRow
                    favorites={favorites}
                    key={publication.id}
                    publication={publication}
                    onClick={() => selectSeries(publication)}
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