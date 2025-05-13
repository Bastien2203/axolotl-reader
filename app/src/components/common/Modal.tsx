import { PropsWithChildren } from "react";


type ModalProps = {
    id: string;
    onClose?: () => void;
    ref?: React.Ref<HTMLDialogElement>;
}

const Modal = (props: PropsWithChildren<ModalProps>) => {
    return <dialog id={props.id} className="modal modal-bottom sm:modal-middle" ref={props.ref} onClose={props.onClose}>
        {props.children}
    </dialog>

}

export default Modal;