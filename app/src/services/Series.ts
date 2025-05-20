import { API_HOST } from "../types";
import { Feed, Publication } from "./OPDS";



export const deleteSeries = async (series: Publication) => {
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

export const addSeriesToFavorites = async (series: Publication) => {
    return new Promise<void>(async (resolve, reject) => {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_HOST}/users/favorites/${series.id}`, {
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

export const removeSeriesFromFavorites = async (series: Publication) => {
    return new Promise<void>(async (resolve, reject) => {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_HOST}/users/favorites/${series.id}`, {
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


export const getFavorites = async () => {
    return new Promise<Feed>(async (resolve, reject) => {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_HOST}/users/favorites`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            reject(new Error("Failed to fetch favorites"));
        }

        const data = await response.json();
        resolve(Feed.fromJSON(data));
    })
}