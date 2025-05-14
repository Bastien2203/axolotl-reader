import { API_HOST, Series } from "../types";


export const deleteSeries = async (series: Series) => {
    return new Promise<void>(async (resolve, reject) => {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_HOST}/series/${series.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            reject(new Error("Failed to delete series"));
        }

        resolve();
    })
}

export const addSeriesToFavorites = async (series: Series) => {
    return new Promise<void>(async (resolve, reject) => {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_HOST}/users/add_favorite_series/${series.id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            reject(new Error("Failed to add series to favorites"));
        }

        resolve();
    })
}

export const removeSeriesFromFavorites = async (series: Series) => {
    return new Promise<void>(async (resolve, reject) => {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_HOST}/users/remove_favorite_series/${series.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            reject(new Error("Failed to remove series from favorites"));
        }

        resolve();
    })
}
