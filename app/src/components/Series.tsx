import { ArrowLeft } from "lucide-react";
import { API_HOST, Publication } from "../types";
import { useState } from "react";
import BookRow from "./BookRow";
import DeleteBookModal from "./DeleteBookModal";
import { useToast } from "../contexts/ToastContext";


type SeriesProps = {
    seriesName: string;
    books: Publication[];
    setBooks: (books: Publication[]) => void;
    onBack?: () => void;
    openBook?: (book: Publication) => void;
}

const Series = (props: SeriesProps) => {
    const [deleteModalOpen, setDeleteModalOpen] = useState<string>();
    const { showToast } = useToast();

    const progressMap = JSON.parse(localStorage.getItem("reader-progress") || "{}");
    const getBookProgress = (identifier: string) => {
        if (progressMap[identifier]) {
            return progressMap[identifier].progress;
        }
        return 0;
    }

    const openBook = (book: Publication) => {
        props.openBook?.(book);
    }

    const downloadBook = (book: Publication) => {
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
                    name: book.metadata.title,
                    identifier: book.metadata.identifier,
                    blob: blob,
                    mimeType: link.type,
                    size: blob.size,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });

                putRequest.onsuccess = () => {
                    console.log("Book added to IndexedDB");
                };

                putRequest.onerror = (err) => {
                    console.error("Failed to add book to IndexedDB", err);
                    showToast({
                        message: "Failed to add book to IndexedDB",
                        type: "alert-error"
                    });
                };
            };

            request.onerror = (err) => {
                console.error("Failed to open IndexedDB", err);
                showToast({
                    message: "Failed to open IndexedDB",
                    type: "alert-error"
                });
            };
        }).catch((err) => {
            console.error(err);
            showToast({
                message: "Failed to download book",
                type: "alert-error"
            });
        });
    }

    return <>
        <DeleteBookModal
            books={props.books}
            setBooks={props.setBooks}
            deleteModalOpen={deleteModalOpen}
            setDeleteModalOpen={setDeleteModalOpen}
        />

        <div className="p-4 space-y-6">
            <div className="w-full fixed top-0 left-0 pt-safe-1 pb-[1em] bg-base-300 z-10 flex items-center gap-4 px-4 shadow-md">
                <button
                    onClick={props.onBack}
                    className="btn btn-ghost flex items-center gap-2"
                    aria-label="Go back"
                >
                    <ArrowLeft size={20} />
                    <span className="hidden sm:inline">Back</span>
                </button>
                <h1 className="text-lg sm:text-2xl font-bold truncate">{props.seriesName}</h1>
            </div>
            <div className="pt-[5.5rem]">
                <div className="overflow-x-auto w-full">
                    <table className="table table-zebra w-full">
                        <tbody>
                            {props.books.map((book, i) => (
                                <BookRow
                                    key={i}
                                    progress={getBookProgress(book.metadata.identifier)}
                                    book={book}
                                    openBook={() => openBook(book)}
                                    onDelete={() => setDeleteModalOpen(book.metadata.identifier)}
                                    download={() => downloadBook(book)}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </>
}

export default Series;
