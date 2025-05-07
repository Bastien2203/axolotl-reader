import { useEffect, useRef, useState } from "react";
import { API_HOST, Publication } from "../types"
import { X } from "lucide-react";
import JSZip from "jszip";


type ReaderProps = {
    book: Publication;
    isBlob?: boolean;
    onClose?: () => void;
    onNext?: () => void;
    onPrev?: () => void;
}

const Reader = (props: ReaderProps) => {
    const [overlay, setOverlay] = useState(true);
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLoading("Loading book...");
        const link = props.book.links.filter(link => link.rel === "acquisition")[0]
        fetch((props.isBlob ? "" : API_HOST) + link.href, {
            method: "GET",
            headers: {
                "Accept": link.type,
                "Content-Type": link.type,
                "Authorization": "Bearer " + localStorage.getItem("token"),
            }
        }).then((res) => {
            if (res.status === 200) {
                return res.blob()
            } else {
                throw new Error("Failed to fetch book")
            }
        }).then((blob) => {
            setLoading("Unpacking images...");
            JSZip.loadAsync(blob).then((zip) => {
                const imagePromises: Promise<string>[] = [];
                zip.forEach((_, file) => {
                    if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
                        const promise = file.async('blob').then((blob) => {
                            return URL.createObjectURL(blob);
                        });
                        imagePromises.push(promise);
                    }
                });
                setLoading("Creating blobs...");
                Promise.all(imagePromises).then((urls) => {
                    setImages(urls);
                    setLoading(null);
                });
            });

        })

        const el = scrollRef.current;
        if (!el) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = el;
            const percent = (scrollTop / (scrollHeight - clientHeight)) * 100;
            setProgress(Math.min(100, Math.max(0, percent)));
            const p = JSON.parse(localStorage.getItem("reader-progress") || "{}");
            p[props.book.metadata.identifier] = {
                scrollTop: scrollTop,
                progress: percent.toFixed(2),
            };
            localStorage.setItem("reader-progress", JSON.stringify(p));
        };

        el.addEventListener("scroll", handleScroll);
        return () => el.removeEventListener("scroll", handleScroll);
    }, [])


    useEffect(() => {
        const p = JSON.parse(localStorage.getItem("reader-progress") || "{}");
        if (p[props.book.metadata.identifier]) {
            const el = scrollRef.current;
            if (!el) return;
            el.scrollTop = p[props.book.metadata.identifier].scrollTop;
        }
    }, [images]);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (overlay && !loading) {
            timeout = setTimeout(() => {
                setOverlay(false);
            }, 5000);
        }
        return () => {
            clearTimeout(timeout);
        }
    }, [overlay, loading])

    const showOverlay = () => setOverlay(true);

    if (loading !== null) {
        return <div className="w-screen h-screen flex flex-col items-center justify-center overflow-hidden">
        <span className="loading loading-spinner loading-xl"></span>
        {loading}
    </div>
    }


    return <div
        className="absolute z-10 top-0 left-0 w-full h-full bg-gray-900 overflow-scroll"
        ref={scrollRef}
        onClick={() => showOverlay()}
        onTouchStart={() => showOverlay()}
    >
        {
            overlay &&
            <>
                <div className="fixed bg-black/50 w-full flex justify-between px-4 py-5">
                    <div>
                        <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                    <X size={24} className=" top-4 right-4 text-white cursor-pointer" onClick={() => props.onClose?.()} />
                </div>
                <progress className="fixed progress bottom-0 progress-primary w-full" value={progress} max="100" />
            </>
        }


        <div className="flex flex-col items-center justify-start h-full">
            {images.map((src, i) => (
                <img key={i} src={src} alt={`Page ${i + 1}`} style={{ width: '100%' }} />
            ))}
        </div>


    </div>
}

export default Reader;