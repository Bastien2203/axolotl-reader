

export type Catalog = {
    publications: Publication[];
    metadata : {
        title: string;
        total: number;
        size: number;
        from: number;
    }
}

export type Publication = {
    metadata: {
        title: string;
        identifier: string;
        authors: {
            name: string;
        }[];
        tags: {
            name: string;
        }[];
        belongsTo?: {
        series?: {
            name: string;
            position?: number;
        };
        };
    };
    links: {
        rel: string;
        href: string;
        type: string;
    }[];
};

export type Facets = {
    facets: {
        authors?: string[]
        series?: string[]
        tags?: string[]
    }
}

export type BookProgress = {
    progress: number;
    lastRead: string;
}


const env = import.meta.env.VITE_APP_ENV;
export const API_HOST = env == "production" ? "" :  "http://localhost:8080";

export type Me = {
    ID: string;
    Username: string;
    Role: "user" | "admin";

}