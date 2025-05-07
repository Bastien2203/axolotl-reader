import { useEffect, useState } from "react";
import BookRow from "../components/BookRow";
import { Publication } from "../types";
import Reader from "../components/Reader";
import { useToast } from "../contexts/ToastContext";

type Download = {
    name: string;
    identifier: string;
    blob: Blob;
    mimeType: string;
    size: number;
    createdAt: Date;
    updatedAt: Date;
}

const Downloads = () => {
    const [bookSelected, setBookSelected] = useState<Publication | null>(null);

    const [downloads, setDownloads] = useState<Download[]>([]);
    const {showToast} = useToast();

    const selectBook = (book: Download) => {

        if (!book) {
            showToast({
                type: "alert-error",
                message: "Book not found",
            });
            return;
        }
        setBookSelected({
            metadata: {
                title: book.name,
                identifier: book.identifier,
                authors: [],
            },
            links: [
                {
                    rel: "acquisition",
                    href: URL.createObjectURL(book.blob),
                    type: book.mimeType,
                }
            ]
        });
        const url = new URL(window.location.href);
        url.searchParams.set("book", book.identifier);
        window.history.pushState({}, "", url.toString());
      }

    const backToDownloads = () => {
        setBookSelected(null);
        const url = new URL(window.location.href);
        url.searchParams.delete("book");
        window.history.pushState({}, "", url.toString());
    } 

    useEffect(() => {
        const request = indexedDB.open('downloaded-books', 1);
        
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('books')) {
                db.createObjectStore('books', { keyPath: 'identifier' });
            }
        };

        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction('books', 'readonly');
            const store = tx.objectStore('books');
            const allBooksRequest = store.getAll();

            allBooksRequest.onsuccess = () => {
                setDownloads(allBooksRequest.result);
            };
        };
    }, []);

    const progressMap = JSON.parse(localStorage.getItem("reader-progress") || "{}");
    const getBookProgress = (identifier: string) => {
        if (progressMap[identifier]) {
            return progressMap[identifier].progress;
        }
        return 0;
    }

    if (bookSelected !== null) {
        return <Reader onClose={backToDownloads} book={bookSelected} isBlob onNext={() => { }} onPrev={() => { }} />
      }

    return (
        <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold">Downloads</h1>

        {
            downloads.length > 0 ? (
                <table className="table table-zebra w-full">
                        <tbody>
                            {
                                downloads.map((book, i) => (
                                    <BookRow
                                    key={i}
                                    progress={getBookProgress(book.identifier)}
                                    book={{
                                        metadata: {
                                            title: book.name,
                                            identifier: book.identifier,
                                            authors: [],
                                        },
                                        links: []
                                    }}
                                    openBook={() => selectBook(book)}
                                />
                                ))
                            }
                        </tbody>
                </table>

            ) : <></>
        }
    </div>
    );
}

export default Downloads;