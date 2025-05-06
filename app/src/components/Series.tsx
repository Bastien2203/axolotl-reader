import { ArrowLeft } from "lucide-react";
import { Publication } from "../types";
import { useState } from "react";
import BookRow from "./BookRow";
import DeleteBookModal from "./DeleteBookModal";


type SeriesProps = {
    seriesName: string;
    books: Publication[];
    setBooks: (books: Publication[]) => void;
    onBack?: () => void;
    openBook?: (book: Publication) => void;
}

const Series = (props: SeriesProps) => {
    const [deleteModalOpen, setDeleteModalOpen] = useState<string>();

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

    return <>
        <DeleteBookModal
            books={props.books}
            setBooks={props.setBooks}
            deleteModalOpen={deleteModalOpen}
            setDeleteModalOpen={setDeleteModalOpen}
        />

        <div className="p-4 space-y-6">
            <div
                className="flex w-fit items-center gap-2 cursor-pointer hover:opacity-60"
                onClick={props.onBack}>
                <ArrowLeft size={24} /> Back
            </div>
            <h2 className="text-2xl font-bold">{props.seriesName}</h2>

            <table className="table">
                <tbody>
                    {
                        props.books.map((book, i) => (
                            <BookRow key={i}
                                progress={getBookProgress(book.metadata.identifier)}
                                book={book}
                                openBook={() => openBook(book)}
                                onDelete={() => { setDeleteModalOpen(book.metadata.identifier) }} />
                        ))
                    }
                </tbody>
            </table>

        </div>
    </>
}

export default Series;
