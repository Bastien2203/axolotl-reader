import { useEffect, useState } from "react";
import { userReader } from "../contexts/ReaderContext";
import { useToast } from "../contexts/ToastContext";
import { downloadBook } from "../services/Book";
import { Publication } from "../types";
import BookRow from "./BookRow";
import DeleteBookModal from "./DeleteBookModal";
import { useLocation } from "react-router-dom";

type BookTableProps = {
    books: Publication[];
    setBooks: (books: Publication[]) => void;
}

const BookTable = (props: BookTableProps) => {
    const { showReader } = userReader()
    const { showToast } = useToast()
    const location = useLocation();
    const [deleteModalOpen, setDeleteModalOpen] = useState<string>();


    const progressMap = JSON.parse(localStorage.getItem("reader-progress") || "{}");
    const getBookProgress = (identifier: string) => {
        if (progressMap[identifier]) {
            return progressMap[identifier].progress;
        }
        return 0;
    }

    const locationChangeHandler = () => {
        const url = new URL(window.location.href);
        const bookId = url.searchParams.get("book");

        if (bookId) {
            const foundBook = props.books.find((pub) => pub.metadata.identifier === bookId);

            if (foundBook) {
                showReader({
                    book: foundBook,
                })
            }
        }
    }

    const markAsRead = (identifier: string) => {
        const progress = progressMap[identifier];
        if (progress) {
            progressMap[identifier].progress = 100;
        } else {
            progressMap[identifier] = {
                progress: 100,
            }
        }
            localStorage.setItem("reader-progress", JSON.stringify(progressMap));

    }

    useEffect(() => {
        if (props.books.length === 0) return;
        locationChangeHandler();
    }, [props.books]);

    useEffect(() => {
        locationChangeHandler();
    }, [location]);

    return <>
        <DeleteBookModal
            books={props.books}
            setBooks={props.setBooks}
            deleteModalOpen={deleteModalOpen}
            setDeleteModalOpen={setDeleteModalOpen}
        />
        <table className="table table-zebra w-full">
            <tbody>
                {props.books.map((book, i) => (
                    <BookRow
                        key={i}
                        progress={getBookProgress(book.metadata.identifier)}
                        book={book}
                        openBook={() => showReader({
                            book,
                        })}
                        markAsRead={() => markAsRead(book.metadata.identifier)}
                        onDelete={() => setDeleteModalOpen(book.metadata.identifier)}
                        download={book.links.find((link) => link.rel === "acquisition")?.type.startsWith("blob+") ? undefined :
                            () => downloadBook(book, (message: string) => {
                                showToast({
                                    type: "alert-error",
                                    message
                                })
                            }, (message: string) => {
                                showToast({
                                    type: "alert-success",
                                    message
                                })
                            })}
                    />
                ))}
            </tbody>
        </table>
    </>
}

export default BookTable;