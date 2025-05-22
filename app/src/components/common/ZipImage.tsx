
import {  useEffect } from "react"


type ZipImageProps = {
    onLoad?: (url: string) => void
    blobUrl?: string
}

const ZipImage = (props: ZipImageProps) => {
    useEffect(() => {
        return () => {
            if (props.blobUrl) {
                URL.revokeObjectURL(props.blobUrl)
            }
        }
    }, [props.blobUrl])

    return (
        <div className="w-full flex items-center justify-center">
            <img
                    src={props.blobUrl}
                    alt="Page"
                    className="w-full object-contain"
                />
        </div>
    )
}

export default ZipImage