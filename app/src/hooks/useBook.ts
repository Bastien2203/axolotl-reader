
import { useNavigate } from "react-router-dom";


export const useBook = () => {
    const navigate = useNavigate();
    
    const selectBook = (bookId: String) => {
        const search = new URLSearchParams(window.location.search);
        const newSearch = search.get("page") ? `?page=${search.get("page")}` : "";

        navigate(`book/${bookId}${newSearch}`)
    };

    return { selectBook };
};
