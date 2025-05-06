import { PropsWithChildren } from "react";


type ModalProps = {
    id: string;
    onClose?: () => void;
}

const Modal = (props: PropsWithChildren<ModalProps>) => {
    return <dialog id={props.id} className="modal modal-bottom sm:modal-middle">
        {props.children}
    </dialog>

}

export default Modal;