

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
        series?: Series[]
        tags?: string[]
    }
}

export type Series = {
    name: string;
    id: string;
    cover: string;
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
export const API_HOST = env == "production" ? "" :  "http://localhost:8080";

export type Me = {
    id: string;
    username: string;
    role: "user" | "admin";
    favorite_series: Series[];
}