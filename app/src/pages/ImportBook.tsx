import { Import, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { API_HOST, Facets } from "../types";
import { useToast } from "../contexts/ToastContext";
import { TextOrSelectInput } from "../components/common/TextOrSelectInput";
import { getFacets } from "../services/Book";
import PageLayout from "../layout/PageLayout";


const ImportBook = () => {

    const { showToast } = useToast();

    const [bookDatas, setBookDatas] = useState<{
        title: string;
        seriesPosition?: number;
        file: File;
        cover?: File;
    }[]>([]);

    const [loading, setLoading] = useState<{
        loading: boolean;
        percent: number;
    }>({
        loading: false,
        percent: 0,
    });

    const [metadata, setMetadata] = useState<{
        author?: string;
        seriesName?: string;
        tag?: string;
    }>({});


    const [seriesMode, setSeriesMode] = useState(false);
    const [useFirstPageAsCover, setUseFirstPageAsCover] = useState(true);
    const [facets, setFacets] = useState<Facets>()


    const handleImportClick = () => {
        const fileInput = document.getElementById("file-input") as HTMLInputElement;
        fileInput.click();
    }

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;
        if (fileList) {
            const selectedFiles: File[] = [];
            for (let i = 0; i < fileList.length; i++) {
                selectedFiles.push(fileList[i]);
            }
            if (selectedFiles.length > 1) {
                setBookDatas(selectedFiles.map((file, i) => ({
                    file,
                    title: file.name.substring(0, file.name.lastIndexOf(".")) || file.name,
                    seriesPosition: i + 1,
                })));
            } else {
                setBookDatas(selectedFiles.map(file => ({
                    file,
                    title: file.name.substring(0, file.name.lastIndexOf(".")) || file.name,
                })));
            }
        }
    }

    const uploadBook = async (book: {
        title: string;
        author: string;
        seriesName?: string;
        seriesPosition?: number;
        file: File;
        cover?: File;
    }): Promise<Response> => {
        const formData = new FormData();
        formData.append("book", book.file);
        formData.append("use_first_page_as_cover", useFirstPageAsCover ? "true" : "false");
        if (book.cover) {
            formData.append("cover", book.cover);
        }

        formData.append("title", book.title);
        formData.append("author", book.author);
        formData.append("tag", metadata.tag || "");

        if (book.seriesName && book.seriesName !== "" && book.seriesPosition) {
            formData.append("series_name", book.seriesName);
            formData.append("series_position", book.seriesPosition.toString());
        }

        const uuid = crypto.randomUUID();
        formData.append("identifier", uuid);

        return await fetch(`${API_HOST}/books`, {
            method: "POST",
            body: formData,
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token"),
            }
        });

    }

    const uploadBooks = async () => {

        if (!metadata?.author) {
            showToast({
                message: "Author is required",
                type: "alert-error"
            });
            return;
        }

        if (!useFirstPageAsCover && bookDatas.some(book => !book.cover)) {
            showToast({
                message: "Cover is required",
                type: "alert-error"
            });
            return;
        }

        if (bookDatas.some(book => book.title === "")) {
            showToast({
                message: "Title is required",
                type: "alert-error"
            });
            return;
        }

        if (bookDatas.some(book => book.title.length > 100)) {
            showToast({
                message: "Title is too long",
                type: "alert-error"
            });
            return;
        }

        if (seriesMode && bookDatas.some(book => !book.seriesPosition)) {
            showToast({
                message: "Series position is required and must be greater than 0",
                type: "alert-error"
            });
            return;
        }

        if (bookDatas.some(book => book.seriesPosition && book.seriesPosition < 1)) {
            showToast({
                message: "Series position must be greater than 0",
                type: "alert-error"
            });
            return;
        }

        if (seriesMode && (!metadata.seriesName || metadata.seriesName === "")) {
            showToast({
                message: "Series name is required",
                type: "alert-error"
            });
            return;
        }

        setLoading({
            loading: true,
            percent: 0,
        });

        bookDatas.forEach(async (book, index) => {
            uploadBook({
                title: book.title,
                file: book.file,
                author: metadata.author!!,
                seriesPosition: seriesMode ? book.seriesPosition : undefined,
                seriesName: seriesMode ? metadata.seriesName : undefined,
                cover: useFirstPageAsCover ? undefined : book.cover,
            }).then((res) => {
                if (res.status === 201) {
                    console.log("Book uploaded successfully");
                    console.log("percent", Math.round(((index + 1) / bookDatas.length) * 100));
                    setLoading((prev) => ({
                        ...prev,
                        percent: Math.round(((index + 1) / bookDatas.length) * 100),
                    }));
                } else {
                    showToast({
                        message: `Error uploading book: ${res.statusText}`,
                        type: "alert-error"
                    });
                }
            }
            ).catch((err) => {
                console.error(err);
                showToast({
                    message: `Error uploading book: ${err}`,
                    type: "alert-error"
                });
            }
            ).finally(() => {
                if (index === bookDatas.length - 1) {
                    setLoading({
                        loading: false,
                        percent: 0,
                    });
                    setBookDatas([]);
                    setMetadata({});
                    const fileInput = document.getElementById("file-input") as HTMLInputElement;
                    fileInput.value = "";
                }
            }
            );
        });

    }

    useEffect(() => {
        getFacets().then((data) => {
            setFacets(data);
        }).catch((err) => {
            console.error(err);
            showToast({
                message: `Error fetching facets`,
                type: "alert-error"
            });
        });

    }, []);

    return <PageLayout title="Import Book">
        <input type="file" accept=".cbz" className="hidden" id="file-input" onChange={handleFileInputChange} multiple />

        {
            bookDatas && bookDatas.length > 0 ? (
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
                                    <td>{book.title}</td>
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
                        </fieldset>

                        <TextOrSelectInput
                            label="Author"
                            name="author"
                            value={metadata.author || ""}
                            onChange={(val) => setMetadata({ ...metadata, author: val })}
                            options={facets?.facets?.authors || []}
                            toggleLabel="Select from existing authors"
                        />
                        <TextOrSelectInput
                            label="Tag"
                            name="tag"
                            value={metadata.tag || ""}
                            onChange={(val) => setMetadata({ ...metadata, tag: val })}
                            options={facets?.facets?.tags || []}
                            toggleLabel="Select from existing tags"
                        />
                        {
                            seriesMode && <TextOrSelectInput
                                label="Series Name"
                                name="seriesName"
                                value={metadata.seriesName || ""}
                                onChange={(val) => setMetadata({ ...metadata, seriesName: val })}
                                options={facets?.facets?.series || []}
                                toggleLabel="Select from existing series"
                            />
                        }


                    </div>

                    <div className="flex justify-center gap-4 mt-5">
                        <button className="btn btn-default mt-2" onClick={() => setBookDatas([])}>
                            Cancel
                        </button>
                        <button className="btn btn-accent mt-2" onClick={uploadBooks}>
                            <Import size={24} />
                            Import {bookDatas.length} Book(s)
                        </button>
                    </div>

                    {
                        loading.loading ? (
                            <div className="flex flex-col items-center justify-center mt-5">
                                <p className="text-sm">Uploading {bookDatas.length} book(s)</p>
                                <progress className="progress w-full mt-2" value={loading.percent} max="100"></progress>
                                <p className="text-sm">{loading.percent}%</p>
                            </div>
                        ) : null
                    }
                </>
            ) : (
                <div className="w-full flex justify-center">
                    <button className="btn btn-primary w-1/2 my-12" onClick={handleImportClick}>
                        <Search size={24} />
                        Find Book(s) (.cbz) in your device
                    </button>
                </div>
            )
        }
    </PageLayout>
}

export default ImportBook;