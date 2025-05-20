import { API_HOST } from "../types";


export type Facet = {
    metadata: {
        title: string;
    }
    links: Link[];
}

export class Feed {
    publications?: Publication[];
    metadata: {
        title: string;
    };
    links?: Link[];
    facets?: Facet[];

    constructor({
        publications,
        metadata,
        links,
        facets
    }: {
        publications?: Publication[];
        metadata: {
            title: string;
        };
        links?: Link[];
        facets?: Facet[];
    }) {
        this.publications = publications;
        this.metadata = metadata;
        this.links = links;
        this.facets = facets;
    }

    get self() {
        const link = this.links?.find((link) => link?.rel?.includes("self"));
        return link;
    }
    get next() {
        const link = this.links?.find((link) => link?.rel?.includes("next"));
        return link;
    }
    get previous() {
        const link = this.links?.find((link) => link?.rel?.includes("previous"));
        return link;
    }
    get first() {
        const link = this.links?.find((link) => link?.rel?.includes("first"));
        return link;
    }
    get last() {
        const link = this.links?.find((link) => link?.rel?.includes("last"));
        return link;
    }
    get up() {
        const link = this.links?.find((link) => link?.rel?.includes("up"));
        return link;
    }

    static fromJSON(json: any) {
        return new Feed({
            publications: json?.publications?.map((publication: any) => new Publication({
                metadata: publication?.metadata,
                links: publication.links,
                id: publication.id
            })),
            metadata: json.metadata,
            links: json.links,
            facets: json.facets
        });
    }
}

export class Publication {
    metadata: {
        title: string;
        authors?: string[];
        tags?: string[];
    };
    links: Link[];
    id: string;

    constructor({
        metadata,
        links,
        id
    }: {
        metadata: {
            title: string;
            authors: string[];
            tags: string[];
        };
        links: Link[];
        id: string;
    }) {
        this.metadata = metadata;
        this.links = links;
        this.id = id;
    }

    get cover() {
        const link = this.links.find((link) => link?.rel?.includes("http://opds-spec.org/image/thumbnail"));
        return link;
    }

    get acquisition() { 
        const link = this.links.find((link) => link?.rel?.includes("http://opds-spec.org/acquisition"));
        return link;
    }

    get subsection() {
        const link = this.links.find((link) => link?.rel?.includes("subsection"));
        return link;
    }
}



export type Link = {
    rel?: string[];
    href: string;
    type?: string;
    title?: string;
    properties?: {
        [key: string]: any;
    };
}


export const navigationDocument = async (params?: {
    url?: string,
    page?: number
}) => {
    return new Promise<Feed>(async (resolve, reject) => {
        const token = localStorage.getItem("token");
        const url = new URL(params?.url || API_HOST + "/opds/v2");
        if (params?.page) {
            url.searchParams.append("page", params.page.toString());
        }
        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/opds+json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            reject(new Error("Failed to fetch feed"));
        }

        const data = await response.json();
        resolve(Feed.fromJSON(data));
    })
}
