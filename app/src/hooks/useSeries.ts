import { useNavigate } from "react-router-dom";

export const useSeries = () => {
    const navigate = useNavigate();;
    
    const selectSeries = (seriesId: string) => {
        navigate(`/series/${seriesId}`);
    };

    return { selectSeries };
};
