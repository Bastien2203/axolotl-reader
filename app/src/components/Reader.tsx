import { useEffect, useRef, useState } from "react";
import { API_HOST, Publication } from "../types"
import { X } from "lucide-react";
import JSZip from "jszip";
import { getBookProgress, setBookProgress } from "../services/Book";


type ReaderProps = {
    book: Publication;
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
        const link = props.book.links.find(link => link.rel === "acquisition");
        if (!link) {
            throw new Error("No acquisition link found");
        }

        const fetchUrl = link.type.startsWith("blob+") ? URL.createObjectURL(link.href as unknown as Blob) : API_HOST + link.href;
        fetch(fetchUrl, {
            method: "GET",
            headers: {
                "Accept": link.type,
                "Content-Type": link.type,
                "Authorization": "Bearer " + localStorage.getItem("token"),
            }
        }).then((res) => {
            if (res.status === 200) {
                return res.blob();
            } else {
                throw new Error("Failed to fetch book");
            }
        }).then((blob) => {
            setLoading("Unpacking images...");
            return JSZip.loadAsync(blob);
        }).then((zip) => {
            const imagePromises: Promise<string>[] = [];
            zip.forEach((_, file) => {
                if (/\.(jpe?g|png|gif|webp)$/i.test(file.name)) {
                    const promise = file.async('blob').then((blob) => {
                        return URL.createObjectURL(blob);
                    });
                    imagePromises.push(promise);
                }
            });
            setLoading("Creating blobs...");
            return Promise.all(imagePromises);
        }).then((urls) => {
            setImages(urls);
            setLoading(null);
        }).catch((error) => {
            console.error("Error loading book:", error);
            setLoading("Failed to load book");
        });

        return () => {
            // revoke object URLs to free memory
            if (fetchUrl.startsWith("blob:")) {
                URL.revokeObjectURL(fetchUrl);
            }
        }
    }, [])


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

    useEffect(() => {
        if (images.length === 0) return;

        let loaded = 0;
        const imgs = Array.from(document.querySelectorAll('.reader-image')) as HTMLImageElement[];

        imgs.forEach(img => {
            if (img.complete) {
                loaded++;
            } else {
                img.onload = () => {
                    loaded++;
                    if (loaded === imgs.length) {
                        return attachObserver();
                    }
                };
            }
        });

        if (loaded === imgs.length) {
            return attachObserver();
        }

        function attachObserver() {
            const progressData = getBookProgress(props.book.metadata.identifier);
            if (progressData) {
                const savedIndex = Math.floor((progressData.progress / 100) * images.length);
                setTimeout(() => {
                    const target = document.querySelector(`.reader-image[data-index="${savedIndex}"]`);
                    if (target && scrollRef.current) {
                        scrollRef.current.scrollTo({
                            top: (target as HTMLElement).offsetTop,
                            behavior: "auto", 
                        });
                    }
                }, 0); 
            }
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const index = parseInt(entry.target.getAttribute('data-index') || '0');
                        const progress = (index / images.length) * 100;
                        setBookProgress(props.book.metadata.identifier, progress);
                        setProgress(progress);
                    }
                });
            }, {
                root: scrollRef.current,
                threshold: 0.5, // Trigger when 50% of the image is visible
            });
    
            document.querySelectorAll('.reader-image').forEach(img => observer.observe(img));
            
            return () => observer.disconnect();
        }
        
    }, [images]);


    const showOverlay = () => setOverlay(true);

    if (loading !== null) {
        return <div className="absolute z-10 top-0 left-0 bg-base-300 w-screen h-screen flex flex-col items-center justify-center overflow-hidden">
            <span className="loading loading-spinner loading-xl"></span>
            {loading}
        </div>
    }


    return <div
        className="absolute z-10 top-0 left-0 w-full h-full bg-base-300 overflow-scroll"
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
                <img
                    data-index={i}
                    key={i}
                    src={src}
                    alt={`Page ${i + 1}`}
                    style={{ width: '100%' }}
                    className="reader-image" />
            ))}
        </div>
    </div>
}

export default Reader;