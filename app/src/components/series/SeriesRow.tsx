import { EllipsisVertical, Heart } from "lucide-react";
import { Me, Series } from "../../types";
import { useEffect, useState } from "react";
import { addSeriesToFavorites, deleteSeries, removeSeriesFromFavorites } from "../../services/Series";
import { useToast } from "../../contexts/ToastContext";



type SeriesRowProps = {
    series: Series;
    onClick: () => void;
    onDelete?: () => void;
    user: Me | null;
}

const SeriesRow = (props: SeriesRowProps) => {
    const [favorite, setFavorite] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (props.user) {
            const isFavorite = props.user.FavoriteSeries.some((s) => s.ID == props.series.id);
            setFavorite(isFavorite);
        }
    }, [props.user, props.series]);


    const handleDeleteSeries = () => {
        deleteSeries(props.series).then(() => {
            showToast({
                type: "alert-success",
                message: "Series deleted successfully",
            });
            if (props.onDelete) {
                props.onDelete();
            }
        }
        ).catch((error) => {
            console.error("Error deleting series:", error);
            showToast({
                type: "alert-error",
                message: "Error deleting series",
            });
        })
    }

    const handleFavoriteChange = () => {
        const newstate = !favorite;
        setFavorite(newstate);
        if (newstate) {
            addSeriesToFavorites(props.series).then(() => {
                showToast({
                    type: "alert-success",
                    message: "Series added to favorites successfully",
                });
            }).catch((error) => {
                console.error("Error adding series to favorites:", error);
                showToast({
                    type: "alert-error",
                    message: "Error adding series to favorites",
                });
            })
        } else {
            removeSeriesFromFavorites(props.series).then(() => {
                showToast({
                    type: "alert-success",
                    message: "Series removed from favorites successfully",
                });
            }).catch((error) => {
                console.error("Error removing series from favorites:", error);
                showToast({
                    type: "alert-error",
                    message: "Error removing series from favorites",
                });
            })

        }

    }




    return <tr className="list-row" style={{ height: "max(10em, 10em)" }}>
        <td className="hover:opacity-60 cursor-pointer w-full text-base-content" onClick={() => props.onClick()} >
            {props.series.name}
        </td>

        <td>
            {
                props.user ?
                    <Heart className={`${favorite ? "fill-red-500" : ""}  cursor-pointer`} onClick={handleFavoriteChange} />
                    : <Heart className={`fill-slate-600`} onClick={handleFavoriteChange} />
            }
        </td>


        <td className="w-0 text-right align-center">
            <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-sm px-2">
                    <EllipsisVertical size={20} />
                </div>
                <ul tabIndex={0} className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-40 pointer-events-auto">
                    <li className="bg-red-400/50 rounded"><a onClick={handleDeleteSeries}>Delete</a></li>
                </ul>
            </div>
        </td>
    </tr>
}

export default SeriesRow;