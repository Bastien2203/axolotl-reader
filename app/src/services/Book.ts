import { API_HOST, BookProgress, Facets } from "../types";


// API CALLS ---------------------------------

export const deleteBook = (
    bookId: string,
    onSuccess: () => void,
    onError: (message: string) => void,
    onFinish: () => void
) => {
    fetch(`${API_HOST}/books/${bookId}`, {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
        },
    }).then((res) => {
        if (res.ok) {
            onSuccess();

        } else {
            onError("Error deleting book");
        }
    }).catch(() => {
        onError("Error deleting book");
    }).finally(() => {
        onFinish();
    });
}


export const getFacets = async (facets?: {
    authors?: boolean
    series?: boolean
    tags?: boolean
}) => {
    return new Promise<Facets>((resolve, reject) => {
        fetch(`${API_HOST}/opds/facets.json?${Object.entries(facets || {})
                .filter(([_, value]) => value)
                .map(([key, _]) => `${key}=true`)
                .join("&")
            }`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token"),
            }
        }).then((res) => {
            if (res.status === 200) {
                res.json().then((data) => {
                    resolve(data);
                }).catch(() => {
                    reject("Error parsing facets");
                });
            } else {
                reject("Error fetching facets");
            }
        })

    })

}




// PROGRESS --------------------------------

export const getBookProgress = (identifier: string): BookProgress | null => {
    const progressMap = JSON.parse(localStorage.getItem("reader-progress") || "{}");
    if (progressMap[identifier]) {
        return progressMap[identifier];
    }
    return null
}
export const setBookProgress = (identifier: string, progress: number) => {
    const progressMap = JSON.parse(localStorage.getItem("reader-progress") || "{}");
    if (progressMap[identifier]) {
        progressMap[identifier].progress = progress;
        progressMap[identifier].lastRead = new Date().toISOString();
    } else {
        progressMap[identifier] = {
            progress: progress,
            lastRead: new Date().toISOString(),
        }
    }
    localStorage.setItem("reader-progress", JSON.stringify(progressMap));
}

