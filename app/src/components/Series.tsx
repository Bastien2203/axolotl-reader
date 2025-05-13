import { Publication } from "../types";
import BookTable from "./BookTable";
import { useEffect, useState } from "react";
import { getSeries, PAGE_SIZE } from "../services/Book";
import Spinner from "./common/Spinner";
import Pagination from "./Pagination";
import PageLayout from "../layout/PageLayout";


type SeriesProps = {
    seriesName: string;
    onBack?: () => void;
}



const Series = (props: SeriesProps) => {
    const [books, setBooks] = useState<Publication[]>();
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        getSeries(props.seriesName, page).then((data) => {
            setTotalPages(Math.ceil(data.metadata.total / PAGE_SIZE));
            setBooks(data.publications || []);
        }
        ).catch((error) => {
            console.error("Error fetching series:", error);
        });
    }, [page]);

    return <PageLayout title={props.seriesName} onBack={props.onBack}>
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

export default Series;
