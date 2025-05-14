import { Publication, Series } from "../../types";
import { useEffect, useState } from "react";
import { getSeries, PAGE_SIZE } from "../../services/Book";
import Spinner from "../common/Spinner";
import Pagination from "../common/Pagination";
import PageLayout from "../../layout/PageLayout";
import BookTable from "../books/BookTable";
import { useLocation } from "react-router-dom";


type SeriesPageProps = {
    series: Series;
    onBack?: () => void;
}



const SeriesPage = (props: SeriesPageProps) => {
    const [books, setBooks] = useState<Publication[]>();
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const location = useLocation();

    useEffect(() => {
        getSeries(props.series, page).then((data) => {
            setTotalPages(Math.ceil(data.metadata.total / PAGE_SIZE));
            setBooks(data.publications || []);
        }
        ).catch((error) => {
            console.error("Error fetching series:", error);
        });
    }, [page]);

    useEffect(() => {
        if (location.search === "" && books) {
            props.onBack && props.onBack();
        }
    }, [location]);

    return <PageLayout title={props.series.name} onBack={props.onBack}>
        {books ? <>
            <BookTable books={books} onBooksChange={setBooks} />
            <Pagination
                page={page}
                onPageChange={setPage}
                totalPages={totalPages} />
        </>

            : <div className="w-full h-full flex justify-center items-center">
                <Spinner />
            </div>}

    </PageLayout>

}

export default SeriesPage;
