import { ArrowLeft } from "lucide-react";
import { Publication } from "../types";
import BookTable from "./BookTable";


type SeriesProps = {
    seriesName: string;
    books: Publication[];
    setBooks: (books: Publication[]) => void;
    onBack?: () => void;
}

const Series = (props: SeriesProps) => {
    
    return <div className="p-4 space-y-6">
            <div className="w-full fixed top-0 left-0 pt-safe-1 pb-[1em] bg-base-300 z-10 flex items-center gap-4 px-4 shadow-md">
                <button
                    onClick={props.onBack}
                    className="btn btn-ghost flex items-center gap-2"
                    aria-label="Go back"
                >
                    <ArrowLeft size={20} />
                    <span className="hidden sm:inline">Back</span>
                </button>
                <h1 className="text-lg sm:text-2xl font-bold truncate">{props.seriesName}</h1>
            </div>
            <div className="pt-[5.5rem]">
                <div className="overflow-x-auto w-full">
                    <BookTable books={props.books} setBooks={props.setBooks}/>
                </div>
            </div>

        </div>

}

export default Series;
