import { useEffect, useState } from "react";
import { useToast } from "../../contexts/ToastContext";

type SecureImageProps = {
    url: string;
    token: string;
    className?: string;
    alt?: string;
}

const SecureImage = (props: SecureImageProps) => {
    const [imgUrl, setImgUrl] = useState<string | null>(null);
    const {showToast} = useToast();
    
    useEffect(() => {
        fetch(props.url, {
          headers: {
            Authorization: "Bearer " + props.token,
          },
        })
          .then((res) => res.blob())
          .then((blob) => {
            const url = URL.createObjectURL(blob);
            setImgUrl(url);
          })
          .catch(() => {
            showToast({
              message: "Error loading image",
              type: "alert-error",
            });
          });
      }, []);
    
      if (!imgUrl) return <div className="animate-pulse w-32 h-32 bg-base-200 rounded-md"></div>
    
      return <img src={imgUrl} alt={props.alt} className={props.className} />
}

export default SecureImage