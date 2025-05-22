import { useCallback, useEffect, useState } from "react";
import ReaderOverlay from "../components/reader/ReaderOverlay";
import { useTap } from "../hooks/useTap";
import { navigationDocument, Publication } from "../services/OPDS";
import { LoaderFunction, useLoaderData, useNavigate } from "react-router-dom";
import { API_HOST } from "../types";
import { VirtualScroll } from "../components/common/VirtualScroll";
import JSZip, { JSZipObject } from "jszip";
import ZipImage from "../components/common/ZipImage";
import { setBookProgress } from "../services/Book";

export const readerLoader: LoaderFunction<Publication> = async ({ params }) => {
    const { seriesId, bookId } = params
    const data = await navigationDocument({ url: `${API_HOST}/opds/v2/series/${seriesId}` })
    const publication = data.publications?.find(p => p.id === bookId)
    if (!publication || !data.publications) throw new Response("Not Found", { status: 404 })
    const nextPublication = data.publications?.at(data.publications.indexOf(publication) + 1)
    return { publication, nextPublication, seriesId }
}


const useAutoHideOverlay = (overlay: boolean, loading: string | null, onHide: () => void) => {
    useEffect(() => {
        if (!overlay || loading) return;
        const timeout = setTimeout(onHide, 5000);
        return () => clearTimeout(timeout);
    }, [overlay, loading]);
};


const Reader = () => {
    const [overlay, setOverlay] = useState(true);
    const [loading, setLoading] = useState<string | null>("");
    const [index, setIndex] = useState(0);
    const [items, setItems] = useState<JSZipObject[]>([]);

    const showOverlay = useCallback(() => setOverlay(true), []);
    const navigate = useNavigate();
    const { publication, nextPublication, seriesId } = useLoaderData<{ publication: Publication, nextPublication?: Publication, seriesId: string }>();
    const { onTouchStart, onTouchEnd } = useTap(showOverlay);
    useAutoHideOverlay(overlay, loading, () => setOverlay(false));


    useEffect(() => {
        const loadPublication = async () => {
            setLoading("Loading book...")
            const link = publication?.acquisition
            if (!link?.type) throw new Error("No acquisition link found")

            try {
                const response = await fetch(link.href, {
                    headers: {
                        Accept: link.type,
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                })

                if (!response.ok) throw new Error("Failed to fetch book")

                const zip = await JSZip.loadAsync(await response.blob())
                const images = Object.values(zip.files).filter(file =>
                    /\.(jpe?g|png|gif|webp)$/i.test(file.name)
                )
                setItems(images)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(null)
            }
        }

        loadPublication()
    }, [publication])

    useEffect(() => {
    
        const progress = index / (items.length - 1) * 100
        setBookProgress(
            publication.id,
            progress > 95 ? 100 : progress
        )
    }, [index])

    const onNext = () => {
        if (nextPublication) {
            navigate(`/series/${seriesId}/book/${nextPublication.id}`, {
                replace: true,
            })
        } else {
            navigate(-1)
        }
    }

    const onClose = () => {
        navigate(-1)
    }


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
            onClick={showOverlay}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            {overlay && <ReaderOverlay onClose={() => onClose()} progress={index / (items.length - 1) * 100} />}

            <VirtualScroll
                items={items}
                buffer={5}
                initialIndex={0}
                onIndexChange={(i) => setIndex(i)}
                renderItem={(file, idx) => file.async("blob").then(blob => <ZipImage key={idx} blobUrl={URL.createObjectURL(blob)} />)}
                lastItem={nextPublication ?
                    <div className="w-full h-[50vh] flex items-center justify-center">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                onNext()
                            }}
                        >
                            Next book: {nextPublication.metadata.title}
                        </button>
                    </div> : <div className="w-full h-[50vh] flex items-center justify-center">
                        <button
                            className="btn btn-primary"
                            onClick={() => onClose()}
                        >
                            Back to series
                        </button>
                    </div>
                }
                className="w-full h-screen"
            />
        </div>
    );
};

export default Reader;