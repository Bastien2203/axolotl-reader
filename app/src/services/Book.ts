import { API_HOST, BookProgress, Catalog, Facets, Publication, Series } from "../types";

export const PAGE_SIZE = 10;


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

export const getBooks = async (page: number) => {
    return new Promise<Catalog>((resolve, reject) => {
        fetch(`${API_HOST}/opds/catalog.json?from=${(page - 1) * PAGE_SIZE}&size=${PAGE_SIZE}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token"),
            }
        }).then((res) => {
            if (res.status === 200) {
                res.json().then((data) => {
                    resolve(data);
                }).catch(() => {
                    reject("Error parsing books");
                });
            } else if (res.status === 401) {
                localStorage.removeItem("token");
                reject("Unauthorized");
            } else {
                reject("Error fetching books");
            }
        })
    }
    )
}

export const searchBooks = async (p: {
    query?: string,
    page: number,
    id?: string,
    }) => {
    return new Promise<Catalog>((resolve, reject) => {
        fetch(`${API_HOST}/opds/search.json?${p.query ? "query="+ encodeURIComponent(p.query) + "&" : ""}${
            p.id ? "id=" + encodeURIComponent(p.id) + "&" : ""
        }from=${(p.page - 1) * PAGE_SIZE}&size=${PAGE_SIZE}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token"),
            }
        }).then((res) => {
            if (res.status === 200) {
                res.json().then((data) => {
                    resolve(data);
                }).catch(() => {
                    reject("Error parsing books");
                });
            } else if (res.status === 401) {
                localStorage.removeItem("token");
                reject("Unauthorized");
            } else {
                reject("Error fetching books");
            }
        })
    })
}

export const getSeries = async (series: Series, page: number) => {
    return new Promise<Catalog>((resolve, reject) => {
        fetch(`${API_HOST}/opds/series/${encodeURIComponent(series.id)}.json?from=${(page - 1) * PAGE_SIZE}&size=${PAGE_SIZE}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token"),
            }
        }).then((res) => {
            if (res.status === 200) {
                res.json().then((data) => {
                    resolve(data);
                }).catch(() => {
                    reject("Error parsing series");
                });
            } else {
                reject("Error fetching series");
            }
        })
    })
}

// DOWNLOAD BOOK -------------------------------

export const downloadBook = (book: Publication, onError: (message: string) => void, onSuccess: (message: string) => void) => {
    const link = book.links.filter(link => link.rel === "acquisition")[0]
    fetch(API_HOST + link.href, {
        method: "GET",
        headers: {
            "Accept": link.type,
            "Content-Type": link.type,
            "Authorization": "Bearer " + localStorage.getItem("token"),
        }
    }).then((res) => {
        if (res.status === 200) {
            return res.blob()
        } else {
            throw new Error("Failed to fetch book")
        }
    }).then((blob) => {
        const request = indexedDB.open('downloaded-books', 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('books')) {
                db.createObjectStore('books', { keyPath: 'identifier' });
            }
        };

        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction('books', 'readwrite');
            const store = tx.objectStore('books');

            const putRequest = store.put({
                identifier: book.metadata.identifier,
                metadata: book.metadata,
                links: [
                    {
                        rel: "acquisition",
                        type: `blob+${link.type}`,
                        href: blob
                    }
                ]
            });

            putRequest.onsuccess = () => {
                onSuccess("Book added to IndexedDB");
            };

            putRequest.onerror = (err) => {
                console.error(err)
                onError("Failed to add book to IndexedDB")
            };
        };

        request.onerror = (err) => {
            console.error(err)
            onError("Failed to open IndexedDB")
        };
    }).catch((err) => {
        console.error(err);
        onError("Failed to download book")
    });
}

export const getDownloadedBooks = (): Promise<Publication[]> => {
    return new Promise<Publication[]>((resolve, reject) => {
        const request = indexedDB.open('downloaded-books', 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('books')) {
                db.createObjectStore('books', { keyPath: 'identifier' });
            }
        };

        request.onerror = (err) => {
            reject(err);
        };

        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction('books', 'readonly');
            const store = tx.objectStore('books');
            const allBooksRequest = store.getAll();

            allBooksRequest.onsuccess = () => {
                resolve(allBooksRequest.result as Publication[]);
            };

            allBooksRequest.onerror = (err) => {
                reject(err);
            };
        };
    });
}

export const deleteDownloadedBook = (bookId: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('downloaded-books', 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('books')) {
                db.createObjectStore('books', { keyPath: 'identifier' });
            }
        };

        request.onerror = (err) => {
            reject(err);
        };

        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction('books', 'readwrite');
            const store = tx.objectStore('books');
            const deleteRequest = store.delete(bookId);

            deleteRequest.onsuccess = () => {
                resolve();
            };

            deleteRequest.onerror = (err) => {
                reject(err);
            };
        };
    });
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

export const getLastReadBook = (): Promise<Publication | null> => {
    return new Promise<Publication | null>((resolve, reject) => {
        const progressMap = JSON.parse(localStorage.getItem("reader-progress") || "{}") as Record<string, BookProgress>;
        const lastReadBooks = Object.entries(progressMap)
            .filter(([_, progress]) => progress.progress < 100) 
            .sort((a, b) => {
                return new Date(b[1].lastRead).getTime() - new Date(a[1].lastRead).getTime();
            });
        if (lastReadBooks.length > 0) {
            const bookId = lastReadBooks[0][0];
            searchBooks({
                id: bookId,
                page: 1
            }).then((data) => {
                const book = data.publications.find((pub) => pub.metadata.identifier === bookId);
                if (book) {
                    resolve(book);
                } else {
                    reject("Book not found");
                }
            }).catch((e) => {
                console.error(e);
                reject("Error fetching book");
            });
        } else {
            resolve(null);
        }
    })
}