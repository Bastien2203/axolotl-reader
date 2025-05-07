import { href } from "react-router-dom";
import { API_HOST, Publication } from "../types";
import { resolve } from "path";
import { rejects } from "assert";


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
                            rel:	"acquisition",
                            type:   `blob+${link.type}`,
                            href:   blob
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

export const getDownloadedBooks = () : Promise<Publication[]> => {
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

export const deleteDownloadedBook = (bookId: string) : Promise<void> => {
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