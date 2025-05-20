export type Facets = {
    facets: {
        authors?: string[]
        series?: Series[]
        tags?: string[]
    }
}

export type Series = {
    name: string;
    id: string;
    cover_url: string;
    tags: Tag[];
}


export type Tag = {
    name: string;
}

export type BookProgress = {
    progress: number;
    lastRead: string;
}


const env = import.meta.env.VITE_APP_ENV;
export const API_HOST = env == "production" ? "" : "http://localhost:8080";

export type User = {
    id: string;
    username: string;
    role: "user" | "admin";
}


export type Job = {
    name: string;
    state: JobState;
    created_at: string;
    finished_at: string;
    duration: number;
}

export type JobState = "Pending" | "Running" | "Completed" | "Failed" | "Unknown";