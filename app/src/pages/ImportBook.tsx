import { Import, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { API_HOST, Facets } from "../types";
import { useToast } from "../contexts/ToastContext";
import { TextOrSelectInput, TextOrSelectInputMany } from "../components/common/TextOrSelectInput";
import { getFacets } from "../services/Book";
import PageLayout from "../layout/PageLayout";
import Spinner from "../components/common/Spinner";


const ImportBook = () => {

   const { showToast } = useToast();

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [bookDatas, setBookDatas] = useState<{
        title: string;
        seriesPosition?: number;
        file: File;
        cover?: File;
    }[]>([]);

    const [loading, setLoading] = useState<{
        loading: boolean;
        percent: number;
        uploadedMB: number;
        totalMB: number;
    }>({
        loading: false,
        percent: 0,
        uploadedMB: 0,
        totalMB: 0,
    });

    const [metadata, setMetadata] = useState<{
        authors?: string[];
        seriesName?: string;
        tags?: string[];
    }>({});

    const [seriesMode, setSeriesMode] = useState(false);
    const [useFirstPageAsCover, setUseFirstPageAsCover] = useState(true);
    const [useTemplateForTitle, setUseTemplateForTitle] = useState(false);
    const [template, setTemplate] = useState("");
    const [facets, setFacets] = useState<Facets>();

    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        const mapped = files.map((file, i) => ({
            file,
            title: file.name.replace(/\.[^/.]+$/, ""),
            seriesPosition: files.length > 1 ? i + 1 : undefined,
        }));
        setBookDatas(mapped);
    };

    const uploadBooks = async () => {
        const totalMB = bookDatas.reduce((acc, b) => acc + b.file.size, 0) / 1024 / 1024;

        if (!metadata?.authors || metadata.authors.length < 1 ) return showToast({ message: "Author is required", type: "alert-error" });
        if (!useFirstPageAsCover && bookDatas.some(b => !b.cover)) return showToast({ message: "Cover is required", type: "alert-error" });
        if (bookDatas.some(b => !b.title)) return showToast({ message: "Title is required", type: "alert-error" });
        if (bookDatas.some(b => b.title.length > 100)) return showToast({ message: "Title is too long", type: "alert-error" });
        if (seriesMode && bookDatas.some(b => !b.seriesPosition || b.seriesPosition < 1)) return showToast({ message: "Invalid series position", type: "alert-error" });
        if (seriesMode && !metadata.seriesName) return showToast({ message: "Series name is required", type: "alert-error" });

        setLoading({ loading: true, percent: 0, uploadedMB: 0, totalMB });

        try {
            // Prepare batch form data
            const formData = new FormData();
            
            // Add common metadata
            formData.append("authors", metadata.authors!.join(","));
            formData.append("tags", metadata.tags?.join(",") || "");
            formData.append("use_first_page_as_cover", useFirstPageAsCover ? "true" : "false");
            if (seriesMode && metadata.seriesName) {
                formData.append("series_name", metadata.seriesName);
            }

            // Add book files and metadata arrays
            bookDatas.forEach((book) => {
                formData.append("books", book.file);
                formData.append("titles", book.title);
                formData.append("identifiers", crypto.randomUUID());
                if (seriesMode && book.seriesPosition) {
                    formData.append("series_positions", book.seriesPosition.toString());
                } else {
                    formData.append("series_positions", "");
                }
                
                // Add cover files if not using first page as cover
                if (!useFirstPageAsCover && book.cover) {
                    formData.append("covers", book.cover);
                }
            });

            const res = await fetch(`${API_HOST}/books/batch`, {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(`Batch upload failed: ${res.status} - ${errorData.error || 'Unknown error'}`);
            }

            const result = await res.json();
            
            // Update progress to 100%
            setLoading({ loading: false, percent: 100, uploadedMB: totalMB, totalMB });
            
            // Show results
            if (result.summary.failed > 0) {
                showToast({ 
                    message: `Upload completed: ${result.summary.success} succeeded, ${result.summary.failed} failed`, 
                    type: result.summary.success > 0 ? "alert-warning" : "alert-error"
                });
                console.log("Failed uploads:", result.results.filter((r: any) => !r.success));
            } else {
                showToast({ 
                    message: `Successfully uploaded ${result.summary.success} book(s)`, 
                    type: "alert-success"
                });
            }

            setBookDatas([]);
            setMetadata({});
            if (fileInputRef.current) fileInputRef.current.value = "";

        } catch (err) {
            console.error(err);
            showToast({ message: `Error uploading books: ${err}`, type: "alert-error" });
            setLoading({ loading: false, percent: 0, uploadedMB: 0, totalMB });
        }
    };

    useEffect(() => {
        getFacets()
            .then(setFacets)
            .catch(err => {
                console.error(err);
                showToast({ message: "Error fetching facets", type: "alert-error" });
            });
    }, []);

    useEffect(() => {
        if (useTemplateForTitle) {
            setBookDatas(prev => prev.map((book, i) => ({
                ...book,
                title: template.replace(/#/g, ((
                    seriesMode ? (book.seriesPosition || i + 1) : i + 1).toString()),
                ),
            })));
        } 
    }, [template, seriesMode]);

    return <PageLayout title="Import Book">
        <input ref={fileInputRef} type="file" accept=".cbz" className="hidden" onChange={handleFileInputChange} multiple />

        {
        bookDatas.length === 0 && 
            <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-xl font-semibold">Import Your Books</h2>
            <p className="text-gray-500 text-center">
                Select and upload your comic book files (.cbz) to start building your library.
                <br />
                Fill in the metadata to organize your collection effectively.
            </p>

            <button className="btn btn-primary w-1/2 my-12" onClick={handleImportClick}>
                    <Search size={24} />
                    Find Book(s) (.cbz) in your device
                </button>
            </div> 
      }
        
        {
            bookDatas && bookDatas.length > 0 && (
                <>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>File Name</th>
                                <th>Size</th>
                                <th>Title</th>
                                {
                                    seriesMode && <th>Series Position</th>
                                }
                                {
                                    !useFirstPageAsCover && <th>Cover</th>
                                }
                            </tr>
                        </thead>

                        <tbody>
                            {bookDatas.map((book) => (
                                <tr key={book.file.name}>
                                    <td>{book.file.name}</td>
                                    <td>{(book.file.size / 1024 / 1024).toFixed(2)} MB</td>
                                    <td>
                                        <input type="text" className="input input-bordered w-full mt-1" value={book.title} onChange={(e) => {
                                            const newBookDatas = [...bookDatas];
                                            const index = newBookDatas.findIndex(b => b.file.name === book.file.name);
                                            if (index !== -1) {
                                                newBookDatas[index].title = e.target.value;
                                                setBookDatas(newBookDatas);
                                            }
                                        }} />
                                    </td>
                                    {
                                        seriesMode && <td>
                                            <input type="number" className="input input-bordered w-full mt-1" value={book.seriesPosition} onChange={(e) => {
                                                const newBookDatas = [...bookDatas];
                                                const index = newBookDatas.findIndex(b => b.file.name === book.file.name);
                                                if (index !== -1) {
                                                    newBookDatas[index].seriesPosition = parseInt(e.target.value);
                                                    setBookDatas(newBookDatas);
                                                }
                                            }} />
                                        </td>
                                    }
                                    {
                                        !useFirstPageAsCover && <td>
                                            <input id={`cover-input-${book.file.name}`} type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={(e) => {
                                                const newBookDatas = [...bookDatas];
                                                const index = newBookDatas.findIndex(b => b.file.name === book.file.name);
                                                if (index !== -1) {
                                                    newBookDatas[index].cover = e.target.files?.[0];
                                                    setBookDatas(newBookDatas);
                                                }
                                            }} />
                                            {
                                                book.cover ? (
                                                    <img src={URL.createObjectURL(book.cover)} alt="cover" className="w-16 object-cover cursor-pointer" onClick={() => {
                                                        const coverInput = document.getElementById(`cover-input-${book.file.name}`) as HTMLInputElement;
                                                        coverInput.click();
                                                    }} />
                                                ) : (
                                                    <button className="btn btn-sm btn-primary" onClick={() => {
                                                        const coverInput = document.getElementById(`cover-input-${book.file.name}`) as HTMLInputElement;
                                                        coverInput.click();
                                                    }}>
                                                        "Select Cover"
                                                    </button>
                                                )
                                            }


                                        </td>

                                    }
                                </tr>
                            ))}
                        </tbody>

                    </table>

                    <div className="divider">Metadata</div>

                    <div className="flex flex-col gap-6 w-full">
                        <fieldset className="flex flex-col gap-2">
                            <div className="flex items-center gap-4 w-full">
                                <input id="serie-mode" type="checkbox" className="checkbox" defaultChecked={seriesMode} onChange={(e) => setSeriesMode(e.target.checked)} />
                                <label htmlFor="serie-mode" className="label cursor-pointer">
                                    <span className="label-text">
                                        Books are part of a series
                                    </span>
                                </label>
                            </div>

                            <div className="flex items-center gap-4 w-full">
                                <input id="use-first-page-as-cover" type="checkbox" className="checkbox" defaultChecked={useFirstPageAsCover} onChange={(e) => setUseFirstPageAsCover(e.target.checked)} />
                                <label htmlFor="use-first-page-as-cover" className="label cursor-pointer">
                                    <span className="label-text">
                                        Use first page as cover
                                    </span>
                                </label>
                            </div>

                            <div className="flex items-center gap-4 w-full">
                                <input id="use-template-for-title" type="checkbox" className="checkbox" defaultChecked={useTemplateForTitle} onChange={(e) => setUseTemplateForTitle(e.target.checked)} />
                                <label htmlFor="use-template-for-title" className="label cursor-pointer">
                                    <span className="label-text">
                                        Use template for title
                                    </span>
                                </label>
                            </div>
                        </fieldset>

                        {
                            useTemplateForTitle &&
                             <input type="text" className="input input-bordered w-full mt-1" placeholder="Ex: Tome number #" value={template} onChange={(e) => setTemplate(e.target.value)} />
                        }

                        <fieldset className="fieldset border-base-content/60 rounded-box border p-4">
                            <TextOrSelectInputMany
                                label="Authors"
                                name="authors"
                                value={metadata.authors || []}
                                onChange={(val) => setMetadata({ ...metadata, authors: val })}
                                options={facets?.facets?.authors || []}
                                toggleLabel="Select from existing authors"
                            />
                        </fieldset>
                        <fieldset className="fieldset border-base-content/60 rounded-box border p-4">
                            <TextOrSelectInputMany
                                label="Tags"
                                name="tags"
                                value={metadata.tags || []}
                                onChange={(val) => setMetadata({ ...metadata, tags: val })}
                                options={facets?.facets?.tags || []}
                                toggleLabel="Select from existing tags"
                            />
                        </fieldset>
                        {
                            seriesMode && <TextOrSelectInput
                                label="Series Name"
                                name="seriesName"
                                value={metadata.seriesName || ""}
                                onChange={(val) => setMetadata({ ...metadata, seriesName: val })}
                                options={facets?.facets?.series?.map(e => e.name) || []}
                                toggleLabel="Select from existing series"
                            />
                        }


                    </div>


                    <div className="flex justify-center gap-4 mt-5">
                        <button className="btn btn-default mt-2" onClick={() => setBookDatas([])}>
                            Cancel
                        </button>
                        <button className="btn btn-accent mt-2" onClick={uploadBooks} disabled={loading.loading}>
                            <Import size={24} />
                            Import {bookDatas.length} Book(s) 
                            {loading.loading && <Spinner/>}
                        </button>
                    </div>

                    
                </>
            ) 
        }

        {loading.loading && (
                <div className="my-4">
                    <progress className="progress progress-primary w-full" value={loading.percent} max={100}></progress>
                    <p className="text-sm mt-1">Uploaded {loading.uploadedMB.toFixed(2)} / {loading.totalMB.toFixed(2)} MB ({loading.percent}%)</p>
                </div>
            )}
    </PageLayout>
}

export default ImportBook;