import { Import, Search } from "lucide-react";
import { useEffect, useState } from "react";


const ImportBook = () => {
    const [files, setFiles] = useState<File[]>();



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
            setFiles(selectedFiles);
        }
    }

    useEffect(() => {
        console.log("Files selected:", files);
    }, [files]);

    return <div className="flex flex-col items-center justify-center h-full">
        <input type="file" accept=".cbz" className="hidden" id="file-input" onChange={handleFileInputChange} multiple />

        {
            files && files.length > 0 ? (
                <>
                    <ul>
                        {files.slice(0, 5).map((file, index) => (
                            <li key={index} className="text-sm">{file.name}</li>
                        ))}
                        {files.length > 5 && (
                            <li className="text-sm">+ {files.length - 5} more...</li>
                        )}
                    </ul>
                    <div className="flex justify-center gap-4 mt-5">
                        <button className="btn btn-default mt-2" onClick={() => setFiles([])}>
                            Cancel
                        </button>
                        <button className="btn btn-accent mt-2">
                            <Import size={24} />
                            Import {files.length} Book(s)
                        </button>
                    </div>

                </>
            ) : (
                <button className="btn btn-primary" onClick={handleImportClick}>
                    <Search size={24} />
                    Find Book(s) (.cbz) in your device
                </button>
            )
        }
    </div>
}

export default ImportBook;