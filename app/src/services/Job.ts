import { API_HOST, Job } from "../types";


export const getJobs = async (): Promise<Job[]> => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_HOST}/jobs`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error("Error getting jobs");
    }
    const data = await response.json();
    return data;
}