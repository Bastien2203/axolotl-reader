import { useEffect, useState } from "react";
import { useToast } from "../contexts/ToastContext";
import Modal from "./common/Modal";
import Spinner from "./common/Spinner";
import { Publication } from "../types";
import { deleteBook } from "../services/Book";


type DeleteBookModalProps = {
    books: Publication[];
    setBooks: (books: Publication[]) => void;
    deleteModalOpen: string | undefined;
    setDeleteModalOpen: (bookId: string | undefined) => void;
}

const DeleteBookModal = (props: DeleteBookModalProps) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const _deleteBook = (bookId: string) => {
        const onSuccess = () => {
            showToast({
                message: "Book deleted successfully",
                type: "alert-success",
            });
            props.setBooks(props.books.filter((book) => book.metadata.identifier !== bookId));
        }

        const onError = (message: string) => {
            showToast({
                message: message,
                type: "alert-error",
            });
        }
        const onFinish = () => {
            setLoading(false);
            props.setDeleteModalOpen(undefined);
        }

        setLoading(true);
        deleteBook(bookId, onSuccess, onError, onFinish);        
    }

    useEffect(() => {
        if (props.deleteModalOpen != undefined) {
            (document.getElementById("delete-book") as HTMLDialogElement)?.showModal();
        } else {
            (document.getElementById("delete-book") as HTMLDialogElement)?.close();
        }
    }, [props.deleteModalOpen]);

    return <Modal id="delete-book">
            <div className="modal-box">
                <h2 className="text-2xl font-bold">Delete Book</h2>
                <p>Are you sure you want to delete this book?</p>
                <div className="modal-action">
                    <button className="btn btn-error" onClick={() => {
                        if (props.deleteModalOpen) {
                            _deleteBook(props.deleteModalOpen as string);
                        }
                    }} disabled={loading}>
                        {
                            loading ? <Spinner /> : "Delete"
                        }
                    </button>
                    <button className="btn" onClick={() => {
                        props.setDeleteModalOpen(undefined);
                    }} disabled={loading}>Cancel</button>
                </div>
            </div>
        </Modal>
}

export default DeleteBookModal;