import { useEffect, useState } from "react";
import Spinner from "../common/Spinner";
import Pagination from "../common/Pagination";
import PageLayout from "../../layout/PageLayout";
import BookTable from "../books/BookTable";
import { useLocation } from "react-router-dom";
import { navigationDocument, Publication } from "../../services/OPDS";


type SeriesPageProps = {
    publication: Publication;
    onBack?: () => void;
}



const SeriesPage = (props: SeriesPageProps) => {
    const [books, setBooks] = useState<Publication[]>();
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const location = useLocation();

    useEffect(() => {
        navigationDocument({
            url : props.publication.subsection?.href,
            page
        }).then((data) => {
            setTotalPages(Number(data.last?.href.split("page=")[1]) || 0);
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

    return <PageLayout title={props.publication.metadata.title} onBack={props.onBack}>
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
