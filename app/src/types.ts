

export type Publication = {
    metadata: {
        title: string;
        identifier: string;
        authors: {
            name: string
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
        authors: string[]
        series: string[]
    }
}


const env = import.meta.env.VITE_APP_ENV;
export const API_HOST = env == "production" ? "" :  "http://localhost:8080";