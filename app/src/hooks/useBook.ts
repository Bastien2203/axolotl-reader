
import { useNavigate } from "react-router-dom";


export const useBook = () => {
    const navigate = useNavigate();
    
    const selectBook = (bookId: String) => {
        navigate(`book/${bookId}`)
    };

    return { selectBook };
};
