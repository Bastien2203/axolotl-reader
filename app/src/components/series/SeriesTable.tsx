import { useEffect, useState } from "react";
import { Me, Series } from "../../types";
import SeriesRow from "./SeriesRow";
import { getMe } from "../../services/Users";
import { useToast } from "../../contexts/ToastContext";
import { useSeriesPage } from "../../contexts/SeriesPageContext";
import { useNavigate } from "react-router-dom";


type SeriesTableProps = {
    series: Series[];
    onSeriesChange: (series: Series[]) => void;
}

const SeriesTable = (props: SeriesTableProps) => {
    const [serieSelected, setSerieSelected] = useState<Series | null>(null);
    const [me, setMe] = useState<Me | null>(null);
    const { showToast } = useToast();
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
        getMe().then((user) => {
            setMe(user)
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
                series: serieSelected,
                onBack: goBack,
            });
        }
    }, [serieSelected])

    
    return <table className="table table-zebra w-full">
        <tbody>
            {props.series.map((series) => (
                <SeriesRow
                    user={me}
                    key={series.id}
                    series={series}
                    onClick={() => selectSeries(series)}
                    onDelete={() => {
                        props.onSeriesChange(
                            props.series.filter((s) => s.id !== series.id)
                        );

                    }}
                />
            ))}
        </tbody>
    </table>
}

export default SeriesTable;