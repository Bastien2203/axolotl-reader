import { useEffect, useRef, useState } from "react";
import { useToast } from "../../contexts/ToastContext";
import Modal from "../common/Modal";
import Spinner from "../common/Spinner";
import { deleteBook } from "../../services/Book";
import { Publication } from "../../services/OPDS";


type DeleteBookModalProps = {
    publications: Publication[];
    setBooks: (books: Publication[]) => void;
    deleteModalOpen: string | null;
    setDeleteModalOpen: (bookId: string | null) => void;
}

const DeleteBookModal = (props: DeleteBookModalProps) => {
    const { showToast } = useToast();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [loading, setLoading] = useState(false);

    const _deleteBook = (bookId: string) => {
        console.log("Deleting book with id: ", bookId);
        const onSuccess = () => {
            showToast({
                message: "Book deleted successfully",
                type: "alert-success",
            });
            props.setBooks(props.publications.filter((book) => book.id !== bookId));
        }

        const onError = (message: string) => {
            showToast({
                message: message,
                type: "alert-error",
            });
        }
        const onFinish = () => {
            setLoading(false);
            props.setDeleteModalOpen(null);
        }
        const book = props.publications.find((p) => p.id === bookId);
        if (!book) {
            showToast({
                message: "Book not found",
                type: "alert-error",
            });
            return;
        }
        
        setLoading(true);
        deleteBook(bookId, onSuccess, onError, onFinish);        
    }

    useEffect(() => {
        if (!dialogRef.current) return;
        if (props.deleteModalOpen != null) {
            dialogRef.current.showModal();
        } else {
            dialogRef.current.close();
        }
    }, [props.deleteModalOpen]);

    return <Modal id="delete-book" ref={dialogRef} onClose={() => {
        props.setDeleteModalOpen(null);
    }}>
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
                        props.setDeleteModalOpen(null);
                    }} disabled={loading}>Cancel</button>
                </div>
            </div>
        </Modal>
}

export default DeleteBookModal;