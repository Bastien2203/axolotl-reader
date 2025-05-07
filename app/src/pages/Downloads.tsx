import { useEffect, useState } from "react";
import { Publication } from "../types";
import BookTable from "../components/BookTable";
import { getDownloadedBooks } from "../services/Book";
import { useToast } from "../contexts/ToastContext";



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
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold">Downloads</h1>
            {
                downloads.length > 0 && (
                    <BookTable
                        books={downloads}
                        setBooks={setDownloads}
                    />
                ) 
            }
        </div>
    );
}

export default Downloads;