import { useEffect, useState } from "react";
import { LoaderFunction, useLoaderData, useNavigate } from "react-router-dom";
import { Feed, navigationDocument, Publication } from "../services/OPDS";
import Pagination from "../components/common/Pagination";
import BookTable from "../components/books/BookTable";
import Spinner from "../components/common/Spinner";
import { API_HOST } from "../types";
import PageLayout from "../layout/PageLayout";

export const seriesLoader: LoaderFunction<Feed> = async ({ params, request }) => {
    const { seriesId } = params;
    const search = new URL(request.url).searchParams;
    const page = search.get("page");
    const data = await navigationDocument({ url: `${API_HOST}/opds/v2/series/${seriesId}`, page: Number(page ?? 1) })
    return data
}

const SeriesPage = () => {
    const search=  new URLSearchParams(window.location.search);
    const page  = Number(search.get("page")) || 1;
    const [books, setBooks] = useState<Publication[]>();
    const [totalPages, setTotalPages] = useState<number>();
    const feed = useLoaderData<Feed>()
    const navigate = useNavigate();

    const setPage = (page: number) => {
        navigate("?page=" + page);
    }


    useEffect(() => {
        if (feed) {
            setBooks(feed.publications);
            setTotalPages(Number(feed.last?.href.split("page=")[1]) || 1);
        }
    }, [feed]);


    if (!books || totalPages === undefined) {
        return <PageLayout title="Loading..." onBack={() => navigate(-1)}>
            <div className="w-full h-full flex justify-center items-center">
                <Spinner />
            </div>
        </PageLayout>
    }

    return <PageLayout title={feed.metadata.title} onBack={() => navigate(-1)}>
        <BookTable books={books} onBooksChange={setBooks} />
        <Pagination
            page={page}
            onPageChange={setPage}
            totalPages={totalPages} />
    </PageLayout>
}

export default SeriesPage;
