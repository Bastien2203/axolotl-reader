import { ArrowLeft } from "lucide-react"
import { PropsWithChildren } from "react"

type PageLayoutProps = {
    title: string
    onBack?: () => void
}

const PageLayout = (props: PropsWithChildren<PageLayoutProps>) => (
    <>
        <div className="bg-base-300 p-4 flex items-center gap-4 fixed top-0 z-10 w-full pt-safe-1">
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
            {
                !props.onBack && <img src="/icon.png" alt="icon" className="h-12 block md:hidden" />
            }

            <h1 className="text-2xl font-bold">{props.title}</h1>
        </div>
        <div className={`p-4 space-y-6 pt-[5.5rem]`}>
            {
                props.children
            }
        </div>
        
    </>
)

export default PageLayout