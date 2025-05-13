import { X } from "lucide-react";

type ReaderOverlayProps = {
    progress: number;
    onClose?: () => void;
};

const ReaderOverlay = (props: ReaderOverlayProps) => (
    <>
        <div className="fixed top-0 bg-black/60 backdrop-blur-xs w-full flex justify-between items-center px-4 py-3 pt-safe-1 z-20">

                <input
                    type="checkbox"
                    className="toggle toggle-sm"
                    onChange={() => {}}
                />

            <X
                size={24}
                className="text-white cursor-pointer"
                onClick={props.onClose}
            />
        </div>
        <progress
            className="fixed progress bottom-0 pb-safe progress-primary w-full z-20"
            value={props.progress}
            max="100"
        />
    </>
);

export default ReaderOverlay;