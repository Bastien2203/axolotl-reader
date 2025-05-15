import { EllipsisVertical, Heart } from "lucide-react";
import { API_HOST, Me, Series } from "../../types";
import { useEffect, useState } from "react";
import { addSeriesToFavorites, deleteSeries, removeSeriesFromFavorites } from "../../services/Series";
import { useToast } from "../../contexts/ToastContext";
import SecureImage from "../common/SecureImage";



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
            const isFavorite = props.user.favorite_series.some((s) => s.id == props.series.id);
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




    return <tr className="border-1 border-base-content/40 border-collapse" style={{ height: "max(5em, 5em)" }}>
        <td className="hover:opacity-60 cursor-pointer w-full text-base-content" onClick={() => props.onClick()} >
            <div className="flex items-center gap-10 ">
                <SecureImage
                    token={localStorage.getItem("token") ?? ""}
                    url={API_HOST + props.series.cover}
                    alt={props.series.name}
                    className="object-cover overflow-clip  w-[5em] h-[5em] object-top"
                    height="5em"
                    aspectRatio="1/1"
                />
                <span className="truncate w-[30vw]">
                    {props.series.name}
                </span>
                <div className="hidden md:flex gap-2">
                    {
                        props.series?.tags?.slice(0, 3).map((tag, index) => (
                            <div key={index} className="badge badge-outline badge-sm">{tag.name}</div>
                        ))
                    }
                    {
                        props.series?.tags?.length > 3 ?
                            <div className="badge badge-outline badge-sm">+{props.series.tags.length - 3}</div>
                            : null
                    }
                </div>
            </div>
        </td>



        <td className="px-2">
            {
                props.user ?
                    <Heart className={`${favorite ? "fill-red-500" : ""}  cursor-pointer`} onClick={handleFavoriteChange} />
                    : <Heart className={`fill-slate-600`} onClick={handleFavoriteChange} />
            }
        </td>


        <td className="px-2">
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