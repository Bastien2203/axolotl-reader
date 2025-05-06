import { API_HOST } from "../types";


export const deleteBook = (
    bookId: string,
    onSuccess: () => void,
    onError: (message: string) => void,
    onFinish: () => void
) => {
    fetch(`${API_HOST}/books/${bookId}`, {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
        },
    }).then((res) => {
        if (res.ok) {
            onSuccess();
            
        } else {
            onError("Error deleting book");
        }
    }).catch(() => {
        onError("Error deleting book");
    }).finally(() => {
        onFinish();
    });
}