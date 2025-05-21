import { useState } from "react";
import { setBookProgress, getBookProgress } from "../../services/Book";
import DeleteBookModal from "../modals/DeleteBookModal";
import BookRow from "./BookRow";
import { Publication } from "../../services/OPDS";
import { useBook } from "../../hooks/useBook";


type BookTableProps = {
    books: Publication[];
    onBooksChange: (books: Publication[]) => void;
}

const BookTable = (props: BookTableProps) => {
    const { selectBook } = useBook()
    const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);

    const markAsRead = (identifier: string) => {
        setBookProgress(identifier, 100)
    }


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
                        openBook={() => selectBook(book.id)}
                        markAsRead={() => markAsRead(book.id)}
                        onDelete={() => setDeleteModalOpen(book.id)}
                        download={() => { }}
                    />
                ))}
            </tbody>
        </table>
    </>
}

export default BookTable;