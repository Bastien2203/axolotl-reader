import { useEffect, useState } from "react";
import { userReader } from "../contexts/ReaderContext";
import { useToast } from "../contexts/ToastContext";
import { downloadBook, getBookProgress, getFacets, setBookProgress } from "../services/Book";
import { Facets, Publication } from "../types";
import BookRow from "./BookRow";
import DeleteBookModal from "./modals/DeleteBookModal";
import { useLocation } from "react-router-dom";
import SelectFacetsModal from "./modals/SelectFacetsModal";
import FacetsFilter from "./FacetsFilter";

type BookTableProps = {
    books: Publication[];
    onBooksChange: (books: Publication[]) => void;
    facets?: {
        authors?: boolean
        series?: boolean
        tags?: boolean
    }
}

const BookTable = (props: BookTableProps) => {
    const { showReader } = userReader()
    const { showToast } = useToast()
    const location = useLocation();
    const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);
    const [facets, setFacets] = useState<Facets | null>(null);
    const [facetsModalOpen, setFacetsModalOpen] = useState<{
        type: "authors" | "series" | "tags",
        values: string[]
    } | null>(null);
    const [selectedFacets, setSelectedFacets] = useState<Facets | null>(null);


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
        if (props.facets) {
            getFacets(props.facets).then((data) => {
                setFacets(data);
            }
            ).catch(() => {
                showToast({
                    type: "alert-error",
                    message: "Error fetching facets",
                })
            })
        }
    }, [props.facets]);

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
        <SelectFacetsModal
            facetsModalOpen={facetsModalOpen}
            setFacetsModalOpen={setFacetsModalOpen}
            selectedFacets={selectedFacets}
            setSelectedFacets={setSelectedFacets}
        />
        <>
            {facets && (
                <div className="flex flex-col gap-2 mb-4">
                    {
                        Object.entries(facets.facets).map(([key]) => {
                            return <FacetsFilter
                                key={key}
                                type={key as "series" | "tags" | "authors"}
                                facets={facets}
                                onFacetsButtonClick={(type, values) => {
                                    setFacetsModalOpen({
                                        type,
                                        values
                                    })
                                }}
                                selectedFacets={selectedFacets}
                                onSelectedFacetsChange={setSelectedFacets}
                            />
                        })
                    }


                </div>
            )}

        </>
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