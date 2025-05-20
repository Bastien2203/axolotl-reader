import { EllipsisVertical } from "lucide-react";
import SecureImage from "../common/SecureImage";
import { Publication } from "../../services/OPDS";



type BookRowProps = {
    book: Publication;
    progress: number | null;
    openBook?: () => void;
    onDelete?: () => void;
    download?: () => void;
    markAsRead?: () => void;
}

const BookRow = (props: BookRowProps) => {


    return <tr className="list-row" style={{ height: "max(15vw, 10em)" }}>
        <td className="flex justify-between hover:opacity-60 cursor-pointer w-full" onClick={() => props.openBook?.()} >
            <SecureImage
                alt={props.book.metadata.title}
                className="object-cover rounded-md h-full p-1"
                url={props.book.cover?.href ?? ""}
                height="max(15vw, 10em)"
                token={localStorage.getItem("token") || ""}
            />

            <span className="text-base-content flex flex-col gap-1 items-start justify-center truncate">
                {props.book.metadata.title}
                <span className="text-base-content opacity-60 text-sm">{props.book.metadata.authors?.join(", ") || "Unknown Author"}</span>
                <br />
                {
                    props.progress && props.progress > 0 &&
                    <progress
                        className="progress progress-primary w-full z-1"
                        value={props.progress}
                        max={100} />

                }
            </span>

            <div></div>
        </td>

        <td className="w-0 text-right align-center">
            <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-sm px-2">
                    <EllipsisVertical size={20} />
                </div>
                <ul tabIndex={0} className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-40 pointer-events-auto">
                    <li><a onClick={() => props.openBook?.()}>Open</a></li>
                    {
                        props.download &&
                        <li>
                            <a onClick={() => props.download?.()}>
                                Download
                            </a>
                        </li>
                    }

                    {
                        props.markAsRead && props.progress !== 100 &&
                        <li>
                            <a onClick={() => props.markAsRead?.()}>
                                Mark as Read
                            </a>
                        </li>
                    }

                    {
                        props.onDelete &&
                        <li className="bg-red-400/50 rounded"><a onClick={() => props.onDelete?.()}>Delete</a></li>
                    }



                </ul>
            </div>
        </td>
    </tr>
}

export default BookRow;