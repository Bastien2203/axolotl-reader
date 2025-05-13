import { useEffect, useState } from "react";
import PageLayout from "../layout/PageLayout";
import { Publication, Catalog } from "../types";
import { useNavigate } from "react-router-dom";
import BookTable from "../components/BookTable";
import Spinner from "../components/common/Spinner";
import Pagination from "../components/Pagination";
import { getBooks, searchBooks } from "../services/Book";
import { useToast } from "../contexts/ToastContext";

const PAGE_SIZE = 10;

const SearchPage = () => {
    const [books, setBooks] = useState<Publication[]>([]);
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const {showToast} = useToast();

    const _searchBooks = () => {
        setLoading(true);
        setPage(1);
        searchBooks({query: search, page}).then((data: Catalog) => {
            setTotalPages(Math.ceil(data.metadata.total / PAGE_SIZE));
            setBooks(data.publications || []);
            setLoading(false);
        }
        ).catch((error) => {
            console.error("Error fetching books:", error);
            if (error === "Unauthorized") {
                localStorage.removeItem("token");
                navigate("/login");
            }

            showToast({
                type: "alert-error",
                message: "Error fetching books",
            });
            setLoading(false);
        })
    }

    const loadAllBooks = () => {
        setLoading(true);
        getBooks(page).then((data: Catalog) => {
            setTotalPages(Math.ceil(data.metadata.total / PAGE_SIZE));
                    setBooks(data.publications || []);
                    setLoading(false);
        }).catch((error) => {
            console.error("Error fetching books:", error);
            if (error === "Unauthorized") {
                localStorage.removeItem("token");
                navigate("/login");
            }

            showToast({
                type: "alert-error",
                message: "Error fetching books",
            });
            setLoading(false);
        })
    }

    useEffect(() => {
        if(search !== "") {
            _searchBooks();
        } else {
            loadAllBooks();
        }
    }, [page]);

    useEffect(() => {
        if (search.length > 3) {
            _searchBooks();
        } else if (search.length === 0) {
            loadAllBooks();
        }
    }, [search]);

    return <PageLayout title="Search">
        {
            loading ?
                <div className="w-full h-full flex justify-center items-center">
                    <Spinner />
                </div> : (
                    <>
                        <input
                            type="text"
                            placeholder="Search books..."
                            className="input input-bordered w-full mb-4"
                            onChange={(e) => setSearch(e.target.value)}
                            value={search}
                        />

                        <BookTable
                            books={books}
                            onBooksChange={setBooks}
                        />

                        <Pagination 
                            page={page}
                            onPageChange={setPage}
                            totalPages={totalPages}/>
                    </>
                )
        }

    </PageLayout>
}

export default SearchPage;