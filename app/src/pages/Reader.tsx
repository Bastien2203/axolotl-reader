import { useCallback, useRef, useState } from "react";
import { useAutoHideOverlay } from "../hooks/reader/useAutoHideOverlay";
import { useBookLoader } from "../hooks/reader/useBookLoader";
import { useImageProgress } from "../hooks/reader/useImageProgress";
import ReaderOverlay from "../components/reader/ReaderOverlay";
import { useTap } from "../hooks/reader/useTap";
import { navigationDocument, Publication } from "../services/OPDS";
import { LoaderFunction, useLoaderData, useNavigate } from "react-router-dom";
import { API_HOST } from "../types";

export const readerLoader: LoaderFunction<Publication> = async ({ params }) => {
    const { seriesId, bookId } = params
    const data = await navigationDocument({ url: `${API_HOST}/opds/v2/series/${seriesId}` })
    const publication = data.publications?.find(p => p.id === bookId)
    if (!publication) throw new Response("Not Found", { status: 404 })
    return { publication }
}



const Reader = () => {
    const [overlay, setOverlay] = useState(true);
    const [progress, setProgress] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const showOverlay = useCallback(() => setOverlay(true), []);
    const { onTouchStart, onTouchEnd } = useTap(showOverlay);
    const { publication } = useLoaderData<{ publication: Publication }>()
    const navigate = useNavigate();

    const { images, loading } = useBookLoader(publication);
    useAutoHideOverlay(overlay, loading, () => setOverlay(false));
    useImageProgress(images, scrollRef, publication, setProgress);



    if (loading) {
        return (
            <div className="absolute z-10 top-0 left-0 bg-base-300 w-screen h-screen flex flex-col items-center justify-center overflow-hidden">
                <span className="loading loading-spinner loading-xl"></span>
                {loading}
            </div>
        );
    }

    return (
        <div
            className="absolute z-10 top-0 left-0 reader bg-base-300 overflow-scroll"
            ref={scrollRef}
            onClick={showOverlay}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            {overlay && <ReaderOverlay onClose={() => navigate(-1)} progress={progress} />}

            <div className="flex flex-col items-center justify-start h-full">
                {images.map((src, i) => (
                    <img
                        loading="lazy"
                        data-index={i}
                        key={i}
                        src={src}
                        alt={`Page ${i + 1}`}
                        style={{ width: "100%" }}
                        className="reader-image"
                    />
                ))}
            </div>
        </div>
    );
};

export default Reader;