import { ArrowLeft } from "lucide-react";
import { PropsWithChildren } from "react";


type TopNavigationBarProps = {
    onBack?: () => void;
    title: string;
    className?: string;
}

const TopNavigationBar = (props: PropsWithChildren<TopNavigationBarProps>) => (
    <div className="p-4 space-y-6">
            <div className="w-full fixed top-0 left-0 pt-safe-1 pb-[1em] bg-base-300 z-10 flex items-center gap-4 px-4 shadow-md">
                {
                    props.onBack && <button
                    onClick={props.onBack}
                    className="btn btn-ghost flex items-center gap-2"
                    aria-label="Go back"
                >
                    <ArrowLeft size={20} />
                    <span className="hidden sm:inline">Back</span>
                </button>
                }
                
                <h1 className="text-lg sm:text-2xl font-bold truncate">{props.title}</h1>
            </div>
            <div className="pt-[5.5rem]">
                <div className={`overflow-x-auto w-full ${props.className}`}>
                    {props.children}
                </div>
            </div>

        </div>
)

export default TopNavigationBar;