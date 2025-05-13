import { useEffect, useState } from "react";
import { Publication } from "../types";
import BookTable from "../components/BookTable";
import { getDownloadedBooks } from "../services/Book";
import { useToast } from "../contexts/ToastContext";
import PageLayout from "../layout/PageLayout";



const Downloads = () => {
    const [downloads, setDownloads] = useState<Publication[]>([]);
    const { showToast } = useToast();


    useEffect(() => {
        getDownloadedBooks().then((books) => {
            setDownloads(books);
        }).catch((err) => {
            console.error(err);
            showToast({
                type: "alert-error",
                message: "Failed to fetch downloaded books",
            });
        });
    }, []);

    return (
        <PageLayout title="Downloads">
            {
                downloads.length > 0 && (
                    <BookTable
                        books={downloads}
                        onBooksChange={setDownloads}
                    />
                ) 
            }
        </PageLayout>
    );
}

export default Downloads;