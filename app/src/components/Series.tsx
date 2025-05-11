import { Publication } from "../types";
import BookTable from "./BookTable";
import TopNavigationBar from "../layout/TopNavigationBar";


type SeriesProps = {
    seriesName: string;
    books: Publication[];
    setBooks: (books: Publication[]) => void;
    onBack?: () => void;
}

const Series = (props: SeriesProps) => {
    
    return <TopNavigationBar title={props.seriesName} onBack={props.onBack}>
        <BookTable books={props.books} setBooks={props.setBooks}/>
    </TopNavigationBar>

}

export default Series;
