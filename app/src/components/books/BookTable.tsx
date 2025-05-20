import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { userReader } from "../../contexts/ReaderContext";
import { setBookProgress, getBookProgress } from "../../services/Book";
import DeleteBookModal from "../modals/DeleteBookModal";
import BookRow from "./BookRow";
import { Publication } from "../../services/OPDS";


type BookTableProps = {
    books: Publication[];
    onBooksChange: (books: Publication[]) => void;
}

const BookTable = (props: BookTableProps) => {
    const { showReader } = userReader()
    const location = useLocation();
    const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);

    const locationChangeHandler = () => {
        const url = new URL(window.location.href);
        const bookId = url.searchParams.get("book");

        if (bookId) {
            const foundBook = props.books.find((b) => b.id === bookId);

            if (foundBook) {
                showReader({
                    publication: foundBook,
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
            publications={props.books}
            setBooks={props.onBooksChange}
            deleteModalOpen={deleteModalOpen}
            setDeleteModalOpen={setDeleteModalOpen}
        />
        <table className="table table-zebra w-full">
            <tbody>
                {props.books.map((book, i) => (
                    <BookRow
                        key={i}
                        progress={getBookProgress(book.id)?.progress ?? null}
                        book={book}
                        openBook={() => showReader({
                            publication: book,
                        })}
                        markAsRead={() => markAsRead(book.id)}
                        onDelete={() => setDeleteModalOpen(book.id)}
                        download={() => {}}
                    />
                ))}
            </tbody>
        </table>
    </>
}

export default BookTable;