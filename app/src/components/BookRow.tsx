import { EllipsisVertical } from "lucide-react";
import { API_HOST, Publication } from "../types";
import SecureImage from "./common/SecureImage";


type BookRowProps = {
    book: Publication;
    openBook?: () => void;
    onDelete?: () => void;
}

const BookRow = (props: BookRowProps) => {
    const cover = props.book.links.filter(link => link.rel === "cover")[0]

    return <tr className="list-row h-42">
        <td className="h-42 flex justify-between hover:opacity-60 cursor-pointer w-full" onClick={() => props.openBook?.()}>
            <SecureImage
                alt={props.book.metadata.title}
                className="object-cover rounded-md p-1 h-full"
                url={API_HOST + cover.href}
                token={localStorage.getItem("token") || ""}
            />

            <span className="text-base-content flex flex-col items-start justify-center truncate">
            {props.book.metadata.title}
            {props.book.metadata.authors.map((author, i) => (
                <span key={i} className="text-base-content opacity-60 text-sm">{author.name}</span>
            ))}
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

                    <li className="bg-red-400/50 rounded"><a onClick={() => props.onDelete?.()}>Delete</a></li>
                </ul>
            </div>
        </td>
    </tr>
}

export default BookRow;