import { useCallback, useRef, useState } from "react";
import { useAutoHideOverlay } from "../../hooks/reader/useAutoHideOverlay";
import { useBookLoader } from "../../hooks/reader/useBookLoader";
import { useImageProgress } from "../../hooks/reader/useImageProgress";
import ReaderOverlay from "./ReaderOverlay";
import { useTap } from "../../hooks/reader/useTap";
import { Publication } from "../../services/OPDS";


type ReaderProps = {
    publication: Publication;
    onClose?: () => void;
    onNext?: () => void;
    onPrev?: () => void;
}

const Reader = (props: ReaderProps) => {
    const [overlay, setOverlay] = useState(true);
    const [progress, setProgress] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const showOverlay = useCallback(() => setOverlay(true), []);
    const { onTouchStart, onTouchEnd } = useTap(showOverlay);

    const { images, loading } = useBookLoader(props.publication);
    useAutoHideOverlay(overlay, loading, () => setOverlay(false));
    useImageProgress(images, scrollRef, props.publication, setProgress);


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
            {overlay && <ReaderOverlay onClose={props.onClose} progress={progress} />}

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