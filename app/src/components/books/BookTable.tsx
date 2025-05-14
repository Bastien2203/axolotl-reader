import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { userReader } from "../../contexts/ReaderContext";
import { useToast } from "../../contexts/ToastContext";
import { setBookProgress, getBookProgress, downloadBook } from "../../services/Book";
import { Publication } from "../../types";
import DeleteBookModal from "../modals/DeleteBookModal";
import BookRow from "./BookRow";


type BookTableProps = {
    books: Publication[];
    onBooksChange: (books: Publication[]) => void;
}

const BookTable = (props: BookTableProps) => {
    const { showReader } = userReader()
    const { showToast } = useToast()
    const location = useLocation();
    const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);

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
        setBookProgress(identifier, 100)
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
            setBooks={props.onBooksChange}
            deleteModalOpen={deleteModalOpen}
            setDeleteModalOpen={setDeleteModalOpen}
        />
        <table className="table table-zebra w-full">
            <tbody>
                {props.books.map((book, i) => (
                    <BookRow
                        key={i}
                        progress={getBookProgress(book.metadata.identifier)?.progress ?? null}
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